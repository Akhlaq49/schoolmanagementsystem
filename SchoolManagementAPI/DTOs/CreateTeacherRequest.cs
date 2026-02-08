using System.ComponentModel.DataAnnotations;

namespace SchoolManagementAPI.DTOs;

public class CreateTeacherRequest
{
    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    public string? Phone { get; set; }
    public string? Address { get; set; }
    public int? DepartmentId { get; set; }
    public int? DesignationId { get; set; }
}