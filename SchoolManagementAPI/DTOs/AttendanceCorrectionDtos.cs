namespace SchoolManagementAPI.DTOs;

public class CreateCorrectionRequestDto
{
    public int AttendanceId { get; set; }
    public int StudentId { get; set; }
    public string Reason { get; set; } = string.Empty;
    public int? RequestedStatus { get; set; }
    public string? RequestedTimeIn { get; set; }
    public string? RequestedTimeOut { get; set; }
    public string? RequestedRemarks { get; set; }
}

public class ReviewCorrectionDto
{
    public string Status { get; set; } = "approved"; // approved | rejected
    public string? ReviewerRemarks { get; set; }
}
