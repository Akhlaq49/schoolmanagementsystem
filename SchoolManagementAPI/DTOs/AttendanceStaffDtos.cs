namespace SchoolManagementAPI.DTOs;

/// <summary>
/// Staff attendance row (admin module) - one row per staff member for a specific date.
/// </summary>
public class StaffAttendanceDto
{
    public int StaffId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Department { get; set; } = "—";

    /// <summary>Status codes: 0=Not Marked, 1=PP, 2=PO, 3=Absent</summary>
    public int Status { get; set; }

    public string TimeIn { get; set; } = string.Empty;  // HH:mm
    public string TimeOut { get; set; } = string.Empty; // HH:mm
}

/// <summary>
/// Bulk save request for staff attendance (admin module).
/// </summary>
public class StaffAttendanceBulkRequestDto
{
    public string Date { get; set; } = string.Empty; // yyyy-MM-dd
    public List<StaffAttendanceBulkRecordDto> Records { get; set; } = new();
}

/// <summary>Single staff attendance record for bulk save.</summary>
public class StaffAttendanceBulkRecordDto
{
    public int StaffId { get; set; }
    public int Status { get; set; }
    public string? TimeIn { get; set; }  // HH:mm
    public string? TimeOut { get; set; } // HH:mm
}

/// <summary>
/// Staff attendance history row (used by staff history UI).
/// </summary>
public class StaffAttendanceHistoryDto
{
    public string Date { get; set; } = string.Empty; // yyyy-MM-dd
    /// <summary>Status label: PP/PO/A/Not Marked</summary>
    public string Status { get; set; } = string.Empty;
    public string TimeIn { get; set; } = string.Empty; // HH:mm
    public string TimeOut { get; set; } = string.Empty; // HH:mm
}

