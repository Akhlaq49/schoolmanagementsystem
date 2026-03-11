using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public interface IExpenseService
{
    Task<List<ExpenseCategory>> GetAllExpenseCategoriesAsync();
    Task<ExpenseCategory?> GetExpenseCategoryByIdAsync(int id);
    Task<ExpenseCategory> CreateExpenseCategoryAsync(ExpenseCategory category);
    Task<ExpenseCategory?> UpdateExpenseCategoryAsync(int id, ExpenseCategory category);
    Task<bool> DeleteExpenseCategoryAsync(int id);
    
    Task<List<Payment>> GetAllExpensesAsync();
    Task<Payment?> GetExpenseByIdAsync(int id);
    Task<Payment> CreateExpenseAsync(Payment expense);
    Task<Payment?> UpdateExpenseAsync(int id, Payment expense);
    Task<bool> DeleteExpenseAsync(int id);
    Task<IncomeExpenseReportDto> GetIncomeExpenseReportAsync(DateTime start, DateTime end);
}

