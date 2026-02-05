using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public interface IAttendanceService
{
    Task<List<Attendance>> GetAttendanceByDateAsync(DateTime date, int? classId, int? sectionId);
    Task<Attendance?> GetAttendanceByIdAsync(int id);
    Task<Attendance> CreateAttendanceAsync(Attendance attendance);
    Task<Attendance?> UpdateAttendanceAsync(int id, Attendance attendance);
    Task<bool> DeleteAttendanceAsync(int id);
    Task<List<Attendance>> GetAttendanceReportAsync(int studentId, int month, int year);
}

