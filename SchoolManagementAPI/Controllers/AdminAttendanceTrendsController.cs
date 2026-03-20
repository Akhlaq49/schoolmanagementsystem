using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolManagementAPI.DTOs;
using SchoolManagementAPI.Services;
using System.Globalization;

namespace SchoolManagementAPI.Controllers;

[ApiController]
[Route("api/admin/attendance/trends")]
[Authorize(Roles = "admin")]
public class AdminAttendanceTrendsController : ControllerBase
{
    private readonly IAttendanceService _attendanceService;

    public AdminAttendanceTrendsController(IAttendanceService attendanceService)
    {
        _attendanceService = attendanceService;
    }

    /// <summary>
    /// GET api/admin/attendance/trends?period=daily|weekly|monthly&dateFrom=yyyy-MM-dd&dateTo=yyyy-MM-dd&classId=1&sectionId=2
    /// Returns trend data points and totals for charts.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<AttendanceTrendsResponseDto>> GetTrends(
        [FromQuery] string period = "daily",
        [FromQuery] string? dateFrom = null,
        [FromQuery] string? dateTo = null,
        [FromQuery] int? classId = null,
        [FromQuery] int? sectionId = null)
    {
        var today = DateTime.Today;
        DateTime from, to;

        if (!string.IsNullOrWhiteSpace(dateFrom) && DateTime.TryParseExact(dateFrom.Trim(), "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsedFrom))
            from = parsedFrom.Date;
        else
            from = GetDefaultDateFrom(today, period);

        if (!string.IsNullOrWhiteSpace(dateTo) && DateTime.TryParseExact(dateTo.Trim(), "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsedTo))
            to = parsedTo.Date;
        else
            to = today;

        var periodNorm = (period ?? "daily").Trim().ToLowerInvariant();
        if (periodNorm != "daily" && periodNorm != "weekly" && periodNorm != "monthly")
            return BadRequest(new { message = "period must be daily, weekly, or monthly." });

        var result = await _attendanceService.GetAttendanceTrendsAsync(periodNorm, from, to, classId, sectionId);
        return Ok(result);
    }

    private static DateTime GetDefaultDateFrom(DateTime today, string period)
    {
        var p = (period ?? "daily").Trim().ToLowerInvariant();
        if (p == "monthly")
            return today.AddMonths(-5);
        if (p == "weekly")
            return today.AddDays(-56); // ~8 weeks
        return today.AddDays(-13); // 14 days for daily
    }
}
