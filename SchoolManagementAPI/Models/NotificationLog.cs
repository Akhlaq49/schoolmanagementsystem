namespace SchoolManagementAPI.Models;

public enum NotificationChannel
{
    WhatsApp = 1,
    SMS = 2,
    Email = 3
}

public enum NotificationStatus
{
    Sent = 1,
    Failed = 2,
    Pending = 3
}

public class NotificationLog
{
    public int LogId { get; set; }
    public int? RecipientId { get; set; } // User ID (Student, Parent, Teacher)
    public int TemplateId { get; set; }
    public NotificationType Type { get; set; }
    public NotificationChannel Channel { get; set; }
    public string Message { get; set; } = string.Empty;
    public NotificationStatus Status { get; set; }
    public DateTime SentAt { get; set; }
    public string? ErrorMessage { get; set; }
    public string? ExternalMessageId { get; set; } // Optional: ID from WhatsApp/SMS provider
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

    // Navigation Properties
    public User? Recipient { get; set; }
    public NotificationTemplate? Template { get; set; }
}
