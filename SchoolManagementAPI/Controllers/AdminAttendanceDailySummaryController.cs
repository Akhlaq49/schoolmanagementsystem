using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolManagementAPI.DTOs;
using SchoolManagementAPI.Services;
using System.Globalization;
using System.Text;

namespace SchoolManagementAPI.Controllers;

[ApiController]
[Route("api/admin/attendance/daily")]
[Authorize(Roles = "admin")]
public class AdminAttendanceDailySummaryController : ControllerBase
{
    private readonly IAttendanceService _attendanceService;

    public AdminAttendanceDailySummaryController(IAttendanceService attendanceService)
    {
        _attendanceService = attendanceService;
    }

    // GET api/admin/attendance/daily?date=yyyy-MM-dd
    [HttpGet]
    public async Task<ActionResult<AdminAttendanceDailySummaryDto>> GetDailySummary([FromQuery] string date)
    {
        if (string.IsNullOrWhiteSpace(date))
            return BadRequest(new { message = "date is required (yyyy-MM-dd)" });

        if (!DateTime.TryParseExact(date.Trim(), "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsed))
            return BadRequest(new { message = "Invalid date. Use yyyy-MM-dd." });

        var result = await _attendanceService.GetAdminAttendanceDailySummaryAsync(parsed.Date);
        return Ok(result);
    }

    // POST api/admin/attendance/daily/reminders
    [HttpPost("reminders")]
    public async Task<ActionResult<AdminAttendanceDailyReminderResultDto>> SendDailyReminders([FromBody] AdminAttendanceDailyReminderRequestDto dto)
    {
        if (dto == null || string.IsNullOrWhiteSpace(dto.Date))
            return BadRequest(new { message = "date is required (yyyy-MM-dd)" });

        if (!DateTime.TryParseExact(dto.Date.Trim(), "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsed))
            return BadRequest(new { message = "Invalid date. Use yyyy-MM-dd." });

        var result = await _attendanceService.SendAdminAttendanceDailyRemindersAsync(parsed.Date);
        return Ok(result);
    }

    // GET api/admin/attendance/daily/export?date=yyyy-MM-dd
    [HttpGet("export")]
    public async Task<IActionResult> ExportDailySummary([FromQuery] string date)
    {
        if (string.IsNullOrWhiteSpace(date))
            return BadRequest(new { message = "date is required (yyyy-MM-dd)" });

        if (!DateTime.TryParseExact(date.Trim(), "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsed))
            return BadRequest(new { message = "Invalid date. Use yyyy-MM-dd." });

        var csvBytes = await _attendanceService.ExportAdminAttendanceDailySummaryCsvAsync(parsed.Date);
        var fileName = $"attendance_daily_summary_{parsed:yyyy-MM-dd}.csv";
        return File(csvBytes, "text/csv", fileName);
    }
}

