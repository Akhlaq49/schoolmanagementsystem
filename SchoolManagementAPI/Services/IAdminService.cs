using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public interface IAdminService
{
    Task<List<User>> GetAllAdminsAsync();
    Task<User?> GetAdminByIdAsync(int id);
    Task<User> CreateAdminAsync(User admin);
    Task<User?> UpdateAdminAsync(int id, User admin);
    Task<bool> DeleteAdminAsync(int id);
}

