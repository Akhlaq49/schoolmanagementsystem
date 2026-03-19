using System;
using System.Globalization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Data;
using SchoolManagementAPI.DTOs;
using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Controllers;

[ApiController]
[Route("api/admin/attendance/calendar")]
public class AdminAttendanceCalendarController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private static readonly string[] AllowedTypes = new[] { "holiday", "event", "half-day", "special" };

    public AdminAttendanceCalendarController(ApplicationDbContext context)
    {
        _context = context;
    }

    // List calendar items for a year (used to paint the calendar grid).
    [HttpGet]
    public async Task<ActionResult<List<AttendanceCalendarItemDto>>> GetCalendarItemsByYear([FromQuery] int year)
    {
        if (year <= 0) year = DateTime.Today.Year;

        var start = new DateTime(year, 1, 1);
        var end = new DateTime(year, 12, 31);

        var list = await _context.AttendanceCalendarItems
            .Where(x => x.Date.Date >= start.Date && x.Date.Date <= end.Date)
            .OrderBy(x => x.Date)
            .Select(x => new AttendanceCalendarItemDto
            {
                Id = x.CalendarItemId,
                Date = x.Date.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
                Title = x.Title,
                Type = x.Type,
                Description = x.Description
            })
            .ToListAsync();

        return Ok(list);
    }

    // Create (UI "Save" when configId is null).
    [Authorize(Roles = "admin")]
    [HttpPost]
    public async Task<ActionResult<AttendanceCalendarItemDto>> CreateCalendarItem([FromBody] UpsertAttendanceCalendarItemRequestDto dto)
    {
        var date = ParseYmd(dto.Date);
        if (date == null) return BadRequest(new { message = "Invalid date. Use yyyy-MM-dd." });

        if (string.IsNullOrWhiteSpace(dto.Title))
            return BadRequest(new { message = "Title is required." });

        if (string.IsNullOrWhiteSpace(dto.Type) || !AllowedTypes.Contains(dto.Type.Trim()))
            return BadRequest(new { message = $"Invalid type. Allowed: {string.Join(", ", AllowedTypes)}" });

        var existing = await _context.AttendanceCalendarItems
            .FirstOrDefaultAsync(x => x.Date.Date == date.Value.Date);
        if (existing != null)
            return Conflict(new { message = "This date already has a calendar item." });

        var entity = new AttendanceCalendarItem
        {
            Date = date.Value.Date,
            Title = dto.Title.Trim(),
            Type = dto.Type.Trim(),
            Description = dto.Description?.Trim()
        };

        _context.AttendanceCalendarItems.Add(entity);
        await _context.SaveChangesAsync();

        return Ok(new AttendanceCalendarItemDto
        {
            Id = entity.CalendarItemId,
            Date = entity.Date.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
            Title = entity.Title,
            Type = entity.Type,
            Description = entity.Description
        });
    }

    // Update (UI "Save" when configId exists).
    [Authorize(Roles = "admin")]
    [HttpPut("{id:int}")]
    public async Task<ActionResult<AttendanceCalendarItemDto>> UpdateCalendarItem([FromRoute] int id, [FromBody] UpsertAttendanceCalendarItemRequestDto dto)
    {
        var entity = await _context.AttendanceCalendarItems.FirstOrDefaultAsync(x => x.CalendarItemId == id);
        if (entity == null) return NotFound();

        var date = ParseYmd(dto.Date);
        if (date == null) return BadRequest(new { message = "Invalid date. Use yyyy-MM-dd." });

        if (string.IsNullOrWhiteSpace(dto.Title))
            return BadRequest(new { message = "Title is required." });

        if (string.IsNullOrWhiteSpace(dto.Type) || !AllowedTypes.Contains(dto.Type.Trim()))
            return BadRequest(new { message = $"Invalid type. Allowed: {string.Join(", ", AllowedTypes)}" });

        var conflict = await _context.AttendanceCalendarItems
            .FirstOrDefaultAsync(x => x.Date.Date == date.Value.Date && x.CalendarItemId != id);
        if (conflict != null)
            return Conflict(new { message = "This date already has a calendar item." });

        entity.Date = date.Value.Date;
        entity.Title = dto.Title.Trim();
        entity.Type = dto.Type.Trim();
        entity.Description = dto.Description?.Trim();

        await _context.SaveChangesAsync();

        return Ok(new AttendanceCalendarItemDto
        {
            Id = entity.CalendarItemId,
            Date = entity.Date.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
            Title = entity.Title,
            Type = entity.Type,
            Description = entity.Description
        });
    }

    // Delete (UI remove item).
    [Authorize(Roles = "admin")]
    [HttpDelete("{id:int}")]
    public async Task<ActionResult> DeleteCalendarItem([FromRoute] int id)
    {
        var entity = await _context.AttendanceCalendarItems.FirstOrDefaultAsync(x => x.CalendarItemId == id);
        if (entity == null) return NotFound();

        _context.AttendanceCalendarItems.Remove(entity);
        await _context.SaveChangesAsync();

        return Ok();
    }

    private static DateTime? ParseYmd(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        if (DateTime.TryParseExact(value.Trim(), "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var d))
            return d.Date;
        return null;
    }
}

