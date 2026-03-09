using SchoolManagementAPI.DTOs;

namespace SchoolManagementAPI.Services;

public interface IFeeStructureService
{
    Task<List<FeeStructureResponseDto>> GetAllAsync();
    Task<FeeStructureResponseDto?> GetByIdAsync(int id);
    Task<FeeStructureResponseDto> CreateAsync(CreateFeeStructureDto dto);
    Task<FeeStructureResponseDto?> UpdateAsync(int id, UpdateFeeStructureDto dto);
    Task<bool> DeleteAsync(int id);
}
