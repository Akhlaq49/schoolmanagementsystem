using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolManagementAPI.DTOs;
using SchoolManagementAPI.Models;
using SchoolManagementAPI.Services;

namespace SchoolManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AttendanceController : ControllerBase
{
    private readonly IAttendanceService _attendanceService;

    public AttendanceController(IAttendanceService attendanceService)
    {
        _attendanceService = attendanceService;
    }

    [HttpGet]
    public async Task<ActionResult<List<Attendance>>> GetAttendance(
        [FromQuery] DateTime date,
        [FromQuery] int? classId,
        [FromQuery] int? sectionId)
    {
        var attendance = await _attendanceService.GetAttendanceByDateAsync(date, classId, sectionId);
        return Ok(attendance);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Attendance>> GetAttendanceById(int id)
    {
        var attendance = await _attendanceService.GetAttendanceByIdAsync(id);
        if (attendance == null)
        {
            return NotFound();
        }
        return Ok(attendance);
    }

    [HttpGet("today/{studentId:int}")]
    public async Task<ActionResult<Attendance?>> GetTodayAttendance(int studentId)
    {
        var attendance = await _attendanceService.GetTodayAttendanceAsync(studentId);
        return Ok(attendance);
    }

    [HttpPost("checkin")]
    public async Task<ActionResult<Attendance>> CheckIn([FromBody] CheckInRequestDto dto)
    {
        int? userId = null;
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (int.TryParse(claim, out var uid)) userId = uid;
        var attendance = await _attendanceService.CheckInAsync(dto, userId);
        return Ok(attendance);
    }

    [HttpPatch("checkout")]
    public async Task<ActionResult<Attendance>> CheckOut([FromBody] CheckOutRequestDto dto)
    {
        var attendance = await _attendanceService.CheckOutAsync(dto);
        if (attendance == null) return NotFound();
        return Ok(attendance);
    }

    [HttpPost("bulk")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<ActionResult<List<Attendance>>> BulkSave([FromBody] BulkAttendanceRequestDto dto)
    {
        int? userId = null;
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (int.TryParse(claim, out var uid)) userId = uid;
        var result = await _attendanceService.BulkSaveAttendanceAsync(dto, userId);
        return Ok(result);
    }

    [HttpGet("report/{studentId}")]
    public async Task<ActionResult<List<Attendance>>> GetAttendanceReport(
        int studentId,
        [FromQuery] int month,
        [FromQuery] int year)
    {
        var attendance = await _attendanceService.GetAttendanceReportAsync(studentId, month, year);
        return Ok(attendance);
    }

    [HttpGet("report/{studentId}/summary")]
    public async Task<ActionResult<AttendanceReportResponseDto>> GetAttendanceReportSummary(
        int studentId,
        [FromQuery] int? month,
        [FromQuery] int? year,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to)
    {
        var report = await _attendanceService.GetAttendanceReportWithSummaryAsync(studentId, month, year, from, to);
        return Ok(report);
    }

    [HttpPost]
    [Authorize(Roles = "admin,teacher")]
    public async Task<ActionResult<Attendance>> CreateAttendance([FromBody] Attendance attendance)
    {
        var created = await _attendanceService.CreateAttendanceAsync(attendance);
        return CreatedAtAction(nameof(GetAttendanceById), new { id = created.AttendanceId }, created);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> UpdateAttendance(int id, [FromBody] Attendance attendance)
    {
        var updated = await _attendanceService.UpdateAttendanceAsync(id, attendance);
        if (updated == null) return NotFound();
        return Ok(updated);
    }

    [HttpPatch("{id}")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> EditAttendance(int id, [FromBody] UpdateAttendanceDto dto)
    {
        var updated = await _attendanceService.UpdateAttendanceByIdAsync(id, dto);
        if (updated == null) return NotFound();
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteAttendance(int id)
    {
        var result = await _attendanceService.DeleteAttendanceAsync(id);
        if (!result)
        {
            return NotFound();
        }
        return NoContent();
    }
}

