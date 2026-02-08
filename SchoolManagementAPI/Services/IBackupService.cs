namespace SchoolManagementAPI.Services;

public class BackupInfo
{
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public long SizeBytes { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime? ModifiedDate { get; set; }
}

public class BackupResult
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public BackupInfo? BackupInfo { get; set; }
}

public interface IBackupService
{
    /// <summary>
    /// Create a backup of the database
    /// </summary>
    Task<BackupResult> CreateBackupAsync();

    /// <summary>
    /// Get list of all backups
    /// </summary>
    Task<List<BackupInfo>> GetBackupHistoryAsync();

    /// <summary>
    /// Restore database from backup file
    /// </summary>
    Task<BackupResult> RestoreBackupAsync(string filePath);

    /// <summary>
    /// Delete a backup file
    /// </summary>
    Task<BackupResult> DeleteBackupAsync(string fileName);

    /// <summary>
    /// Delete backups older than specified days
    /// </summary>
    Task<int> DeleteOldBackupsAsync(int retentionDays);
}
