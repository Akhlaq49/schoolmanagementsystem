using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolManagementAPI.DTOs;
using SchoolManagementAPI.Services;

namespace SchoolManagementAPI.Controllers;

[ApiController]
[Route("api/fee")]
[Authorize]
public class FeeController : ControllerBase
{
    private readonly IFeeStructureService _structureService;

    public FeeController(IFeeStructureService structureService)
    {
        _structureService = structureService;
    }

    [HttpGet("structures")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<List<FeeStructureResponseDto>>> GetAllStructures()
    {
        var list = await _structureService.GetAllAsync();
        return Ok(list);
    }

    [HttpGet("structures/{id}")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<FeeStructureResponseDto>> GetStructureById(int id)
    {
        var item = await _structureService.GetByIdAsync(id);
        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpPost("structures")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<FeeStructureResponseDto>> CreateStructure([FromBody] CreateFeeStructureDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest(new { message = "Name is required." });

        if (dto.ClassId <= 0)
            return BadRequest(new { message = "Class is required." });

        if (dto.AcademicSessionId <= 0)
            return BadRequest(new { message = "Academic session is required." });

        if (dto.MonthlyAmount <= 0)
            return BadRequest(new { message = "Monthly amount must be greater than 0." });

        if (dto.DueDayOfMonth < 1 || dto.DueDayOfMonth > 28)
            return BadRequest(new { message = "Due day must be between 1 and 28." });

        var created = await _structureService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetStructureById), new { id = created.FeeStructureId }, created);
    }

    [HttpPut("structures/{id}")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<FeeStructureResponseDto>> UpdateStructure(int id, [FromBody] UpdateFeeStructureDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest(new { message = "Name is required." });

        if (dto.MonthlyAmount <= 0)
            return BadRequest(new { message = "Monthly amount must be greater than 0." });

        var updated = await _structureService.UpdateAsync(id, dto);
        if (updated == null) return NotFound();
        return Ok(updated);
    }

    [HttpDelete("structures/{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteStructure(int id)
    {
        var ok = await _structureService.DeleteAsync(id);
        if (!ok) return NotFound();
        return NoContent();
    }
}
