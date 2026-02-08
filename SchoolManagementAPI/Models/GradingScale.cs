using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolManagementAPI.Models;

[Table("grading_scale")]
public class GradingScale
{
    [Key]
    [Column("scale_id")]
    public int ScaleId { get; set; }

    [Column("class_id")]
    public int ClassId { get; set; }

    [Column("min_marks")]
    public decimal MinMarks { get; set; }

    [Column("max_marks")]
    public decimal MaxMarks { get; set; }

    [Column("grade")]
    public string Grade { get; set; } = string.Empty; // A+, A, B+, B, C, D, F

    [Column("grade_point")]
    public decimal GradePoint { get; set; } // 4.0 to 0.0

    [Column("remarks")]
    public string? Remarks { get; set; } // Excellent, Good, Pass, Fail

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_date")]
    public DateTime CreatedDate { get; set; } = DateTime.Now;

    [Column("modified_date")]
    public DateTime ModifiedDate { get; set; } = DateTime.Now;

    // Navigation Properties
    [ForeignKey("ClassId")]
    public virtual Class Class { get; set; } = null!;
}
