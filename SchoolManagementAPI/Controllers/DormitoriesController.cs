using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolManagementAPI.Models;
using SchoolManagementAPI.Services;

namespace SchoolManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DormitoriesController : ControllerBase
{
    private readonly IDormitoryService _dormitoryService;

    public DormitoriesController(IDormitoryService dormitoryService)
    {
        _dormitoryService = dormitoryService;
    }

    [HttpGet]
    public async Task<ActionResult<List<Dormitory>>> GetAllDormitories()
    {
        var dormitories = await _dormitoryService.GetAllDormitoriesAsync();
        return Ok(dormitories);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Dormitory>> GetDormitory(int id)
    {
        var dormitory = await _dormitoryService.GetDormitoryByIdAsync(id);
        if (dormitory == null) return NotFound();
        return Ok(dormitory);
    }

    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<Dormitory>> CreateDormitory([FromBody] Dormitory dormitory)
    {
        var created = await _dormitoryService.CreateDormitoryAsync(dormitory);
        return CreatedAtAction(nameof(GetDormitory), new { id = created.DormitoryId }, created);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> UpdateDormitory(int id, [FromBody] Dormitory dormitory)
    {
        var updated = await _dormitoryService.UpdateDormitoryAsync(id, dormitory);
        if (updated == null) return NotFound();
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteDormitory(int id)
    {
        var result = await _dormitoryService.DeleteDormitoryAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }
}

