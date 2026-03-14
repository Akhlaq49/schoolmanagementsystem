using SchoolManagementAPI.DTOs;
using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public interface IStudentService
{
    Task<List<User>> GetAllStudentsAsync();
    Task<List<User>> GetActiveStudentsAsync();
    Task<List<User>> GetDroppedStudentsAsync();
    Task<List<User>> SearchStudentsAsync(string term, string? status);
    Task<User> CreateStudentFromDtoAsync(CreateStudentDto dto);
    Task<User?> GetStudentByIdAsync(int id);
    Task<User?> GetStudentByStudentIdAsync(int studentId);
    Task<User> CreateStudentAsync(User student);
    Task<User?> UpdateStudentAsync(int id, User student);
    Task<User?> UpdateStudentFromDtoAsync(int id, UpdateStudentDto dto);
    Task<bool> DeleteStudentAsync(int id);
    Task<List<User>> GetStudentsByClassIdAsync(int classId);
}

