using ClosedXML.Excel;
using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Data;
using SchoolManagementAPI.DTOs;
using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public class QuestionBankService : IQuestionBankService
{
    private readonly ApplicationDbContext _context;

    public QuestionBankService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<QuestionBank>> GetAllQuestionsAsync()
    {
        return await _context.QuestionBanks
            .Include(q => q.Subject)
            .Include(q => q.Class)
            .Include(q => q.Teacher)
            .OrderByDescending(q => q.CreatedAt)
            .ToListAsync();
    }

    public async Task<QuestionBank?> GetQuestionByIdAsync(int id)
    {
        return await _context.QuestionBanks
            .Include(q => q.Subject)
            .Include(q => q.Class)
            .Include(q => q.Teacher)
            .FirstOrDefaultAsync(q => q.QuestionBankId == id);
    }

    public async Task<List<QuestionBank>> GetQuestionsBySubjectAsync(int subjectId)
    {
        return await _context.QuestionBanks
            .Include(q => q.Subject)
            .Include(q => q.Class)
            .Where(q => q.SubjectId == subjectId)
            .OrderBy(q => q.ChapterName)
            .ThenBy(q => q.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<QuestionBank>> GetQuestionsByClassAsync(int classId)
    {
        return await _context.QuestionBanks
            .Include(q => q.Subject)
            .Include(q => q.Class)
            .Where(q => q.ClassId == classId)
            .OrderBy(q => q.SubjectId)
            .ThenBy(q => q.ChapterName)
            .ToListAsync();
    }

    public async Task<List<QuestionBank>> GetQuestionsBySubjectAndClassAsync(int subjectId, int classId)
    {
        return await _context.QuestionBanks
            .Include(q => q.Subject)
            .Include(q => q.Class)
            .Where(q => q.SubjectId == subjectId && q.ClassId == classId)
            .OrderBy(q => q.ChapterName)
            .ThenBy(q => q.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<QuestionBank>> GetQuestionsByChapterAsync(int subjectId, int classId, string chapterName)
    {
        return await _context.QuestionBanks
            .Include(q => q.Subject)
            .Include(q => q.Class)
            .Where(q => q.SubjectId == subjectId && 
                       q.ClassId == classId && 
                       q.ChapterName.ToLower() == chapterName.ToLower())
            .OrderBy(q => q.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<QuestionBank>> GetQuestionsByTeacherAsync(int teacherId)
    {
        return await _context.QuestionBanks
            .Include(q => q.Subject)
            .Include(q => q.Class)
            .Where(q => q.TeacherId == teacherId)
            .OrderByDescending(q => q.CreatedAt)
            .ToListAsync();
    }

    public async Task<QuestionBank> CreateQuestionAsync(QuestionBank question)
    {
        question.CreatedAt = DateTime.UtcNow;
        _context.QuestionBanks.Add(question);
        await _context.SaveChangesAsync();
        return question;
    }

    public async Task<QuestionBank?> UpdateQuestionAsync(int id, QuestionBank question)
    {
        var existing = await _context.QuestionBanks.FindAsync(id);
        if (existing == null) return null;

        existing.QuestionText = question.QuestionText;
        existing.QuestionType = question.QuestionType;
        existing.OptionA = question.OptionA;
        existing.OptionB = question.OptionB;
        existing.OptionC = question.OptionC;
        existing.OptionD = question.OptionD;
        existing.CorrectAnswer = question.CorrectAnswer;
        existing.Explanation = question.Explanation;
        existing.Marks = question.Marks;
        existing.DifficultyLevel = question.DifficultyLevel;
        existing.ChapterName = question.ChapterName;
        existing.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteQuestionAsync(int id)
    {
        var question = await _context.QuestionBanks.FindAsync(id);
        if (question == null) return false;

        _context.QuestionBanks.Remove(question);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<string>> GetChaptersBySubjectAndClassAsync(int subjectId, int classId)
    {
        return await _context.QuestionBanks
            .Where(q => q.SubjectId == subjectId && q.ClassId == classId)
            .Select(q => q.ChapterName)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync();
    }

    public async Task<BulkUploadResult> BulkUploadQuestionsAsync(Stream excelStream, int teacherId)
    {
        var result = new BulkUploadResult();
        var questionsToAdd = new List<QuestionBank>();
        
        // Get all classes and subjects for lookup
        var classes = await _context.Classes.ToListAsync();
        var subjects = await _context.Subjects.ToListAsync();

        using (var workbook = new XLWorkbook(excelStream))
        {
            var worksheet = workbook.Worksheet(1);
            var rowCount = worksheet.RowsUsed().Count();

            if (rowCount < 2) // Header + at least one data row
            {
                result.Errors.Add("Excel file must contain at least one data row");
                return result;
            }

            result.TotalRows = rowCount - 1; // Exclude header row

            // Read header row to determine column positions
            var headers = new Dictionary<string, int>();
            var headerRow = worksheet.Row(1);
            var lastColumn = worksheet.LastColumnUsed()?.ColumnNumber() ?? 0;
            
            for (int col = 1; col <= lastColumn; col++)
            {
                var headerValue = headerRow.Cell(col).GetString()?.Trim().ToLower();
                if (!string.IsNullOrEmpty(headerValue))
                {
                    headers[headerValue] = col;
                }
            }

            // Validate required columns
            var requiredColumns = new[] { "class", "subject", "chapter name", "question text", "question type", "marks", "difficulty level" };
            foreach (var col in requiredColumns)
            {
                if (!headers.ContainsKey(col))
                {
                    result.Errors.Add($"Missing required column: {col}");
                }
            }

            if (result.Errors.Any())
            {
                return result;
            }

            // Process data rows
            for (int row = 2; row <= rowCount; row++)
            {
                try
                {
                    var question = new QuestionBank
                    {
                        TeacherId = teacherId,
                        CreatedAt = DateTime.UtcNow
                    };

                    // Get class
                    var classValue = GetCellValue(worksheet, row, headers, "class");
                    if (string.IsNullOrEmpty(classValue))
                    {
                        result.Errors.Add($"Row {row}: Class is required");
                        result.FailureCount++;
                        continue;
                    }

                    var classEntity = classes.FirstOrDefault(c => 
                        c.Name.Equals(classValue, StringComparison.OrdinalIgnoreCase) ||
                        c.ClassId.ToString() == classValue);
                    
                    if (classEntity == null)
                    {
                        result.Errors.Add($"Row {row}: Class '{classValue}' not found");
                        result.FailureCount++;
                        continue;
                    }
                    question.ClassId = classEntity.ClassId;

                    // Get subject
                    var subjectValue = GetCellValue(worksheet, row, headers, "subject");
                    if (string.IsNullOrEmpty(subjectValue))
                    {
                        result.Errors.Add($"Row {row}: Subject is required");
                        result.FailureCount++;
                        continue;
                    }

                    var subjectEntity = subjects.FirstOrDefault(s => 
                        s.Name.Equals(subjectValue, StringComparison.OrdinalIgnoreCase) ||
                        s.SubjectId.ToString() == subjectValue);
                    
                    if (subjectEntity == null)
                    {
                        result.Errors.Add($"Row {row}: Subject '{subjectValue}' not found");
                        result.FailureCount++;
                        continue;
                    }
                    question.SubjectId = subjectEntity.SubjectId;

                    // Chapter Name
                    question.ChapterName = GetCellValue(worksheet, row, headers, "chapter name") ?? "";
                    if (string.IsNullOrEmpty(question.ChapterName))
                    {
                        result.Errors.Add($"Row {row}: Chapter Name is required");
                        result.FailureCount++;
                        continue;
                    }

                    // Question Text
                    question.QuestionText = GetCellValue(worksheet, row, headers, "question text") ?? "";
                    if (string.IsNullOrEmpty(question.QuestionText))
                    {
                        result.Errors.Add($"Row {row}: Question Text is required");
                        result.FailureCount++;
                        continue;
                    }

                    // Question Type
                    var questionType = GetCellValue(worksheet, row, headers, "question type") ?? "MultipleChoice";
                    question.QuestionType = questionType;

                    // Options (for Multiple Choice)
                    if (questionType.Equals("MultipleChoice", StringComparison.OrdinalIgnoreCase))
                    {
                        question.OptionA = GetCellValue(worksheet, row, headers, "option a");
                        question.OptionB = GetCellValue(worksheet, row, headers, "option b");
                        question.OptionC = GetCellValue(worksheet, row, headers, "option c");
                        question.OptionD = GetCellValue(worksheet, row, headers, "option d");
                    }

                    // Correct Answer
                    question.CorrectAnswer = GetCellValue(worksheet, row, headers, "correct answer");

                    // Marks
                    var marksValue = GetCellValue(worksheet, row, headers, "marks");
                    if (decimal.TryParse(marksValue, out var marks))
                    {
                        question.Marks = marks;
                    }
                    else
                    {
                        question.Marks = 1.0m;
                        result.Warnings.Add($"Row {row}: Invalid marks value, defaulting to 1.0");
                    }

                    // Difficulty Level
                    var difficulty = GetCellValue(worksheet, row, headers, "difficulty level") ?? "Medium";
                    question.DifficultyLevel = difficulty;

                    // Explanation
                    question.Explanation = GetCellValue(worksheet, row, headers, "explanation");

                    questionsToAdd.Add(question);
                }
                catch (Exception ex)
                {
                    result.Errors.Add($"Row {row}: {ex.Message}");
                    result.FailureCount++;
                }
            }
        }

        // Bulk insert valid questions
        if (questionsToAdd.Any())
        {
            try
            {
                _context.QuestionBanks.AddRange(questionsToAdd);
                await _context.SaveChangesAsync();
                result.SuccessCount = questionsToAdd.Count;
            }
            catch (Exception ex)
            {
                result.Errors.Add($"Error saving questions: {ex.Message}");
                result.FailureCount += questionsToAdd.Count;
                result.SuccessCount = 0;
            }
        }

        return result;
    }

    private string? GetCellValue(IXLWorksheet worksheet, int row, Dictionary<string, int> headers, string columnName)
    {
        if (headers.TryGetValue(columnName.ToLower(), out int col))
        {
            return worksheet.Row(row).Cell(col).GetString()?.Trim();
        }
        return null;
    }

    public async Task<List<QuestionBank>> GetQuestionsForExamAsync(int classId, int subjectId, bool isFullBook, List<string>? selectedChapters)
    {
        var query = _context.QuestionBanks
            .Include(q => q.Subject)
            .Include(q => q.Class)
            .Where(q => q.ClassId == classId && q.SubjectId == subjectId);

        if (isFullBook)
        {
            // Return all questions for the class and subject
            return await query
                .OrderBy(q => q.ChapterName)
                .ThenBy(q => q.CreatedAt)
                .ToListAsync();
        }
        else if (selectedChapters != null && selectedChapters.Any())
        {
            // Return questions for selected chapters only
            return await query
                .Where(q => selectedChapters.Contains(q.ChapterName))
                .OrderBy(q => q.ChapterName)
                .ThenBy(q => q.CreatedAt)
                .ToListAsync();
        }

        return new List<QuestionBank>();
    }
}



