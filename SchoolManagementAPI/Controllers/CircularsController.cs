using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolManagementAPI.Models;
using SchoolManagementAPI.Services;

namespace SchoolManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CircularsController : ControllerBase
{
    private readonly ICircularService _circularService;

    public CircularsController(ICircularService circularService)
    {
        _circularService = circularService;
    }

    [HttpGet]
    public async Task<ActionResult<List<Circular>>> GetAllCirculars()
    {
        var circulars = await _circularService.GetAllCircularsAsync();
        return Ok(circulars);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Circular>> GetCircular(int id)
    {
        var circular = await _circularService.GetCircularByIdAsync(id);
        if (circular == null) return NotFound();
        return Ok(circular);
    }

    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<Circular>> CreateCircular([FromBody] Circular circular)
    {
        var created = await _circularService.CreateCircularAsync(circular);
        return CreatedAtAction(nameof(GetCircular), new { id = created.CircularId }, created);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> UpdateCircular(int id, [FromBody] Circular circular)
    {
        var updated = await _circularService.UpdateCircularAsync(id, circular);
        if (updated == null) return NotFound();
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteCircular(int id)
    {
        var result = await _circularService.DeleteCircularAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }
}

