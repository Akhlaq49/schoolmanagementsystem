using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolManagementAPI.Models;

[Table("attendance")]
public class Attendance
{
    [Key]
    [Column("attendance_id")]
    public int AttendanceId { get; set; }

    [Column("status")]
    public int Status { get; set; } // 0=Not Marked, 1=PP, 2=PO, 3=Absent, 4=SL, 5=FL, 6=Holiday, 7=Late

    [Column("student_id")]
    public int StudentId { get; set; }

    [Column("date")]
    public DateTime Date { get; set; }

    [Column("session")]
    public string? Session { get; set; }

    [Column("time_in")]
    public TimeSpan? TimeIn { get; set; }

    [Column("time_out")]
    public TimeSpan? TimeOut { get; set; }

    [Column("remarks")]
    public string? Remarks { get; set; }

    [Column("leave_reason")]
    public string? LeaveReason { get; set; }

    [Column("marked_by")]
    public int? MarkedBy { get; set; }

    [Column("marked_at")]
    public DateTime? MarkedAt { get; set; }

    // Navigation Properties
    [ForeignKey("StudentId")]
    public virtual Student Student { get; set; } = null!;
}

