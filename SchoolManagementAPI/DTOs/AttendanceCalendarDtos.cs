namespace SchoolManagementAPI.DTOs;

public class AttendanceCalendarItemDto
{
    public int Id { get; set; }
    public string Date { get; set; } = string.Empty; // yyyy-MM-dd
    public string Title { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // holiday | event | half-day | special
    public string? Description { get; set; }
}

public class UpsertAttendanceCalendarItemRequestDto
{
    public string Date { get; set; } = string.Empty; // yyyy-MM-dd
    public string Title { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // holiday | event | half-day | special
    public string? Description { get; set; }
}

