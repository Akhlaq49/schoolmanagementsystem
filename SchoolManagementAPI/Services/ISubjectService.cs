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
}

