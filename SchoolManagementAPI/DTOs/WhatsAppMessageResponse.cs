namespace SchoolManagementAPI.DTOs;

public class WhatsAppMessageResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public int SentCount { get; set; }
    public int FailedCount { get; set; }
    public List<string> FailedNumbers { get; set; } = new List<string>();
}
