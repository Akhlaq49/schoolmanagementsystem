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
    private readonly ILeaveService _leaveService;

    public AttendanceController(IAttendanceService attendanceService, ILeaveService leaveService)
    {
        _attendanceService = attendanceService;
        _leaveService = leaveService;
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

    /// <summary>Get class attendance by date, class and optional section (for teacher/admin).</summary>
    [HttpGet("class")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<ActionResult<List<Attendance>>> GetClassAttendance(
        [FromQuery] DateTime date,
        [FromQuery] int classId,
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

    [HttpGet("leaves")]
    public async Task<ActionResult<List<LeaveApplication>>> GetLeaves(
        [FromQuery] string applicantType,
        [FromQuery] int applicantId)
    {
        var list = await _leaveService.GetByApplicantAsync(applicantType, applicantId);
        return Ok(list);
    }

    [HttpGet("leaves/all")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<List<LeaveApplication>>> GetAllLeaves(
        [FromQuery] string? applicantType,
        [FromQuery] string? status)
    {
        var list = await _leaveService.GetAllAsync(applicantType, status);
        return Ok(list);
    }

    [HttpPatch("leaves/{id:int}/review")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<LeaveApplication>> ReviewLeave(int id, [FromBody] ReviewLeaveDto dto)
    {
        int? reviewerId = null;
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (int.TryParse(claim, out var uid)) reviewerId = uid;
        var updated = await _leaveService.ReviewAsync(id, dto.Status, reviewerId, dto.ReviewerRemarks);
        if (updated == null) return NotFound();
        return Ok(updated);
    }

    [HttpGet("leaves/{id:int}")]
    public async Task<ActionResult<LeaveApplication>> GetLeaveById(int id)
    {
        var leave = await _leaveService.GetByIdAsync(id);
        if (leave == null) return NotFound();
        return Ok(leave);
    }

    [HttpPost("leaves")]
    public async Task<ActionResult<LeaveApplication>> CreateLeave([FromBody] LeaveApplication leave)
    {
        var created = await _leaveService.CreateAsync(leave);
        return CreatedAtAction(nameof(GetLeaveById), new { id = created.LeaveApplicationId }, created);
    }

    [HttpPut("leaves/{id:int}")]
    public async Task<ActionResult<LeaveApplication>> UpdateLeave(int id, [FromBody] LeaveApplication leave)
    {
        var updated = await _leaveService.UpdateAsync(id, leave);
        if (updated == null) return NotFound();
        return Ok(updated);
    }

    [HttpDelete("leaves/{id:int}")]
    public async Task<IActionResult> DeleteLeave(int id)
    {
        var result = await _leaveService.DeleteAsync(id);
        if (!result) return NotFound();
        return NoContent();
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

