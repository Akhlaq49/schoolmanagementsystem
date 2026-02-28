using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolManagementAPI.Models;
using SchoolManagementAPI.Services;

namespace SchoolManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SubjectsController : ControllerBase
{
    private readonly ISubjectService _subjectService;

    public SubjectsController(ISubjectService subjectService)
    {
        _subjectService = subjectService;
    }

    public class SubjectCreateForClassesRequest
    {
        public string Name { get; set; } = string.Empty;
        public List<int> ClassIds { get; set; } = new();
        public int? TeacherId { get; set; }
    }

    public class SubjectUpdateForNameRequest
    {
        public string OriginalName { get; set; } = string.Empty;
        public string NewName { get; set; } = string.Empty;
        public List<int> ClassIds { get; set; } = new();
        public int? TeacherId { get; set; }
    }

    [HttpGet]
    public async Task<ActionResult<List<Subject>>> GetAllSubjects()
    {
        var subjects = await _subjectService.GetAllSubjectsAsync();
        return Ok(subjects);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Subject>> GetSubject(int id)
    {
        var subject = await _subjectService.GetSubjectByIdAsync(id);
        if (subject == null)
        {
            return NotFound();
        }
        return Ok(subject);
    }

    [HttpGet("class/{classId}")]
    public async Task<ActionResult<List<Subject>>> GetSubjectsByClass(int classId)
    {
        var subjects = await _subjectService.GetSubjectsByClassIdAsync(classId);
        return Ok(subjects);
    }

    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<Subject>> CreateSubject([FromBody] Subject subject)
    {
        var created = await _subjectService.CreateSubjectAsync(subject);
        return CreatedAtAction(nameof(GetSubject), new { id = created.SubjectId }, created);
    }

    [HttpPost("multiple-classes")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<List<Subject>>> CreateSubjectsForClasses([FromBody] SubjectCreateForClassesRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(new { message = "Subject name is required." });
        }

        if (request.ClassIds == null || request.ClassIds.Count == 0)
        {
            return BadRequest(new { message = "At least one class must be selected." });
        }

        var created = await _subjectService.CreateSubjectsForClassesAsync(
            request.Name,
            request.ClassIds,
            request.TeacherId
        );

        return Ok(created);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> UpdateSubject(int id, [FromBody] Subject subject)
    {
        var updated = await _subjectService.UpdateSubjectAsync(id, subject);
        if (updated == null)
        {
            return NotFound();
        }
        return Ok(updated);
    }

    [HttpPut("by-name")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<List<Subject>>> UpdateSubjectsForName([FromBody] SubjectUpdateForNameRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.OriginalName) || string.IsNullOrWhiteSpace(request.NewName))
        {
            return BadRequest(new { message = "Subject name is required." });
        }

        if (request.ClassIds == null || request.ClassIds.Count == 0)
        {
            return BadRequest(new { message = "At least one class must be selected." });
        }

        var updated = await _subjectService.UpdateSubjectsForNameAsync(
            request.OriginalName,
            request.NewName,
            request.ClassIds,
            request.TeacherId
        );

        return Ok(updated);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteSubject(int id)
    {
        var result = await _subjectService.DeleteSubjectAsync(id);
        if (!result)
        {
            return NotFound();
        }
        return NoContent();
    }
}

