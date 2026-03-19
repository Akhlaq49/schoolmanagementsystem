using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolManagementAPI.DTOs;
using SchoolManagementAPI.Services;

namespace SchoolManagementAPI.Controllers;

[ApiController]
[Route("api/admin/attendance/monthly")]
[Authorize(Roles = "admin")]
public class AdminAttendanceMonthlyController : ControllerBase
{
    private readonly IAttendanceService _attendanceService;

    public AdminAttendanceMonthlyController(IAttendanceService attendanceService)
    {
        _attendanceService = attendanceService;
    }

    /// <summary>
    /// GET api/admin/attendance/monthly/grid?month=3&year=2026&classId=1&sectionId=2
    /// Returns the full monthly attendance grid for the given month/year, optionally
    /// filtered by class and section.
    /// </summary>
    [HttpGet("grid")]
    public async Task<ActionResult<MonthlyGridResponseDto>> GetMonthlyGrid(
        [FromQuery] int month,
        [FromQuery] int year,
        [FromQuery] int? classId,
        [FromQuery] int? sectionId)
    {
        if (month < 1 || month > 12)
            return BadRequest(new { message = "month must be between 1 and 12." });

        if (year < 2000 || year > 2100)
            return BadRequest(new { message = "year is out of valid range." });

        var result = await _attendanceService.GetMonthlyGridAsync(month, year, classId, sectionId);
        return Ok(result);
    }

    /// <summary>
    /// GET api/admin/attendance/monthly/grid/export?month=3&year=2026&classId=1&sectionId=2
    /// Downloads the monthly grid as a CSV file.
    /// </summary>
    [HttpGet("grid/export")]
    public async Task<IActionResult> ExportMonthlyGrid(
        [FromQuery] int month,
        [FromQuery] int year,
        [FromQuery] int? classId,
        [FromQuery] int? sectionId)
    {
        if (month < 1 || month > 12)
            return BadRequest(new { message = "month must be between 1 and 12." });

        if (year < 2000 || year > 2100)
            return BadRequest(new { message = "year is out of valid range." });

        var csvBytes = await _attendanceService.ExportMonthlyGridCsvAsync(month, year, classId, sectionId);
        var fileName = $"attendance_monthly_grid_{year}_{month:D2}.csv";
        return File(csvBytes, "text/csv", fileName);
    }
}
