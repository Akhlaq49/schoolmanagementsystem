using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolManagementAPI.DTOs;
using SchoolManagementAPI.Models;
using SchoolManagementAPI.Services;

namespace SchoolManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StudentsController : ControllerBase
{
    private readonly IStudentService _studentService;

    public StudentsController(IStudentService studentService)
    {
        _studentService = studentService;
    }

    [HttpGet]
    public async Task<ActionResult<List<User>>> GetAllStudents([FromQuery] string? status = null)
    {
        List<User> students = status?.ToLower() == "dropped"
            ? await _studentService.GetDroppedStudentsAsync()
            : status?.ToLower() == "active"
                ? await _studentService.GetActiveStudentsAsync()
                : await _studentService.GetAllStudentsAsync();
        return Ok(students);
    }

    [HttpGet("search")]
    public async Task<ActionResult<List<User>>> SearchStudents(
        [FromQuery] string term,
        [FromQuery] string? status = "active")
    {
        if (string.IsNullOrWhiteSpace(term))
        {
            return Ok(new List<User>());
        }

        var students = await _studentService.SearchStudentsAsync(term, status);
        return Ok(students);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<User>> GetStudent(int id)
    {
        var student = await _studentService.GetStudentByIdAsync(id);
        if (student == null)
        {
            return NotFound();
        }
        return Ok(student);
    }

    [HttpGet("student/{studentId:int}")]
    public async Task<ActionResult<User>> GetStudentByStudentId(int studentId)
    {
        var student = await _studentService.GetStudentByStudentIdAsync(studentId);
        if (student == null) return NotFound();
        return Ok(student);
    }

    [HttpGet("class/{classId}")]
    public async Task<ActionResult<List<User>>> GetStudentsByClass(int classId)
    {
        var students = await _studentService.GetStudentsByClassIdAsync(classId);
        return Ok(students);
    }

    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<User>> CreateStudent([FromBody] CreateStudentDto dto)
    {
        var created = await _studentService.CreateStudentFromDtoAsync(dto);
        return CreatedAtAction(nameof(GetStudent), new { id = created.UserId }, created);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> UpdateStudent(int id, [FromBody] UpdateStudentDto dto)
    {
        var updated = await _studentService.UpdateStudentFromDtoAsync(id, dto);
        if (updated == null)
        {
            return NotFound();
        }
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteStudent(int id)
    {
        var result = await _studentService.DeleteStudentAsync(id);
        if (!result)
        {
            return NotFound();
        }
        return NoContent();
    }
}

