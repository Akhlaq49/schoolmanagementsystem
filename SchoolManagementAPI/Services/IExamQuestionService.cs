using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public interface IExamQuestionService
{
    Task<List<ExamQuestion>> GetAllExamQuestionsAsync();
    Task<ExamQuestion?> GetExamQuestionByIdAsync(int id);
    Task<List<ExamQuestion>> GetExamQuestionsByExamIdAsync(int examId);
    Task<ExamQuestion> CreateExamQuestionAsync(ExamQuestion question);
    Task<ExamQuestion?> UpdateExamQuestionAsync(int id, ExamQuestion question);
    Task<bool> DeleteExamQuestionAsync(int id);
}

