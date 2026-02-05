using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolManagementAPI.Models;
using SchoolManagementAPI.Services;
using System.Security.Claims;

namespace SchoolManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InvoicesController : ControllerBase
{
    private readonly IPaymentService _paymentService;

    public InvoicesController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    [HttpGet]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<List<Invoice>>> GetAllInvoices()
    {
        var invoices = await _paymentService.GetAllInvoicesAsync();
        return Ok(invoices);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Invoice>> GetInvoice(int id)
    {
        var invoice = await _paymentService.GetInvoiceByIdAsync(id);
        if (invoice == null) return NotFound();
        return Ok(invoice);
    }

    [HttpGet("student/{studentId}")]
    public async Task<ActionResult<List<Invoice>>> GetInvoicesByStudent(int studentId)
    {
        var loginType = User.FindFirstValue("login_type");
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // Students and parents can only see their own invoices
        if ((loginType == "student" || loginType == "parent") && userId != studentId)
        {
            return Forbid();
        }

        var invoices = await _paymentService.GetInvoicesByStudentIdAsync(studentId);
        return Ok(invoices);
    }

    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<Invoice>> CreateInvoice([FromBody] Invoice invoice)
    {
        var created = await _paymentService.CreateInvoiceAsync(invoice);
        return CreatedAtAction(nameof(GetInvoice), new { id = created.InvoiceId }, created);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> UpdateInvoice(int id, [FromBody] Invoice invoice)
    {
        var updated = await _paymentService.UpdateInvoiceAsync(id, invoice);
        if (updated == null) return NotFound();
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteInvoice(int id)
    {
        var result = await _paymentService.DeleteInvoiceAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpPost("{invoiceId}/payments")]
    public async Task<ActionResult<Payment>> CreatePayment(int invoiceId, [FromBody] Payment payment)
    {
        payment.InvoiceId = invoiceId;
        var created = await _paymentService.CreatePaymentAsync(payment);
        return CreatedAtAction(nameof(GetInvoice), new { id = invoiceId }, created);
    }
}

