using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolManagementAPI.Services;

namespace SchoolManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FinancialReportsController : ControllerBase
{
    private readonly FinancialReportService _reportService;

    public FinancialReportsController(FinancialReportService reportService)
    {
        _reportService = reportService;
    }

    [HttpGet("fee-collection-summary")]
    public async Task<ActionResult<FeeCollectionSummary>> GetFeeCollectionSummary(
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate,
        [FromQuery] int? classId = null)
    {
        if (startDate > endDate)
            return BadRequest("Start date must be before end date");

        var summary = await _reportService.GetFeeCollectionSummaryAsync(startDate, endDate, classId);
        return Ok(summary);
    }

    [HttpGet("defaulters")]
    public async Task<ActionResult<List<DefaulterReport>>> GetDefaulters(
        [FromQuery] int? classId = null,
        [FromQuery] int? sectionId = null)
    {
        var defaulters = await _reportService.GetDefaultersListAsync(classId, sectionId);
        return Ok(defaulters);
    }

    [HttpGet("monthly-income")]
    public async Task<ActionResult<MonthlyIncomeReport>> GetMonthlyIncome(
        [FromQuery] int year,
        [FromQuery] int month)
    {
        if (month < 1 || month > 12)
            return BadRequest("Month must be between 1 and 12");

        var report = await _reportService.GetMonthlyIncomeAsync(year, month);
        return Ok(report);
    }

    [HttpGet("class-statistics")]
    public async Task<ActionResult<List<ClassFeeStatistics>>> GetClassStatistics()
    {
        var statistics = await _reportService.GetFeeStatisticsByClassAsync();
        return Ok(statistics);
    }

    [HttpGet("current-month-summary")]
    public async Task<ActionResult<FeeCollectionSummary>> GetCurrentMonthSummary([FromQuery] int? classId = null)
    {
        var now = DateTime.Now;
        var startDate = new DateTime(now.Year, now.Month, 1);
        var endDate = startDate.AddMonths(1).AddDays(-1);

        var summary = await _reportService.GetFeeCollectionSummaryAsync(startDate, endDate, classId);
        return Ok(summary);
    }
}
