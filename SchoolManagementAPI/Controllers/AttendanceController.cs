using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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

    [HttpGet("report/{studentId}")]
    public async Task<ActionResult<List<Attendance>>> GetAttendanceReport(
        int studentId,
        [FromQuery] int month,
        [FromQuery] int year)
    {
        var attendance = await _attendanceService.GetAttendanceReportAsync(studentId, month, year);
        return Ok(attendance);
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
        if (updated == null)
        {
            return NotFound();
        }
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

