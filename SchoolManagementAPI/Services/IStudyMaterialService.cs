using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public interface IStudyMaterialService
{
    Task<List<StudyMaterial>> GetAllStudyMaterialsAsync();
    Task<StudyMaterial?> GetStudyMaterialByIdAsync(int id);
    Task<List<StudyMaterial>> GetStudyMaterialsByClassIdAsync(int classId);
    Task<List<StudyMaterial>> GetStudyMaterialsByStudentIdAsync(int studentId);
    Task<StudyMaterial> CreateStudyMaterialAsync(StudyMaterial material);
    Task<StudyMaterial?> UpdateStudyMaterialAsync(int id, StudyMaterial material);
    Task<bool> DeleteStudyMaterialAsync(int id);
}

