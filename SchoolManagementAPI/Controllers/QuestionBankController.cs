using ClosedXML.Excel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolManagementAPI.DTOs;
using SchoolManagementAPI.Models;
using SchoolManagementAPI.Services;
using System.Security.Claims;

namespace SchoolManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class QuestionBankController : ControllerBase
{
    private readonly IQuestionBankService _questionBankService;

    public QuestionBankController(IQuestionBankService questionBankService)
    {
        _questionBankService = questionBankService;
    }

    [HttpGet]
    public async Task<ActionResult<List<QuestionBank>>> GetAllQuestions()
    {
        var questions = await _questionBankService.GetAllQuestionsAsync();
        return Ok(questions);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<QuestionBank>> GetQuestion(int id)
    {
        var question = await _questionBankService.GetQuestionByIdAsync(id);
        if (question == null) return NotFound();
        return Ok(question);
    }

    [HttpGet("subject/{subjectId}")]
    public async Task<ActionResult<List<QuestionBank>>> GetQuestionsBySubject(int subjectId)
    {
        var questions = await _questionBankService.GetQuestionsBySubjectAsync(subjectId);
        return Ok(questions);
    }

    [HttpGet("class/{classId}")]
    public async Task<ActionResult<List<QuestionBank>>> GetQuestionsByClass(int classId)
    {
        var questions = await _questionBankService.GetQuestionsByClassAsync(classId);
        return Ok(questions);
    }

    [HttpGet("subject/{subjectId}/class/{classId}")]
    public async Task<ActionResult<List<QuestionBank>>> GetQuestionsBySubjectAndClass(int subjectId, int classId)
    {
        var questions = await _questionBankService.GetQuestionsBySubjectAndClassAsync(subjectId, classId);
        return Ok(questions);
    }

    [HttpGet("subject/{subjectId}/class/{classId}/chapter/{chapterName}")]
    public async Task<ActionResult<List<QuestionBank>>> GetQuestionsByChapter(int subjectId, int classId, string chapterName)
    {
        var questions = await _questionBankService.GetQuestionsByChapterAsync(subjectId, classId, chapterName);
        return Ok(questions);
    }

    [HttpGet("teacher/{teacherId}")]
    public async Task<ActionResult<List<QuestionBank>>> GetQuestionsByTeacher(int teacherId)
    {
        var loginType = User.FindFirstValue("login_type");
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // Teachers can only see their own questions, admins can see all
        if (loginType != "admin" && userId != teacherId)
        {
            return Forbid();
        }

        var questions = await _questionBankService.GetQuestionsByTeacherAsync(teacherId);
        return Ok(questions);
    }

    [HttpGet("chapters/subject/{subjectId}/class/{classId}")]
    public async Task<ActionResult<List<string>>> GetChapters(int subjectId, int classId)
    {
        var chapters = await _questionBankService.GetChaptersBySubjectAndClassAsync(subjectId, classId);
        return Ok(chapters);
    }

    [HttpPost("exam-questions")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<ActionResult<List<QuestionBank>>> GetQuestionsForExam([FromBody] ExamQuestionRequest request)
    {
        var questions = await _questionBankService.GetQuestionsForExamAsync(
            request.ClassId, 
            request.SubjectId, 
            request.IsFullBook, 
            request.SelectedChapters);
        return Ok(questions);
    }

    [HttpPost]
    [Authorize(Roles = "admin,teacher")]
    public async Task<ActionResult<QuestionBank>> CreateQuestion([FromBody] QuestionBank question)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var loginType = User.FindFirstValue("login_type");

        // Set teacher ID from the authenticated user if not admin
        if (loginType == "teacher")
        {
            question.TeacherId = userId;
        }

        var created = await _questionBankService.CreateQuestionAsync(question);
        return CreatedAtAction(nameof(GetQuestion), new { id = created.QuestionBankId }, created);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> UpdateQuestion(int id, [FromBody] QuestionBank question)
    {
        var existing = await _questionBankService.GetQuestionByIdAsync(id);
        if (existing == null) return NotFound();

        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var loginType = User.FindFirstValue("login_type");

        // Teachers can only update their own questions
        if (loginType == "teacher" && existing.TeacherId != userId)
        {
            return Forbid();
        }

        var updated = await _questionBankService.UpdateQuestionAsync(id, question);
        if (updated == null) return NotFound();
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> DeleteQuestion(int id)
    {
        var existing = await _questionBankService.GetQuestionByIdAsync(id);
        if (existing == null) return NotFound();

        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var loginType = User.FindFirstValue("login_type");

        // Teachers can only delete their own questions
        if (loginType == "teacher" && existing.TeacherId != userId)
        {
            return Forbid();
        }

        var result = await _questionBankService.DeleteQuestionAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpPost("upload-excel")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<ActionResult<BulkUploadResult>> UploadExcel(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new BulkUploadResult { Errors = new List<string> { "No file uploaded" } });
        }

        // Validate file extension
        var allowedExtensions = new[] { ".xlsx", ".xls" };
        var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(fileExtension))
        {
            return BadRequest(new BulkUploadResult { Errors = new List<string> { "Invalid file format. Only Excel files (.xlsx, .xls) are allowed." } });
        }

        // Validate file size (max 10MB)
        if (file.Length > 10 * 1024 * 1024)
        {
            return BadRequest(new BulkUploadResult { Errors = new List<string> { "File size exceeds 10MB limit." } });
        }

        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var loginType = User.FindFirstValue("login_type");

        // Set teacher ID from the authenticated user if not admin
        int teacherId = userId;
        if (loginType == "admin")
        {
            // For admin, we could allow specifying teacherId in query string, but for now use admin's ID
            teacherId = userId;
        }

        try
        {
            using (var stream = file.OpenReadStream())
            {
                var result = await _questionBankService.BulkUploadQuestionsAsync(stream, teacherId);
                return Ok(result);
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, new BulkUploadResult 
            { 
                Errors = new List<string> { $"Error processing file: {ex.Message}" } 
            });
        }
    }

    [HttpGet("download-template")]
    [Authorize(Roles = "admin,teacher")]
    public IActionResult DownloadTemplate()
    {
        // Create a simple Excel template using ClosedXML
        using (var workbook = new XLWorkbook())
        {
            var worksheet = workbook.Worksheets.Add("Questions");
            
            // Header row
            worksheet.Cell(1, 1).Value = "Class";
            worksheet.Cell(1, 2).Value = "Subject";
            worksheet.Cell(1, 3).Value = "Chapter Name";
            worksheet.Cell(1, 4).Value = "Question Text";
            worksheet.Cell(1, 5).Value = "Question Type";
            worksheet.Cell(1, 6).Value = "Option A";
            worksheet.Cell(1, 7).Value = "Option B";
            worksheet.Cell(1, 8).Value = "Option C";
            worksheet.Cell(1, 9).Value = "Option D";
            worksheet.Cell(1, 10).Value = "Correct Answer";
            worksheet.Cell(1, 11).Value = "Marks";
            worksheet.Cell(1, 12).Value = "Difficulty Level";
            worksheet.Cell(1, 13).Value = "Explanation";

            // Style header
            var headerRange = worksheet.Range(1, 1, 1, 13);
            headerRange.Style.Font.Bold = true;
            headerRange.Style.Fill.BackgroundColor = XLColor.LightGray;

            // Add sample row
            worksheet.Cell(2, 1).Value = "Class 1";
            worksheet.Cell(2, 2).Value = "Mathematics";
            worksheet.Cell(2, 3).Value = "Chapter 1";
            worksheet.Cell(2, 4).Value = "What is 2 + 2?";
            worksheet.Cell(2, 5).Value = "MultipleChoice";
            worksheet.Cell(2, 6).Value = "3";
            worksheet.Cell(2, 7).Value = "4";
            worksheet.Cell(2, 8).Value = "5";
            worksheet.Cell(2, 9).Value = "6";
            worksheet.Cell(2, 10).Value = "B";
            worksheet.Cell(2, 11).Value = "1";
            worksheet.Cell(2, 12).Value = "Easy";
            worksheet.Cell(2, 13).Value = "Basic addition";

            // Auto-fit columns
            worksheet.Columns().AdjustToContents();

            var stream = new MemoryStream();
            workbook.SaveAs(stream);
            stream.Position = 0;

            return File(stream.ToArray(), 
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
                "QuestionBankTemplate.xlsx");
        }
    }
}



