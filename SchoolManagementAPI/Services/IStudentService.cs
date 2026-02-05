using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public interface IStudentService
{
    Task<List<User>> GetAllStudentsAsync();
    Task<User?> GetStudentByIdAsync(int id);
    Task<User> CreateStudentAsync(User student);
    Task<User?> UpdateStudentAsync(int id, User student);
    Task<bool> DeleteStudentAsync(int id);
    Task<List<User>> GetStudentsByClassIdAsync(int classId);
}

