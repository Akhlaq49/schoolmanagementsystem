namespace SchoolManagementAPI.DTOs;

public class WhatsAppMessageRequest
{
    public List<string> PhoneNumbers { get; set; } = new List<string>();
    public string Message { get; set; } = string.Empty;
    public string? Title { get; set; }
}
