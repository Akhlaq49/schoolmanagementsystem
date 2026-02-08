using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Data;
using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public class FeeCalculationService
{
    private readonly ApplicationDbContext _context;

    public FeeCalculationService(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Calculate total amount due including fines and applying discounts
    /// </summary>
    public async Task<FeeCalculation> CalculateFeeAsync(Invoice invoice)
    {
        var calculation = new FeeCalculation
        {
            InvoiceId = invoice.InvoiceId,
            BaseAmount = invoice.Amount,
            FineAmount = 0,
            DiscountAmount = 0,
            FinalAmount = invoice.Amount
        };

        // Calculate fine if due date has passed
        if (invoice.DueDate.HasValue && invoice.DueDate < DateTime.Today && invoice.Status == "unpaid")
        {
            calculation.FineAmount = await CalculateFineAsync(invoice);
        }

        // Calculate and apply discounts
        calculation.DiscountAmount = await CalculateDiscountsAsync(invoice);

        // Calculate final amount
        calculation.FinalAmount = calculation.BaseAmount + calculation.FineAmount - calculation.DiscountAmount;
        calculation.FinalAmount = Math.Max(0, calculation.FinalAmount); // Ensure not negative

        return calculation;
    }

    /// <summary>
    /// Calculate late payment fine
    /// </summary>
    private async Task<decimal> CalculateFineAsync(Invoice invoice)
    {
        if (!invoice.DueDate.HasValue) return 0;

        var daysOverdue = (DateTime.Today - invoice.DueDate.Value).Days;
        var fineRules = await _context.FineRules
            .Where(fr => fr.IsActive &&
                   (fr.FeeTypeId == null || fr.FeeTypeId == invoice.FeeTypeId) &&
                   fr.DaysAfterDue <= daysOverdue)
            .OrderByDescending(fr => fr.DaysAfterDue)
            .ToListAsync();

        if (!fineRules.Any()) return 0;

        var applicableRule = fineRules.First();
        decimal fine = 0;

        if (applicableRule.FineType == "Fixed")
        {
            fine = applicableRule.FineAmount;
        }
        else if (applicableRule.FineType == "Percentage")
        {
            fine = (invoice.Amount * applicableRule.FineAmount) / 100;
        }

        return fine;
    }

    /// <summary>
    /// Calculate total discounts applicable to invoice
    /// </summary>
    private async Task<decimal> CalculateDiscountsAsync(Invoice invoice)
    {
        var discountRules = await _context.DiscountRules
            .Where(dr => dr.IsActive &&
                   (dr.FeeTypeId == null || dr.FeeTypeId == invoice.FeeTypeId))
            .ToListAsync();

        decimal totalDiscount = 0;

        foreach (var rule in discountRules)
        {
            // Check if discount applies
            if (!await DiscountAppliesAsync(invoice, rule)) continue;

            decimal discountAmount = 0;

            if (rule.CalculationType == "Fixed")
            {
                discountAmount = rule.DiscountAmount;
            }
            else if (rule.CalculationType == "Percentage")
            {
                discountAmount = (invoice.Amount * rule.DiscountAmount) / 100;
            }

            totalDiscount += discountAmount;
        }

        return totalDiscount;
    }

    /// <summary>
    /// Check if discount rule applies to this invoice
    /// </summary>
    private async Task<bool> DiscountAppliesAsync(Invoice invoice, DiscountRule rule)
    {
        switch (rule.DiscountType)
        {
            case "Sibling":
                // Check if student has siblings also paying fees
                var student = await _context.Users.FindAsync(invoice.StudentId);
                if (student?.ParentId == null) return false;

                var siblingCount = await _context.Users
                    .Where(u => u.ParentId == student.ParentId && u.UserId != student.UserId)
                    .CountAsync();

                return siblingCount > 0;

            case "Early":
                // Check if payment is made before due date
                if (!invoice.DueDate.HasValue) return false;
                return DateTime.Today < invoice.DueDate.Value;

            case "Merit":
                // Check student's merit (e.g., GPA > 3.5)
                // This would require checking student results
                // For now, return false - can be enhanced based on business logic
                return false;

            default:
                return false;
        }
    }

    /// <summary>
    /// Update invoice with calculated amounts
    /// </summary>
    public async Task<Invoice> ApplyCalculationToInvoiceAsync(Invoice invoice)
    {
        var calculation = await CalculateFeeAsync(invoice);

        invoice.FineAmount = calculation.FineAmount;
        invoice.DiscountAmount = calculation.DiscountAmount;
        invoice.FinalAmount = calculation.FinalAmount;
        invoice.Due = calculation.FinalAmount - invoice.AmountPaid;

        await _context.SaveChangesAsync();
        return invoice;
    }
}

/// <summary>
/// DTO for fee calculation results
/// </summary>
public class FeeCalculation
{
    public int InvoiceId { get; set; }
    public decimal BaseAmount { get; set; }
    public decimal FineAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal FinalAmount { get; set; }
}
