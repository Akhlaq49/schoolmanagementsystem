using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services.Family;

public interface IFeeAddonService
{
    Task<List<Models.FeeAddon>> GetAllAsync();
    Task<Models.FeeAddon?> GetByIdAsync(int id);
    Task<Models.FeeAddon> CreateAsync(Models.FeeAddon feeAddon);
    Task<Models.FeeAddon?> UpdateAsync(int id, Models.FeeAddon feeAddon);
    Task<bool> DeleteAsync(int id);
}
