using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolManagementAPI.Models;
using SchoolManagementAPI.Services;

namespace SchoolManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MarksController : ControllerBase
{
    private readonly IMarkService _markService;

    public MarksController(IMarkService markService)
    {
        _markService = markService;
    }

    [HttpGet]
    public async Task<ActionResult<List<Mark>>> GetAllMarks()
    {
        var marks = await _markService.GetAllMarksAsync();
        return Ok(marks);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Mark>> GetMark(int id)
    {
        var mark = await _markService.GetMarkByIdAsync(id);
        if (mark == null) return NotFound();
        return Ok(mark);
    }

    [HttpGet("student/{studentId}")]
    public async Task<ActionResult<List<Mark>>> GetMarksByStudent(int studentId)
    {
        var marks = await _markService.GetMarksByStudentIdAsync(studentId);
        return Ok(marks);
    }

    [HttpGet("exam/{examId}")]
    public async Task<ActionResult<List<Mark>>> GetMarksByExam(int examId)
    {
        var marks = await _markService.GetMarksByExamIdAsync(examId);
        return Ok(marks);
    }

    [HttpGet("exam/{examId}/student/{studentId}")]
    public async Task<ActionResult<List<Mark>>> GetMarksByExamAndStudent(int examId, int studentId)
    {
        var marks = await _markService.GetMarksByExamAndStudentAsync(examId, studentId);
        return Ok(marks);
    }

    [HttpPost]
    [Authorize(Roles = "admin,teacher")]
    public async Task<ActionResult<Mark>> CreateMark([FromBody] Mark mark)
    {
        var created = await _markService.CreateMarkAsync(mark);
        return CreatedAtAction(nameof(GetMark), new { id = created.MarkId }, created);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> UpdateMark(int id, [FromBody] Mark mark)
    {
        var updated = await _markService.UpdateMarkAsync(id, mark);
        if (updated == null) return NotFound();
        return Ok(updated);
    }

    [HttpPut("bulk")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> BulkUpdateMarks([FromBody] List<Mark> marks)
    {
        var result = await _markService.BulkUpdateMarksAsync(marks);
        return Ok(new { success = result });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteMark(int id)
    {
        var result = await _markService.DeleteMarkAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }
}

