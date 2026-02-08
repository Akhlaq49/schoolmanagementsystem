namespace SchoolManagementAPI.Models;

public enum NotificationType
{
    Attendance = 1,
    Fee = 2,
    Result = 3,
    Announcement = 4,
    Birthday = 5
}

public class NotificationTemplate
{
    public int TemplateId { get; set; }
    public string Name { get; set; } = string.Empty;
    public NotificationType Type { get; set; }
    public string MessageTemplate { get; set; } = string.Empty; // Contains placeholders like {StudentName}, {Amount}, {Date}
    public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public DateTime? ModifiedDate { get; set; }
}
