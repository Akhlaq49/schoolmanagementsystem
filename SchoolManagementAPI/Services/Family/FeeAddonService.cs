using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Data;
using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services.Family;

public class FeeAddonService : IFeeAddonService
{
    private readonly ApplicationDbContext _context;

    public FeeAddonService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Models.FeeAddon>> GetAllAsync()
    {
        return await _context.FeeAddons
            .AsNoTracking()
            .OrderBy(f => f.Name)
            .ToListAsync();
    }

    public async Task<Models.FeeAddon?> GetByIdAsync(int id)
    {
        return await _context.FeeAddons
            .AsNoTracking()
            .FirstOrDefaultAsync(f => f.FeeAddonId == id);
    }

    public async Task<Models.FeeAddon> CreateAsync(Models.FeeAddon feeAddon)
    {
        _context.FeeAddons.Add(feeAddon);
        await _context.SaveChangesAsync();
        return feeAddon;
    }

    public async Task<Models.FeeAddon?> UpdateAsync(int id, Models.FeeAddon feeAddon)
    {
        var existing = await _context.FeeAddons.FindAsync(id);
        if (existing == null) return null;
        existing.Name = feeAddon.Name;
        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var existing = await _context.FeeAddons.FindAsync(id);
        if (existing == null) return false;
        _context.FeeAddons.Remove(existing);
        await _context.SaveChangesAsync();
        return true;
    }
}
