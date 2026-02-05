using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public interface ISectionService
{
    Task<List<Section>> GetAllSectionsAsync();
    Task<Section?> GetSectionByIdAsync(int id);
    Task<List<Section>> GetSectionsByClassIdAsync(int classId);
    Task<Section> CreateSectionAsync(Section section);
    Task<Section?> UpdateSectionAsync(int id, Section section);
    Task<bool> DeleteSectionAsync(int id);
}

