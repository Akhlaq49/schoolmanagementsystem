using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Data;
using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DiscountRulesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public DiscountRulesController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<DiscountRule>>> GetAllDiscountRules()
    {
        var rules = await _context.DiscountRules
            .Include(dr => dr.FeeType)
            .OrderBy(dr => dr.Name)
            .ToListAsync();
        return Ok(rules);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<DiscountRule>> GetDiscountRule(int id)
    {
        var rule = await _context.DiscountRules
            .Include(dr => dr.FeeType)
            .FirstOrDefaultAsync(dr => dr.RuleId == id);

        if (rule == null) return NotFound();
        return Ok(rule);
    }

    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<DiscountRule>> CreateDiscountRule([FromBody] DiscountRule rule)
    {
        if (string.IsNullOrWhiteSpace(rule.Name))
            return BadRequest("Discount rule name is required");

        if (rule.DiscountAmount <= 0)
            return BadRequest("Discount amount must be greater than 0");

        if (rule.CalculationType != "Fixed" && rule.CalculationType != "Percentage")
            return BadRequest("Calculation type must be 'Fixed' or 'Percentage'");

        rule.CreatedDate = DateTime.Now;
        rule.ModifiedDate = DateTime.Now;

        _context.DiscountRules.Add(rule);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetDiscountRule), new { id = rule.RuleId }, rule);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> UpdateDiscountRule(int id, [FromBody] DiscountRule rule)
    {
        var existing = await _context.DiscountRules.FindAsync(id);
        if (existing == null) return NotFound();

        if (string.IsNullOrWhiteSpace(rule.Name))
            return BadRequest("Discount rule name is required");

        if (rule.DiscountAmount <= 0)
            return BadRequest("Discount amount must be greater than 0");

        if (rule.CalculationType != "Fixed" && rule.CalculationType != "Percentage")
            return BadRequest("Calculation type must be 'Fixed' or 'Percentage'");

        existing.Name = rule.Name;
        existing.DiscountType = rule.DiscountType;
        existing.CalculationType = rule.CalculationType;
        existing.DiscountAmount = rule.DiscountAmount;
        existing.Conditions = rule.Conditions;
        existing.FeeTypeId = rule.FeeTypeId;
        existing.IsActive = rule.IsActive;
        existing.Description = rule.Description;
        existing.ModifiedDate = DateTime.Now;

        await _context.SaveChangesAsync();
        return Ok(existing);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteDiscountRule(int id)
    {
        var rule = await _context.DiscountRules.FindAsync(id);
        if (rule == null) return NotFound();

        _context.DiscountRules.Remove(rule);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
