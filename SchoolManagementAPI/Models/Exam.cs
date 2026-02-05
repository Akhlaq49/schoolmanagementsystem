using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolManagementAPI.Models;

[Table("exam")]
public class Exam
{
    [Key]
    [Column("exam_id")]
    public int ExamId { get; set; }

    [Required]
    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Column("date")]
    public DateTime? Date { get; set; }

    [Column("comment")]
    public string? Comment { get; set; }
}

