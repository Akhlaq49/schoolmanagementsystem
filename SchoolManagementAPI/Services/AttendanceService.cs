using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Data;
using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public class AttendanceService : IAttendanceService
{
    private readonly ApplicationDbContext _context;

    public AttendanceService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Attendance>> GetAttendanceByDateAsync(DateTime date, int? classId, int? sectionId)
    {
        var query = _context.Attendances
            .Include(a => a.Student)
            .Where(a => a.Date.Date == date.Date);

        if (classId.HasValue)
        {
            query = query.Where(a => a.Student.ClassId == classId.Value);
        }

        if (sectionId.HasValue)
        {
            query = query.Where(a => a.Student.SectionId == sectionId.Value);
        }

        return await query.ToListAsync();
    }

    public async Task<Attendance?> GetAttendanceByIdAsync(int id)
    {
        return await _context.Attendances
            .Include(a => a.Student)
            .FirstOrDefaultAsync(a => a.AttendanceId == id);
    }

    public async Task<Attendance> CreateAttendanceAsync(Attendance attendance)
    {
        _context.Attendances.Add(attendance);
        await _context.SaveChangesAsync();
        return attendance;
    }

    public async Task<Attendance?> UpdateAttendanceAsync(int id, Attendance attendance)
    {
        var existing = await _context.Attendances.FindAsync(id);
        if (existing == null) return null;

        existing.Status = attendance.Status;
        existing.Date = attendance.Date;
        existing.Session = attendance.Session;

        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteAttendanceAsync(int id)
    {
        var attendance = await _context.Attendances.FindAsync(id);
        if (attendance == null) return false;

        _context.Attendances.Remove(attendance);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<Attendance>> GetAttendanceReportAsync(int studentId, int month, int year)
    {
        return await _context.Attendances
            .Include(a => a.Student)
            .Where(a => a.StudentId == studentId 
                && a.Date.Month == month 
                && a.Date.Year == year)
            .OrderBy(a => a.Date)
            .ToListAsync();
    }
}

