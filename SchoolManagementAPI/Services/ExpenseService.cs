using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Data;
using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public class ExpenseService : IExpenseService
{
    private readonly ApplicationDbContext _context;

    public ExpenseService(ApplicationDbContext context)
    {
        _context = context;
    }

    // Expense Category Methods
    public async Task<List<ExpenseCategory>> GetAllExpenseCategoriesAsync()
    {
        return await _context.Set<ExpenseCategory>().ToListAsync();
    }

    public async Task<ExpenseCategory?> GetExpenseCategoryByIdAsync(int id)
    {
        return await _context.Set<ExpenseCategory>().FindAsync(id);
    }

    public async Task<ExpenseCategory> CreateExpenseCategoryAsync(ExpenseCategory category)
    {
        _context.Set<ExpenseCategory>().Add(category);
        await _context.SaveChangesAsync();
        return category;
    }

    public async Task<ExpenseCategory?> UpdateExpenseCategoryAsync(int id, ExpenseCategory category)
    {
        var existing = await _context.Set<ExpenseCategory>().FindAsync(id);
        if (existing == null) return null;

        existing.Name = category.Name;
        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteExpenseCategoryAsync(int id)
    {
        var category = await _context.Set<ExpenseCategory>().FindAsync(id);
        if (category == null) return false;

        _context.Set<ExpenseCategory>().Remove(category);
        await _context.SaveChangesAsync();
        return true;
    }

    // Expense Methods (using Payment table with payment_type = 'expense')
    public async Task<List<Payment>> GetAllExpensesAsync()
    {
        return await _context.Payments
            .Where(p => p.PaymentType == "expense")
            .ToListAsync();
    }

    public async Task<Payment?> GetExpenseByIdAsync(int id)
    {
        return await _context.Payments
            .FirstOrDefaultAsync(p => p.PaymentId == id && p.PaymentType == "expense");
    }

    public async Task<Payment> CreateExpenseAsync(Payment expense)
    {
        expense.PaymentType = "expense";
        expense.Timestamp = DateTime.UtcNow;
        _context.Payments.Add(expense);
        await _context.SaveChangesAsync();
        return expense;
    }

    public async Task<Payment?> UpdateExpenseAsync(int id, Payment expense)
    {
        var existing = await _context.Payments
            .FirstOrDefaultAsync(p => p.PaymentId == id && p.PaymentType == "expense");
        if (existing == null) return null;

        existing.Title = expense.Title;
        existing.Description = expense.Description;
        existing.Amount = expense.Amount;
        existing.PaymentMethod = expense.PaymentMethod;
        existing.Timestamp = expense.Timestamp;

        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteExpenseAsync(int id)
    {
        var expense = await _context.Payments
            .FirstOrDefaultAsync(p => p.PaymentId == id && p.PaymentType == "expense");
        if (expense == null) return false;

        _context.Payments.Remove(expense);
        await _context.SaveChangesAsync();
        return true;
    }
}

