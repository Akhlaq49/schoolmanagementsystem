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
    private readonly IFeeChallanService _challanService;
    private readonly IFeeDiscountService _discountService;

    public FeeController(IFeeStructureService structureService, IFeeChallanService challanService, IFeeDiscountService discountService)
    {
        _structureService = structureService;
        _challanService = challanService;
        _discountService = discountService;
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

    // ─── Fee Challans ────────────────────────────────────

    [HttpGet("challans")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<List<FeeChallanResponseDto>>> GetAllChallans(
        [FromQuery] int? month, [FromQuery] int? year, [FromQuery] string? status)
    {
        var list = await _challanService.GetAllAsync(month, year, status);
        return Ok(list);
    }

    [HttpGet("challans/{id}")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<FeeChallanResponseDto>> GetChallanById(int id)
    {
        var item = await _challanService.GetByIdAsync(id);
        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpGet("challans/summary")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<ChallanSummaryDto>> GetChallanSummary(
        [FromQuery] int? month, [FromQuery] int? year)
    {
        var summary = await _challanService.GetSummaryAsync(month, year);
        return Ok(summary);
    }

    // ─── Collection Register (Payments) ──────────────────

    [HttpGet("collection/payments")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<List<CollectionPaymentDto>>> GetCollectionPayments(
        [FromQuery] DateTime? start, [FromQuery] DateTime? end)
    {
        var list = await _challanService.GetCollectionPaymentsAsync(start, end);
        return Ok(list);
    }

    [HttpGet("collection/summary")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<CollectionSummaryDto>> GetCollectionSummary(
        [FromQuery] DateTime? start, [FromQuery] DateTime? end)
    {
        var summary = await _challanService.GetCollectionSummaryAsync(start, end);
        return Ok(summary);
    }

    [HttpGet("student/{studentId}/challans")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<List<FeeChallanResponseDto>>> GetStudentChallans(
        int studentId, [FromQuery] string? status)
    {
        var list = await _challanService.GetByStudentAsync(studentId, status);
        return Ok(list);
    }

    [HttpGet("defaulters")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<List<FeeChallanResponseDto>>> GetDefaulters(
        [FromQuery] int? classId,
        [FromQuery] string? status)
    {
        var list = await _challanService.GetDefaultersAsync(classId, status);
        return Ok(list);
    }

    [HttpPost("challans/generate")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult> GenerateChallans([FromBody] ChallanGenerateRequestDto dto)
    {
        if (dto.Month < 1 || dto.Month > 12)
            return BadRequest(new { message = "Month must be between 1 and 12." });

        if (dto.Year < 2000)
            return BadRequest(new { message = "Invalid year." });

        if (dto.AcademicSessionId <= 0)
            return BadRequest(new { message = "Academic session is required." });

        var count = await _challanService.GenerateChallansAsync(dto);
        return Ok(new { count });
    }

    [HttpPost("challans/{id}/pay")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<FeeChallanResponseDto>> RecordPayment(int id, [FromBody] RecordPaymentRequestDto dto)
    {
        if (dto.Amount <= 0)
            return BadRequest(new { message = "Payment amount must be greater than 0." });

        var result = await _challanService.RecordPaymentAsync(id, dto);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost("challans/{id}/waive")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<FeeChallanResponseDto>> WaiveChallan(int id, [FromBody] WaiveChallanRequestDto dto)
    {
        var result = await _challanService.WaiveChallanAsync(id, dto.Reason);
        if (result == null) return NotFound();
        return Ok(result);
    }

    // ─── Fee Discounts ────────────────────────────────────

    [HttpGet("discounts")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<List<FeeDiscountResponseDto>>> GetDiscounts(
        [FromQuery] string? scope, [FromQuery] string? status)
    {
        var list = await _discountService.GetAllAsync(scope, status);
        return Ok(list);
    }

    [HttpGet("discounts/{id}")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<FeeDiscountResponseDto>> GetDiscountById(int id)
    {
        var item = await _discountService.GetByIdAsync(id);
        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpPost("discounts")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<FeeDiscountResponseDto>> CreateDiscount([FromBody] CreateFeeDiscountDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest(new { message = "Name is required." });
        if (dto.Value < 0)
            return BadRequest(new { message = "Value must be non-negative." });
        var created = await _discountService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetDiscountById), new { id = created.FeeDiscountId }, created);
    }

    [HttpPut("discounts/{id}")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<FeeDiscountResponseDto>> UpdateDiscount(int id, [FromBody] UpdateFeeDiscountDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest(new { message = "Name is required." });
        if (dto.Value < 0)
            return BadRequest(new { message = "Value must be non-negative." });
        var updated = await _discountService.UpdateAsync(id, dto);
        if (updated == null) return NotFound();
        return Ok(updated);
    }

    [HttpDelete("discounts/{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteDiscount(int id)
    {
        var ok = await _discountService.DeleteAsync(id);
        if (!ok) return NotFound();
        return NoContent();
    }

    [HttpGet("discounts/{id}/assignments")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<List<FeeDiscountAssignmentResponseDto>>> GetDiscountAssignments(int id)
    {
        var list = await _discountService.GetAssignmentsAsync(id);
        return Ok(list);
    }

    [HttpPost("discounts/{id}/assign/student/{studentId}")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<FeeDiscountAssignmentResponseDto>> AssignDiscountToStudent(int id, int studentId)
    {
        var result = await _discountService.AssignToStudentAsync(id, studentId);
        if (result == null) return BadRequest(new { message = "Discount not found, invalid scope, or already assigned." });
        return Ok(result);
    }

    [HttpPost("discounts/{id}/assign/family/{familyId}")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<FeeDiscountAssignmentResponseDto>> AssignDiscountToFamily(int id, int familyId)
    {
        var result = await _discountService.AssignToFamilyAsync(id, familyId);
        if (result == null) return BadRequest(new { message = "Discount not found, invalid scope, or already assigned." });
        return Ok(result);
    }

    [HttpDelete("discounts/assignments/{assignmentId}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> UnassignDiscount(int assignmentId)
    {
        var ok = await _discountService.UnassignAsync(assignmentId);
        if (!ok) return NotFound();
        return NoContent();
    }
}
