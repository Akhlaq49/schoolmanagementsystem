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
    Task<List<ClassAttendanceSheetItemDto>> GetClassAttendanceSheetAsync(DateTime date, int classId, int? sectionId);

    Task<List<Attendance>> GetTeacherThisMonthAsync(int teacherId, int month, int year);
    Task<Attendance?> GetTeacherTodayAsync(int teacherId);
    Task<List<Attendance>> GetAllByTeacherAsync(int teacherId);
    Task<Attendance> TeacherCheckInAsync(int teacherId, TeacherCheckInDto dto);
    Task<Attendance?> TeacherCheckOutAsync(int teacherId, TeacherCheckOutDto dto);

    // Admin: Staff attendance
    Task<List<StaffAttendanceDto>> GetStaffAttendanceAsync(DateTime date);
    Task<List<Attendance>> BulkSaveStaffAttendanceAsync(StaffAttendanceBulkRequestDto dto, int? markedByUserId = null);
    Task<List<StaffAttendanceHistoryDto>> GetStaffAttendanceHistoryAsync(int staffId);

    // Admin: Daily summary for attendance monitoring
    Task<AdminAttendanceDailySummaryDto> GetAdminAttendanceDailySummaryAsync(DateTime date);
    Task<AdminAttendanceDailyReminderResultDto> SendAdminAttendanceDailyRemindersAsync(DateTime date);
    Task<byte[]> ExportAdminAttendanceDailySummaryCsvAsync(DateTime date);

    // Admin: Monthly grid
    Task<MonthlyGridResponseDto> GetMonthlyGridAsync(int month, int year, int? classId, int? sectionId);
    Task<byte[]> ExportMonthlyGridCsvAsync(int month, int year, int? classId, int? sectionId);

    // Admin: Attendance reports
    Task<AdminAttendanceReportsResponseDto> GetAdminAttendanceReportsAsync(DateTime dateFrom, DateTime dateTo, int? classId, int? sectionId, string reportType);
    Task<byte[]> ExportAdminAttendanceReportsCsvAsync(DateTime dateFrom, DateTime dateTo, int? classId, int? sectionId, string reportType);
    Task<byte[]> ExportAdminAttendanceSingleReportCsvAsync(int reportId, DateTime dateFrom, DateTime dateTo, int? classId, int? sectionId, string reportType);

    // Admin: Attendance trends
    Task<AttendanceTrendsResponseDto> GetAttendanceTrendsAsync(string period, DateTime dateFrom, DateTime dateTo, int? classId, int? sectionId);

    // Admin: Class-level summary
    Task<AdminAttendanceClassSummaryResponseDto> GetClassLevelSummaryAsync(string period);
}

