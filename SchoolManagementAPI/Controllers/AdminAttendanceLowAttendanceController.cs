using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolManagementAPI.DTOs;
using SchoolManagementAPI.Services;

namespace SchoolManagementAPI.Controllers;

[ApiController]
[Route("api/admin/attendance/low-attendance")]
[Authorize(Roles = "admin")]
public class AdminAttendanceLowAttendanceController : ControllerBase
{
    private readonly IAttendanceService _attendanceService;

    public AdminAttendanceLowAttendanceController(IAttendanceService attendanceService)
    {
        _attendanceService = attendanceService;
    }

    /// <summary>
    /// GET api/admin/attendance/low-attendance?period=today|week|month&amp;classId=
    /// Returns students with their attendance stats for the period. Frontend filters by threshold.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<AdminAttendanceLowAttendanceResponseDto>> GetLowAttendance(
        [FromQuery] string period = "today",
        [FromQuery] int? classId = null)
    {
        var periodNorm = (period ?? "today").Trim().ToLowerInvariant();
        if (periodNorm != "today" && periodNorm != "week" && periodNorm != "month")
            return BadRequest(new { message = "period must be today, week, or month." });

        var result = await _attendanceService.GetLowAttendanceStudentsAsync(periodNorm, classId);
        return Ok(result);
    }
}
