using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public interface IMarkService
{
    Task<List<Mark>> GetAllMarksAsync();
    Task<Mark?> GetMarkByIdAsync(int id);
    Task<List<Mark>> GetMarksByStudentIdAsync(int studentId);
    Task<List<Mark>> GetMarksByExamIdAsync(int examId);
    Task<List<Mark>> GetMarksByExamAndStudentAsync(int examId, int studentId);
    Task<Mark> CreateMarkAsync(Mark mark);
    Task<Mark?> UpdateMarkAsync(int id, Mark mark);
    Task<bool> DeleteMarkAsync(int id);
    Task<bool> BulkUpdateMarksAsync(List<Mark> marks);
}

