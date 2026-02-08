using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public interface IGradingService
{
    Task<IEnumerable<GradingScale>> GetAllScalesAsync();
    Task<GradingScale?> GetScaleByIdAsync(int id);
    Task<IEnumerable<GradingScale>> GetScalesByClassAsync(int classId);
    Task<GradingScale> CreateScaleAsync(GradingScale scale);
    Task<GradingScale?> UpdateScaleAsync(int id, GradingScale scale);
    Task<bool> DeleteScaleAsync(int id);
    Task SeedDefaultGradingScalesAsync();
}
