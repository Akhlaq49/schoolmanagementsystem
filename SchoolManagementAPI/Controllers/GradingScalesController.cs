using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolManagementAPI.Models;
using SchoolManagementAPI.Services;

namespace SchoolManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class GradingScalesController : ControllerBase
{
    private readonly IGradingService _gradingService;

    public GradingScalesController(IGradingService gradingService)
    {
        _gradingService = gradingService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<GradingScale>>> GetAllScales()
    {
        var scales = await _gradingService.GetAllScalesAsync();
        return Ok(scales);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<GradingScale>> GetScale(int id)
    {
        var scale = await _gradingService.GetScaleByIdAsync(id);
        if (scale == null) return NotFound();
        return Ok(scale);
    }

    [HttpGet("by-class/{classId}")]
    public async Task<ActionResult<IEnumerable<GradingScale>>> GetScalesByClass(int classId)
    {
        var scales = await _gradingService.GetScalesByClassAsync(classId);
        return Ok(scales);
    }

    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<GradingScale>> CreateScale([FromBody] GradingScale scale)
    {
        if (scale.MinMarks < 0 || scale.MaxMarks > 100 || scale.MinMarks > scale.MaxMarks)
            return BadRequest("Invalid marks range. MinMarks should be >= 0, MaxMarks <= 100, and MinMarks <= MaxMarks");

        if (string.IsNullOrWhiteSpace(scale.Grade))
            return BadRequest("Grade is required");

        if (scale.GradePoint < 0 || scale.GradePoint > 4.0m)
            return BadRequest("Grade point must be between 0 and 4.0");

        var created = await _gradingService.CreateScaleAsync(scale);
        return CreatedAtAction(nameof(GetScale), new { id = created.ScaleId }, created);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> UpdateScale(int id, [FromBody] GradingScale scale)
    {
        if (scale.MinMarks < 0 || scale.MaxMarks > 100 || scale.MinMarks > scale.MaxMarks)
            return BadRequest("Invalid marks range. MinMarks should be >= 0, MaxMarks <= 100, and MinMarks <= MaxMarks");

        if (string.IsNullOrWhiteSpace(scale.Grade))
            return BadRequest("Grade is required");

        if (scale.GradePoint < 0 || scale.GradePoint > 4.0m)
            return BadRequest("Grade point must be between 0 and 4.0");

        var updated = await _gradingService.UpdateScaleAsync(id, scale);
        if (updated == null) return NotFound();
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteScale(int id)
    {
        var result = await _gradingService.DeleteScaleAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }
}
