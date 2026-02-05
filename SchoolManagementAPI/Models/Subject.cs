using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolManagementAPI.Models;

[Table("subject")]
public class Subject
{
    [Key]
    [Column("subject_id")]
    public int SubjectId { get; set; }

    [Required]
    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Column("class_id")]
    public int? ClassId { get; set; }

    [Column("teacher_id")]
    public int? TeacherId { get; set; }

    // Navigation Properties
    [ForeignKey("ClassId")]
    public virtual Class? Class { get; set; }
}

