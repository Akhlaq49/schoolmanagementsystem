using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolManagementAPI.Models;

/// <summary>
/// Student request to correct/edit attendance. Admin approval required.
/// </summary>
[Table("attendance_correction")]
public class AttendanceCorrection
{
    [Key]
    [Column("attendance_correction_id")]
    public int AttendanceCorrectionId { get; set; }

    [Required]
    [Column("attendance_id")]
    public int AttendanceId { get; set; }

    [Required]
    [Column("student_id")]
    public int StudentId { get; set; }

    [Required]
    [Column("reason")]
    public string Reason { get; set; } = string.Empty;

    [Column("requested_status")]
    public int? RequestedStatus { get; set; }

    [Column("requested_time_in")]
    public TimeSpan? RequestedTimeIn { get; set; }

    [Column("requested_time_out")]
    public TimeSpan? RequestedTimeOut { get; set; }

    [Column("requested_remarks")]
    public string? RequestedRemarks { get; set; }

    [Required]
    [Column("status")]
    public string Status { get; set; } = "pending"; // pending | approved | rejected

    [Column("reviewed_by")]
    public int? ReviewedBy { get; set; }

    [Column("reviewer_remarks")]
    public string? ReviewerRemarks { get; set; }

    [Column("requested_at")]
    public DateTime RequestedAt { get; set; } = DateTime.UtcNow;

    [Column("reviewed_at")]
    public DateTime? ReviewedAt { get; set; }

    [ForeignKey("AttendanceId")]
    public virtual Attendance Attendance { get; set; } = null!;

    [ForeignKey("StudentId")]
    public virtual Student Student { get; set; } = null!;
}
