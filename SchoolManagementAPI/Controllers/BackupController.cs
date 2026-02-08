using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolManagementAPI.Services;

namespace SchoolManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "admin")]
public class BackupController : ControllerBase
{
    private readonly IBackupService _backupService;
    private readonly ILogger<BackupController> _logger;

    public BackupController(
        IBackupService backupService,
        ILogger<BackupController> logger)
    {
        _backupService = backupService;
        _logger = logger;
    }

    /// <summary>
    /// Create a manual database backup
    /// </summary>
    [HttpPost("create")]
    public async Task<ActionResult<BackupResult>> CreateBackup()
    {
        _logger.LogInformation("Manual backup requested by {User}", User.Identity?.Name);

        var result = await _backupService.CreateBackupAsync();

        if (result.Success)
        {
            return Ok(result);
        }

        return BadRequest(result);
    }

    /// <summary>
    /// Get list of all available backups
    /// </summary>
    [HttpGet("history")]
    public async Task<ActionResult<IEnumerable<BackupInfo>>> GetBackupHistory([FromQuery] int limit = 50)
    {
        var backups = await _backupService.GetBackupHistoryAsync();

        if (limit > 0)
        {
            backups = backups.Take(limit).ToList();
        }

        _logger.LogInformation("Retrieved {Count} backups", backups.Count);

        return Ok(backups);
    }

    /// <summary>
    /// Get latest backup info
    /// </summary>
    [HttpGet("latest")]
    public async Task<ActionResult<BackupInfo>> GetLatestBackup()
    {
        var backups = await _backupService.GetBackupHistoryAsync();
        var latest = backups.FirstOrDefault();

        if (latest == null)
        {
            return NotFound("No backups found");
        }

        return Ok(latest);
    }

    /// <summary>
    /// Restore database from a backup file
    /// WARNING: This will overwrite the current database
    /// </summary>
    [HttpPost("restore")]
    public async Task<ActionResult<BackupResult>> RestoreBackup([FromQuery] string filePath)
    {
        if (string.IsNullOrWhiteSpace(filePath))
        {
            return BadRequest("File path is required");
        }

        _logger.LogWarning("Database restore requested from {FilePath} by {User}", filePath, User.Identity?.Name);

        var result = await _backupService.RestoreBackupAsync(filePath);

        if (result.Success)
        {
            return Ok(result);
        }

        return BadRequest(result);
    }

    /// <summary>
    /// Delete a specific backup file
    /// </summary>
    [HttpDelete("{fileName}")]
    public async Task<ActionResult<BackupResult>> DeleteBackup(string fileName)
    {
        if (string.IsNullOrWhiteSpace(fileName))
        {
            return BadRequest("File name is required");
        }

        _logger.LogInformation("Backup deletion requested for {FileName} by {User}", fileName, User.Identity?.Name);

        var result = await _backupService.DeleteBackupAsync(fileName);

        if (result.Success)
        {
            return Ok(result);
        }

        return BadRequest(result);
    }

    /// <summary>
    /// Delete backups older than specified days
    /// </summary>
    [HttpDelete("cleanup")]
    public async Task<ActionResult<object>> CleanupOldBackups([FromQuery] int retentionDays = 30)
    {
        if (retentionDays < 1)
        {
            return BadRequest("Retention days must be at least 1");
        }

        _logger.LogInformation("Backup cleanup requested (retention: {Days} days) by {User}", retentionDays, User.Identity?.Name);

        var deletedCount = await _backupService.DeleteOldBackupsAsync(retentionDays);

        return Ok(new
        {
            message = $"Deleted {deletedCount} old backups (older than {retentionDays} days)",
            deletedCount
        });
    }
}
