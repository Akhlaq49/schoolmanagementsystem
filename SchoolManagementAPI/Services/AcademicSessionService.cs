using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Data;
using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public interface IAcademicSessionService
{
    Task<List<AcademicSession>> GetAllAsync();
    Task<AcademicSession?> GetByIdAsync(int id);
    Task<AcademicSession> CreateAsync(AcademicSession session);
    Task<AcademicSession?> UpdateAsync(int id, AcademicSession session);
    Task<bool> DeleteAsync(int id);
}

public class AcademicSessionService : IAcademicSessionService
{
    private readonly ApplicationDbContext _context;

    public AcademicSessionService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<AcademicSession>> GetAllAsync()
    {
        return await _context.AcademicSessions
            .AsNoTracking()
            .OrderByDescending(s => s.IsCurrent)
            .ThenByDescending(s => s.StartDate)
            .ToListAsync();
    }

    public async Task<AcademicSession?> GetByIdAsync(int id)
    {
        return await _context.AcademicSessions
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.AcademicSessionId == id);
    }

    public async Task<AcademicSession> CreateAsync(AcademicSession session)
    {
        if (session.IsCurrent)
        {
            await ClearCurrentFlagAsync();
        }

        _context.AcademicSessions.Add(session);
        await _context.SaveChangesAsync();
        return session;
    }

    public async Task<AcademicSession?> UpdateAsync(int id, AcademicSession session)
    {
        var existing = await _context.AcademicSessions.FindAsync(id);
        if (existing == null) return null;

        if (session.IsCurrent && !existing.IsCurrent)
        {
            await ClearCurrentFlagAsync();
        }

        existing.Name = session.Name;
        existing.StartDate = session.StartDate;
        existing.EndDate = session.EndDate;
        existing.IsCurrent = session.IsCurrent;
        existing.IsActive = session.IsActive;

        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var existing = await _context.AcademicSessions.FindAsync(id);
        if (existing == null) return false;

        _context.AcademicSessions.Remove(existing);
        await _context.SaveChangesAsync();
        return true;
    }

    private async Task ClearCurrentFlagAsync()
    {
        var currentSessions = await _context.AcademicSessions
            .Where(s => s.IsCurrent)
            .ToListAsync();

        if (currentSessions.Count == 0) return;

        foreach (var s in currentSessions)
        {
            s.IsCurrent = false;
        }

        await _context.SaveChangesAsync();
    }
}

