using SchoolManagementAPI.Models;
using SchoolManagementAPI.DTOs;

namespace SchoolManagementAPI.Services;

public interface IStudentService
{
    Task<List<User>> GetAllStudentsAsync();
    Task<User?> GetStudentByIdAsync(int id);
    Task<User> CreateStudentAsync(CreateStudentRequest request);
    Task<User?> UpdateStudentAsync(int id, UpdateStudentRequest request);
    Task<bool> DeleteStudentAsync(int id);
    Task<List<User>> GetStudentsByClassIdAsync(int classId);
}

