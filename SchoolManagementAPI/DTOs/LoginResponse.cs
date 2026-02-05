namespace SchoolManagementAPI.DTOs;

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
    public string LoginType { get; set; } = string.Empty;
    public int UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public List<string> Roles { get; set; } = new List<string>();
}

