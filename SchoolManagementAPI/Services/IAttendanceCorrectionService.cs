using SchoolManagementAPI.DTOs;
using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public interface IAttendanceCorrectionService
{
    Task<AttendanceCorrection> CreateAsync(CreateCorrectionRequestDto dto);
    Task<List<AttendanceCorrection>> GetByStudentAsync(int studentId);
    Task<List<AttendanceCorrection>> GetPendingForAdminAsync();
    Task<AttendanceCorrection?> ReviewAsync(int id, ReviewCorrectionDto dto, int reviewerUserId);
    Task<AttendanceCorrection?> GetByIdAsync(int id);
}
