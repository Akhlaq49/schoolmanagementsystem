namespace SchoolManagementAPI.Models;

public class BackupSettings
{
    public bool Enabled { get; set; } = true;
    public string Schedule { get; set; } = "0 2 * * *"; // Daily at 2 AM (cron expression)
    public string BackupPath { get; set; } = "D:\\Backups\\SchoolManagement";
    public int RetentionDays { get; set; } = 30; // Delete backups older than this
    public bool CloudUpload { get; set; } = false; // Future: upload to cloud storage
}
