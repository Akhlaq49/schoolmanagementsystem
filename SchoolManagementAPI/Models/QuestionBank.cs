using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolManagementAPI.Models;

[Table("question_bank")]
public class QuestionBank
{
    [Key]
    [Column("question_bank_id")]
    public int QuestionBankId { get; set; }

    [Required]
    [Column("subject_id")]
    public int SubjectId { get; set; }

    [Required]
    [Column("class_id")]
    public int ClassId { get; set; }

    [Required]
    [Column("chapter_name")]
    [MaxLength(200)]
    public string ChapterName { get; set; } = string.Empty;

    [Required]
    [Column("question_text")]
    public string QuestionText { get; set; } = string.Empty;

    [Column("question_type")]
    [MaxLength(50)]
    public string QuestionType { get; set; } = "MultipleChoice"; // MultipleChoice, TrueFalse, ShortAnswer, Essay

    [Column("option_a")]
    public string? OptionA { get; set; }

    [Column("option_b")]
    public string? OptionB { get; set; }

    [Column("option_c")]
    public string? OptionC { get; set; }

    [Column("option_d")]
    public string? OptionD { get; set; }

    [Column("correct_answer")]
    [MaxLength(10)]
    public string? CorrectAnswer { get; set; } // A, B, C, D, True, False, or text for short answer

    [Column("explanation")]
    public string? Explanation { get; set; }

    [Column("marks")]
    public decimal Marks { get; set; } = 1.0m;

    [Column("difficulty_level")]
    [MaxLength(20)]
    public string DifficultyLevel { get; set; } = "Medium"; // Easy, Medium, Hard

    [Column("teacher_id")]
    public int TeacherId { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    // Navigation Properties
    [ForeignKey("SubjectId")]
    public virtual Subject? Subject { get; set; }

    [ForeignKey("ClassId")]
    public virtual Class? Class { get; set; }

    [ForeignKey("TeacherId")]
    public virtual User? Teacher { get; set; }
}



