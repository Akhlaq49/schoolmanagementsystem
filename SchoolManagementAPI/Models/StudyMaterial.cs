using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolManagementAPI.Models;

[Table("study_material")]
public class StudyMaterial
{
    [Key]
    [Column("study_material_id")]
    public int StudyMaterialId { get; set; }

    [Required]
    [Column("title")]
    public string Title { get; set; } = string.Empty;

    [Column("description")]
    public string? Description { get; set; }

    [Column("class_id")]
    public int? ClassId { get; set; }

    [Column("subject_id")]
    public int? SubjectId { get; set; }

    // Navigation Properties
    [ForeignKey("ClassId")]
    public virtual Class? Class { get; set; }

    [ForeignKey("SubjectId")]
    public virtual Subject? Subject { get; set; }

    [Column("file_name")]
    public string? FileName { get; set; }

    [Column("file_type")]
    public string? FileType { get; set; }

    [Column("timestamp")]
    public DateTime Timestamp { get; set; }
}

