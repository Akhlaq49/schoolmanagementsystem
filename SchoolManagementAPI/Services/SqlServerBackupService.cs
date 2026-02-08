using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Data;

namespace SchoolManagementAPI.Services;

public class SqlServerBackupService : IBackupService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<SqlServerBackupService> _logger;
    private readonly string _backupPath;

    public SqlServerBackupService(
        IConfiguration configuration,
        ILogger<SqlServerBackupService> logger)
    {
        _configuration = configuration;
        _logger = logger;
        _backupPath = _configuration["BackupSettings:BackupPath"] ?? "D:\\Backups\\SchoolManagement";

        // Ensure backup directory exists
        if (!Directory.Exists(_backupPath))
        {
            try
            {
                Directory.CreateDirectory(_backupPath);
                _logger.LogInformation("Created backup directory at {Path}", _backupPath);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create backup directory at {Path}", _backupPath);
            }
        }
    }

    public async Task<BackupResult> CreateBackupAsync()
    {
        try
        {
            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            if (string.IsNullOrEmpty(connectionString))
            {
                return new BackupResult
                {
                    Success = false,
                    Message = "Database connection string not configured"
                };
            }

            // Extract database name from connection string
            var dbName = ExtractDatabaseName(connectionString);
            if (string.IsNullOrEmpty(dbName))
            {
                return new BackupResult
                {
                    Success = false,
                    Message = "Could not determine database name"
                };
            }

            // Generate backup filename with timestamp
            var timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
            var fileName = $"SchoolDB_Backup_{timestamp}.bak";
            var filePath = Path.Combine(_backupPath, fileName);

            // Ensure backup directory exists
            Directory.CreateDirectory(_backupPath);

            // Build BACKUP DATABASE command
            var backupCommand = $@"
                BACKUP DATABASE [{dbName}] 
                TO DISK = '{filePath}'
                WITH FORMAT, MEDIANAME = 'SchoolDBBackup', 
                NAME = 'Full Backup of {dbName}';";

            using (var connection = new SqlConnection(connectionString))
            {
                await connection.OpenAsync();

                using (var command = new SqlCommand(backupCommand, connection))
                {
                    command.CommandTimeout = 600; // 10 minute timeout
                    await command.ExecuteNonQueryAsync();
                }

                await connection.CloseAsync();
            }

            // Verify backup file was created
            if (!File.Exists(filePath))
            {
                return new BackupResult
                {
                    Success = false,
                    Message = "Backup file was not created"
                };
            }

            var fileInfo = new FileInfo(filePath);
            var backupInfo = new BackupInfo
            {
                FileName = fileName,
                FilePath = filePath,
                SizeBytes = fileInfo.Length,
                CreatedDate = fileInfo.CreationTime
            };

            _logger.LogInformation("Database backup created successfully: {FileName} ({Size} bytes)", fileName, fileInfo.Length);

            return new BackupResult
            {
                Success = true,
                Message = $"Backup created successfully: {fileName}",
                BackupInfo = backupInfo
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating database backup");
            return new BackupResult
            {
                Success = false,
                Message = $"Error creating backup: {ex.Message}"
            };
        }
    }

    public async Task<List<BackupInfo>> GetBackupHistoryAsync()
    {
        var backups = new List<BackupInfo>();

        try
        {
            if (!Directory.Exists(_backupPath))
            {
                return backups;
            }

            var directory = new DirectoryInfo(_backupPath);
            var bakFiles = directory.GetFiles("*.bak").OrderByDescending(f => f.CreationTime);

            foreach (var file in bakFiles)
            {
                backups.Add(new BackupInfo
                {
                    FileName = file.Name,
                    FilePath = file.FullName,
                    SizeBytes = file.Length,
                    CreatedDate = file.CreationTime,
                    ModifiedDate = file.LastWriteTime
                });
            }

            _logger.LogInformation("Retrieved {Count} backups from {Path}", backups.Count, _backupPath);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving backup history");
        }

        return await Task.FromResult(backups);
    }

    public async Task<BackupResult> RestoreBackupAsync(string filePath)
    {
        try
        {
            if (!File.Exists(filePath))
            {
                return new BackupResult
                {
                    Success = false,
                    Message = $"Backup file not found: {filePath}"
                };
            }

            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            if (string.IsNullOrEmpty(connectionString))
            {
                return new BackupResult
                {
                    Success = false,
                    Message = "Database connection string not configured"
                };
            }

            var dbName = ExtractDatabaseName(connectionString);
            if (string.IsNullOrEmpty(dbName))
            {
                return new BackupResult
                {
                    Success = false,
                    Message = "Could not determine database name"
                };
            }

            // Note: RESTORE requires specific recovery model and database state
            // For safety, we'll just warn that this requires special handling
            _logger.LogWarning("Restore operation initiated for {DbName} from {FilePath}", dbName, filePath);

            // Build RESTORE DATABASE command with REPLACE to overwrite existing database
            var restoreCommand = $@"
                RESTORE DATABASE [{dbName}]
                FROM DISK = '{filePath}'
                WITH REPLACE, RECOVERY;";

            using (var connection = new SqlConnection(connectionString))
            {
                await connection.OpenAsync();

                using (var command = new SqlCommand(restoreCommand, connection))
                {
                    command.CommandTimeout = 600;
                    await command.ExecuteNonQueryAsync();
                }

                await connection.CloseAsync();
            }

            _logger.LogInformation("Database restored successfully from {FilePath}", filePath);

            return new BackupResult
            {
                Success = true,
                Message = $"Database restored successfully from {Path.GetFileName(filePath)}"
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error restoring database from {FilePath}", filePath);
            return new BackupResult
            {
                Success = false,
                Message = $"Error restoring backup: {ex.Message}"
            };
        }
    }

    public async Task<BackupResult> DeleteBackupAsync(string fileName)
    {
        try
        {
            var filePath = Path.Combine(_backupPath, fileName);

            if (!File.Exists(filePath))
            {
                return new BackupResult
                {
                    Success = false,
                    Message = "Backup file not found"
                };
            }

            File.Delete(filePath);

            _logger.LogInformation("Backup deleted: {FileName}", fileName);

            return new BackupResult
            {
                Success = true,
                Message = $"Backup deleted: {fileName}"
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting backup {FileName}", fileName);
            return new BackupResult
            {
                Success = false,
                Message = $"Error deleting backup: {ex.Message}"
            };
        }
    }

    public async Task<int> DeleteOldBackupsAsync(int retentionDays)
    {
        try
        {
            if (!Directory.Exists(_backupPath))
            {
                return 0;
            }

            var directory = new DirectoryInfo(_backupPath);
            var cutoffDate = DateTime.Now.AddDays(-retentionDays);
            var oldFiles = directory.GetFiles("*.bak")
                .Where(f => f.CreationTime < cutoffDate)
                .ToList();

            int deletedCount = 0;

            foreach (var file in oldFiles)
            {
                try
                {
                    file.Delete();
                    deletedCount++;
                    _logger.LogInformation("Deleted old backup: {FileName}", file.Name);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to delete backup: {FileName}", file.Name);
                }
            }

            if (deletedCount > 0)
            {
                _logger.LogInformation("Deleted {Count} old backups (older than {Days} days)", deletedCount, retentionDays);
            }

            return await Task.FromResult(deletedCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting old backups");
            return 0;
        }
    }

    private string? ExtractDatabaseName(string connectionString)
    {
        try
        {
            var builder = new SqlConnectionStringBuilder(connectionString);
            return builder.InitialCatalog ?? builder.DataSource;
        }
        catch
        {
            return null;
        }
    }
}
