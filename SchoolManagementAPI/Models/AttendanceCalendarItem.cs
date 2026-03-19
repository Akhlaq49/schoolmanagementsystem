using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolManagementAPI.Models;

[Table("attendance_calendar_items")]
public class AttendanceCalendarItem
{
    [Key]
    [Column("calendar_item_id")]
    public int CalendarItemId { get; set; }

    [Required]
    [Column("date")]
    public DateTime Date { get; set; }

    [Required]
    [Column("title")]
    public string Title { get; set; } = string.Empty;

    [Required]
    [Column("type")]
    public string Type { get; set; } = string.Empty; // holiday | event | half-day | special

    [Column("description")]
    public string? Description { get; set; }
}

