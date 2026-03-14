using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Data;
using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public class LeaveService : ILeaveService
{
    private readonly ApplicationDbContext _context;

    public LeaveService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<LeaveApplication>> GetByApplicantAsync(string applicantType, int applicantId)
    {
        return await _context.LeaveApplications
            .Where(l => l.ApplicantType == applicantType && l.ApplicantId == applicantId)
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<LeaveApplication>> GetAllAsync(string? applicantType = null, string? status = null)
    {
        var q = _context.LeaveApplications.AsQueryable();
        if (!string.IsNullOrEmpty(applicantType))
            q = q.Where(l => l.ApplicantType == applicantType);
        if (!string.IsNullOrEmpty(status))
            q = q.Where(l => l.Status == status);
        return await q.OrderByDescending(l => l.CreatedAt).ToListAsync();
    }

    public async Task<LeaveApplication?> GetByIdAsync(int id)
    {
        return await _context.LeaveApplications.FindAsync(id);
    }

    public async Task<LeaveApplication> CreateAsync(LeaveApplication leave)
    {
        leave.CreatedAt = DateTime.UtcNow;
        leave.Status = "pending";
        _context.LeaveApplications.Add(leave);
        await _context.SaveChangesAsync();
        return leave;
    }

    public async Task<LeaveApplication?> UpdateAsync(int id, LeaveApplication leave)
    {
        var existing = await _context.LeaveApplications.FindAsync(id);
        if (existing == null) return null;

        if (existing.Status != "pending")
            return null;

        existing.LeaveType = leave.LeaveType;
        existing.LeaveFrom = leave.LeaveFrom;
        existing.LeaveTo = leave.LeaveTo;
        existing.Reason = leave.Reason;
        existing.AttachmentUrl = leave.AttachmentUrl;

        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<LeaveApplication?> ReviewAsync(int id, string status, int? reviewerId = null, string? reviewerRemarks = null)
    {
        var existing = await _context.LeaveApplications.FindAsync(id);
        if (existing == null) return null;
        if (existing.Status != "pending") return null;
        if (status != "approved" && status != "rejected") return null;

        existing.Status = status;
        existing.ReviewerId = reviewerId;
        existing.ReviewerRemarks = reviewerRemarks;
        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var existing = await _context.LeaveApplications.FindAsync(id);
        if (existing == null) return false;

        if (existing.Status != "pending")
            return false;

        _context.LeaveApplications.Remove(existing);
        await _context.SaveChangesAsync();
        return true;
    }
}
