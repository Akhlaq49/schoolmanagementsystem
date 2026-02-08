namespace SchoolManagementAPI.Services;

public interface INotificationAutomationService
{
    /// <summary>
    /// Send WhatsApp alerts to parents about student absences
    /// </summary>
    Task SendAttendanceAlertsAsync(DateTime attendanceDate);

    /// <summary>
    /// Send fee payment reminders X days before due date
    /// </summary>
    Task SendFeeRemindersAsync(int daysBeforeDue);

    /// <summary>
    /// Send result notifications when exam results are published
    /// </summary>
    Task SendResultNotificationsAsync(int examId);

    /// <summary>
    /// Send birthday wishes to students
    /// </summary>
    Task SendBirthdayWishesAsync();

    /// <summary>
    /// Resolve template placeholders with actual data
    /// </summary>
    string ResolvePlaceholders(string template, Dictionary<string, string> data);
}
