using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolManagementAPI.Models;

/// <summary>
/// Leave application for students, teachers, or staff.
/// Used by student attendance module to check approved leave and display status.
/// </summary>
[Table("leave_application")]
public class LeaveApplication
{
    [Key]
    [Column("leave_application_id")]
    public int LeaveApplicationId { get; set; }

    [Required]
    [Column("applicant_type")]
    public string ApplicantType { get; set; } = "student"; // student | teacher | staff

    [Required]
    [Column("applicant_id")]
    public int ApplicantId { get; set; }

    [Required]
    [Column("leave_type")]
    public string LeaveType { get; set; } = "full"; // short | full

    [Required]
    [Column("leave_from")]
    public DateTime LeaveFrom { get; set; }

    [Required]
    [Column("leave_to")]
    public DateTime LeaveTo { get; set; }

    [Required]
    [Column("reason")]
    public string Reason { get; set; } = string.Empty;

    [Required]
    [Column("status")]
    public string Status { get; set; } = "pending"; // pending | approved | rejected

    [Column("reviewer_id")]
    public int? ReviewerId { get; set; }

    [Column("reviewer_remarks")]
    public string? ReviewerRemarks { get; set; }

    [Column("attachment_url")]
    public string? AttachmentUrl { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
