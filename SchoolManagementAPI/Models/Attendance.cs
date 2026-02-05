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
    public int Status { get; set; } // 0 undefined, 1 present, 2 absent, 3 holiday, 4 half day, 5 late

    [Column("student_id")]
    public int StudentId { get; set; }

    [Column("date")]
    public DateTime Date { get; set; }

    [Column("session")]
    public string? Session { get; set; }

    // Navigation Properties
    [ForeignKey("StudentId")]
    public virtual Student Student { get; set; } = null!;
}

