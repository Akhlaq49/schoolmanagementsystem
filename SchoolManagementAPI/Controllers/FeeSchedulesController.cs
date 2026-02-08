using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolManagementAPI.Models;
using SchoolManagementAPI.Services;

namespace SchoolManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FeeSchedulesController : ControllerBase
{
    private readonly IRecurringFeeService _recurringFeeService;

    public FeeSchedulesController(IRecurringFeeService recurringFeeService)
    {
        _recurringFeeService = recurringFeeService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<FeeSchedule>>> GetAllSchedules()
    {
        var schedules = await _recurringFeeService.GetAllSchedulesAsync();
        return Ok(schedules);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<FeeSchedule>> GetSchedule(int id)
    {
        var schedule = await _recurringFeeService.GetScheduleByIdAsync(id);
        if (schedule == null) return NotFound();
        return Ok(schedule);
    }

    [HttpGet("by-class/{classId}")]
    public async Task<ActionResult<IEnumerable<FeeSchedule>>> GetSchedulesByClass(int classId)
    {
        var schedules = await _recurringFeeService.GetSchedulesByClassAsync(classId);
        return Ok(schedules);
    }

    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<FeeSchedule>> CreateSchedule([FromBody] FeeSchedule schedule)
    {
        if (schedule.Amount <= 0)
            return BadRequest("Amount must be greater than 0");

        if (schedule.DueDay < 1 || schedule.DueDay > 31)
            return BadRequest("Due day must be between 1 and 31");

        var created = await _recurringFeeService.CreateScheduleAsync(schedule);
        return CreatedAtAction(nameof(GetSchedule), new { id = created.ScheduleId }, created);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> UpdateSchedule(int id, [FromBody] FeeSchedule schedule)
    {
        if (schedule.Amount <= 0)
            return BadRequest("Amount must be greater than 0");

        if (schedule.DueDay < 1 || schedule.DueDay > 31)
            return BadRequest("Due day must be between 1 and 31");

        var updated = await _recurringFeeService.UpdateScheduleAsync(id, schedule);
        if (updated == null) return NotFound();
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteSchedule(int id)
    {
        var result = await _recurringFeeService.DeleteScheduleAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpPost("generate-invoices")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<object>> GenerateInvoicesForCurrentMonth()
    {
        var count = await _recurringFeeService.GenerateInvoicesForAllAsync();
        return Ok(new { message = $"Generated {count} invoices for the current month" });
    }

    [HttpPost("generate-invoices/{month}/{year}")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<object>> GenerateInvoicesForMonth(int month, int year)
    {
        if (month < 1 || month > 12)
            return BadRequest("Month must be between 1 and 12");

        var count = await _recurringFeeService.GenerateInvoicesForMonthAsync(month, year);
        return Ok(new { message = $"Generated {count} invoices for {month}/{year}" });
    }
}
