using System.ComponentModel.DataAnnotations;

namespace SchoolManagementAPI.DTOs;

public class CreateStudentRequest
{
    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    public string? Phone { get; set; }
    public string? Address { get; set; }
    public DateTime? Birthday { get; set; }
    public int? Age { get; set; }
    public string? Sex { get; set; }
    public int? ClassId { get; set; }
    public int? SectionId { get; set; }
    public int? ParentId { get; set; }
    public string? Roll { get; set; }
    public string? Session { get; set; }
}