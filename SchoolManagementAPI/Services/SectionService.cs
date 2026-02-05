using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Data;
using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public class SectionService : ISectionService
{
    private readonly ApplicationDbContext _context;

    public SectionService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Section>> GetAllSectionsAsync()
    {
        return await _context.Sections
            .Include(s => s.Class)
            .ToListAsync();
    }

    public async Task<Section?> GetSectionByIdAsync(int id)
    {
        return await _context.Sections
            .Include(s => s.Class)
            .FirstOrDefaultAsync(s => s.SectionId == id);
    }

    public async Task<List<Section>> GetSectionsByClassIdAsync(int classId)
    {
        return await _context.Sections
            .Where(s => s.ClassId == classId)
            .Include(s => s.Class)
            .ToListAsync();
    }

    public async Task<Section> CreateSectionAsync(Section section)
    {
        _context.Sections.Add(section);
        await _context.SaveChangesAsync();
        return section;
    }

    public async Task<Section?> UpdateSectionAsync(int id, Section section)
    {
        var existing = await _context.Sections.FindAsync(id);
        if (existing == null) return null;

        existing.Name = section.Name;
        existing.ClassId = section.ClassId;
        existing.TeacherId = section.TeacherId;

        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteSectionAsync(int id)
    {
        var section = await _context.Sections.FindAsync(id);
        if (section == null) return false;

        _context.Sections.Remove(section);
        await _context.SaveChangesAsync();
        return true;
    }
}

