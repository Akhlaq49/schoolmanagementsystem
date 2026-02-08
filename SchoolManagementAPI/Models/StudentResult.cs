using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolManagementAPI.Models;

[Table("student_result")]
public class StudentResult
{
    [Key]
    [Column("result_id")]
    public int ResultId { get; set; }

    [Column("student_id")]
    public int StudentId { get; set; }

    [Column("exam_id")]
    public int ExamId { get; set; }

    [Column("total_marks")]
    public decimal TotalMarks { get; set; }

    [Column("obtained_marks")]
    public decimal ObtainedMarks { get; set; }

    [Column("percentage")]
    public decimal Percentage { get; set; }

    [Column("gpa")]
    public decimal GPA { get; set; } // Calculated from all subjects

    [Column("grade")]
    public string Grade { get; set; } = string.Empty;

    [Column("position")]
    public int Position { get; set; } // Rank in class

    [Column("is_passed")]
    public bool IsPassed { get; set; }

    [Column("remarks")]
    public string? Remarks { get; set; }

    [Column("calculated_date")]
    public DateTime CalculatedDate { get; set; } = DateTime.Now;

    [Column("created_date")]
    public DateTime CreatedDate { get; set; } = DateTime.Now;

    // Navigation Properties
    [ForeignKey("StudentId")]
    public virtual User Student { get; set; } = null!;

    [ForeignKey("ExamId")]
    public virtual Exam Exam { get; set; } = null!;
}
