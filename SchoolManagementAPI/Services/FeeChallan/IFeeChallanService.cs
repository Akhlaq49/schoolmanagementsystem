using SchoolManagementAPI.DTOs;

namespace SchoolManagementAPI.Services;

public interface IFeeChallanService
{
    Task<List<FeeChallanResponseDto>> GetAllAsync(int? month, int? year, string? status);
    Task<FeeChallanResponseDto?> GetByIdAsync(int id);
    Task<ChallanSummaryDto> GetSummaryAsync(int? month, int? year);
    Task<List<CollectionPaymentDto>> GetCollectionPaymentsAsync(DateTime? start, DateTime? end);
    Task<CollectionSummaryDto> GetCollectionSummaryAsync(DateTime? start, DateTime? end);
    Task<List<FeeChallanResponseDto>> GetByStudentAsync(int studentId, string? status);
    Task<List<FeeChallanResponseDto>> GetDefaultersAsync(int? classId, string? status);
    Task<int> GenerateChallansAsync(ChallanGenerateRequestDto dto);
    Task<FeeChallanResponseDto?> RecordPaymentAsync(int challanId, RecordPaymentRequestDto dto);
    Task<FeeChallanResponseDto?> WaiveChallanAsync(int challanId, string reason);
}
