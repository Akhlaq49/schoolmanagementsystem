namespace SchoolManagementAPI.DTOs;

/// <summary>One student row returned in the monthly grid header list.</summary>
public class MonthlyGridStudentDto
{
    public int StudentId { get; set; }
    public string Roll { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? ClassName { get; set; }
    public string? SectionName { get; set; }
}

/// <summary>One cell in the monthly grid (one student × one calendar day).</summary>
public class MonthlyGridCellDto
{
    public int StudentId { get; set; }
    public int Day { get; set; }            // 1-31

    /// <summary>P=Present, A=Absent, L=Leave, H=Holiday, empty=Not Marked.</summary>
    public string Status { get; set; } = string.Empty;

    public string? TimeIn { get; set; }     // HH:mm
    public string? TimeOut { get; set; }    // HH:mm
    public string? Remarks { get; set; }

    /// <summary>Raw numeric status code from the DB (0–7) for reference.</summary>
    public int RawStatus { get; set; }
}

/// <summary>Full monthly grid response.</summary>
public class MonthlyGridResponseDto
{
    public int Month { get; set; }
    public int Year { get; set; }
    public int DaysInMonth { get; set; }
    public string MonthLabel { get; set; } = string.Empty;  // e.g. "Mar 2026"
    public List<MonthlyGridStudentDto> Students { get; set; } = new();
    public List<MonthlyGridCellDto> GridCells { get; set; } = new();
}
