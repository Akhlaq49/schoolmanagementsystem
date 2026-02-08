using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolManagementAPI.Services;

namespace SchoolManagementAPI.Controllers;

[ApiController]
[Route("api/pdf-reports")]
[Authorize]
public class PdfReportsController : ControllerBase
{
    private readonly IPdfService _pdfService;

    public PdfReportsController(IPdfService pdfService)
    {
        _pdfService = pdfService;
    }

    [HttpGet("fee-receipt/{invoiceId}")]
    public async Task<IActionResult> GetFeeReceipt(int invoiceId)
    {
        try
        {
            var pdf = await _pdfService.GenerateFeeReceiptAsync(invoiceId);
            return File(pdf, "application/pdf", $"fee-receipt-{invoiceId}.pdf");
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpGet("result-card/{studentId}/{examId}")]
    public async Task<IActionResult> GetResultCard(int studentId, int examId)
    {
        try
        {
            var pdf = await _pdfService.GenerateResultCardAsync(studentId, examId);
            return File(pdf, "application/pdf", $"result-card-{studentId}-{examId}.pdf");
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpGet("attendance-report")]
    public async Task<IActionResult> GetAttendanceReport(
        [FromQuery] int classId,
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate)
    {
        if (classId <= 0)
        {
            return BadRequest("classId is required.");
        }

        if (startDate > endDate)
        {
            return BadRequest("startDate must be before endDate.");
        }

        try
        {
            var pdf = await _pdfService.GenerateAttendanceReportAsync(classId, startDate, endDate);
            return File(pdf, "application/pdf", $"attendance-report-{classId}-{startDate:yyyyMMdd}-{endDate:yyyyMMdd}.pdf");
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpGet("id-card/{studentId}")]
    public async Task<IActionResult> GetIdCard(int studentId)
    {
        try
        {
            var pdf = await _pdfService.GenerateStudentIdCardAsync(studentId);
            return File(pdf, "application/pdf", $"student-id-card-{studentId}.pdf");
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }
}
