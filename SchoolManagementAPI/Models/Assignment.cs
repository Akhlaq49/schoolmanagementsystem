using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolManagementAPI.Models;

[Table("assignment")]
public class Assignment
{
    [Key]
    [Column("assignment_id")]
    public int AssignmentId { get; set; }

    [Required]
    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Column("subject_id")]
    public int SubjectId { get; set; }

    [Column("class_id")]
    public int ClassId { get; set; }

    [Column("teacher_id")]
    public int TeacherId { get; set; }

    [Column("description")]
    public string? Description { get; set; }

    [Column("file_name")]
    public string? FileName { get; set; }

    [Column("file_type")]
    public string? FileType { get; set; }

    [Column("timestamp")]
    public DateTime Timestamp { get; set; }

    // Navigation Properties
    [ForeignKey("ClassId")]
    public virtual Class? Class { get; set; }

    [ForeignKey("SubjectId")]
    public virtual Subject? Subject { get; set; }
}

