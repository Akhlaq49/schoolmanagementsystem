using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Data;
using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public class ExamService : IExamService
{
    private readonly ApplicationDbContext _context;

    public ExamService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Exam>> GetAllExamsAsync()
    {
        return await _context.Exams.ToListAsync();
    }

    public async Task<Exam?> GetExamByIdAsync(int id)
    {
        return await _context.Exams.FindAsync(id);
    }

    public async Task<Exam> CreateExamAsync(Exam exam)
    {
        _context.Exams.Add(exam);
        await _context.SaveChangesAsync();
        return exam;
    }

    public async Task<Exam?> UpdateExamAsync(int id, Exam exam)
    {
        var existing = await _context.Exams.FindAsync(id);
        if (existing == null) return null;

        existing.Name = exam.Name;
        existing.Date = exam.Date;
        existing.Comment = exam.Comment;

        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteExamAsync(int id)
    {
        var exam = await _context.Exams.FindAsync(id);
        if (exam == null) return false;

        _context.Exams.Remove(exam);
        await _context.SaveChangesAsync();
        return true;
    }
}

