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

    // NOTE: Profile and relationship fields (department_id, designation_id, birthday, age, sex,
    // class_id, section_id, parent_id, roll, session, family_id, school_reg_num, b_form_cnic,
    // religion, blood_group, status, profession) have been moved off the users table in the
    // database. We keep the CLR properties only for backward-compatible code paths, but mark
    // them as [NotMapped] so EF Core does not expect matching columns.

    [NotMapped]
    public int? DepartmentId { get; set; }

    [NotMapped]
    public int? DesignationId { get; set; }

    [NotMapped]
    public DateTime? Birthday { get; set; }

    [NotMapped]
    public int? Age { get; set; }

    [NotMapped]
    public string? Sex { get; set; }

    [NotMapped]
    public int? ClassId { get; set; }

    [NotMapped]
    public int? SectionId { get; set; }

    [NotMapped]
    public int? ParentId { get; set; }

    [NotMapped]
    public string? Roll { get; set; }

    [NotMapped]
    public string? Session { get; set; }

    [NotMapped]
    public int? FamilyId { get; set; }

    [NotMapped]
    public string? SchoolRegNum { get; set; }

    [NotMapped]
    public string? BFormCnic { get; set; }

    [NotMapped]
    public string? Religion { get; set; }

    [NotMapped]
    public string? BloodGroup { get; set; }

    [NotMapped]
    public string Status { get; set; } = "Active"; // Active, Dropped

    [NotMapped]
    public string? Profession { get; set; }

    // Navigation properties that depended on the removed FK columns are also not mapped.
    [NotMapped]
    public virtual Department? Department { get; set; }

    [NotMapped]
    public virtual Class? Class { get; set; }

    [NotMapped]
    public virtual Section? Section { get; set; }

    [NotMapped]
    [JsonIgnore]
    public virtual User? Parent { get; set; }

    [NotMapped]
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

