using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Data;
using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public class MarkService : IMarkService
{
    private readonly ApplicationDbContext _context;

    public MarkService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Mark>> GetAllMarksAsync()
    {
        return await _context.Marks
            .Include(m => m.Student)
            .Include(m => m.Exam)
            .Include(m => m.Subject)
            .ToListAsync();
    }

    public async Task<Mark?> GetMarkByIdAsync(int id)
    {
        return await _context.Marks
            .Include(m => m.Student)
            .Include(m => m.Exam)
            .Include(m => m.Subject)
            .FirstOrDefaultAsync(m => m.MarkId == id);
    }

    public async Task<List<Mark>> GetMarksByStudentIdAsync(int studentId)
    {
        return await _context.Marks
            .Where(m => m.StudentId == studentId)
            .Include(m => m.Exam)
            .Include(m => m.Subject)
            .ToListAsync();
    }

    public async Task<List<Mark>> GetMarksByExamIdAsync(int examId)
    {
        return await _context.Marks
            .Where(m => m.ExamId == examId)
            .Include(m => m.Student)
            .Include(m => m.Subject)
            .ToListAsync();
    }

    public async Task<List<Mark>> GetMarksByExamAndStudentAsync(int examId, int studentId)
    {
        return await _context.Marks
            .Where(m => m.ExamId == examId && m.StudentId == studentId)
            .Include(m => m.Subject)
            .ToListAsync();
    }

    public async Task<Mark> CreateMarkAsync(Mark mark)
    {
        _context.Marks.Add(mark);
        await _context.SaveChangesAsync();
        return mark;
    }

    public async Task<Mark?> UpdateMarkAsync(int id, Mark mark)
    {
        var existing = await _context.Marks.FindAsync(id);
        if (existing == null) return null;

        existing.ClassScore1 = mark.ClassScore1;
        existing.ClassScore2 = mark.ClassScore2;
        existing.ClassScore3 = mark.ClassScore3;
        existing.ExamScore = mark.ExamScore;
        existing.Comment = mark.Comment;

        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteMarkAsync(int id)
    {
        var mark = await _context.Marks.FindAsync(id);
        if (mark == null) return false;

        _context.Marks.Remove(mark);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> BulkUpdateMarksAsync(List<Mark> marks)
    {
        foreach (var mark in marks)
        {
            var existing = await _context.Marks.FindAsync(mark.MarkId);
            if (existing != null)
            {
                existing.ClassScore1 = mark.ClassScore1;
                existing.ClassScore2 = mark.ClassScore2;
                existing.ClassScore3 = mark.ClassScore3;
                existing.ExamScore = mark.ExamScore;
                existing.Comment = mark.Comment;
            }
        }

        await _context.SaveChangesAsync();
        return true;
    }
}

