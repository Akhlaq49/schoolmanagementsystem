using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SchoolManagementAPI.Models;

[Table("users")]
public class User
{
    [Key]
    [Column("user_id")]
    public int UserId { get; set; }

    [Required]
    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [Column("email")]
    public string Email { get; set; } = string.Empty;

    [Column("phone")]
    public string? Phone { get; set; }

    [Column("address")]
    public string? Address { get; set; }

    [Required]
    [Column("password")]
    public string Password { get; set; } = string.Empty;

    [Column("login_status")]
    public string LoginStatus { get; set; } = "0";

    // Admin-specific fields
    [Column("level")]
    public string? Level { get; set; }

    // Teacher-specific fields
    [Column("department_id")]
    public int? DepartmentId { get; set; }

    [Column("designation_id")]
    public int? DesignationId { get; set; }

    // Student-specific fields
    [Column("birthday")]
    public DateTime? Birthday { get; set; }

    [Column("age")]
    public int? Age { get; set; }

    [Column("sex")]
    public string? Sex { get; set; }

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

    [Column("family_id")]
    public int? FamilyId { get; set; }

    [Column("school_reg_num")]
    public string? SchoolRegNum { get; set; }

    [Column("b_form_cnic")]
    public string? BFormCnic { get; set; }

    [Column("religion")]
    public string? Religion { get; set; }

    [Column("blood_group")]
    public string? BloodGroup { get; set; }

    [Column("status")]
    public string Status { get; set; } = "Active"; // Active, Dropped

    // Parent-specific fields
    [Column("profession")]
    public string? Profession { get; set; }

    // Navigation Properties
    [ForeignKey("DepartmentId")]
    public virtual Department? Department { get; set; }

    [ForeignKey("ClassId")]
    public virtual Class? Class { get; set; }

    [ForeignKey("SectionId")]
    public virtual Section? Section { get; set; }

    [ForeignKey("ParentId")]
    [JsonIgnore] // Prevent circular reference in JSON serialization
    public virtual User? Parent { get; set; }

    [ForeignKey("FamilyId")]
    public virtual Family? Family { get; set; }

    public virtual StudentPreviousInstitute? PreviousInstitute { get; set; }
    public virtual StudentAdmission? Admission { get; set; }
    public virtual Student? StudentProfile { get; set; }

    // Navigation Properties for Roles
    public virtual ICollection<UserRoleMapping> UserRoles { get; set; } = new List<UserRoleMapping>();

    // Helper property to get roles as a list
    [NotMapped]
    public List<UserRole> Roles 
    { 
        get => UserRoles.Select(ur => ur.Role).ToList(); 
    }

    // Helper method to check if user has a specific role
    public bool HasRole(UserRole role) 
    { 
        return UserRoles.Any(ur => ur.Role == role); 
    }
}

