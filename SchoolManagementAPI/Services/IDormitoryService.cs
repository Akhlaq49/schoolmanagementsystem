using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public interface IDormitoryService
{
    Task<List<Dormitory>> GetAllDormitoriesAsync();
    Task<Dormitory?> GetDormitoryByIdAsync(int id);
    Task<Dormitory> CreateDormitoryAsync(Dormitory dormitory);
    Task<Dormitory?> UpdateDormitoryAsync(int id, Dormitory dormitory);
    Task<bool> DeleteDormitoryAsync(int id);
}

