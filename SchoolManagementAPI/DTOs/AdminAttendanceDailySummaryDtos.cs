using System.Text.Json.Serialization;

namespace SchoolManagementAPI.DTOs;

public class AdminAttendanceDailyStatsDto
{
    public int Total { get; set; }
    public int Present { get; set; }
    public int Absent { get; set; }
    public int NotMarked { get; set; }
    public int Percent { get; set; }
}

public class AdminAttendanceClassBreakdownDto
{
    public int ClassId { get; set; }
    public int SectionId { get; set; }
    public string ClassName { get; set; } = string.Empty;
    public string Section { get; set; } = string.Empty;
    public int Total { get; set; }
    public int Present { get; set; }
    public int Absent { get; set; }
    public int NotMarked { get; set; }
    public int Percent { get; set; }

    // complete | partial | pending
    public string Status { get; set; } = "pending";
}

public class AdminAttendanceNotMarkedItemDto
{
    public int Id { get; set; }
    public string ClassName { get; set; } = string.Empty;
    public string? Section { get; set; }
    public string? Teacher { get; set; }
    public string Type { get; set; } = "class"; // class | staff
}

public class AdminAttendanceDailySummaryDto
{
    public AdminAttendanceDailyStatsDto Stats { get; set; } = new();
    public List<AdminAttendanceClassBreakdownDto> ClassBreakdown { get; set; } = new();
    public List<AdminAttendanceNotMarkedItemDto> NotMarkedList { get; set; } = new();
}

public class AdminAttendanceDailyReminderRequestDto
{
    public string Date { get; set; } = string.Empty; // yyyy-MM-dd
}

public class AdminAttendanceDailyReminderResultDto
{
    public int Count { get; set; }
    public string Message { get; set; } = string.Empty;
}

