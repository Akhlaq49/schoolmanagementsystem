using Microsoft.EntityFrameworkCore;
using System.Text;
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

    // -----------------------------
    // Admin: Staff Attendance
    // -----------------------------

    public async Task<List<StaffAttendanceDto>> GetStaffAttendanceAsync(DateTime date)
    {
        var dateOnly = date.Date;

        // Staff are based on Teacher role in the unified users table.
        var staffUsers = await _context.Users
            .Include(u => u.UserRoles)
            .Where(u => u.UserRoles.Any(ur => ur.Role == UserRole.Teacher))
            .OrderBy(u => u.Name)
            .Select(u => new { u.UserId, u.Name })
            .ToListAsync();

        var staffIds = staffUsers.Select(x => x.UserId).ToHashSet();

        var attendanceList = await _context.Attendances
            .Where(a => a.TeacherId != null && a.Date.Date == dateOnly && staffIds.Contains(a.TeacherId.Value))
            .ToListAsync();

        var attendanceByStaff = attendanceList
            .Where(a => a.TeacherId.HasValue)
            .ToDictionary(a => a.TeacherId!.Value);

        return staffUsers.Select(s =>
        {
            var att = attendanceByStaff.GetValueOrDefault(s.UserId);
            var timeInStr = att?.TimeIn.HasValue == true
                ? $"{att.TimeIn.Value.Hours:D2}:{att.TimeIn.Value.Minutes:D2}"
                : string.Empty;
            var timeOutStr = att?.TimeOut.HasValue == true
                ? $"{att.TimeOut.Value.Hours:D2}:{att.TimeOut.Value.Minutes:D2}"
                : string.Empty;

            return new StaffAttendanceDto
            {
                StaffId = s.UserId,
                Name = s.Name,
                // Department isn't reliably mapped in the current users model.
                Department = "—",
                Status = att?.Status ?? 0,
                TimeIn = timeInStr,
                TimeOut = timeOutStr
            };
        }).ToList();
    }

    public async Task<List<Attendance>> BulkSaveStaffAttendanceAsync(StaffAttendanceBulkRequestDto dto, int? markedByUserId = null)
    {
        var dateOnly = DateTime.Parse(dto.Date).Date;
        var now = DateTime.UtcNow;
        var result = new List<Attendance>();

        foreach (var rec in dto.Records)
        {
            var existing = await _context.Attendances
                .FirstOrDefaultAsync(a => a.TeacherId == rec.StaffId && a.Date.Date == dateOnly);

            var timeIn = ParseTimeSpan(rec.TimeIn);
            var timeOut = ParseTimeSpan(rec.TimeOut);

            if (existing != null)
            {
                existing.Status = rec.Status;
                existing.TimeIn = (rec.Status == 1 || rec.Status == 2) ? timeIn : null;
                existing.TimeOut = (rec.Status == 1 || rec.Status == 2) ? timeOut : null;
                existing.MarkedBy = markedByUserId ?? existing.MarkedBy;
                existing.MarkedAt = now;
                result.Add(existing);
            }
            else
            {
                var attendance = new Attendance
                {
                    TeacherId = rec.StaffId,
                    Date = dateOnly,
                    Status = rec.Status,
                    TimeIn = (rec.Status == 1 || rec.Status == 2) ? timeIn : null,
                    TimeOut = (rec.Status == 1 || rec.Status == 2) ? timeOut : null,
                    MarkedBy = markedByUserId,
                    MarkedAt = now
                };

                _context.Attendances.Add(attendance);
                result.Add(attendance);
            }
        }

        await _context.SaveChangesAsync();
        return result;
    }

    public async Task<List<StaffAttendanceHistoryDto>> GetStaffAttendanceHistoryAsync(int staffId)
    {
        var list = await _context.Attendances
            .Where(a => a.TeacherId == staffId)
            .OrderByDescending(a => a.Date)
            .ToListAsync();

        string statusLabel(int status) => status switch
        {
            0 => "Not Marked",
            1 => "PP",
            2 => "PO",
            3 => "A",
            _ => status.ToString()
        };

        string formatTime(TimeSpan? t) =>
            t.HasValue ? $"{t.Value.Hours:D2}:{t.Value.Minutes:D2}" : string.Empty;

        return list.Select(a => new StaffAttendanceHistoryDto
        {
            Date = a.Date.Date.ToString("yyyy-MM-dd"),
            Status = statusLabel(a.Status),
            TimeIn = formatTime(a.TimeIn),
            TimeOut = formatTime(a.TimeOut)
        }).ToList();
    }

    // -----------------------------
    // Admin: Daily summary
    // -----------------------------
    public async Task<AdminAttendanceDailySummaryDto> GetAdminAttendanceDailySummaryAsync(DateTime date)
    {
        var dateOnly = date.Date;

        // 1) Build class/section list based on existing students.
        var studentGroups = await _context.Students
            .Where(s => s.ClassId.HasValue && s.SectionId.HasValue)
            .GroupBy(s => new { ClassId = s.ClassId!.Value, SectionId = s.SectionId!.Value })
            .Select(g => new { g.Key.ClassId, g.Key.SectionId, Total = g.Count() })
            .ToListAsync();

        var classIds = studentGroups.Select(x => x.ClassId).Distinct().ToList();
        var sectionIds = studentGroups.Select(x => x.SectionId).Distinct().ToList();

        var classes = await _context.Classes
            .Where(c => classIds.Contains(c.ClassId))
            .Select(c => new { c.ClassId, c.Name, c.TeacherId })
            .ToListAsync();

        var sections = await _context.Sections
            .Where(s => sectionIds.Contains(s.SectionId))
            .Select(s => new { s.SectionId, s.Name, s.ClassId, s.TeacherId })
            .ToListAsync();

        var teacherIds = studentGroups
            .Select(g =>
            {
                var classTeacherId = classes.FirstOrDefault(c => c.ClassId == g.ClassId)?.TeacherId;
                var sectionTeacherId = sections.FirstOrDefault(s => s.SectionId == g.SectionId)?.TeacherId;
                return sectionTeacherId ?? classTeacherId;
            })
            .Where(id => id.HasValue)
            .Select(id => id!.Value)
            .Distinct()
            .ToList();

        var teacherNames = await _context.Users
            .Where(u => teacherIds.Contains(u.UserId))
            .Select(u => new { u.UserId, u.Name })
            .ToDictionaryAsync(x => x.UserId, x => x.Name);

        // 2) Load attendance records for the day (student attendance only).
        //    We join to Student to get ClassId/SectionId for grouping.
        var attendanceRows = await _context.Attendances
            .Include(a => a.Student)
            .Where(a => a.StudentId != null && a.Date.Date == dateOnly && a.Student!.ClassId != null && a.Student!.SectionId != null)
            .Select(a => new
            {
                ClassId = a.Student!.ClassId!.Value,
                SectionId = a.Student!.SectionId!.Value,
                Status = a.Status
            })
            .ToListAsync();

        var attendanceByClassSection = attendanceRows
            .GroupBy(x => new { x.ClassId, x.SectionId })
            .ToDictionary(
                g => (g.Key.ClassId, g.Key.SectionId),
                g => new
                {
                    Count = g.Count(),
                    Present = g.Count(r => r.Status == 1 || r.Status == 2 || r.Status == 7), // PP, PO, Late
                    Absent = g.Count(r => r.Status == 3),
                    NotMarked = g.Count(r => r.Status == 0)
                }
            );

        // 3) Build class-wise breakdown.
        var classBreakdown = new List<AdminAttendanceClassBreakdownDto>();
        foreach (var g in studentGroups.OrderBy(x => x.ClassId).ThenBy(x => x.SectionId))
        {
            var classInfo = classes.FirstOrDefault(c => c.ClassId == g.ClassId);
            var sectionInfo = sections.FirstOrDefault(s => s.SectionId == g.SectionId);

            attendanceByClassSection.TryGetValue((g.ClassId, g.SectionId), out var att);

            var total = g.Total;
            var present = att?.Present ?? 0;
            var absent = att?.Absent ?? 0;

            // If teacher hasn't submitted anything for this section, treat all students as Not Marked.
            var notMarked = (att == null || att.Count == 0) ? total : (att.NotMarked);

            string status;
            if (att == null || att.Count == 0)
                status = "pending";
            else if (notMarked == 0)
                status = "complete";
            else
                status = "partial";

            var percentDenom = present + absent;
            var percent = percentDenom > 0 ? (int)Math.Round((present * 100.0) / percentDenom) : 0;

            classBreakdown.Add(new AdminAttendanceClassBreakdownDto
            {
                ClassId = g.ClassId,
                ClassName = classInfo?.Name ?? $"Class {g.ClassId}",
                Section = sectionInfo?.Name ?? $"Section {g.SectionId}",
                Total = total,
                Present = present,
                Absent = absent,
                NotMarked = notMarked,
                Percent = percent,
                Status = status
            });
        }

        // 4) Totals/stats across all classBreakdown.
        var stats = new AdminAttendanceDailyStatsDto
        {
            Total = classBreakdown.Sum(x => x.Total),
            Present = classBreakdown.Sum(x => x.Present),
            Absent = classBreakdown.Sum(x => x.Absent),
            NotMarked = classBreakdown.Sum(x => x.NotMarked),
        };
        var statsDenom = stats.Present + stats.Absent;
        stats.Percent = statsDenom > 0 ? (int)Math.Round((stats.Present * 100.0) / statsDenom) : 0;

        // 5) Build not-marked list: classes not complete + staff not marked.
        var notMarkedList = new List<AdminAttendanceNotMarkedItemDto>();

        // Build notMarkedList with stable mapping by using studentGroups and attendance groups again.
        foreach (var g in studentGroups)
        {
            var att = attendanceByClassSection.TryGetValue((g.ClassId, g.SectionId), out var tmp) ? tmp : null;

            var total = g.Total;
            var present = att?.Present ?? 0;
            var absent = att?.Absent ?? 0;
            var notMarked = (att == null || att.Count == 0) ? total : att.NotMarked;

            string status = (att == null || att.Count == 0) ? "pending" : (notMarked == 0 ? "complete" : "partial");
            if (status == "complete") continue;

            var classInfo = classes.FirstOrDefault(c => c.ClassId == g.ClassId);
            var sectionInfo = sections.FirstOrDefault(s => s.SectionId == g.SectionId);

            int? teacherId = sectionInfo?.TeacherId ?? classInfo?.TeacherId;
            teacherNames.TryGetValue(teacherId ?? -1, out var teacherName);

            notMarkedList.Add(new AdminAttendanceNotMarkedItemDto
            {
                Id = g.SectionId, // UI doesn't require a specific meaning; just unique.
                ClassName = classInfo?.Name ?? $"Class {g.ClassId}",
                Section = sectionInfo?.Name,
                Teacher = teacherId.HasValue ? (teacherNames.ContainsKey(teacherId.Value) ? teacherNames[teacherId.Value] : null) : null,
                Type = "class"
            });
        }

        // Staff not marked: teacher-role users missing attendance or with status 0.
        var staffUsers = await _context.Users
            .Include(u => u.UserRoles)
            .Where(u => u.UserRoles.Any(ur => ur.Role == UserRole.Teacher))
            .OrderBy(u => u.Name)
            .Select(u => new { u.UserId, u.Name })
            .ToListAsync();

        var staffIds = staffUsers.Select(s => s.UserId).ToHashSet();

        var staffAttendance = await _context.Attendances
            .Where(a => a.TeacherId != null && a.Date.Date == dateOnly && staffIds.Contains(a.TeacherId.Value))
            .ToListAsync();

        var staffAttendanceById = staffAttendance
            .Where(a => a.TeacherId.HasValue)
            .GroupBy(a => a.TeacherId!.Value)
            .ToDictionary(g => g.Key, g => g.OrderByDescending(x => x.MarkedAt).FirstOrDefault());

        foreach (var s in staffUsers)
        {
            var att = staffAttendanceById.GetValueOrDefault(s.UserId);
            var status = att?.Status ?? 0;

            if (att == null || status == 0)
            {
                notMarkedList.Add(new AdminAttendanceNotMarkedItemDto
                {
                    Id = s.UserId,
                    ClassName = s.Name,
                    Section = null,
                    Teacher = null,
                    Type = "staff"
                });
            }
        }

        // 6) Return.
        return new AdminAttendanceDailySummaryDto
        {
            Stats = stats,
            ClassBreakdown = classBreakdown,
            NotMarkedList = notMarkedList
        };
    }

    public async Task<AdminAttendanceDailyReminderResultDto> SendAdminAttendanceDailyRemindersAsync(DateTime date)
    {
        var summary = await GetAdminAttendanceDailySummaryAsync(date);
        // For now, reminders are simulated. Later we can integrate email/notification sending.
        return new AdminAttendanceDailyReminderResultDto
        {
            Count = summary.NotMarkedList.Count,
            Message = $"Reminder queued for {summary.NotMarkedList.Count} class/staff item(s)."
        };
    }

    public async Task<byte[]> ExportAdminAttendanceDailySummaryCsvAsync(DateTime date)
    {
        var summary = await GetAdminAttendanceDailySummaryAsync(date);

        var sb = new StringBuilder();
        sb.AppendLine("date,type,id,className,section,teacher,status,total,present,absent,notMarked,percent");

        foreach (var c in summary.ClassBreakdown.OrderBy(x => x.ClassId))
        {
            sb.AppendLine(string.Join(",",
                date.ToString("yyyy-MM-dd"),
                "class",
                c.ClassId,
                EscapeCsv(c.ClassName),
                EscapeCsv(c.Section),
                "", // teacher not included here
                c.Status,
                c.Total,
                c.Present,
                c.Absent,
                c.NotMarked,
                c.Percent
            ));
        }

        foreach (var n in summary.NotMarkedList.Where(x => x.Type == "staff"))
        {
            sb.AppendLine(string.Join(",",
                date.ToString("yyyy-MM-dd"),
                "staff",
                n.Id,
                EscapeCsv(n.ClassName),
                "",
                EscapeCsv(n.Teacher ?? ""),
                "pending",
                "",
                "",
                "",
                "",
                ""
            ));
        }

        return Encoding.UTF8.GetBytes(sb.ToString());
    }

    // -----------------------------
    // Admin: Monthly Grid
    // -----------------------------

    public async Task<MonthlyGridResponseDto> GetMonthlyGridAsync(int month, int year, int? classId, int? sectionId)
    {
        // 1) Load matching students.
        var studentQuery = _context.Students
            .Include(s => s.Class)
            .Include(s => s.Section)
            .Where(s => s.ClassId != null);

        if (classId.HasValue)
            studentQuery = studentQuery.Where(s => s.ClassId == classId.Value);
        if (sectionId.HasValue)
            studentQuery = studentQuery.Where(s => s.SectionId == sectionId.Value);

        var students = await studentQuery
            .OrderBy(s => s.ClassId)
            .ThenBy(s => s.SectionId)
            .ThenBy(s => s.Roll)
            .ThenBy(s => s.Name)
            .ToListAsync();

        var studentIds = students.Select(s => s.StudentId).ToHashSet();

        // 2) Load all attendance records for these students in the given month.
        var attendanceList = await _context.Attendances
            .Where(a => a.StudentId != null
                     && studentIds.Contains(a.StudentId!.Value)
                     && a.Date.Month == month
                     && a.Date.Year == year)
            .ToListAsync();

        // Key: (studentId, day) → attendance row.
        var attDict = attendanceList
            .Where(a => a.StudentId.HasValue)
            .GroupBy(a => (a.StudentId!.Value, a.Date.Day))
            .ToDictionary(g => g.Key, g => g.OrderByDescending(x => x.MarkedAt).First());

        // 3) Load calendar holidays for this month (type = 'holiday').
        var firstDay = new DateTime(year, month, 1);
        var lastDay = firstDay.AddMonths(1).AddDays(-1);
        var holidayDays = await _context.AttendanceCalendarItems
            .Where(ci => ci.Type == "holiday"
                      && ci.Date.Date >= firstDay.Date
                      && ci.Date.Date <= lastDay.Date)
            .Select(ci => ci.Date.Day)
            .Distinct()
            .ToListAsync();
        var holidayDaySet = holidayDays.ToHashSet();

        // 4) Build grid cells.
        var daysInMonth = DateTime.DaysInMonth(year, month);
        var cells = new List<MonthlyGridCellDto>();

        foreach (var s in students)
        {
            for (int day = 1; day <= daysInMonth; day++)
            {
                attDict.TryGetValue((s.StudentId, day), out var att);
                int rawStatus = att?.Status ?? 0;

                string gridStatus;
                if (att != null)
                {
                    gridStatus = rawStatus switch
                    {
                        1 or 2 or 7 => "P", // PP, PO, Late
                        3           => "A", // Absent
                        4 or 5      => "L", // SL, FL
                        6           => "H", // Holiday (in attendance record)
                        _           => ""   // 0 = Not Marked
                    };
                }
                else
                {
                    // No record: mark H if it's a calendar holiday, else empty.
                    gridStatus = holidayDaySet.Contains(day) ? "H" : "";
                }

                // Only emit a cell if there is something to show.
                if (string.IsNullOrEmpty(gridStatus) && att == null) continue;

                string? timeIn = null, timeOut = null;
                if (att?.TimeIn.HasValue == true)
                    timeIn = $"{att.TimeIn.Value.Hours:D2}:{att.TimeIn.Value.Minutes:D2}";
                if (att?.TimeOut.HasValue == true)
                    timeOut = $"{att.TimeOut.Value.Hours:D2}:{att.TimeOut.Value.Minutes:D2}";

                cells.Add(new MonthlyGridCellDto
                {
                    StudentId = s.StudentId,
                    Day       = day,
                    Status    = gridStatus,
                    RawStatus = rawStatus,
                    TimeIn    = timeIn,
                    TimeOut   = timeOut,
                    Remarks   = att?.Remarks ?? att?.LeaveReason
                });
            }
        }

        // Also emit empty-status Holiday cells for students that have no record on holiday days.
        foreach (var s in students)
        {
            foreach (var day in holidayDaySet)
            {
                if (!attDict.ContainsKey((s.StudentId, day)))
                {
                    // Avoid duplicates: check cells list.
                    if (!cells.Any(c => c.StudentId == s.StudentId && c.Day == day))
                    {
                        cells.Add(new MonthlyGridCellDto
                        {
                            StudentId = s.StudentId,
                            Day       = day,
                            Status    = "H",
                            RawStatus = 0
                        });
                    }
                }
            }
        }

        var monthNames = new[] { "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec" };

        return new MonthlyGridResponseDto
        {
            Month       = month,
            Year        = year,
            DaysInMonth = daysInMonth,
            MonthLabel  = $"{monthNames[month - 1]} {year}",
            Students    = students.Select(s => new MonthlyGridStudentDto
            {
                StudentId   = s.StudentId,
                Roll        = s.Roll ?? string.Empty,
                Name        = s.Name,
                ClassName   = s.Class?.Name,
                SectionName = s.Section?.Name
            }).ToList(),
            GridCells = cells.OrderBy(c => c.StudentId).ThenBy(c => c.Day).ToList()
        };
    }

    public async Task<byte[]> ExportMonthlyGridCsvAsync(int month, int year, int? classId, int? sectionId)
    {
        var grid = await GetMonthlyGridAsync(month, year, classId, sectionId);

        var sb = new StringBuilder();

        // Header row: #, Roll, Name, 1..DaysInMonth
        var header = new List<string> { "#", "Roll", "Name" };
        for (int d = 1; d <= grid.DaysInMonth; d++)
            header.Add(d.ToString());
        header.AddRange(new[] { "P", "A", "L", "H", "NM" });
        sb.AppendLine(string.Join(",", header));

        // Cell lookup.
        var cellLookup = grid.GridCells
            .ToDictionary(c => (c.StudentId, c.Day));

        int rowNum = 0;
        foreach (var s in grid.Students)
        {
            rowNum++;
            var row = new List<string> { rowNum.ToString(), EscapeCsv(s.Roll), EscapeCsv(s.Name) };

            int pCount = 0, aCount = 0, lCount = 0, hCount = 0, nmCount = 0;
            for (int d = 1; d <= grid.DaysInMonth; d++)
            {
                cellLookup.TryGetValue((s.StudentId, d), out var cell);
                var st = cell?.Status ?? "";
                row.Add(string.IsNullOrEmpty(st) ? "—" : st);
                switch (st)
                {
                    case "P": pCount++; break;
                    case "A": aCount++; break;
                    case "L": lCount++; break;
                    case "H": hCount++; break;
                    default:  nmCount++; break;
                }
            }
            row.AddRange(new[] { pCount.ToString(), aCount.ToString(), lCount.ToString(), hCount.ToString(), nmCount.ToString() });
            sb.AppendLine(string.Join(",", row));
        }

        return Encoding.UTF8.GetBytes(sb.ToString());
    }

    private static string EscapeCsv(string? value)
    {
        if (string.IsNullOrEmpty(value)) return "";
        var v = value.Replace("\"", "\"\"");
        if (v.Contains(',') || v.Contains('\n') || v.Contains('\r'))
            return $"\"{v}\"";
        return v;
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

