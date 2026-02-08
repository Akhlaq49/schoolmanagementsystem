using Cronos;

namespace SchoolManagementAPI.Services;

public class BackupHostedService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<BackupHostedService> _logger;
    private readonly IConfiguration _configuration;
    private CronExpression? _cronExpression;

    public BackupHostedService(
        IServiceProvider serviceProvider,
        ILogger<BackupHostedService> logger,
        IConfiguration configuration)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _configuration = configuration;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        try
        {
            var backupSettings = _configuration.GetSection("BackupSettings");
            var enabled = backupSettings.GetValue<bool>("Enabled", true);

            if (!enabled)
            {
                _logger.LogInformation("Backup scheduled service is disabled");
                return;
            }

            var cronSchedule = backupSettings.GetValue<string>("Schedule") ?? "0 2 * * *"; // Daily at 2 AM

            // Parse cron expression
            try
            {
                _cronExpression = CronExpression.Parse(cronSchedule);
                _logger.LogInformation("Backup scheduler initialized with cron: {Cron}", cronSchedule);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Invalid cron expression: {Cron}", cronSchedule);
                return;
            }

            // Start background loop
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var nextOccurrence = _cronExpression.GetNextOccurrence(DateTime.UtcNow);

                    if (nextOccurrence.HasValue)
                    {
                        var delay = nextOccurrence.Value - DateTime.UtcNow;

                        _logger.LogInformation("Next backup scheduled for {NextBackup}", nextOccurrence.Value);

                        // Wait until the next scheduled time
                        await Task.Delay(delay, stoppingToken);

                        // Execute backup
                        await ExecuteBackupAsync(stoppingToken);

                        // Also clean up old backups
                        await DeleteOldBackupsAsync();
                    }
                    else
                    {
                        // If no next occurrence, wait 1 hour and retry
                        await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
                    }
                }
                catch (OperationCanceledException)
                {
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in backup scheduler loop");
                    // Wait 1 minute before retrying
                    await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Fatal error in backup scheduler");
        }
    }

    private async Task ExecuteBackupAsync(CancellationToken cancellationToken)
    {
        try
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var backupService = scope.ServiceProvider.GetRequiredService<IBackupService>();

                _logger.LogInformation("Starting scheduled database backup...");

                var result = await backupService.CreateBackupAsync();

                if (result.Success)
                {
                    _logger.LogInformation("Scheduled backup completed successfully: {Message}", result.Message);
                }
                else
                {
                    _logger.LogWarning("Scheduled backup failed: {Message}", result.Message);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing scheduled backup");
        }
    }

    private async Task DeleteOldBackupsAsync()
    {
        try
        {
            var backupSettings = _configuration.GetSection("BackupSettings");
            var retentionDays = backupSettings.GetValue<int>("RetentionDays", 30);

            using (var scope = _serviceProvider.CreateScope())
            {
                var backupService = scope.ServiceProvider.GetRequiredService<IBackupService>();
                var deletedCount = await backupService.DeleteOldBackupsAsync(retentionDays);

                if (deletedCount > 0)
                {
                    _logger.LogInformation("Deleted {Count} old backups during cleanup", deletedCount);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cleaning up old backups");
        }
    }
}
