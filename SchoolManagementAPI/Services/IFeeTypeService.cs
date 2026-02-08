using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public interface IFeeTypeService
{
    Task<IEnumerable<FeeType>> GetAllAsync();
    Task<FeeType?> GetByIdAsync(int id);
    Task<FeeType?> GetByNameAsync(string name);
    Task<FeeType> CreateAsync(FeeType feeType);
    Task<FeeType?> UpdateAsync(int id, FeeType feeType);
    Task<bool> DeleteAsync(int id);
}
