using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Data;
using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public class StudyMaterialService : IStudyMaterialService
{
    private readonly ApplicationDbContext _context;

    public StudyMaterialService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<StudyMaterial>> GetAllStudyMaterialsAsync()
    {
        return await _context.StudyMaterials
            .Include(s => s.Class)
            .Include(s => s.Subject)
            .ToListAsync();
    }

    public async Task<StudyMaterial?> GetStudyMaterialByIdAsync(int id)
    {
        return await _context.StudyMaterials
            .Include(s => s.Class)
            .Include(s => s.Subject)
            .FirstOrDefaultAsync(s => s.StudyMaterialId == id);
    }

    public async Task<List<StudyMaterial>> GetStudyMaterialsByClassIdAsync(int classId)
    {
        return await _context.StudyMaterials
            .Where(s => s.ClassId == classId)
            .Include(s => s.Subject)
            .ToListAsync();
    }

    public async Task<List<StudyMaterial>> GetStudyMaterialsByStudentIdAsync(int studentId)
    {
        var student = await _context.Users
            .Include(u => u.UserRoles)
            .FirstOrDefaultAsync(u => u.UserId == studentId && u.UserRoles.Any(ur => ur.Role == UserRole.Student));
        if (student?.ClassId == null) return new List<StudyMaterial>();

        return await GetStudyMaterialsByClassIdAsync(student.ClassId.Value);
    }

    public async Task<StudyMaterial> CreateStudyMaterialAsync(StudyMaterial material)
    {
        material.Timestamp = DateTime.UtcNow;
        _context.StudyMaterials.Add(material);
        await _context.SaveChangesAsync();
        return material;
    }

    public async Task<StudyMaterial?> UpdateStudyMaterialAsync(int id, StudyMaterial material)
    {
        var existing = await _context.StudyMaterials.FindAsync(id);
        if (existing == null) return null;

        existing.Title = material.Title;
        existing.Description = material.Description;
        existing.ClassId = material.ClassId;
        existing.SubjectId = material.SubjectId;
        existing.FileName = material.FileName;
        existing.FileType = material.FileType;

        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteStudyMaterialAsync(int id)
    {
        var material = await _context.StudyMaterials.FindAsync(id);
        if (material == null) return false;

        _context.StudyMaterials.Remove(material);
        await _context.SaveChangesAsync();
        return true;
    }
}

