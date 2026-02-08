using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolManagementAPI.Models;
using SchoolManagementAPI.Services;

namespace SchoolManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FeeTypesController : ControllerBase
{
    private readonly IFeeTypeService _feeTypeService;

    public FeeTypesController(IFeeTypeService feeTypeService)
    {
        _feeTypeService = feeTypeService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<FeeType>>> GetAllFeeTypes()
    {
        var feeTypes = await _feeTypeService.GetAllAsync();
        return Ok(feeTypes);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<FeeType>> GetFeeType(int id)
    {
        var feeType = await _feeTypeService.GetByIdAsync(id);
        if (feeType == null) return NotFound();
        return Ok(feeType);
    }

    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<FeeType>> CreateFeeType([FromBody] FeeType feeType)
    {
        if (string.IsNullOrWhiteSpace(feeType.Name))
            return BadRequest("Fee type name is required");

        var created = await _feeTypeService.CreateAsync(feeType);
        return CreatedAtAction(nameof(GetFeeType), new { id = created.FeeTypeId }, created);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> UpdateFeeType(int id, [FromBody] FeeType feeType)
    {
        if (string.IsNullOrWhiteSpace(feeType.Name))
            return BadRequest("Fee type name is required");

        var updated = await _feeTypeService.UpdateAsync(id, feeType);
        if (updated == null) return NotFound();
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteFeeType(int id)
    {
        var result = await _feeTypeService.DeleteAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }
}
