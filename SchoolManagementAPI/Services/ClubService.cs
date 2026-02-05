using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Data;
using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public class ClubService : IClubService
{
    private readonly ApplicationDbContext _context;

    public ClubService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Club>> GetAllClubsAsync()
    {
        return await _context.Clubs.ToListAsync();
    }

    public async Task<Club?> GetClubByIdAsync(int id)
    {
        return await _context.Clubs.FindAsync(id);
    }

    public async Task<Club> CreateClubAsync(Club club)
    {
        _context.Clubs.Add(club);
        await _context.SaveChangesAsync();
        return club;
    }

    public async Task<Club?> UpdateClubAsync(int id, Club club)
    {
        var existing = await _context.Clubs.FindAsync(id);
        if (existing == null) return null;

        existing.ClubName = club.ClubName;
        existing.Description = club.Description;
        existing.Date = club.Date;

        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteClubAsync(int id)
    {
        var club = await _context.Clubs.FindAsync(id);
        if (club == null) return false;

        _context.Clubs.Remove(club);
        await _context.SaveChangesAsync();
        return true;
    }
}

