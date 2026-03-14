using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Data;
using SchoolManagementAPI.DTOs;
using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public class AttendanceCorrectionService : IAttendanceCorrectionService
{
    private readonly ApplicationDbContext _context;

    public AttendanceCorrectionService(ApplicationDbContext context)
    {
        _context = context;
    }

    private static TimeSpan? ParseTime(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        if (TimeSpan.TryParse(value, out var ts)) return ts;
        if (value.Length >= 5 && value[2] == ':')
            return TimeSpan.TryParse(value.Length == 5 ? value + ":00" : value, out ts) ? ts : null;
        return null;
    }

    public async Task<AttendanceCorrection> CreateAsync(CreateCorrectionRequestDto dto)
    {
        var attendance = await _context.Attendances.FindAsync(dto.AttendanceId);
        if (attendance == null || attendance.StudentId != dto.StudentId)
            throw new InvalidOperationException("Attendance not found or access denied");

        var existing = await _context.AttendanceCorrections
            .FirstOrDefaultAsync(c => c.AttendanceId == dto.AttendanceId && c.Status == "pending");
        if (existing != null)
            throw new InvalidOperationException("A pending correction request already exists for this attendance");

        var correction = new AttendanceCorrection
        {
            AttendanceId = dto.AttendanceId,
            StudentId = dto.StudentId,
            Reason = dto.Reason,
            RequestedStatus = dto.RequestedStatus,
            RequestedTimeIn = ParseTime(dto.RequestedTimeIn),
            RequestedTimeOut = ParseTime(dto.RequestedTimeOut),
            RequestedRemarks = dto.RequestedRemarks,
            Status = "pending"
        };
        _context.AttendanceCorrections.Add(correction);
        await _context.SaveChangesAsync();
        await LoadRelations(correction);
        return correction;
    }

    public async Task<List<AttendanceCorrection>> GetByStudentAsync(int studentId)
    {
        return await _context.AttendanceCorrections
            .Include(c => c.Attendance)
            .Where(c => c.StudentId == studentId)
            .OrderByDescending(c => c.RequestedAt)
            .ToListAsync();
    }

    public async Task<List<AttendanceCorrection>> GetPendingForAdminAsync()
    {
        return await _context.AttendanceCorrections
            .Include(c => c.Attendance)
                .ThenInclude(a => a!.Student)
            .Where(c => c.Status == "pending")
            .OrderBy(c => c.RequestedAt)
            .ToListAsync();
    }

    public async Task<AttendanceCorrection?> ReviewAsync(int id, ReviewCorrectionDto dto, int reviewerUserId)
    {
        var c = await _context.AttendanceCorrections
            .Include(x => x.Attendance)
            .FirstOrDefaultAsync(x => x.AttendanceCorrectionId == id);
        if (c == null || c.Status != "pending") return null;

        c.Status = dto.Status.ToLowerInvariant();
        c.ReviewedBy = reviewerUserId;
        c.ReviewerRemarks = dto.ReviewerRemarks;
        c.ReviewedAt = DateTime.UtcNow;

        if (c.Status == "approved")
        {
            var att = c.Attendance;
            if (c.RequestedStatus.HasValue) att.Status = c.RequestedStatus.Value;
            if (c.RequestedTimeIn.HasValue) att.TimeIn = c.RequestedTimeIn;
            if (c.RequestedTimeOut.HasValue) att.TimeOut = c.RequestedTimeOut;
            if (c.RequestedRemarks != null) att.Remarks = c.RequestedRemarks;
        }

        await _context.SaveChangesAsync();
        await LoadRelations(c);
        return c;
    }

    public async Task<AttendanceCorrection?> GetByIdAsync(int id)
    {
        var c = await _context.AttendanceCorrections.FindAsync(id);
        if (c != null) await LoadRelations(c);
        return c;
    }

    private async Task LoadRelations(AttendanceCorrection c)
    {
        await _context.Entry(c).Reference(x => x.Attendance).LoadAsync();
        if (c.Attendance != null)
            await _context.Entry(c.Attendance).Reference(a => a.Student).LoadAsync();
    }
}
