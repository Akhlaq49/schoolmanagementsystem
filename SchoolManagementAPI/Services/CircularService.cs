using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Data;
using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public class CircularService : ICircularService
{
    private readonly ApplicationDbContext _context;

    public CircularService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Circular>> GetAllCircularsAsync()
    {
        return await _context.Circulars
            .OrderByDescending(c => c.Date)
            .ToListAsync();
    }

    public async Task<Circular?> GetCircularByIdAsync(int id)
    {
        return await _context.Circulars.FindAsync(id);
    }

    public async Task<Circular> CreateCircularAsync(Circular circular)
    {
        circular.Date = DateTime.UtcNow;
        _context.Circulars.Add(circular);
        await _context.SaveChangesAsync();
        return circular;
    }

    public async Task<Circular?> UpdateCircularAsync(int id, Circular circular)
    {
        var existing = await _context.Circulars.FindAsync(id);
        if (existing == null) return null;

        existing.Title = circular.Title;
        existing.Reference = circular.Reference;
        existing.Content = circular.Content;

        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteCircularAsync(int id)
    {
        var circular = await _context.Circulars.FindAsync(id);
        if (circular == null) return false;

        _context.Circulars.Remove(circular);
        await _context.SaveChangesAsync();
        return true;
    }
}

