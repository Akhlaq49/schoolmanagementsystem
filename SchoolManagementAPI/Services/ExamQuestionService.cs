using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Data;
using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public class ExamQuestionService : IExamQuestionService
{
    private readonly ApplicationDbContext _context;

    public ExamQuestionService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ExamQuestion>> GetAllExamQuestionsAsync()
    {
        return await _context.ExamQuestions.ToListAsync();
    }

    public async Task<ExamQuestion?> GetExamQuestionByIdAsync(int id)
    {
        return await _context.ExamQuestions.FindAsync(id);
    }

    public async Task<List<ExamQuestion>> GetExamQuestionsByExamIdAsync(int examId)
    {
        return await _context.ExamQuestions
            .Where(eq => eq.ExamId == examId)
            .ToListAsync();
    }

    public async Task<ExamQuestion> CreateExamQuestionAsync(ExamQuestion question)
    {
        question.Timestamp = DateTime.UtcNow;
        _context.ExamQuestions.Add(question);
        await _context.SaveChangesAsync();
        return question;
    }

    public async Task<ExamQuestion?> UpdateExamQuestionAsync(int id, ExamQuestion question)
    {
        var existing = await _context.ExamQuestions.FindAsync(id);
        if (existing == null) return null;

        existing.Question = question.Question;
        existing.FileName = question.FileName;
        existing.FileType = question.FileType;

        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteExamQuestionAsync(int id)
    {
        var question = await _context.ExamQuestions.FindAsync(id);
        if (question == null) return false;

        _context.ExamQuestions.Remove(question);
        await _context.SaveChangesAsync();
        return true;
    }
}

