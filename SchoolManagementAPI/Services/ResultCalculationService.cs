using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Data;
using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public class ResultCalculationService
{
    private readonly ApplicationDbContext _context;
    private readonly IGradingService _gradingService;

    public ResultCalculationService(ApplicationDbContext context, IGradingService gradingService)
    {
        _context = context;
        _gradingService = gradingService;
    }

    public async Task<StudentResult?> CalculateStudentResultAsync(int studentId, int examId)
    {
        var student = await _context.Users
            .Include(u => u.Class)
            .FirstOrDefaultAsync(u => u.UserId == studentId);

        if (student == null) return null;

        var marks = await _context.Marks
            .Where(m => m.StudentId == studentId && m.ExamId == examId)
            .Include(m => m.Subject)
            .ToListAsync();

        if (!marks.Any()) return null;

        // Calculate total and obtained marks
        decimal totalMarks = 0;
        decimal obtainedMarks = 0;

        foreach (var mark in marks)
        {
            decimal subjectTotal = (mark.ClassScore1 ?? 0) + (mark.ClassScore2 ?? 0) + (mark.ClassScore3 ?? 0) + (mark.ExamScore ?? 0);
            decimal subjectObtained = (mark.ClassScore1 ?? 0) + (mark.ClassScore2 ?? 0) + (mark.ClassScore3 ?? 0) + (mark.ExamScore ?? 0);
            
            totalMarks += subjectTotal;
            obtainedMarks += subjectObtained;
        }

        decimal percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;

        // Get grading scale for this class
        var scale = await _context.GradingScales
            .Where(gs => gs.ClassId == student.ClassId && 
                   gs.MinMarks <= percentage && 
                   percentage <= gs.MaxMarks)
            .OrderByDescending(gs => gs.MinMarks)
            .FirstOrDefaultAsync();

        var result = new StudentResult
        {
            StudentId = studentId,
            ExamId = examId,
            TotalMarks = totalMarks,
            ObtainedMarks = obtainedMarks,
            Percentage = percentage,
            Grade = scale?.Grade ?? "F",
            GPA = scale?.GradePoint ?? 0,
            IsPassed = percentage >= 40, // Default pass percentage
            Remarks = scale?.Remarks ?? "Fail",
            CalculatedDate = DateTime.Now,
            CreatedDate = DateTime.Now
        };

        return result;
    }

    public async Task<int> CalculateExamResultsAsync(int examId)
    {
        var exam = await _context.Exams.FindAsync(examId);
        if (exam == null) return 0;

        // Get all marks for this exam
        var studentMarks = await _context.Marks
            .Where(m => m.ExamId == examId)
            .Select(m => m.StudentId)
            .Distinct()
            .ToListAsync();

        int resultsCreated = 0;

        foreach (var studentId in studentMarks)
        {
            // Check if result already exists
            var existingResult = await _context.StudentResults
                .FirstOrDefaultAsync(sr => sr.StudentId == studentId && sr.ExamId == examId);

            if (existingResult != null)
            {
                // Update existing result
                var newResult = await CalculateStudentResultAsync(studentId, examId);
                if (newResult != null)
                {
                    existingResult.TotalMarks = newResult.TotalMarks;
                    existingResult.ObtainedMarks = newResult.ObtainedMarks;
                    existingResult.Percentage = newResult.Percentage;
                    existingResult.Grade = newResult.Grade;
                    existingResult.GPA = newResult.GPA;
                    existingResult.IsPassed = newResult.IsPassed;
                    existingResult.Remarks = newResult.Remarks;
                    existingResult.CalculatedDate = DateTime.Now;
                }
            }
            else
            {
                // Create new result
                var result = await CalculateStudentResultAsync(studentId, examId);
                if (result != null)
                {
                    _context.StudentResults.Add(result);
                    resultsCreated++;
                }
            }
        }

        if (resultsCreated > 0 || studentMarks.Any())
        {
            // Update rankings
            await UpdateClassRankingsAsync(examId);
            await _context.SaveChangesAsync();
        }

        return resultsCreated;
    }

    private async Task UpdateClassRankingsAsync(int examId)
    {
        var results = await _context.StudentResults
            .Where(sr => sr.ExamId == examId)
            .Include(sr => sr.Student)
            .ToListAsync();

        // Group by class and rank
        var groupedByClass = results.GroupBy(r => r.Student.ClassId);

        foreach (var classGroup in groupedByClass)
        {
            var rankedResults = classGroup
                .OrderByDescending(r => r.GPA)
                .ThenByDescending(r => r.Percentage)
                .ToList();

            for (int i = 0; i < rankedResults.Count; i++)
            {
                rankedResults[i].Position = i + 1;
            }
        }
    }

    public async Task<List<MeritListEntry>> GetMeritListAsync(int examId, int classId)
    {
        var results = await _context.StudentResults
            .Where(sr => sr.ExamId == examId && sr.Student.ClassId == classId)
            .Include(sr => sr.Student)
                .ThenInclude(s => s.Section)
            .OrderBy(sr => sr.Position)
            .ToListAsync();

        return results.Select(r => new MeritListEntry
        {
            Position = r.Position,
            StudentId = r.StudentId,
            StudentName = r.Student.Name ?? "N/A",
            RollNumber = r.Student.Roll ?? "N/A",
            SectionName = r.Student.Section?.Name ?? "N/A",
            ObtainedMarks = r.ObtainedMarks,
            TotalMarks = r.TotalMarks,
            Percentage = r.Percentage,
            Grade = r.Grade,
            GPA = r.GPA
        }).ToList();
    }

    public async Task<List<SubjectTopperEntry>> GetSubjectToppersAsync(int examId, int subjectId)
    {
        var marks = await _context.Marks
            .Where(m => m.ExamId == examId && m.SubjectId == subjectId)
            .Include(m => m.Student)
            .OrderByDescending(m => m.ExamScore)
            .ThenByDescending(m => m.ClassScore1 + m.ClassScore2 + m.ClassScore3)
            .Take(10)
            .ToListAsync();

        return marks.Select((m, index) => new SubjectTopperEntry
        {
            Position = index + 1,
            StudentId = m.StudentId,
            StudentName = m.Student.Name ?? "N/A",
            SubjectMarks = (m.ExamScore ?? 0) + (m.ClassScore1 ?? 0) + (m.ClassScore2 ?? 0) + (m.ClassScore3 ?? 0)
        }).ToList();
    }

    public async Task<ExamStatistics> GetExamStatisticsAsync(int examId, int classId)
    {
        var results = await _context.StudentResults
            .Where(sr => sr.ExamId == examId && sr.Student.ClassId == classId)
            .ToListAsync();

        if (!results.Any())
            return new ExamStatistics();

        return new ExamStatistics
        {
            TotalStudents = results.Count,
            PassedStudents = results.Count(r => r.IsPassed),
            FailedStudents = results.Count(r => !r.IsPassed),
            HighestPercentage = results.Max(r => r.Percentage),
            LowestPercentage = results.Min(r => r.Percentage),
            AveragePercentage = results.Average(r => r.Percentage),
            AverageGPA = results.Average(r => r.GPA),
            PassPercentage = (decimal)results.Count(r => r.IsPassed) / results.Count * 100
        };
    }
}

// DTOs
public class MeritListEntry
{
    public int Position { get; set; }
    public int StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string RollNumber { get; set; } = string.Empty;
    public string SectionName { get; set; } = string.Empty;
    public decimal ObtainedMarks { get; set; }
    public decimal TotalMarks { get; set; }
    public decimal Percentage { get; set; }
    public string Grade { get; set; } = string.Empty;
    public decimal GPA { get; set; }
}

public class SubjectTopperEntry
{
    public int Position { get; set; }
    public int StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public decimal SubjectMarks { get; set; }
}

public class ExamStatistics
{
    public int TotalStudents { get; set; }
    public int PassedStudents { get; set; }
    public int FailedStudents { get; set; }
    public decimal HighestPercentage { get; set; }
    public decimal LowestPercentage { get; set; }
    public decimal AveragePercentage { get; set; }
    public decimal AverageGPA { get; set; }
    public decimal PassPercentage { get; set; }
}
