using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public interface IDepartmentService
{
    Task<List<Department>> GetAllDepartmentsAsync();
    Task<Department?> GetDepartmentByIdAsync(int id);
    Task<Department> CreateDepartmentAsync(Department department);
    Task<Department?> UpdateDepartmentAsync(int id, Department department);
    Task<bool> DeleteDepartmentAsync(int id);
}

