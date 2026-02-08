namespace SchoolManagementAPI.Services;

public interface IPdfService
{
    Task<byte[]> GenerateFeeReceiptAsync(int invoiceId);
    Task<byte[]> GenerateResultCardAsync(int studentId, int examId);
    Task<byte[]> GenerateAttendanceReportAsync(int classId, DateTime startDate, DateTime endDate);
    Task<byte[]> GenerateStudentIdCardAsync(int studentId);
}
