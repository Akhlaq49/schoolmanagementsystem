using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services.Family;

public interface IFamilyService
{
    Task<List<Models.Family>> GetAllFamiliesAsync();
    Task<Models.Family?> GetFamilyByIdAsync(int id);
    Task<Models.Family> CreateFamilyAsync(Models.Family family);
}

