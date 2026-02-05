using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolManagementAPI.Models;

[Table("teacher")]
public class Teacher
{
    [Key]
    [Column("teacher_id")]
    public int TeacherId { get; set; }

    [Required]
    [Column("name")]
    public string Name { get; set; } = string.Empty;

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

    [Column("department_id")]
    public int? DepartmentId { get; set; }

    [Column("designation_id")]
    public int? DesignationId { get; set; }

    [Column("login_status")]
    public string LoginStatus { get; set; } = "0";

    // Navigation Properties
    [ForeignKey("DepartmentId")]
    public virtual Department? Department { get; set; }
}

