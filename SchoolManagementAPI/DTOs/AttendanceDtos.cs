namespace SchoolManagementAPI.DTOs;

/// <summary>Student check-in request (PP or PO).</summary>
public class CheckInRequestDto
{
    public int StudentId { get; set; }
    public string Date { get; set; } = string.Empty; // yyyy-MM-dd
    public string Mode { get; set; } = "PP";         // PP | PO
    public string TimeIn { get; set; } = string.Empty; // HH:mm or HH:mm:ss
    public string? Remarks { get; set; }
}

/// <summary>Student check-out request.</summary>
public class CheckOutRequestDto
{
    public int StudentId { get; set; }
    public string Date { get; set; } = string.Empty; // yyyy-MM-dd
    public string TimeOut { get; set; } = string.Empty; // HH:mm or HH:mm:ss
    public string? Remarks { get; set; }
}

/// <summary>Single record for bulk attendance save.</summary>
public class BulkAttendanceRecordDto
{
    public int StudentId { get; set; }
    public int Status { get; set; }
    public string? TimeIn { get; set; }
    public string? TimeOut { get; set; }
    public string? Remarks { get; set; }
    public string? LeaveReason { get; set; }
}

/// <summary>Bulk save class attendance.</summary>
public class BulkAttendanceRequestDto
{
    public string Date { get; set; } = string.Empty; // yyyy-MM-dd
    public int ClassId { get; set; }
    public int? SectionId { get; set; }
    public List<BulkAttendanceRecordDto> Records { get; set; } = new();
}

/// <summary>Edit attendance - partial update.</summary>
public class UpdateAttendanceDto
{
    public int? Status { get; set; }
    public string? TimeIn { get; set; }
    public string? TimeOut { get; set; }
    public string? Remarks { get; set; }
    public string? LeaveReason { get; set; }
}

/// <summary>Attendance report with summary stats.</summary>
public class AttendanceReportResponseDto
{
    public List<AttendanceRecordDto> Records { get; set; } = new();
    public AttendanceReportSummaryDto Summary { get; set; } = new();
}

/// <summary>Single attendance record in report.</summary>
public class AttendanceRecordDto
{
    public int AttendanceId { get; set; }
    public int StudentId { get; set; }
    public DateTime Date { get; set; }
    public int Status { get; set; }
    public string? TimeIn { get; set; }
    public string? TimeOut { get; set; }
    public string? Remarks { get; set; }
}

/// <summary>Review leave (approve/reject).</summary>
public class ReviewLeaveDto
{
    public string Status { get; set; } = string.Empty; // approved | rejected
    public string? ReviewerRemarks { get; set; }
}

/// <summary>Attendance summary stats.</summary>
public class AttendanceReportSummaryDto
{
    public int TotalDays { get; set; }
    public int PresentCount { get; set; }
    public int AbsentCount { get; set; }
    public int LeaveCount { get; set; }
    public int HolidayCount { get; set; }
    public int NotMarkedCount { get; set; }
    public double AttendancePercent { get; set; }
}
