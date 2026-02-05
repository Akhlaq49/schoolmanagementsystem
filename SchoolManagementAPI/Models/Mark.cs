using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolManagementAPI.Models;

[Table("mark")]
public class Mark
{
    [Key]
    [Column("mark_id")]
    public int MarkId { get; set; }

    [Column("student_id")]
    public int StudentId { get; set; }

    [Column("exam_id")]
    public int ExamId { get; set; }

    [Column("subject_id")]
    public int SubjectId { get; set; }

    [Column("class_score1")]
    public decimal? ClassScore1 { get; set; }

    [Column("class_score2")]
    public decimal? ClassScore2 { get; set; }

    [Column("class_score3")]
    public decimal? ClassScore3 { get; set; }

    [Column("exam_score")]
    public decimal? ExamScore { get; set; }

    [Column("comment")]
    public string? Comment { get; set; }

    // Navigation Properties
    [ForeignKey("StudentId")]
    public virtual Student Student { get; set; } = null!;

    [ForeignKey("ExamId")]
    public virtual Exam Exam { get; set; } = null!;

    [ForeignKey("SubjectId")]
    public virtual Subject Subject { get; set; } = null!;
}

