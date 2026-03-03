using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolManagementAPI.Models;

[Table("student")]
public class Student
{
    [Key]
    [Column("student_id")]
    public int StudentId { get; set; }

    [Required]
    [Column("user_id")]
    public int UserId { get; set; }

    [Required]
    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Column("birthday")]
    public DateTime? Birthday { get; set; }

    [Column("age")]
    public int? Age { get; set; }

    [Column("sex")]
    public string? Sex { get; set; }

    [EmailAddress]
    [Column("email")]
    public string? Email { get; set; }

    [Column("phone")]
    public string? Phone { get; set; }

    [Column("address")]
    public string? Address { get; set; }

    [Required]
    [Column("password")]
    public string Password { get; set; } = string.Empty;

    [Column("class_id")]
    public int? ClassId { get; set; }

    [Column("section_id")]
    public int? SectionId { get; set; }

    [Column("parent_id")]
    public int? ParentId { get; set; }

    [Column("roll")]
    public string? Roll { get; set; }

    [Column("session")]
    public string? Session { get; set; }

    [Column("login_status")]
    public string LoginStatus { get; set; } = "0";

    [Column("status")]
    public string? Status { get; set; }

    [Column("school_reg_num")]
    public string? SchoolRegNum { get; set; }

    [Column("b_form_cnic")]
    public string? BFormCnic { get; set; }

    [Column("religion")]
    public string? Religion { get; set; }

    [Column("blood_group")]
    public string? BloodGroup { get; set; }

    [Column("family_id")]
    public int? FamilyId { get; set; }

    // Navigation Properties
    [ForeignKey("UserId")]
    public virtual User? User { get; set; }

    [ForeignKey("ClassId")]
    public virtual Class? Class { get; set; }

    [ForeignKey("SectionId")]
    public virtual Section? Section { get; set; }

    [ForeignKey("ParentId")]
    public virtual Parent? Parent { get; set; }

    [ForeignKey("FamilyId")]
    public virtual Family? Family { get; set; }
}

