using SchoolManagementAPI.DTOs;
using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public interface IQuestionBankService
{
    Task<List<QuestionBank>> GetAllQuestionsAsync();
    Task<QuestionBank?> GetQuestionByIdAsync(int id);
    Task<List<QuestionBank>> GetQuestionsBySubjectAsync(int subjectId);
    Task<List<QuestionBank>> GetQuestionsByClassAsync(int classId);
    Task<List<QuestionBank>> GetQuestionsBySubjectAndClassAsync(int subjectId, int classId);
    Task<List<QuestionBank>> GetQuestionsByChapterAsync(int subjectId, int classId, string chapterName);
    Task<List<QuestionBank>> GetQuestionsByTeacherAsync(int teacherId);
    Task<QuestionBank> CreateQuestionAsync(QuestionBank question);
    Task<QuestionBank?> UpdateQuestionAsync(int id, QuestionBank question);
    Task<bool> DeleteQuestionAsync(int id);
    Task<List<string>> GetChaptersBySubjectAndClassAsync(int subjectId, int classId);
    Task<BulkUploadResult> BulkUploadQuestionsAsync(Stream excelStream, int teacherId);
    Task<List<QuestionBank>> GetQuestionsForExamAsync(int classId, int subjectId, bool isFullBook, List<string>? selectedChapters);
}



