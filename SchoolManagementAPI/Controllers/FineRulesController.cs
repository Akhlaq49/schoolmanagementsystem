using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Data;
using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FineRulesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public FineRulesController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<FineRule>>> GetAllFineRules()
    {
        var rules = await _context.FineRules
            .Include(fr => fr.FeeType)
            .OrderBy(fr => fr.DaysAfterDue)
            .ToListAsync();
        return Ok(rules);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<FineRule>> GetFineRule(int id)
    {
        var rule = await _context.FineRules
            .Include(fr => fr.FeeType)
            .FirstOrDefaultAsync(fr => fr.RuleId == id);

        if (rule == null) return NotFound();
        return Ok(rule);
    }

    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<FineRule>> CreateFineRule([FromBody] FineRule rule)
    {
        if (rule.DaysAfterDue < 0)
            return BadRequest("Days after due must be non-negative");

        if (rule.FineAmount <= 0)
            return BadRequest("Fine amount must be greater than 0");

        if (rule.FineType != "Fixed" && rule.FineType != "Percentage")
            return BadRequest("Fine type must be 'Fixed' or 'Percentage'");

        rule.CreatedDate = DateTime.Now;
        rule.ModifiedDate = DateTime.Now;

        _context.FineRules.Add(rule);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetFineRule), new { id = rule.RuleId }, rule);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> UpdateFineRule(int id, [FromBody] FineRule rule)
    {
        var existing = await _context.FineRules.FindAsync(id);
        if (existing == null) return NotFound();

        if (rule.DaysAfterDue < 0)
            return BadRequest("Days after due must be non-negative");

        if (rule.FineAmount <= 0)
            return BadRequest("Fine amount must be greater than 0");

        if (rule.FineType != "Fixed" && rule.FineType != "Percentage")
            return BadRequest("Fine type must be 'Fixed' or 'Percentage'");

        existing.FeeTypeId = rule.FeeTypeId;
        existing.DaysAfterDue = rule.DaysAfterDue;
        existing.FineType = rule.FineType;
        existing.FineAmount = rule.FineAmount;
        existing.IsActive = rule.IsActive;
        existing.Description = rule.Description;
        existing.ModifiedDate = DateTime.Now;

        await _context.SaveChangesAsync();
        return Ok(existing);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteFineRule(int id)
    {
        var rule = await _context.FineRules.FindAsync(id);
        if (rule == null) return NotFound();

        _context.FineRules.Remove(rule);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
