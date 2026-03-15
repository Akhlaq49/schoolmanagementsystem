using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolManagementAPI.DTOs;
using SchoolManagementAPI.Models;
using SchoolManagementAPI.Services;

namespace SchoolManagementAPI.Controllers;

[ApiController]
[Route("api/teacher-attendance")]
[Authorize]
public class TeacherAttendanceController : ControllerBase
{
    private readonly IAttendanceService _attendanceService;

    public TeacherAttendanceController(IAttendanceService attendanceService)
    {
        _attendanceService = attendanceService;
    }

    private int? GetCurrentTeacherId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(claim) || !int.TryParse(claim, out var userId))
            return null;
        return userId;
    }

    [HttpGet("this-month")]
    [Authorize(Roles = "teacher")]
    public async Task<ActionResult<List<Attendance>>> GetThisMonth(
        [FromQuery] int? month,
        [FromQuery] int? year)
    {
        var teacherId = GetCurrentTeacherId();
        if (!teacherId.HasValue) return Unauthorized();

        var d = DateTime.Today;
        var m = month ?? d.Month;
        var y = year ?? d.Year;

        var list = await _attendanceService.GetTeacherThisMonthAsync(teacherId.Value, m, y);
        return Ok(list);
    }

    [HttpGet("today")]
    [Authorize(Roles = "teacher")]
    public async Task<ActionResult<Attendance?>> GetToday()
    {
        var teacherId = GetCurrentTeacherId();
        if (!teacherId.HasValue) return Unauthorized();

        var record = await _attendanceService.GetTeacherTodayAsync(teacherId.Value);
        return Ok(record);
    }

    [HttpPost("checkin")]
    [Authorize(Roles = "teacher")]
    public async Task<ActionResult<Attendance>> CheckIn([FromBody] TeacherCheckInDto dto)
    {
        var teacherId = GetCurrentTeacherId();
        if (!teacherId.HasValue) return Unauthorized();

        var record = await _attendanceService.TeacherCheckInAsync(teacherId.Value, dto);
        return Ok(record);
    }

    [HttpPatch("checkout")]
    [Authorize(Roles = "teacher")]
    public async Task<ActionResult<Attendance>> CheckOut([FromBody] TeacherCheckOutDto dto)
    {
        var teacherId = GetCurrentTeacherId();
        if (!teacherId.HasValue) return Unauthorized();

        var record = await _attendanceService.TeacherCheckOutAsync(teacherId.Value, dto);
        if (record == null) return NotFound();
        return Ok(record);
    }

    [HttpGet]
    [Authorize(Roles = "teacher")]
    public async Task<ActionResult<List<Attendance>>> GetAll()
    {
        var teacherId = GetCurrentTeacherId();
        if (!teacherId.HasValue) return Unauthorized();

        var list = await _attendanceService.GetAllByTeacherAsync(teacherId.Value);
        return Ok(list);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Attendance>> GetById(int id)
    {
        var record = await _attendanceService.GetAttendanceByIdAsync(id);
        if (record == null) return NotFound();

        var teacherId = GetCurrentTeacherId();
        var isAdmin = User.IsInRole("admin");
        if (!isAdmin && (record.TeacherId != teacherId))
            return Forbid();

        return Ok(record);
    }

    [HttpPost]
    [Authorize(Roles = "admin,teacher")]
    public async Task<ActionResult<Attendance>> Create([FromBody] Attendance record)
    {
        var teacherId = GetCurrentTeacherId();
        if (User.IsInRole("teacher") && !teacherId.HasValue) return Unauthorized();
        if (User.IsInRole("teacher") && record.TeacherId != teacherId)
            return Forbid();
        if (record.TeacherId == null) return BadRequest(new { message = "TeacherId is required" });

        var created = await _attendanceService.CreateAttendanceAsync(record);
        return CreatedAtAction(nameof(GetById), new { id = created.AttendanceId }, created);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<ActionResult<Attendance>> Update(int id, [FromBody] Attendance record)
    {
        var existing = await _attendanceService.GetAttendanceByIdAsync(id);
        if (existing == null) return NotFound();

        var teacherId = GetCurrentTeacherId();
        if (User.IsInRole("teacher") && (existing.TeacherId != teacherId))
            return Forbid();

        record.AttendanceId = id;
        record.TeacherId = existing.TeacherId;
        record.StudentId = existing.StudentId;
        var updated = await _attendanceService.UpdateAttendanceAsync(id, record);
        return Ok(updated);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> Delete(int id)
    {
        var existing = await _attendanceService.GetAttendanceByIdAsync(id);
        if (existing == null) return NotFound();

        var teacherId = GetCurrentTeacherId();
        if (User.IsInRole("teacher") && (existing.TeacherId != teacherId))
            return Forbid();

        var result = await _attendanceService.DeleteAttendanceAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }
}
