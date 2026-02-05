using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Data;
using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public class DepartmentService : IDepartmentService
{
    private readonly ApplicationDbContext _context;

    public DepartmentService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Department>> GetAllDepartmentsAsync()
    {
        return await _context.Departments.ToListAsync();
    }

    public async Task<Department?> GetDepartmentByIdAsync(int id)
    {
        return await _context.Departments.FindAsync(id);
    }

    public async Task<Department> CreateDepartmentAsync(Department department)
    {
        _context.Departments.Add(department);
        await _context.SaveChangesAsync();
        return department;
    }

    public async Task<Department?> UpdateDepartmentAsync(int id, Department department)
    {
        var existing = await _context.Departments.FindAsync(id);
        if (existing == null) return null;

        existing.Name = department.Name;
        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteDepartmentAsync(int id)
    {
        var department = await _context.Departments.FindAsync(id);
        if (department == null) return false;

        _context.Departments.Remove(department);
        await _context.SaveChangesAsync();
        return true;
    }
}

