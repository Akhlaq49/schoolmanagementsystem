using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Data;
using SchoolManagementAPI.DTOs;
using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public class FeeStructureService : IFeeStructureService
{
    private readonly ApplicationDbContext _context;

    public FeeStructureService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<FeeStructureResponseDto>> GetAllAsync()
    {
        var list = await _context.FeeStructures
            .AsNoTracking()
            .Include(fs => fs.Class)
            .Include(fs => fs.AcademicSession)
            .Include(fs => fs.Addons)
                .ThenInclude(a => a.FeeAddon)
            .OrderByDescending(fs => fs.CreatedAt)
            .ToListAsync();

        return list.Select(MapToResponse).ToList();
    }

    public async Task<FeeStructureResponseDto?> GetByIdAsync(int id)
    {
        var entity = await GetEntityWithIncludes(id);
        return entity is null ? null : MapToResponse(entity);
    }

    public async Task<FeeStructureResponseDto> CreateAsync(CreateFeeStructureDto dto)
    {
        var entity = new Models.FeeStructure
        {
            Name = dto.Name,
            ClassId = dto.ClassId,
            AcademicSessionId = dto.AcademicSessionId,
            MonthlyAmount = dto.MonthlyAmount,
            DueDayOfMonth = dto.DueDayOfMonth,
            LateFinePerDay = dto.LateFinePerDay,
            Description = dto.Description,
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow,
            Addons = dto.Addons.Select(a => new FeeStructureAddon
            {
                FeeAddonId = a.FeeAddonId,
                Amount = a.Amount
            }).ToList()
        };

        _context.FeeStructures.Add(entity);
        await _context.SaveChangesAsync();

        var created = await GetEntityWithIncludes(entity.FeeStructureId);
        return MapToResponse(created!);
    }

    public async Task<FeeStructureResponseDto?> UpdateAsync(int id, UpdateFeeStructureDto dto)
    {
        var existing = await _context.FeeStructures
            .Include(fs => fs.Addons)
            .FirstOrDefaultAsync(fs => fs.FeeStructureId == id);

        if (existing is null) return null;

        existing.Name = dto.Name;
        existing.ClassId = dto.ClassId;
        existing.AcademicSessionId = dto.AcademicSessionId;
        existing.MonthlyAmount = dto.MonthlyAmount;
        existing.DueDayOfMonth = dto.DueDayOfMonth;
        existing.LateFinePerDay = dto.LateFinePerDay;
        existing.Description = dto.Description;
        existing.IsActive = dto.IsActive;

        _context.FeeStructureAddons.RemoveRange(existing.Addons);

        foreach (var a in dto.Addons)
        {
            existing.Addons.Add(new FeeStructureAddon
            {
                FeeStructureId = id,
                FeeAddonId = a.FeeAddonId,
                Amount = a.Amount
            });
        }

        await _context.SaveChangesAsync();

        var updated = await GetEntityWithIncludes(id);
        return MapToResponse(updated!);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var existing = await _context.FeeStructures.FindAsync(id);
        if (existing is null) return false;

        _context.FeeStructures.Remove(existing);
        await _context.SaveChangesAsync();
        return true;
    }

    private async Task<Models.FeeStructure?> GetEntityWithIncludes(int id)
    {
        return await _context.FeeStructures
            .AsNoTracking()
            .Include(fs => fs.Class)
            .Include(fs => fs.AcademicSession)
            .Include(fs => fs.Addons)
                .ThenInclude(a => a.FeeAddon)
            .FirstOrDefaultAsync(fs => fs.FeeStructureId == id);
    }

    private static FeeStructureResponseDto MapToResponse(Models.FeeStructure fs)
    {
        return new FeeStructureResponseDto
        {
            FeeStructureId = fs.FeeStructureId,
            Name = fs.Name,
            ClassId = fs.ClassId,
            ClassName = fs.Class?.Name,
            AcademicSessionId = fs.AcademicSessionId,
            AcademicSessionName = fs.AcademicSession?.Name,
            MonthlyAmount = fs.MonthlyAmount,
            DueDayOfMonth = fs.DueDayOfMonth,
            LateFinePerDay = fs.LateFinePerDay,
            Description = fs.Description,
            IsActive = fs.IsActive,
            CreatedAt = fs.CreatedAt,
            Addons = fs.Addons.Select(a => new FeeStructureAddonResponseDto
            {
                FeeStructureAddonId = a.FeeStructureAddonId,
                FeeAddonId = a.FeeAddonId,
                FeeAddonName = a.FeeAddon?.Name,
                Amount = a.Amount
            }).ToList()
        };
    }
}
