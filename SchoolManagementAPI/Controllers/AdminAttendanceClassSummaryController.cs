using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolManagementAPI.DTOs;
using SchoolManagementAPI.Services;

namespace SchoolManagementAPI.Controllers;

[ApiController]
[Route("api/admin/attendance/class-summary")]
[Authorize(Roles = "admin")]
public class AdminAttendanceClassSummaryController : ControllerBase
{
    private readonly IAttendanceService _attendanceService;

    public AdminAttendanceClassSummaryController(IAttendanceService attendanceService)
    {
        _attendanceService = attendanceService;
    }

    /// <summary>
    /// GET api/admin/attendance/class-summary?period=today|week|month
    /// Returns class-level attendance summary for the period.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<AdminAttendanceClassSummaryResponseDto>> GetClassSummary([FromQuery] string period = "today")
    {
        var periodNorm = (period ?? "today").Trim().ToLowerInvariant();
        if (periodNorm != "today" && periodNorm != "week" && periodNorm != "month")
            return BadRequest(new { message = "period must be today, week, or month." });

        var result = await _attendanceService.GetClassLevelSummaryAsync(periodNorm);
        return Ok(result);
    }
}
