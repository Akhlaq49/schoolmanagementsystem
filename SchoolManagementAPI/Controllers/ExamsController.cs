using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolManagementAPI.Models;
using SchoolManagementAPI.Services;

namespace SchoolManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ExamsController : ControllerBase
{
    private readonly IExamService _examService;

    public ExamsController(IExamService examService)
    {
        _examService = examService;
    }

    [HttpGet]
    public async Task<ActionResult<List<Exam>>> GetAllExams()
    {
        var exams = await _examService.GetAllExamsAsync();
        return Ok(exams);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Exam>> GetExam(int id)
    {
        var exam = await _examService.GetExamByIdAsync(id);
        if (exam == null)
        {
            return NotFound();
        }
        return Ok(exam);
    }

    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<Exam>> CreateExam([FromBody] Exam exam)
    {
        var created = await _examService.CreateExamAsync(exam);
        return CreatedAtAction(nameof(GetExam), new { id = created.ExamId }, created);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> UpdateExam(int id, [FromBody] Exam exam)
    {
        var updated = await _examService.UpdateExamAsync(id, exam);
        if (updated == null)
        {
            return NotFound();
        }
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteExam(int id)
    {
        var result = await _examService.DeleteExamAsync(id);
        if (!result)
        {
            return NotFound();
        }
        return NoContent();
    }
}

