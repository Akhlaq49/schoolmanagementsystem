using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public interface IPaymentService
{
    Task<List<Invoice>> GetAllInvoicesAsync();
    Task<Invoice?> GetInvoiceByIdAsync(int id);
    Task<List<Invoice>> GetInvoicesByStudentIdAsync(int studentId);
    Task<Invoice> CreateInvoiceAsync(Invoice invoice);
    Task<Invoice?> UpdateInvoiceAsync(int id, Invoice invoice);
    Task<bool> DeleteInvoiceAsync(int id);
    Task<Payment> CreatePaymentAsync(Payment payment);
}

