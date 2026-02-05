using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolManagementAPI.Models;

[Table("academic_syllabus")]
public class AcademicSyllabus
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("academic_syllabus_code")]
    public string AcademicSyllabusCode { get; set; } = string.Empty;

    [Column("title")]
    public string Title { get; set; } = string.Empty;

    [Column("class_id")]
    public int ClassId { get; set; }

    [Column("subject_id")]
    public int SubjectId { get; set; }

    [Column("description")]
    public string? Description { get; set; }

    [Column("file_name")]
    public string? FileName { get; set; }

    [Column("timestamp")]
    public DateTime Timestamp { get; set; }
}

