using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolManagementAPI.Models;
using SchoolManagementAPI.Services;

namespace SchoolManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ClassesController : ControllerBase
{
    private readonly IClassService _classService;

    public ClassesController(IClassService classService)
    {
        _classService = classService;
    }

    [HttpGet]
    public async Task<ActionResult<List<Class>>> GetAllClasses()
    {
        var classes = await _classService.GetAllClassesAsync();
        return Ok(classes);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Class>> GetClass(int id)
    {
        var classEntity = await _classService.GetClassByIdAsync(id);
        if (classEntity == null)
        {
            return NotFound();
        }
        return Ok(classEntity);
    }

    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<Class>> CreateClass([FromBody] Class classEntity)
    {
        var created = await _classService.CreateClassAsync(classEntity);
        return CreatedAtAction(nameof(GetClass), new { id = created.ClassId }, created);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> UpdateClass(int id, [FromBody] Class classEntity)
    {
        var updated = await _classService.UpdateClassAsync(id, classEntity);
        if (updated == null)
        {
            return NotFound();
        }
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteClass(int id)
    {
        var result = await _classService.DeleteClassAsync(id);
        if (!result)
        {
            return NotFound();
        }
        return NoContent();
    }
}

