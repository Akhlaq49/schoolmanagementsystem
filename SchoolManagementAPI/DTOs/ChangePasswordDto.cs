using System.ComponentModel.DataAnnotations;

namespace SchoolManagementAPI.DTOs;

public class ChangePasswordDto
{
    [Required(AllowEmptyStrings = false, ErrorMessage = "Current password is required")]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required(AllowEmptyStrings = false, ErrorMessage = "New password is required")]
    [MinLength(6, ErrorMessage = "New password must be at least 6 characters")]
    public string NewPassword { get; set; } = string.Empty;
}
