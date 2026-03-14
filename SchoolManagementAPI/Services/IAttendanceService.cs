using SchoolManagementAPI.DTOs;
using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public interface IAttendanceService
{
    Task<List<Attendance>> GetAttendanceByDateAsync(DateTime date, int? classId, int? sectionId);
    Task<Attendance?> GetAttendanceByIdAsync(int id);
    Task<Attendance?> GetTodayAttendanceAsync(int studentId);
    Task<Attendance> CreateAttendanceAsync(Attendance attendance);
    Task<Attendance?> UpdateAttendanceAsync(int id, Attendance attendance);
    Task<Attendance?> UpdateAttendanceByIdAsync(int id, UpdateAttendanceDto dto);
    Task<bool> DeleteAttendanceAsync(int id);
    Task<List<Attendance>> GetAttendanceReportAsync(int studentId, int month, int year);
    Task<AttendanceReportResponseDto> GetAttendanceReportWithSummaryAsync(int studentId, int? month, int? year, DateTime? fromDate, DateTime? toDate);
    Task<Attendance> CheckInAsync(CheckInRequestDto dto, int? markedByUserId = null);
    Task<Attendance?> CheckOutAsync(CheckOutRequestDto dto);
    Task<List<Attendance>> BulkSaveAttendanceAsync(BulkAttendanceRequestDto dto, int? markedByUserId = null);
}

