using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolManagementAPI.Models;
using SchoolManagementAPI.Services;

namespace SchoolManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TransportsController : ControllerBase
{
    private readonly ITransportService _transportService;

    public TransportsController(ITransportService transportService)
    {
        _transportService = transportService;
    }

    [HttpGet]
    public async Task<ActionResult<List<Transport>>> GetAllTransports()
    {
        var transports = await _transportService.GetAllTransportsAsync();
        return Ok(transports);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Transport>> GetTransport(int id)
    {
        var transport = await _transportService.GetTransportByIdAsync(id);
        if (transport == null) return NotFound();
        return Ok(transport);
    }

    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<Transport>> CreateTransport([FromBody] Transport transport)
    {
        var created = await _transportService.CreateTransportAsync(transport);
        return CreatedAtAction(nameof(GetTransport), new { id = created.TransportId }, created);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> UpdateTransport(int id, [FromBody] Transport transport)
    {
        var updated = await _transportService.UpdateTransportAsync(id, transport);
        if (updated == null) return NotFound();
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteTransport(int id)
    {
        var result = await _transportService.DeleteTransportAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }
}

