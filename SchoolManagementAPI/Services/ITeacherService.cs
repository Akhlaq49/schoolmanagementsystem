using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public interface ITeacherService
{
    Task<List<User>> GetAllTeachersAsync();
    Task<User?> GetTeacherByIdAsync(int id);
    Task<User> CreateTeacherAsync(User teacher);
    Task<User?> UpdateTeacherAsync(int id, User teacher);
    Task<bool> DeleteTeacherAsync(int id);
}

