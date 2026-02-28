using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolManagementAPI.Models;
using SchoolManagementAPI.Services;

namespace SchoolManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AcademicSessionsController : ControllerBase
{
    private readonly IAcademicSessionService _service;

    public AcademicSessionsController(IAcademicSessionService service)
    {
        _service = service;
    }

    [HttpGet]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<List<AcademicSession>>> GetAll()
    {
        var sessions = await _service.GetAllAsync();
        return Ok(sessions);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<AcademicSession>> GetById(int id)
    {
        var session = await _service.GetByIdAsync(id);
        if (session == null) return NotFound();
        return Ok(session);
    }

    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<AcademicSession>> Create([FromBody] AcademicSession session)
    {
        if (string.IsNullOrWhiteSpace(session.Name))
        {
            return BadRequest(new { message = "Name is required." });
        }

        var created = await _service.CreateAsync(session);
        return CreatedAtAction(nameof(GetById), new { id = created.AcademicSessionId }, created);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<AcademicSession>> Update(int id, [FromBody] AcademicSession session)
    {
        if (string.IsNullOrWhiteSpace(session.Name))
        {
            return BadRequest(new { message = "Name is required." });
        }

        var updated = await _service.UpdateAsync(id, session);
        if (updated == null) return NotFound();
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var ok = await _service.DeleteAsync(id);
        if (!ok) return NotFound();
        return NoContent();
    }
}

