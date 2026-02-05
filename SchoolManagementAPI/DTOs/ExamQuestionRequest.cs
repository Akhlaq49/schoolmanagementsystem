namespace SchoolManagementAPI.DTOs;

public class ExamQuestionRequest
{
    public int ClassId { get; set; }
    public int SubjectId { get; set; }
    public bool IsFullBook { get; set; }
    public List<string>? SelectedChapters { get; set; }
}
