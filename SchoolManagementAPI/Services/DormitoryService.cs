using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Data;
using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public class DormitoryService : IDormitoryService
{
    private readonly ApplicationDbContext _context;

    public DormitoryService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Dormitory>> GetAllDormitoriesAsync()
    {
        return await _context.Dormitories.ToListAsync();
    }

    public async Task<Dormitory?> GetDormitoryByIdAsync(int id)
    {
        return await _context.Dormitories.FindAsync(id);
    }

    public async Task<Dormitory> CreateDormitoryAsync(Dormitory dormitory)
    {
        _context.Dormitories.Add(dormitory);
        await _context.SaveChangesAsync();
        return dormitory;
    }

    public async Task<Dormitory?> UpdateDormitoryAsync(int id, Dormitory dormitory)
    {
        var existing = await _context.Dormitories.FindAsync(id);
        if (existing == null) return null;

        existing.Name = dormitory.Name;
        existing.NumberOfRoom = dormitory.NumberOfRoom;
        existing.Description = dormitory.Description;

        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteDormitoryAsync(int id)
    {
        var dormitory = await _context.Dormitories.FindAsync(id);
        if (dormitory == null) return false;

        _context.Dormitories.Remove(dormitory);
        await _context.SaveChangesAsync();
        return true;
    }
}

