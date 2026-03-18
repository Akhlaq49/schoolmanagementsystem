using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Data;
using SchoolManagementAPI.DTOs;
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
            .Where(a => a.Date.Date == date.Date && a.StudentId != null);

        if (classId.HasValue)
            query = query.Where(a => a.Student!.ClassId == classId.Value);
        if (sectionId.HasValue)
            query = query.Where(a => a.Student!.SectionId == sectionId.Value);

        return await query.ToListAsync();
    }

    public async Task<Attendance?> GetAttendanceByIdAsync(int id)
    {
        return await _context.Attendances
            .Include(a => a.Student)
            .Include(a => a.Teacher)
            .FirstOrDefaultAsync(a => a.AttendanceId == id);
    }

    public async Task<Attendance?> GetTodayAttendanceAsync(int studentId)
    {
        var today = DateTime.Today;
        return await _context.Attendances
            .Include(a => a.Student)
            .FirstOrDefaultAsync(a => a.StudentId == studentId && a.Date.Date == today);
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
        existing.TimeIn = attendance.TimeIn;
        existing.TimeOut = attendance.TimeOut;
        existing.Remarks = attendance.Remarks;
        existing.LeaveReason = attendance.LeaveReason;

        await _context.SaveChangesAsync();
        if (existing.StudentId.HasValue)
            await _context.Entry(existing).Reference(a => a.Student).LoadAsync();
        if (existing.TeacherId.HasValue)
            await _context.Entry(existing).Reference(a => a.Teacher).LoadAsync();
        return existing;
    }

    public async Task<Attendance?> UpdateAttendanceByIdAsync(int id, UpdateAttendanceDto dto)
    {
        var existing = await _context.Attendances.FindAsync(id);
        if (existing == null) return null;

        if (dto.Status.HasValue) existing.Status = dto.Status.Value;
        if (dto.TimeIn != null) existing.TimeIn = ParseTimeSpan(dto.TimeIn);
        if (dto.TimeOut != null) existing.TimeOut = ParseTimeSpan(dto.TimeOut);
        if (dto.Remarks != null) existing.Remarks = dto.Remarks;
        if (dto.LeaveReason != null) existing.LeaveReason = dto.LeaveReason;

        await _context.SaveChangesAsync();
        if (existing.StudentId.HasValue)
            await _context.Entry(existing).Reference(a => a.Student).LoadAsync();
        if (existing.TeacherId.HasValue)
            await _context.Entry(existing).Reference(a => a.Teacher).LoadAsync();
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

    public async Task<AttendanceReportResponseDto> GetAttendanceReportWithSummaryAsync(int studentId, int? month, int? year, DateTime? fromDate, DateTime? toDate)
    {
        var query = _context.Attendances
            .Include(a => a.Student)
            .Where(a => a.StudentId == studentId);

        if (fromDate.HasValue && toDate.HasValue)
        {
            query = query.Where(a => a.Date.Date >= fromDate.Value.Date && a.Date.Date <= toDate.Value.Date);
        }
        else if (month.HasValue && year.HasValue)
        {
            query = query.Where(a => a.Date.Month == month.Value && a.Date.Year == year.Value);
        }
        else
        {
            var now = DateTime.Today;
            query = query.Where(a => a.Date.Month == now.Month && a.Date.Year == now.Year);
        }

        var list = await query.OrderBy(a => a.Date).ToListAsync();

        var presentCount = list.Count(a => a.Status == 1 || a.Status == 2 || a.Status == 7); // PP, PO, Late
        var absentCount = list.Count(a => a.Status == 3);
        var leaveCount = list.Count(a => a.Status == 4 || a.Status == 5); // SL, FL
        var holidayCount = list.Count(a => a.Status == 6);
        var notMarkedCount = list.Count(a => a.Status == 0);
        var totalDays = list.Count;
        var workingDays = totalDays - holidayCount;
        var attendancePercent = workingDays > 0 ? Math.Round(100.0 * presentCount / workingDays, 2) : 0;

        return new AttendanceReportResponseDto
        {
            Records = list.Select(a => new AttendanceRecordDto
            {
                AttendanceId = a.AttendanceId,
                StudentId = a.StudentId ?? 0,
                Date = a.Date,
                Status = a.Status,
                TimeIn = a.TimeIn.HasValue ? a.TimeIn.Value.ToString(@"hh\:mm") : null,
                TimeOut = a.TimeOut.HasValue ? a.TimeOut.Value.ToString(@"hh\:mm") : null,
                Remarks = a.Remarks
            }).ToList(),
            Summary = new AttendanceReportSummaryDto
            {
                TotalDays = totalDays,
                PresentCount = presentCount,
                AbsentCount = absentCount,
                LeaveCount = leaveCount,
                HolidayCount = holidayCount,
                NotMarkedCount = notMarkedCount,
                AttendancePercent = attendancePercent
            }
        };
    }

    public async Task<Attendance> CheckInAsync(CheckInRequestDto dto, int? markedByUserId = null)
    {
        var date = DateTime.Parse(dto.Date).Date;
        var status = dto.Mode.ToUpperInvariant() == "PO" ? 2 : 1; // 1=PP, 2=PO
        var timeIn = ParseTimeSpan(dto.TimeIn);

        var existing = await _context.Attendances
            .FirstOrDefaultAsync(a => a.StudentId == dto.StudentId && a.Date.Date == date && a.StudentId != null);

        if (existing != null)
        {
            existing.Status = status;
            existing.TimeIn = timeIn ?? existing.TimeIn;
            existing.Remarks = dto.Remarks ?? existing.Remarks;
            existing.MarkedBy = markedByUserId ?? existing.MarkedBy;
            existing.MarkedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            if (existing.StudentId.HasValue)
                await _context.Entry(existing).Reference(a => a.Student).LoadAsync();
            if (existing.TeacherId.HasValue)
                await _context.Entry(existing).Reference(a => a.Teacher).LoadAsync();
            return existing;
        }

        var attendance = new Attendance
        {
            StudentId = dto.StudentId,
            Date = date,
            Status = status,
            TimeIn = timeIn,
            Remarks = dto.Remarks,
            MarkedBy = markedByUserId,
            MarkedAt = DateTime.UtcNow
        };
        _context.Attendances.Add(attendance);
        await _context.SaveChangesAsync();
        if (attendance.StudentId.HasValue)
            await _context.Entry(attendance).Reference(a => a.Student).LoadAsync();
        if (attendance.TeacherId.HasValue)
            await _context.Entry(attendance).Reference(a => a.Teacher).LoadAsync();
        return attendance;
    }

    public async Task<Attendance?> CheckOutAsync(CheckOutRequestDto dto)
    {
        var date = DateTime.Parse(dto.Date).Date;
        var timeOut = ParseTimeSpan(dto.TimeOut);

        var existing = await _context.Attendances
            .Include(a => a.Student)
            .FirstOrDefaultAsync(a => a.StudentId == dto.StudentId && a.Date.Date == date);

        if (existing == null) return null;

        existing.TimeOut = timeOut ?? existing.TimeOut;
        existing.Remarks = dto.Remarks ?? existing.Remarks;
        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<List<Attendance>> BulkSaveAttendanceAsync(BulkAttendanceRequestDto dto, int? markedByUserId = null)
    {
        var date = DateTime.Parse(dto.Date).Date;
        var now = DateTime.UtcNow;
        var result = new List<Attendance>();

        foreach (var rec in dto.Records)
        {
            var existing = await _context.Attendances
                .FirstOrDefaultAsync(a => a.StudentId == rec.StudentId && a.Date.Date == date && a.StudentId != null);

            var timeIn = ParseTimeSpan(rec.TimeIn);
            var timeOut = ParseTimeSpan(rec.TimeOut);

            if (existing != null)
            {
                existing.Status = rec.Status;
                // If status isn't PP/PO, we should clear time fields.
                // This supports "Clear row" -> status=0 and timeIn/timeOut should become NULL.
                existing.TimeIn = (rec.Status == 1 || rec.Status == 2) ? timeIn : null;
                existing.TimeOut = (rec.Status == 1 || rec.Status == 2) ? timeOut : null;
                existing.Remarks = rec.Remarks;
                existing.LeaveReason = rec.LeaveReason;
                existing.MarkedBy = markedByUserId ?? existing.MarkedBy;
                existing.MarkedAt = now;
                result.Add(existing);
            }
            else
            {
                var attendance = new Attendance
                {
                    StudentId = rec.StudentId,
                    Date = date,
                    Status = rec.Status,
                    TimeIn = (rec.Status == 1 || rec.Status == 2) ? timeIn : null,
                    TimeOut = (rec.Status == 1 || rec.Status == 2) ? timeOut : null,
                    Remarks = rec.Remarks,
                    LeaveReason = rec.LeaveReason,
                    MarkedBy = markedByUserId,
                    MarkedAt = now
                };
                _context.Attendances.Add(attendance);
                result.Add(attendance);
            }
        }

        await _context.SaveChangesAsync();
        foreach (var a in result)
            await _context.Entry(a).Reference(x => x.Student).LoadAsync();
        return result;
    }

    public async Task<List<Attendance>> GetTeacherThisMonthAsync(int teacherId, int month, int year)
    {
        return await _context.Attendances
            .Include(a => a.Teacher)
            .Where(a => a.TeacherId == teacherId && a.Date.Month == month && a.Date.Year == year)
            .OrderBy(a => a.Date)
            .ToListAsync();
    }

    public async Task<Attendance?> GetTeacherTodayAsync(int teacherId)
    {
        var today = DateTime.Today;
        return await _context.Attendances
            .Include(a => a.Teacher)
            .FirstOrDefaultAsync(a => a.TeacherId == teacherId && a.Date.Date == today);
    }

    public async Task<List<Attendance>> GetAllByTeacherAsync(int teacherId)
    {
        return await _context.Attendances
            .Include(a => a.Teacher)
            .Where(a => a.TeacherId == teacherId)
            .OrderByDescending(a => a.Date)
            .ToListAsync();
    }

    public async Task<Attendance> TeacherCheckInAsync(int teacherId, TeacherCheckInDto dto)
    {
        var date = DateTime.Parse(dto.Date).Date;
        var timeIn = ParseTimeSpan(dto.TimeIn);

        var existing = await _context.Attendances
            .FirstOrDefaultAsync(a => a.TeacherId == teacherId && a.Date.Date == date);

        if (existing != null)
        {
            existing.TimeIn = timeIn ?? existing.TimeIn;
            existing.Status = 1;
            existing.Remarks = dto.Remarks ?? existing.Remarks;
            existing.MarkedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            await _context.Entry(existing).Reference(a => a.Teacher).LoadAsync();
            return existing;
        }

        var attendance = new Attendance
        {
            TeacherId = teacherId,
            Date = date,
            Status = 1,
            TimeIn = timeIn,
            Remarks = dto.Remarks,
            MarkedAt = DateTime.UtcNow
        };
        _context.Attendances.Add(attendance);
        await _context.SaveChangesAsync();
        await _context.Entry(attendance).Reference(a => a.Teacher).LoadAsync();
        return attendance;
    }

    public async Task<Attendance?> TeacherCheckOutAsync(int teacherId, TeacherCheckOutDto dto)
    {
        var date = DateTime.Parse(dto.Date).Date;
        var timeOut = ParseTimeSpan(dto.TimeOut);

        var existing = await _context.Attendances
            .Include(a => a.Teacher)
            .FirstOrDefaultAsync(a => a.TeacherId == teacherId && a.Date.Date == date);

        if (existing == null) return null;

        existing.TimeOut = timeOut ?? existing.TimeOut;
        existing.Remarks = dto.Remarks ?? existing.Remarks;
        existing.MarkedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<List<ClassAttendanceSheetItemDto>> GetClassAttendanceSheetAsync(DateTime date, int classId, int? sectionId)
    {
        var studentQuery = _context.Students
            .Include(s => s.Class)
            .Include(s => s.Section)
            .Where(s => s.ClassId == classId);
        if (sectionId.HasValue)
            studentQuery = studentQuery.Where(s => s.SectionId == sectionId.Value);
        var students = await studentQuery.OrderBy(s => s.Roll).ThenBy(s => s.Name).ToListAsync();
        var studentIds = students.Select(s => s.StudentId).ToHashSet();

        // Load attendance for this date for these students only (avoids class filter/date timezone issues)
        var dateOnly = date.Date;
        var attendanceList = await _context.Attendances
            .Where(a => a.StudentId != null && a.Date.Date == dateOnly && studentIds.Contains(a.StudentId.Value))
            .ToListAsync();
        var attendanceByStudent = attendanceList.Where(a => a.StudentId.HasValue).ToDictionary(a => a.StudentId!.Value);

        return students.Select(s =>
        {
            var att = attendanceByStudent.GetValueOrDefault(s.StudentId);
            string? timeInStr = null;
            string? timeOutStr = null;
            if (att != null)
            {
                if (att.TimeIn.HasValue)
                    timeInStr = $"{att.TimeIn.Value.Hours:D2}:{att.TimeIn.Value.Minutes:D2}";
                if (att.TimeOut.HasValue)
                    timeOutStr = $"{att.TimeOut.Value.Hours:D2}:{att.TimeOut.Value.Minutes:D2}";
            }
            return new ClassAttendanceSheetItemDto
            {
                StudentId = s.StudentId,
                StudentName = s.Name,
                RollNumber = s.Roll,
                ClassId = s.ClassId,
                SectionId = s.SectionId,
                ClassName = s.Class?.Name,
                SectionName = s.Section?.Name,
                AttendanceId = att?.AttendanceId,
                Status = att?.Status ?? 0,
                TimeIn = timeInStr,
                TimeOut = timeOutStr,
                Remarks = att?.Remarks,
                LeaveReason = att?.LeaveReason
            };
        }).ToList();
    }

    private static TimeSpan? ParseTimeSpan(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        if (TimeSpan.TryParse(value, out var ts)) return ts;
        if (value.Length == 5 && value[2] == ':') // HH:mm
            return TimeSpan.TryParse(value + ":00", out ts) ? ts : null;
        return null;
    }
}

