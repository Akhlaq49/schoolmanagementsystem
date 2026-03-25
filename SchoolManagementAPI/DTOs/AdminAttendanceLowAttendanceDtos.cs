namespace SchoolManagementAPI.DTOs;

public class LowAttendanceStudentDto
{
    public int StudentId { get; set; }
    public string Roll { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string ClassName { get; set; } = string.Empty;
    public string Section { get; set; } = string.Empty;
    public int Present { get; set; }
    public int Absent { get; set; }
    public int Total { get; set; }
    public int Percent { get; set; }
}

public class LowAttendanceClassOptionDto
{
    public int ClassId { get; set; }
    public string ClassName { get; set; } = string.Empty;
}

public class AdminAttendanceLowAttendanceResponseDto
{
    public string Period { get; set; } = string.Empty;  // today | week | month
    public string DateFrom { get; set; } = string.Empty;
    public string DateTo { get; set; } = string.Empty;
    public List<LowAttendanceStudentDto> Students { get; set; } = new();
    public List<LowAttendanceClassOptionDto> ClassOptions { get; set; } = new();
}
