using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public interface IClassService
{
    Task<List<Class>> GetAllClassesAsync();
    Task<Class?> GetClassByIdAsync(int id);
    Task<Class> CreateClassAsync(Class classEntity);
    Task<Class?> UpdateClassAsync(int id, Class classEntity);
    Task<bool> DeleteClassAsync(int id);
}

