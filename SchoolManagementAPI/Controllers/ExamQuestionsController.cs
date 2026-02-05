using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolManagementAPI.Models;
using SchoolManagementAPI.Services;

namespace SchoolManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ExamQuestionsController : ControllerBase
{
    private readonly IExamQuestionService _examQuestionService;

    public ExamQuestionsController(IExamQuestionService examQuestionService)
    {
        _examQuestionService = examQuestionService;
    }

    [HttpGet]
    public async Task<ActionResult<List<ExamQuestion>>> GetAllExamQuestions()
    {
        var questions = await _examQuestionService.GetAllExamQuestionsAsync();
        return Ok(questions);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ExamQuestion>> GetExamQuestion(int id)
    {
        var question = await _examQuestionService.GetExamQuestionByIdAsync(id);
        if (question == null) return NotFound();
        return Ok(question);
    }

    [HttpGet("exam/{examId}")]
    public async Task<ActionResult<List<ExamQuestion>>> GetExamQuestionsByExam(int examId)
    {
        var questions = await _examQuestionService.GetExamQuestionsByExamIdAsync(examId);
        return Ok(questions);
    }

    [HttpPost]
    [Authorize(Roles = "admin,teacher")]
    public async Task<ActionResult<ExamQuestion>> CreateExamQuestion([FromBody] ExamQuestion question)
    {
        var created = await _examQuestionService.CreateExamQuestionAsync(question);
        return CreatedAtAction(nameof(GetExamQuestion), new { id = created.ExamQuestionId }, created);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> UpdateExamQuestion(int id, [FromBody] ExamQuestion question)
    {
        var updated = await _examQuestionService.UpdateExamQuestionAsync(id, question);
        if (updated == null) return NotFound();
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> DeleteExamQuestion(int id)
    {
        var result = await _examQuestionService.DeleteExamQuestionAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }
}

