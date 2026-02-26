using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolManagementAPI.Models;
using SchoolManagementAPI.Services.Family;

namespace SchoolManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FeeAddonsController : ControllerBase
{
    private readonly IFeeAddonService _service;

    public FeeAddonsController(IFeeAddonService service)
    {
        _service = service;
    }

    [HttpGet]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<List<FeeAddon>>> GetAll()
    {
        var list = await _service.GetAllAsync();
        return Ok(list);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<FeeAddon>> GetById(int id)
    {
        var item = await _service.GetByIdAsync(id);
        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<FeeAddon>> Create([FromBody] FeeAddon feeAddon)
    {
        if (string.IsNullOrWhiteSpace(feeAddon.Name))
            return BadRequest(new { message = "Name is required." });
        var created = await _service.CreateAsync(feeAddon);
        return CreatedAtAction(nameof(GetById), new { id = created.FeeAddonId }, created);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<FeeAddon>> Update(int id, [FromBody] FeeAddon feeAddon)
    {
        if (string.IsNullOrWhiteSpace(feeAddon.Name))
            return BadRequest(new { message = "Name is required." });
        var updated = await _service.UpdateAsync(id, feeAddon);
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
