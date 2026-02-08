using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Data;
using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public class FinancialReportService
{
    private readonly ApplicationDbContext _context;

    public FinancialReportService(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Get fee collection summary for a date range
    /// </summary>
    public async Task<FeeCollectionSummary> GetFeeCollectionSummaryAsync(
        DateTime startDate, 
        DateTime endDate, 
        int? classId = null)
    {
        var invoicesQuery = _context.Invoices
            .Include(i => i.Student)
            .Include(i => i.FeeType)
            .Where(i => i.CreationTimestamp >= startDate && i.CreationTimestamp <= endDate);

        if (classId.HasValue)
        {
            invoicesQuery = invoicesQuery.Where(i => i.Student.ClassId == classId);
        }

        var invoices = await invoicesQuery.ToListAsync();

        var summary = new FeeCollectionSummary
        {
            StartDate = startDate,
            EndDate = endDate,
            ClassId = classId,
            TotalInvoices = invoices.Count,
            TotalAmount = invoices.Sum(i => i.Amount),
            TotalCollected = invoices.Sum(i => i.AmountPaid),
            TotalOutstanding = invoices.Sum(i => i.Due),
            PaidInvoices = invoices.Count(i => i.Status == "paid"),
            UnpaidInvoices = invoices.Count(i => i.Status == "unpaid"),
            FinesCollected = invoices.Sum(i => i.FineAmount),
            DiscountsGiven = invoices.Sum(i => i.DiscountAmount)
        };

        return summary;
    }

    /// <summary>
    /// Get list of defaulters (students with outstanding fees)
    /// </summary>
    public async Task<List<DefaulterReport>> GetDefaultersListAsync(int? classId = null, int? sectionId = null)
    {
        var invoicesQuery = _context.Invoices
            .Include(i => i.Student)
                .ThenInclude(s => s.Class)
            .Include(i => i.Student)
                .ThenInclude(s => s.Section)
            .Include(i => i.FeeType)
            .Where(i => i.Status == "unpaid");

        if (classId.HasValue)
        {
            invoicesQuery = invoicesQuery.Where(i => i.Student.ClassId == classId);
        }

        if (sectionId.HasValue)
        {
            invoicesQuery = invoicesQuery.Where(i => i.Student.SectionId == sectionId);
        }

        var invoices = await invoicesQuery.ToListAsync();

        // Group by student
        var defaulters = invoices
            .GroupBy(i => i.StudentId)
            .Select(g => new DefaulterReport
            {
                StudentId = g.Key,
                StudentName = g.First().Student.Name ?? "N/A",
                ClassName = g.First().Student.Class?.Name ?? "N/A",
                SectionName = g.First().Student.Section?.Name ?? "N/A",
                Email = g.First().Student.Email ?? "N/A",
                Phone = g.First().Student.Phone ?? "N/A",
                TotalOutstanding = g.Sum(i => i.Due),
                InvoiceCount = g.Count(),
                OldestDueDate = g.Where(i => i.DueDate.HasValue).Min(i => i.DueDate),
                Invoices = g.Select(i => new InvoiceDetails
                {
                    InvoiceId = i.InvoiceId,
                    Title = i.Title,
                    Amount = i.Amount,
                    AmountPaid = i.AmountPaid,
                    Outstanding = i.Due,
                    DueDate = i.DueDate,
                    FeeType = i.FeeType?.Name ?? "N/A"
                }).ToList()
            })
            .OrderByDescending(d => d.TotalOutstanding)
            .ToList();

        return defaulters;
    }

    /// <summary>
    /// Get monthly income report
    /// </summary>
    public async Task<MonthlyIncomeReport> GetMonthlyIncomeAsync(int year, int month)
    {
        var startDate = new DateTime(year, month, 1);
        var endDate = startDate.AddMonths(1).AddDays(-1);

        var payments = await _context.Payments
            .Include(p => p.Invoice)
                .ThenInclude(i => i.FeeType)
            .Where(p => p.Timestamp >= startDate && p.Timestamp <= endDate)
            .ToListAsync();

        var report = new MonthlyIncomeReport
        {
            Year = year,
            Month = month,
            MonthName = startDate.ToString("MMMM"),
            TotalPayments = payments.Count,
            TotalAmount = payments.Sum(p => p.Amount),
            PaymentsByType = payments
                .GroupBy(p => p.Invoice?.FeeType?.Name ?? "Other")
                .Select(g => new PaymentsByTypeDetail
                {
                    FeeType = g.Key,
                    Count = g.Count(),
                    Amount = g.Sum(p => p.Amount)
                })
                .ToList(),
            PaymentsByMethod = payments
                .GroupBy(p => p.PaymentMethod ?? "Unknown")
                .Select(g => new PaymentsByMethodDetail
                {
                    PaymentMethod = g.Key,
                    Count = g.Count(),
                    Amount = g.Sum(p => p.Amount)
                })
                .ToList()
        };

        return report;
    }

    /// <summary>
    /// Get fee statistics by class
    /// </summary>
    public async Task<List<ClassFeeStatistics>> GetFeeStatisticsByClassAsync()
    {
        var classes = await _context.Classes.ToListAsync();
        var invoices = await _context.Invoices
            .Include(i => i.Student)
            .ToListAsync();

        var statistics = classes.Select(c => new ClassFeeStatistics
        {
            ClassId = c.ClassId,
            ClassName = c.Name,
            TotalStudents = invoices.Count(i => i.Student.ClassId == c.ClassId),
            TotalInvoices = invoices.Count(i => i.Student.ClassId == c.ClassId),
            TotalAmount = invoices.Where(i => i.Student.ClassId == c.ClassId).Sum(i => i.Amount),
            TotalCollected = invoices.Where(i => i.Student.ClassId == c.ClassId).Sum(i => i.AmountPaid),
            TotalOutstanding = invoices.Where(i => i.Student.ClassId == c.ClassId).Sum(i => i.Due),
            CollectionPercentage = invoices.Where(i => i.Student.ClassId == c.ClassId).Sum(i => i.Amount) > 0
                ? (invoices.Where(i => i.Student.ClassId == c.ClassId).Sum(i => i.AmountPaid) /
                   invoices.Where(i => i.Student.ClassId == c.ClassId).Sum(i => i.Amount)) * 100
                : 0
        }).OrderBy(s => s.ClassName).ToList();

        return statistics;
    }
}

// DTOs for reports
public class FeeCollectionSummary
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int? ClassId { get; set; }
    public int TotalInvoices { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal TotalCollected { get; set; }
    public decimal TotalOutstanding { get; set; }
    public int PaidInvoices { get; set; }
    public int UnpaidInvoices { get; set; }
    public decimal FinesCollected { get; set; }
    public decimal DiscountsGiven { get; set; }
}

public class DefaulterReport
{
    public int StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string ClassName { get; set; } = string.Empty;
    public string SectionName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public decimal TotalOutstanding { get; set; }
    public int InvoiceCount { get; set; }
    public DateTime? OldestDueDate { get; set; }
    public List<InvoiceDetails> Invoices { get; set; } = new();
}

public class InvoiceDetails
{
    public int InvoiceId { get; set; }
    public string Title { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal AmountPaid { get; set; }
    public decimal Outstanding { get; set; }
    public DateTime? DueDate { get; set; }
    public string FeeType { get; set; } = string.Empty;
}

public class MonthlyIncomeReport
{
    public int Year { get; set; }
    public int Month { get; set; }
    public string MonthName { get; set; } = string.Empty;
    public int TotalPayments { get; set; }
    public decimal TotalAmount { get; set; }
    public List<PaymentsByTypeDetail> PaymentsByType { get; set; } = new();
    public List<PaymentsByMethodDetail> PaymentsByMethod { get; set; } = new();
}

public class PaymentsByTypeDetail
{
    public string FeeType { get; set; } = string.Empty;
    public int Count { get; set; }
    public decimal Amount { get; set; }
}

public class PaymentsByMethodDetail
{
    public string PaymentMethod { get; set; } = string.Empty;
    public int Count { get; set; }
    public decimal Amount { get; set; }
}

public class ClassFeeStatistics
{
    public int ClassId { get; set; }
    public string ClassName { get; set; } = string.Empty;
    public int TotalStudents { get; set; }
    public int TotalInvoices { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal TotalCollected { get; set; }
    public decimal TotalOutstanding { get; set; }
    public decimal CollectionPercentage { get; set; }
}
