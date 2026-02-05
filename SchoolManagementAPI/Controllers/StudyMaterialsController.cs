using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolManagementAPI.Models;
using SchoolManagementAPI.Services;
using System.Security.Claims;

namespace SchoolManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StudyMaterialsController : ControllerBase
{
    private readonly IStudyMaterialService _studyMaterialService;

    public StudyMaterialsController(IStudyMaterialService studyMaterialService)
    {
        _studyMaterialService = studyMaterialService;
    }

    [HttpGet]
    public async Task<ActionResult<List<StudyMaterial>>> GetAllStudyMaterials()
    {
        var materials = await _studyMaterialService.GetAllStudyMaterialsAsync();
        return Ok(materials);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<StudyMaterial>> GetStudyMaterial(int id)
    {
        var material = await _studyMaterialService.GetStudyMaterialByIdAsync(id);
        if (material == null) return NotFound();
        return Ok(material);
    }

    [HttpGet("class/{classId}")]
    public async Task<ActionResult<List<StudyMaterial>>> GetStudyMaterialsByClass(int classId)
    {
        var materials = await _studyMaterialService.GetStudyMaterialsByClassIdAsync(classId);
        return Ok(materials);
    }

    [HttpGet("student/{studentId}")]
    public async Task<ActionResult<List<StudyMaterial>>> GetStudyMaterialsByStudent(int studentId)
    {
        var loginType = User.FindFirstValue("login_type");
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        if (loginType == "student" && userId != studentId)
        {
            return Forbid();
        }

        var materials = await _studyMaterialService.GetStudyMaterialsByStudentIdAsync(studentId);
        return Ok(materials);
    }

    [HttpPost]
    [Authorize(Roles = "admin,teacher")]
    public async Task<ActionResult<StudyMaterial>> CreateStudyMaterial([FromBody] StudyMaterial material)
    {
        var created = await _studyMaterialService.CreateStudyMaterialAsync(material);
        return CreatedAtAction(nameof(GetStudyMaterial), new { id = created.StudyMaterialId }, created);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> UpdateStudyMaterial(int id, [FromBody] StudyMaterial material)
    {
        var updated = await _studyMaterialService.UpdateStudyMaterialAsync(id, material);
        if (updated == null) return NotFound();
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> DeleteStudyMaterial(int id)
    {
        var result = await _studyMaterialService.DeleteStudyMaterialAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }
}

