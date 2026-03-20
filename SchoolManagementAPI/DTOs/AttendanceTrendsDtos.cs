namespace SchoolManagementAPI.DTOs;

public class AttendanceTrendDataPointDto
{
    public string Label { get; set; } = string.Empty;
    public int Present { get; set; }
    public int Absent { get; set; }
    public int Leave { get; set; }
    public int Total { get; set; }
}

public class AttendanceTrendsTotalsDto
{
    public int Present { get; set; }
    public int Absent { get; set; }
    public int Leave { get; set; }
    public int Percent { get; set; }
}

public class AttendanceTrendsResponseDto
{
    public string Period { get; set; } = string.Empty;  // daily | weekly | monthly
    public string DateFrom { get; set; } = string.Empty;
    public string DateTo { get; set; } = string.Empty;
    public List<AttendanceTrendDataPointDto> DataPoints { get; set; } = new();
    public AttendanceTrendsTotalsDto Totals { get; set; } = new();
}
