using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolManagementAPI.Models;
using SchoolManagementAPI.Services;

namespace SchoolManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TeachersController : ControllerBase
{
    private readonly ITeacherService _teacherService;

    public TeachersController(ITeacherService teacherService)
    {
        _teacherService = teacherService;
    }

    [HttpGet]
    public async Task<ActionResult<List<User>>> GetAllTeachers()
    {
        var teachers = await _teacherService.GetAllTeachersAsync();
        return Ok(teachers);
    }

    [HttpGet("me")]
    [Authorize(Roles = "teacher")]
    public async Task<ActionResult<User>> GetCurrentTeacher()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            return Unauthorized();
        var teacher = await _teacherService.GetTeacherByIdAsync(userId);
        if (teacher == null) return NotFound();
        return Ok(teacher);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<User>> GetTeacher(int id)
    {
        var teacher = await _teacherService.GetTeacherByIdAsync(id);
        if (teacher == null)
        {
            return NotFound();
        }
        return Ok(teacher);
    }

    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<User>> CreateTeacher([FromBody] User teacher)
    {
        var created = await _teacherService.CreateTeacherAsync(teacher);
        return CreatedAtAction(nameof(GetTeacher), new { id = created.UserId }, created);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> UpdateTeacher(int id, [FromBody] User teacher)
    {
        var updated = await _teacherService.UpdateTeacherAsync(id, teacher);
        if (updated == null)
        {
            return NotFound();
        }
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteTeacher(int id)
    {
        var result = await _teacherService.DeleteTeacherAsync(id);
        if (!result)
        {
            return NotFound();
        }
        return NoContent();
    }
}

