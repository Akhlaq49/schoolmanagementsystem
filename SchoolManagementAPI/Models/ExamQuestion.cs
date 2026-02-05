using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolManagementAPI.Models;

[Table("exam_question")]
public class ExamQuestion
{
    [Key]
    [Column("exam_question_id")]
    public int ExamQuestionId { get; set; }

    [Column("exam_id")]
    public int ExamId { get; set; }

    [Column("class_id")]
    public int ClassId { get; set; }

    [Column("subject_id")]
    public int SubjectId { get; set; }

    [Column("question")]
    public string Question { get; set; } = string.Empty;

    [Column("file_name")]
    public string? FileName { get; set; }

    [Column("file_type")]
    public string? FileType { get; set; }

    [Column("timestamp")]
    public DateTime Timestamp { get; set; }
}

