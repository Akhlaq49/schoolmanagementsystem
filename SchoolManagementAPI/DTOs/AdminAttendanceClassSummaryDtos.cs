namespace SchoolManagementAPI.DTOs;

public class ClassSummaryItemDto
{
    public int ClassId { get; set; }
    public int SectionId { get; set; }
    public string ClassName { get; set; } = string.Empty;
    public string Section { get; set; } = string.Empty;
    public int Total { get; set; }
    public int Present { get; set; }
    public int Absent { get; set; }
    public int Leave { get; set; }
    public int Percent { get; set; }
}

public class AdminAttendanceClassSummaryResponseDto
{
    public string Period { get; set; } = string.Empty;  // today | week | month
    public string DateFrom { get; set; } = string.Empty;
    public string DateTo { get; set; } = string.Empty;
    public List<ClassSummaryItemDto> Classes { get; set; } = new();
}
