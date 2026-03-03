using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolManagementAPI.Models;

[Table("student_previous_institute")]
public class StudentPreviousInstitute
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [Column("user_id")]
    public int UserId { get; set; }

    [Column("previous_institute_name")]
    public string? PreviousInstituteName { get; set; }

    [Column("passing_class")]
    public string? PassingClass { get; set; }

    [Column("passing_percentage")]
    public decimal? PassingPercentage { get; set; }

    [Column("passing_year")]
    public int? PassingYear { get; set; }

    [Column("institute_address")]
    public string? InstituteAddress { get; set; }

    [ForeignKey("UserId")]
    public virtual User? User { get; set; }
}
