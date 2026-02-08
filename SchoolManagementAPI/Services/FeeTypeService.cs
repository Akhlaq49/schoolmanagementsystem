using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Data;
using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public class FeeTypeService : IFeeTypeService
{
    private readonly ApplicationDbContext _context;

    public FeeTypeService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<FeeType>> GetAllAsync()
    {
        return await _context.FeeTypes.OrderBy(ft => ft.Name).ToListAsync();
    }

    public async Task<FeeType?> GetByIdAsync(int id)
    {
        return await _context.FeeTypes.FindAsync(id);
    }

    public async Task<FeeType?> GetByNameAsync(string name)
    {
        return await _context.FeeTypes.FirstOrDefaultAsync(ft => ft.Name == name);
    }

    public async Task<FeeType> CreateAsync(FeeType feeType)
    {
        feeType.CreatedDate = DateTime.Now;
        feeType.ModifiedDate = DateTime.Now;
        _context.FeeTypes.Add(feeType);
        await _context.SaveChangesAsync();
        return feeType;
    }

    public async Task<FeeType?> UpdateAsync(int id, FeeType feeType)
    {
        var existing = await _context.FeeTypes.FindAsync(id);
        if (existing == null) return null;

        existing.Name = feeType.Name;
        existing.Description = feeType.Description;
        existing.IsRecurring = feeType.IsRecurring;
        existing.DefaultAmount = feeType.DefaultAmount;
        existing.ModifiedDate = DateTime.Now;

        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var feeType = await _context.FeeTypes.FindAsync(id);
        if (feeType == null) return false;

        _context.FeeTypes.Remove(feeType);
        await _context.SaveChangesAsync();
        return true;
    }
}
