using SchoolManagementAPI.DTOs;

namespace SchoolManagementAPI.Services;

public interface IFeeDiscountService
{
    Task<List<FeeDiscountResponseDto>> GetAllAsync(string? scope, string? status);
    Task<FeeDiscountResponseDto?> GetByIdAsync(int id);
    Task<FeeDiscountResponseDto> CreateAsync(CreateFeeDiscountDto dto);
    Task<FeeDiscountResponseDto?> UpdateAsync(int id, UpdateFeeDiscountDto dto);
    Task<bool> DeleteAsync(int id);
    Task<List<FeeDiscountAssignmentResponseDto>> GetAssignmentsAsync(int discountId);
    Task<FeeDiscountAssignmentResponseDto?> AssignToStudentAsync(int discountId, int studentId);
    Task<FeeDiscountAssignmentResponseDto?> AssignToFamilyAsync(int discountId, int familyId);
    Task<bool> UnassignAsync(int assignmentId);
}
