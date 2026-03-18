using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolManagementAPI.DTOs;
using SchoolManagementAPI.Models;
using SchoolManagementAPI.Services;
using System;

namespace SchoolManagementAPI.Controllers;

/// <summary>Admin-only APIs for the attendance module (class attendance, etc.).</summary>
[ApiController]
[Route("api/admin/attendance")]
[Authorize(Roles = "admin")]
public class AdminAttendanceController : ControllerBase
{
    private readonly IAttendanceService _attendanceService;

    public AdminAttendanceController(IAttendanceService attendanceService)
    {
        _attendanceService = attendanceService;
    }

    /// <summary>Get class attendance records for a date (students in class/section with attendance for that date).</summary>
    /// <param name="date">Attendance date (yyyy-MM-dd).</param>
    /// <param name="classId">Class ID.</param>
    /// <param name="sectionId">Optional section ID to filter.</param>
    [HttpGet("class")]
    public async Task<ActionResult<List<Attendance>>> GetClassAttendance(
        [FromQuery] DateTime date,
        [FromQuery] int classId,
        [FromQuery] int? sectionId)
    {
        var list = await _attendanceService.GetAttendanceByDateAsync(date, classId, sectionId);
        return Ok(list);
    }

    /// <summary>Get class attendance sheet: all students in class/section with their attendance for the date (one row per student).</summary>
    /// <param name="date">Attendance date (yyyy-MM-dd).</param>
    /// <param name="classId">Class ID.</param>
    /// <param name="sectionId">Optional section ID to filter.</param>
    [HttpGet("class/sheet")]
    public async Task<ActionResult<List<ClassAttendanceSheetItemDto>>> GetClassAttendanceSheet(
        [FromQuery] string date,
        [FromQuery] int classId,
        [FromQuery] int? sectionId)
    {
        if (string.IsNullOrWhiteSpace(date) || !DateTime.TryParse(date, out var dateParsed))
            return BadRequest(new { message = "Invalid date. Use yyyy-MM-dd." });
        var sheet = await _attendanceService.GetClassAttendanceSheetAsync(dateParsed.Date, classId, sectionId);
        return Ok(sheet);
    }

    /// <summary>Bulk save class attendance for a date (create or update records).</summary>
    [HttpPost("class")]
    public async Task<ActionResult<List<Attendance>>> SaveClassAttendance([FromBody] BulkAttendanceRequestDto dto)
    {
        int? userId = null;
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (int.TryParse(claim, out var uid)) userId = uid;

        var result = await _attendanceService.BulkSaveAttendanceAsync(dto, userId);
        return Ok(result);
    }
}
