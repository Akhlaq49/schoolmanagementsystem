using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolManagementAPI.Models;
using SchoolManagementAPI.Services;

namespace SchoolManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "admin")]
public class ExpensesController : ControllerBase
{
    private readonly IExpenseService _expenseService;

    public ExpensesController(IExpenseService expenseService)
    {
        _expenseService = expenseService;
    }

    // Expense Category Endpoints
    [HttpGet("categories")]
    public async Task<ActionResult<List<ExpenseCategory>>> GetExpenseCategories()
    {
        var categories = await _expenseService.GetAllExpenseCategoriesAsync();
        return Ok(categories);
    }

    [HttpGet("categories/{id}")]
    public async Task<ActionResult<ExpenseCategory>> GetExpenseCategory(int id)
    {
        var category = await _expenseService.GetExpenseCategoryByIdAsync(id);
        if (category == null) return NotFound();
        return Ok(category);
    }

    [HttpPost("categories")]
    public async Task<ActionResult<ExpenseCategory>> CreateExpenseCategory([FromBody] ExpenseCategory category)
    {
        var created = await _expenseService.CreateExpenseCategoryAsync(category);
        return CreatedAtAction(nameof(GetExpenseCategory), new { id = created.ExpenseCategoryId }, created);
    }

    [HttpPut("categories/{id}")]
    public async Task<IActionResult> UpdateExpenseCategory(int id, [FromBody] ExpenseCategory category)
    {
        var updated = await _expenseService.UpdateExpenseCategoryAsync(id, category);
        if (updated == null) return NotFound();
        return Ok(updated);
    }

    [HttpDelete("categories/{id}")]
    public async Task<IActionResult> DeleteExpenseCategory(int id)
    {
        var result = await _expenseService.DeleteExpenseCategoryAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }

    // Expense Endpoints
    [HttpGet]
    public async Task<ActionResult<List<Payment>>> GetExpenses()
    {
        var expenses = await _expenseService.GetAllExpensesAsync();
        return Ok(expenses);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Payment>> GetExpense(int id)
    {
        var expense = await _expenseService.GetExpenseByIdAsync(id);
        if (expense == null) return NotFound();
        return Ok(expense);
    }

    [HttpPost]
    public async Task<ActionResult<Payment>> CreateExpense([FromBody] Payment expense)
    {
        var created = await _expenseService.CreateExpenseAsync(expense);
        return CreatedAtAction(nameof(GetExpense), new { id = created.PaymentId }, created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateExpense(int id, [FromBody] Payment expense)
    {
        var updated = await _expenseService.UpdateExpenseAsync(id, expense);
        if (updated == null) return NotFound();
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteExpense(int id)
    {
        var result = await _expenseService.DeleteExpenseAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }
}

