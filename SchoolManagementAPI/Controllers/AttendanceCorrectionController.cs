using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolManagementAPI.DTOs;
using SchoolManagementAPI.Models;
using SchoolManagementAPI.Services;

namespace SchoolManagementAPI.Controllers;

[ApiController]
[Route("api/attendance-correction")]
[Authorize]
public class AttendanceCorrectionController : ControllerBase
{
    private readonly IAttendanceCorrectionService _service;

    public AttendanceCorrectionController(IAttendanceCorrectionService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<ActionResult<AttendanceCorrection>> Create([FromBody] CreateCorrectionRequestDto dto)
    {
        try
        {
            var result = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.AttendanceCorrectionId }, result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("student/{studentId:int}")]
    public async Task<ActionResult<List<AttendanceCorrection>>> GetByStudent(int studentId)
    {
        var list = await _service.GetByStudentAsync(studentId);
        return Ok(list);
    }

    [HttpGet("pending")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<ActionResult<List<AttendanceCorrection>>> GetPending()
    {
        var list = await _service.GetPendingForAdminAsync();
        return Ok(list);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<AttendanceCorrection>> GetById(int id)
    {
        var c = await _service.GetByIdAsync(id);
        if (c == null) return NotFound();
        return Ok(c);
    }

    [HttpPatch("{id:int}/review")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<ActionResult<AttendanceCorrection>> Review(int id, [FromBody] ReviewCorrectionDto dto)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
        var result = await _service.ReviewAsync(id, dto, userId);
        if (result == null) return NotFound();
        return Ok(result);
    }
}
