using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolManagementAPI.DTOs;
using SchoolManagementAPI.Services;
using System.Globalization;

namespace SchoolManagementAPI.Controllers;

[ApiController]
[Route("api/admin/attendance/reports")]
[Authorize(Roles = "admin")]
public class AdminAttendanceReportsController : ControllerBase
{
    private readonly IAttendanceService _attendanceService;

    public AdminAttendanceReportsController(IAttendanceService attendanceService)
    {
        _attendanceService = attendanceService;
    }

    // GET api/admin/attendance/reports?dateFrom=yyyy-MM-dd&dateTo=yyyy-MM-dd&classId=1&sectionId=2&reportType=summary
    [HttpGet]
    public async Task<ActionResult<AdminAttendanceReportsResponseDto>> GetReports(
        [FromQuery] string dateFrom,
        [FromQuery] string dateTo,
        [FromQuery] int? classId,
        [FromQuery] int? sectionId,
        [FromQuery] string reportType = "summary")
    {
        if (!TryParseDate(dateFrom, out var from))
            return BadRequest(new { message = "Invalid dateFrom. Use yyyy-MM-dd." });
        if (!TryParseDate(dateTo, out var to))
            return BadRequest(new { message = "Invalid dateTo. Use yyyy-MM-dd." });

        var result = await _attendanceService.GetAdminAttendanceReportsAsync(from, to, classId, sectionId, reportType);
        return Ok(result);
    }

    // POST api/admin/attendance/reports/generate
    [HttpPost("generate")]
    public async Task<ActionResult<AdminAttendanceReportsResponseDto>> GenerateReport([FromBody] AdminAttendanceReportsRequestDto dto)
    {
        if (dto == null)
            return BadRequest(new { message = "Request body is required." });
        if (!TryParseDate(dto.DateFrom, out var from))
            return BadRequest(new { message = "Invalid dateFrom. Use yyyy-MM-dd." });
        if (!TryParseDate(dto.DateTo, out var to))
            return BadRequest(new { message = "Invalid dateTo. Use yyyy-MM-dd." });

        var result = await _attendanceService.GetAdminAttendanceReportsAsync(from, to, dto.ClassId, dto.SectionId, dto.ReportType);
        return Ok(result);
    }

    // GET api/admin/attendance/reports/export?dateFrom=yyyy-MM-dd&dateTo=yyyy-MM-dd&classId=1&sectionId=2&reportType=summary
    [HttpGet("export")]
    public async Task<IActionResult> ExportReports(
        [FromQuery] string dateFrom,
        [FromQuery] string dateTo,
        [FromQuery] int? classId,
        [FromQuery] int? sectionId,
        [FromQuery] string reportType = "summary")
    {
        if (!TryParseDate(dateFrom, out var from))
            return BadRequest(new { message = "Invalid dateFrom. Use yyyy-MM-dd." });
        if (!TryParseDate(dateTo, out var to))
            return BadRequest(new { message = "Invalid dateTo. Use yyyy-MM-dd." });

        var csvBytes = await _attendanceService.ExportAdminAttendanceReportsCsvAsync(from, to, classId, sectionId, reportType);
        var fileName = $"attendance_reports_{from:yyyyMMdd}_{to:yyyyMMdd}_{reportType}.csv";
        return File(csvBytes, "text/csv", fileName);
    }

    // GET api/admin/attendance/reports/export/{reportId}?dateFrom=yyyy-MM-dd&dateTo=yyyy-MM-dd&classId=1&sectionId=2&reportType=summary
    [HttpGet("export/{reportId:int}")]
    public async Task<IActionResult> ExportSingleReport(
        [FromRoute] int reportId,
        [FromQuery] string dateFrom,
        [FromQuery] string dateTo,
        [FromQuery] int? classId,
        [FromQuery] int? sectionId,
        [FromQuery] string reportType = "summary")
    {
        if (!TryParseDate(dateFrom, out var from))
            return BadRequest(new { message = "Invalid dateFrom. Use yyyy-MM-dd." });
        if (!TryParseDate(dateTo, out var to))
            return BadRequest(new { message = "Invalid dateTo. Use yyyy-MM-dd." });

        var csvBytes = await _attendanceService.ExportAdminAttendanceSingleReportCsvAsync(reportId, from, to, classId, sectionId, reportType);
        var fileName = $"attendance_report_{reportId}_{from:yyyyMMdd}_{to:yyyyMMdd}.csv";
        return File(csvBytes, "text/csv", fileName);
    }

    private static bool TryParseDate(string date, out DateTime parsed)
    {
        return DateTime.TryParseExact(date?.Trim(), "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out parsed);
    }
}

