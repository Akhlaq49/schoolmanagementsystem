using System.ComponentModel.DataAnnotations;

namespace SchoolManagementAPI.DTOs;

public class UpdateTeacherRequest
{
    [Required]
    public string Name { get; set; } = string.Empty;

    [EmailAddress]
    public string? Email { get; set; }

    public string? Phone { get; set; }

    public string? Address { get; set; }

    public int? DepartmentId { get; set; }

    public int? DesignationId { get; set; }
}
