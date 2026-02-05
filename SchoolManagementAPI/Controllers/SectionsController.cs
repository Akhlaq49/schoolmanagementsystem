using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolManagementAPI.Models;
using SchoolManagementAPI.Services;

namespace SchoolManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SectionsController : ControllerBase
{
    private readonly ISectionService _sectionService;

    public SectionsController(ISectionService sectionService)
    {
        _sectionService = sectionService;
    }

    [HttpGet]
    public async Task<ActionResult<List<Section>>> GetAllSections()
    {
        var sections = await _sectionService.GetAllSectionsAsync();
        return Ok(sections);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Section>> GetSection(int id)
    {
        var section = await _sectionService.GetSectionByIdAsync(id);
        if (section == null) return NotFound();
        return Ok(section);
    }

    [HttpGet("class/{classId}")]
    public async Task<ActionResult<List<Section>>> GetSectionsByClass(int classId)
    {
        var sections = await _sectionService.GetSectionsByClassIdAsync(classId);
        return Ok(sections);
    }

    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<Section>> CreateSection([FromBody] Section section)
    {
        var created = await _sectionService.CreateSectionAsync(section);
        return CreatedAtAction(nameof(GetSection), new { id = created.SectionId }, created);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> UpdateSection(int id, [FromBody] Section section)
    {
        var updated = await _sectionService.UpdateSectionAsync(id, section);
        if (updated == null) return NotFound();
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteSection(int id)
    {
        var result = await _sectionService.DeleteSectionAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }
}

