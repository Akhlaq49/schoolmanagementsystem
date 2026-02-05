using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Data;
using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public class ClassService : IClassService
{
    private readonly ApplicationDbContext _context;

    public ClassService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Class>> GetAllClassesAsync()
    {
        return await _context.Classes.ToListAsync();
    }

    public async Task<Class?> GetClassByIdAsync(int id)
    {
        return await _context.Classes.FindAsync(id);
    }

    public async Task<Class> CreateClassAsync(Class classEntity)
    {
        _context.Classes.Add(classEntity);
        await _context.SaveChangesAsync();
        return classEntity;
    }

    public async Task<Class?> UpdateClassAsync(int id, Class classEntity)
    {
        var existing = await _context.Classes.FindAsync(id);
        if (existing == null) return null;

        existing.Name = classEntity.Name;
        existing.NameNumeric = classEntity.NameNumeric;
        existing.TeacherId = classEntity.TeacherId;

        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteClassAsync(int id)
    {
        var classEntity = await _context.Classes.FindAsync(id);
        if (classEntity == null) return false;

        _context.Classes.Remove(classEntity);
        await _context.SaveChangesAsync();
        return true;
    }
}

