using SchoolManagementAPI.Models;
using SchoolManagementAPI.DTOs;

namespace SchoolManagementAPI.Services;

public interface ITeacherService
{
    Task<List<User>> GetAllTeachersAsync();
    Task<User?> GetTeacherByIdAsync(int id);
    Task<User> CreateTeacherAsync(CreateTeacherRequest request);
    Task<User?> UpdateTeacherAsync(int id, UpdateTeacherRequest request);
    Task<bool> DeleteTeacherAsync(int id);
}

