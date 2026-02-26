using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Data;
using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services.Family;

public class FamilyService : IFamilyService
{
    private readonly ApplicationDbContext _context;

    public FamilyService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Models.Family>> GetAllFamiliesAsync()
    {
        return await _context.Families
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Models.Family?> GetFamilyByIdAsync(int id)
    {
        return await _context.Families
            .AsNoTracking()
            .FirstOrDefaultAsync(f => f.FamilyId == id);
    }

    public async Task<Models.Family> CreateFamilyAsync(Models.Family family)
    {
        _context.Families.Add(family);
        await _context.SaveChangesAsync();
        return family;
    }
}

