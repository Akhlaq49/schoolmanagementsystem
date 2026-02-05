using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Data;
using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public class AssignmentService : IAssignmentService
{
    private readonly ApplicationDbContext _context;

    public AssignmentService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Assignment>> GetAllAssignmentsAsync()
    {
        return await _context.Assignments
            .Include(a => a.Class)
            .Include(a => a.Subject)
            .ToListAsync();
    }

    public async Task<Assignment?> GetAssignmentByIdAsync(int id)
    {
        return await _context.Assignments
            .Include(a => a.Class)
            .Include(a => a.Subject)
            .FirstOrDefaultAsync(a => a.AssignmentId == id);
    }

    public async Task<List<Assignment>> GetAssignmentsByClassIdAsync(int classId)
    {
        return await _context.Assignments
            .Where(a => a.ClassId == classId)
            .Include(a => a.Subject)
            .ToListAsync();
    }

    public async Task<List<Assignment>> GetAssignmentsByStudentIdAsync(int studentId)
    {
        var student = await _context.Users
            .Include(u => u.UserRoles)
            .FirstOrDefaultAsync(u => u.UserId == studentId && u.UserRoles.Any(ur => ur.Role == UserRole.Student));
        if (student?.ClassId == null) return new List<Assignment>();

        return await GetAssignmentsByClassIdAsync(student.ClassId.Value);
    }

    public async Task<Assignment> CreateAssignmentAsync(Assignment assignment)
    {
        assignment.Timestamp = DateTime.UtcNow;
        _context.Assignments.Add(assignment);
        await _context.SaveChangesAsync();
        return assignment;
    }

    public async Task<Assignment?> UpdateAssignmentAsync(int id, Assignment assignment)
    {
        var existing = await _context.Assignments.FindAsync(id);
        if (existing == null) return null;

        existing.Name = assignment.Name;
        existing.Description = assignment.Description;
        existing.ClassId = assignment.ClassId;
        existing.SubjectId = assignment.SubjectId;
        existing.TeacherId = assignment.TeacherId;
        existing.FileName = assignment.FileName;
        existing.FileType = assignment.FileType;

        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteAssignmentAsync(int id)
    {
        var assignment = await _context.Assignments.FindAsync(id);
        if (assignment == null) return false;

        _context.Assignments.Remove(assignment);
        await _context.SaveChangesAsync();
        return true;
    }
}

