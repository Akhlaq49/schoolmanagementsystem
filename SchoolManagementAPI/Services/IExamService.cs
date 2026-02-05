using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public interface IExamService
{
    Task<List<Exam>> GetAllExamsAsync();
    Task<Exam?> GetExamByIdAsync(int id);
    Task<Exam> CreateExamAsync(Exam exam);
    Task<Exam?> UpdateExamAsync(int id, Exam exam);
    Task<bool> DeleteExamAsync(int id);
}

