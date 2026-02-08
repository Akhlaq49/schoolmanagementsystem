using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Data;
using SchoolManagementAPI.DTOs;
using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public class NotificationAutomationService : INotificationAutomationService
{
    private readonly ApplicationDbContext _context;
    private readonly IWhatsAppService _whatsAppService;
    private readonly ILogger<NotificationAutomationService> _logger;

    public NotificationAutomationService(
        ApplicationDbContext context,
        IWhatsAppService whatsAppService,
        ILogger<NotificationAutomationService> logger)
    {
        _context = context;
        _whatsAppService = whatsAppService;
        _logger = logger;
    }

    public async Task SendAttendanceAlertsAsync(DateTime attendanceDate)
    {
        try
        {
            _logger.LogInformation("Starting attendance alerts for {Date}", attendanceDate.Date);

            // Get all absent students on the given date
            var absentRecords = await _context.Attendances
                .Where(a => a.Date == attendanceDate.Date && a.Status == 2) // Status 2 = Absent
                .Include(a => a.Student)
                .Include(a => a.Student.Parent)
                .ToListAsync();

            if (!absentRecords.Any())
            {
                _logger.LogInformation("No absences found for {Date}", attendanceDate.Date);
                return;
            }

            // Get attendance template
            var template = await _context.NotificationTemplates
                .FirstOrDefaultAsync(t => t.Type == NotificationType.Attendance && t.IsActive);

            if (template == null)
            {
                _logger.LogWarning("Attendance notification template not found");
                return;
            }

            // Send alerts to parents
            foreach (var record in absentRecords)
            {
                if (record.Student?.Parent == null)
                    continue;

                var parentPhoneNumber = record.Student.Parent.Phone;
                if (string.IsNullOrEmpty(parentPhoneNumber))
                    continue;

                // Resolve placeholders
                var messageData = new Dictionary<string, string>
                {
                    { "StudentName", record.Student.Name },
                    { "Date", attendanceDate.Date.ToString("MMMM dd, yyyy") },
                    { "Class", record.Student.Class?.Name ?? "Unknown" }
                };

                var message = ResolvePlaceholders(template.MessageTemplate, messageData);

                // Send via WhatsApp
                await SendNotificationAsync(
                    record.Student.ParentId,
                    template.TemplateId,
                    message,
                    NotificationType.Attendance,
                    parentPhoneNumber);
            }

            _logger.LogInformation("Sent {Count} attendance alerts for {Date}", absentRecords.Count, attendanceDate.Date);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending attendance alerts for {Date}", attendanceDate.Date);
        }
    }

    public async Task SendFeeRemindersAsync(int daysBeforeDue)
    {
        try
        {
            _logger.LogInformation("Starting fee reminders for invoices due in {Days} days", daysBeforeDue);

            var targetDate = DateTime.UtcNow.AddDays(daysBeforeDue).Date;

            // Get invoices due on this date
            var upcomingInvoices = await _context.Invoices
                .Where(i => i.DueDate.HasValue && i.DueDate.Value.Date == targetDate && i.AmountPaid < i.Amount)
                .Include(i => i.Student)
                .Include(i => i.Student.Parent)
                .Include(i => i.FeeType)
                .ToListAsync();

            if (!upcomingInvoices.Any())
            {
                _logger.LogInformation("No invoices due in {Days} days", daysBeforeDue);
                return;
            }

            // Get fee template
            var template = await _context.NotificationTemplates
                .FirstOrDefaultAsync(t => t.Type == NotificationType.Fee && t.IsActive);

            if (template == null)
            {
                _logger.LogWarning("Fee notification template not found");
                return;
            }

            // Send reminders to parents
            foreach (var invoice in upcomingInvoices)
            {
                if (invoice.Student?.Parent == null)
                    continue;

                var parentPhoneNumber = invoice.Student.Parent.Phone;
                if (string.IsNullOrEmpty(parentPhoneNumber))
                    continue;

                var outstandingAmount = invoice.Amount - (invoice.AmountPaid);

                var messageData = new Dictionary<string, string>
                {
                    { "StudentName", invoice.Student.Name },
                    { "Amount", outstandingAmount.ToString("F2") },
                    { "DueDate", invoice.DueDate?.ToString("MMMM dd, yyyy") ?? "Unknown" },
                    { "FeeType", invoice.FeeType?.Name ?? "Tuition" }
                };

                var message = ResolvePlaceholders(template.MessageTemplate, messageData);

                await SendNotificationAsync(
                    invoice.Student.ParentId,
                    template.TemplateId,
                    message,
                    NotificationType.Fee,
                    parentPhoneNumber);
            }

            _logger.LogInformation("Sent {Count} fee reminders for invoices due in {Days} days", upcomingInvoices.Count, daysBeforeDue);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending fee reminders");
        }
    }

    public async Task SendResultNotificationsAsync(int examId)
    {
        try
        {
            _logger.LogInformation("Starting result notifications for exam {ExamId}", examId);

            // Get all results for this exam
            var results = await _context.StudentResults
                .Where(r => r.ExamId == examId)
                .Include(r => r.Student)
                .Include(r => r.Student.Parent)
                .Include(r => r.Exam)
                .ToListAsync();

            if (!results.Any())
            {
                _logger.LogInformation("No results found for exam {ExamId}", examId);
                return;
            }

            // Get result template
            var template = await _context.NotificationTemplates
                .FirstOrDefaultAsync(t => t.Type == NotificationType.Result && t.IsActive);

            if (template == null)
            {
                _logger.LogWarning("Result notification template not found");
                return;
            }

            // Send notifications to students and parents
            foreach (var result in results)
            {
                if (result.Student?.Parent == null)
                    continue;

                var parentPhoneNumber = result.Student.Parent.Phone;
                if (string.IsNullOrEmpty(parentPhoneNumber))
                    continue;

                var messageData = new Dictionary<string, string>
                {
                    { "StudentName", result.Student.Name },
                    { "ExamName", result.Exam?.Name ?? "Exam" },
                    { "GPA", result.GPA.ToString("F2") },
                    { "Grade", result.Grade ?? "N/A" },
                    { "Percentage", result.Percentage.ToString("F2") },
                    { "Position", result.Position > 0 ? result.Position.ToString() : "N/A" }
                };

                var message = ResolvePlaceholders(template.MessageTemplate, messageData);

                await SendNotificationAsync(
                    result.Student.ParentId,
                    template.TemplateId,
                    message,
                    NotificationType.Result,
                    parentPhoneNumber);
            }

            _logger.LogInformation("Sent {Count} result notifications for exam {ExamId}", results.Count, examId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending result notifications for exam {ExamId}", examId);
        }
    }

    public async Task SendBirthdayWishesAsync()
    {
        try
        {
            _logger.LogInformation("Starting birthday wishes");

            var today = DateTime.UtcNow.Date;

            // Get all students with birthday today
            var birthdayStudents = await _context.Users
                .Where(u => u.Birthday.HasValue &&
                            u.Birthday.Value.Month == today.Month &&
                            u.Birthday.Value.Day == today.Day)
                .Include(u => u.Parent)
                .ToListAsync();

            if (!birthdayStudents.Any())
            {
                _logger.LogInformation("No birthdays found for today");
                return;
            }

            // Get birthday template
            var template = await _context.NotificationTemplates
                .FirstOrDefaultAsync(t => t.Type == NotificationType.Birthday && t.IsActive);

            if (template == null)
            {
                _logger.LogWarning("Birthday notification template not found");
                return;
            }

            // Send wishes
            foreach (var student in birthdayStudents)
            {
                if (student.Parent == null)
                    continue;

                var parentPhoneNumber = student.Parent.Phone;
                if (string.IsNullOrEmpty(parentPhoneNumber))
                    continue;

                var messageData = new Dictionary<string, string>
                {
                    { "StudentName", student.Name },
                    { "Age", ((DateTime.UtcNow.Year - student.Birthday?.Year) ?? 0).ToString() }
                };

                var message = ResolvePlaceholders(template.MessageTemplate, messageData);

                await SendNotificationAsync(
                    student.ParentId,
                    template.TemplateId,
                    message,
                    NotificationType.Birthday,
                    parentPhoneNumber);
            }

            _logger.LogInformation("Sent {Count} birthday wishes", birthdayStudents.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending birthday wishes");
        }
    }

    public string ResolvePlaceholders(string template, Dictionary<string, string> data)
    {
        var result = template;

        foreach (var kvp in data)
        {
            result = result.Replace($"{{{kvp.Key}}}", kvp.Value);
        }

        return result;
    }

    private async Task SendNotificationAsync(
        int? recipientId,
        int templateId,
        string message,
        NotificationType type,
        string phoneNumber)
    {
        try
        {
            // Send via WhatsApp
            var request = new WhatsAppMessageRequest
            {
                PhoneNumbers = new List<string> { phoneNumber },
                Message = message
            };

            var whatsAppResult = await _whatsAppService.SendMessageAsync(request);

            // Log the notification
            var log = new NotificationLog
            {
                RecipientId = recipientId,
                TemplateId = templateId,
                Type = type,
                Channel = NotificationChannel.WhatsApp,
                Message = message,
                Status = whatsAppResult.Success ? NotificationStatus.Sent : NotificationStatus.Failed,
                SentAt = DateTime.UtcNow,
                ErrorMessage = whatsAppResult.Success ? null : whatsAppResult.Message
            };

            _context.NotificationLogs.Add(log);
            await _context.SaveChangesAsync();

            if (whatsAppResult.Success)
            {
                _logger.LogInformation("Notification sent to {PhoneNumber}", phoneNumber);
            }
            else
            {
                _logger.LogWarning("Failed to send notification to {PhoneNumber}: {Error}", phoneNumber, whatsAppResult.Message);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending notification to {PhoneNumber}", phoneNumber);

            // Log failed attempt
            var log = new NotificationLog
            {
                RecipientId = recipientId,
                TemplateId = templateId,
                Type = type,
                Channel = NotificationChannel.WhatsApp,
                Message = message,
                Status = NotificationStatus.Failed,
                SentAt = DateTime.UtcNow,
                ErrorMessage = ex.Message
            };

            _context.NotificationLogs.Add(log);
            await _context.SaveChangesAsync();
        }
    }
}
