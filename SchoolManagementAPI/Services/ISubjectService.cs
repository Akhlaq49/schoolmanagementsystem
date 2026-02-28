using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public interface ISubjectService
{
    Task<List<Subject>> GetAllSubjectsAsync();
    Task<Subject?> GetSubjectByIdAsync(int id);
    Task<List<Subject>> GetSubjectsByClassIdAsync(int classId);
    Task<Subject> CreateSubjectAsync(Subject subject);
    Task<Subject?> UpdateSubjectAsync(int id, Subject subject);
    Task<bool> DeleteSubjectAsync(int id);
    Task<List<Subject>> CreateSubjectsForClassesAsync(string name, IEnumerable<int> classIds, int? teacherId);
    Task<List<Subject>> UpdateSubjectsForNameAsync(string originalName, string newName, IEnumerable<int> classIds, int? teacherId);
}

