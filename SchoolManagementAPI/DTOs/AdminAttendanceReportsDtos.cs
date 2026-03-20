namespace SchoolManagementAPI.DTOs;

public class AdminAttendanceReportsRequestDto
{
    public string DateFrom { get; set; } = string.Empty; // yyyy-MM-dd
    public string DateTo { get; set; } = string.Empty;   // yyyy-MM-dd
    public int? ClassId { get; set; }
    public int? SectionId { get; set; }
    public string ReportType { get; set; } = "summary";  // summary | detailed | class-wise | student-wise
}

public class AdminAttendanceReportsAnalyticsDto
{
    public int TotalRecords { get; set; }
    public int AvgAttendance { get; set; }   // integer percentage
    public int PresentDays { get; set; }     // working days in selected range
    public int StudentsCovered { get; set; }
    public string AbsentTrend { get; set; } = "—";
}

public class AdminAttendanceReportRecordDto
{
    public int Id { get; set; }
    public string ReportName { get; set; } = string.Empty;
    public string DateFrom { get; set; } = string.Empty;
    public string DateTo { get; set; } = string.Empty;
    public string ClassName { get; set; } = string.Empty;
    public string SectionName { get; set; } = string.Empty;
    public string ClassFilter { get; set; } = string.Empty;
    public int RecordCount { get; set; }
    public int AvgAttendance { get; set; }
    public string GeneratedAt { get; set; } = string.Empty; // yyyy-MM-dd
}

public class AdminAttendanceReportsResponseDto
{
    public AdminAttendanceReportsAnalyticsDto Analytics { get; set; } = new();
    public List<AdminAttendanceReportRecordDto> Reports { get; set; } = new();
}

