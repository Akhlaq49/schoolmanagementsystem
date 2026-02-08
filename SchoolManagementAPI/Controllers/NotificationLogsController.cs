using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Data;
using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationLogsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<NotificationLogsController> _logger;

    public NotificationLogsController(
        ApplicationDbContext context,
        ILogger<NotificationLogsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<NotificationLog>>> GetLogs(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] NotificationType? type = null,
        [FromQuery] NotificationStatus? status = null)
    {
        if (pageNumber < 1) pageNumber = 1;
        if (pageSize < 1 || pageSize > 100) pageSize = 20;

        var query = _context.NotificationLogs
            .Include(l => l.Recipient)
            .Include(l => l.Template)
            .OrderByDescending(l => l.CreatedDate)
            .AsQueryable();

        if (type.HasValue)
        {
            query = query.Where(l => l.Type == type.Value);
        }

        if (status.HasValue)
        {
            query = query.Where(l => l.Status == status.Value);
        }

        var totalCount = await query.CountAsync();
        var logs = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        Response.Headers["X-Total-Pages"] = ((totalCount + pageSize - 1) / pageSize).ToString();
        Response.Headers["X-Total-Count"] = totalCount.ToString();

        return logs;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<NotificationLog>> GetLog(int id)
    {
        var log = await _context.NotificationLogs
            .Include(l => l.Recipient)
            .Include(l => l.Template)
            .FirstOrDefaultAsync(l => l.LogId == id);

        if (log == null)
        {
            return NotFound("Log not found");
        }

        return log;
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<NotificationLog>>> GetUserLogs(int userId)
    {
        var logs = await _context.NotificationLogs
            .Where(l => l.RecipientId == userId)
            .Include(l => l.Template)
            .OrderByDescending(l => l.CreatedDate)
            .ToListAsync();

        return logs;
    }

    [HttpGet("template/{templateId}")]
    public async Task<ActionResult<IEnumerable<NotificationLog>>> GetTemplateHistory(int templateId)
    {
        var logs = await _context.NotificationLogs
            .Where(l => l.TemplateId == templateId)
            .Include(l => l.Recipient)
            .OrderByDescending(l => l.CreatedDate)
            .Take(100)
            .ToListAsync();

        return logs;
    }

    [HttpGet("statistics")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<object>> GetStatistics([FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
    {
        var query = _context.NotificationLogs.AsQueryable();

        if (startDate.HasValue)
        {
            query = query.Where(l => l.CreatedDate.Date >= startDate.Value.Date);
        }

        if (endDate.HasValue)
        {
            query = query.Where(l => l.CreatedDate.Date <= endDate.Value.Date);
        }

        var stats = new
        {
            TotalSent = await query.Where(l => l.Status == NotificationStatus.Sent).CountAsync(),
            TotalFailed = await query.Where(l => l.Status == NotificationStatus.Failed).CountAsync(),
            TotalPending = await query.Where(l => l.Status == NotificationStatus.Pending).CountAsync(),
            ByType = new
            {
                Attendance = await query.Where(l => l.Type == NotificationType.Attendance).CountAsync(),
                Fee = await query.Where(l => l.Type == NotificationType.Fee).CountAsync(),
                Result = await query.Where(l => l.Type == NotificationType.Result).CountAsync(),
                Announcement = await query.Where(l => l.Type == NotificationType.Announcement).CountAsync(),
                Birthday = await query.Where(l => l.Type == NotificationType.Birthday).CountAsync()
            },
            ByChannel = new
            {
                WhatsApp = await query.Where(l => l.Channel == NotificationChannel.WhatsApp).CountAsync(),
                SMS = await query.Where(l => l.Channel == NotificationChannel.SMS).CountAsync(),
                Email = await query.Where(l => l.Channel == NotificationChannel.Email).CountAsync()
            }
        };

        return stats;
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteLog(int id)
    {
        var log = await _context.NotificationLogs.FindAsync(id);

        if (log == null)
        {
            return NotFound("Log not found");
        }

        _context.NotificationLogs.Remove(log);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Notification log deleted: {Id}", id);

        return NoContent();
    }

    [HttpDelete]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteOldLogs([FromQuery] int olderThanDays = 30)
    {
        if (olderThanDays < 1) olderThanDays = 30;

        var cutoffDate = DateTime.UtcNow.AddDays(-olderThanDays);
        var logsToDelete = await _context.NotificationLogs
            .Where(l => l.CreatedDate < cutoffDate)
            .ToListAsync();

        _context.NotificationLogs.RemoveRange(logsToDelete);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Deleted {Count} notification logs older than {Days} days", logsToDelete.Count, olderThanDays);

        return Ok(new { message = $"Deleted {logsToDelete.Count} logs" });
    }
}
