using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Data;
using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationTemplatesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<NotificationTemplatesController> _logger;

    public NotificationTemplatesController(
        ApplicationDbContext context,
        ILogger<NotificationTemplatesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<NotificationTemplate>>> GetTemplates([FromQuery] NotificationType? type = null)
    {
        var query = _context.NotificationTemplates.AsQueryable();

        if (type.HasValue)
        {
            query = query.Where(t => t.Type == type.Value);
        }

        return await query.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<NotificationTemplate>> GetTemplate(int id)
    {
        var template = await _context.NotificationTemplates.FindAsync(id);

        if (template == null)
        {
            return NotFound("Template not found");
        }

        return template;
    }

    [HttpPost]
    [Authorize(Roles = "admin,teacher")]
    public async Task<ActionResult<NotificationTemplate>> CreateTemplate(NotificationTemplate template)
    {
        if (string.IsNullOrWhiteSpace(template.Name) || string.IsNullOrWhiteSpace(template.MessageTemplate))
        {
            return BadRequest("Name and MessageTemplate are required");
        }

        template.CreatedDate = DateTime.UtcNow;

        _context.NotificationTemplates.Add(template);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Notification template created: {Name}", template.Name);

        return CreatedAtAction(nameof(GetTemplate), new { id = template.TemplateId }, template);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> UpdateTemplate(int id, NotificationTemplate template)
    {
        var existingTemplate = await _context.NotificationTemplates.FindAsync(id);

        if (existingTemplate == null)
        {
            return NotFound("Template not found");
        }

        existingTemplate.Name = template.Name ?? existingTemplate.Name;
        existingTemplate.Type = template.Type;
        existingTemplate.MessageTemplate = template.MessageTemplate ?? existingTemplate.MessageTemplate;
        existingTemplate.Description = template.Description ?? existingTemplate.Description;
        existingTemplate.IsActive = template.IsActive;
        existingTemplate.ModifiedDate = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Notification template updated: {Id}", id);

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteTemplate(int id)
    {
        var template = await _context.NotificationTemplates.FindAsync(id);

        if (template == null)
        {
            return NotFound("Template not found");
        }

        _context.NotificationTemplates.Remove(template);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Notification template deleted: {Id}", id);

        return NoContent();
    }

    [HttpPost("{id}/deactivate")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> DeactivateTemplate(int id)
    {
        var template = await _context.NotificationTemplates.FindAsync(id);

        if (template == null)
        {
            return NotFound("Template not found");
        }

        template.IsActive = false;
        template.ModifiedDate = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
