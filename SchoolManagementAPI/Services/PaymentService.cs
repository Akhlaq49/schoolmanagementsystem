using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Data;
using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public class PaymentService : IPaymentService
{
    private readonly ApplicationDbContext _context;

    public PaymentService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Invoice>> GetAllInvoicesAsync()
    {
        return await _context.Invoices
            .Include(i => i.Student)
            .ToListAsync();
    }

    public async Task<Invoice?> GetInvoiceByIdAsync(int id)
    {
        return await _context.Invoices
            .Include(i => i.Student)
            .FirstOrDefaultAsync(i => i.InvoiceId == id);
    }

    public async Task<List<Invoice>> GetInvoicesByStudentIdAsync(int studentId)
    {
        return await _context.Invoices
            .Include(i => i.Student)
            .Where(i => i.StudentId == studentId)
            .ToListAsync();
    }

    public async Task<Invoice> CreateInvoiceAsync(Invoice invoice)
    {
        invoice.Due = invoice.Amount - invoice.AmountPaid;
        invoice.Status = invoice.Due > 0 ? "unpaid" : "paid";
        invoice.CreationTimestamp = DateTime.UtcNow;

        _context.Invoices.Add(invoice);
        await _context.SaveChangesAsync();
        return invoice;
    }

    public async Task<Invoice?> UpdateInvoiceAsync(int id, Invoice invoice)
    {
        var existing = await _context.Invoices.FindAsync(id);
        if (existing == null) return null;

        existing.Title = invoice.Title;
        existing.Description = invoice.Description;
        existing.Amount = invoice.Amount;
        existing.AmountPaid = invoice.AmountPaid;
        existing.Due = invoice.Amount - invoice.AmountPaid;
        existing.Status = existing.Due > 0 ? "unpaid" : "paid";

        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteInvoiceAsync(int id)
    {
        var invoice = await _context.Invoices.FindAsync(id);
        if (invoice == null) return false;

        _context.Invoices.Remove(invoice);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<Payment> CreatePaymentAsync(Payment payment)
    {
        payment.Timestamp = DateTime.UtcNow;
        _context.Payments.Add(payment);

        // Update invoice
        var invoice = await _context.Invoices.FindAsync(payment.InvoiceId);
        if (invoice != null)
        {
            invoice.AmountPaid += payment.Amount;
            invoice.Due = invoice.Amount - invoice.AmountPaid;
            invoice.Status = invoice.Due > 0 ? "unpaid" : "paid";
        }

        await _context.SaveChangesAsync();
        return payment;
    }
}

