using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public interface IAssignmentService
{
    Task<List<Assignment>> GetAllAssignmentsAsync();
    Task<Assignment?> GetAssignmentByIdAsync(int id);
    Task<List<Assignment>> GetAssignmentsByClassIdAsync(int classId);
    Task<List<Assignment>> GetAssignmentsByStudentIdAsync(int studentId);
    Task<Assignment> CreateAssignmentAsync(Assignment assignment);
    Task<Assignment?> UpdateAssignmentAsync(int id, Assignment assignment);
    Task<bool> DeleteAssignmentAsync(int id);
}

