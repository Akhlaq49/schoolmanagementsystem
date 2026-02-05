using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Data;
using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public class NoticeboardService : INoticeboardService
{
    private readonly ApplicationDbContext _context;

    public NoticeboardService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Noticeboard>> GetAllNoticesAsync()
    {
        return await _context.Noticeboards
            .OrderByDescending(n => n.CreateTimestamp)
            .ToListAsync();
    }

    public async Task<Noticeboard?> GetNoticeByIdAsync(int id)
    {
        return await _context.Noticeboards.FindAsync(id);
    }

    public async Task<Noticeboard> CreateNoticeAsync(Noticeboard notice)
    {
        notice.CreateTimestamp = DateTime.UtcNow;
        _context.Noticeboards.Add(notice);
        await _context.SaveChangesAsync();
        return notice;
    }

    public async Task<Noticeboard?> UpdateNoticeAsync(int id, Noticeboard notice)
    {
        var existing = await _context.Noticeboards.FindAsync(id);
        if (existing == null) return null;

        existing.NoticeTitle = notice.NoticeTitle;
        existing.Notice = notice.Notice;

        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteNoticeAsync(int id)
    {
        var notice = await _context.Noticeboards.FindAsync(id);
        if (notice == null) return false;

        _context.Noticeboards.Remove(notice);
        await _context.SaveChangesAsync();
        return true;
    }
}

