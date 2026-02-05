using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Data;
using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public class SubjectService : ISubjectService
{
    private readonly ApplicationDbContext _context;

    public SubjectService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Subject>> GetAllSubjectsAsync()
    {
        return await _context.Subjects
            .Include(s => s.Class)
            .ToListAsync();
    }

    public async Task<Subject?> GetSubjectByIdAsync(int id)
    {
        return await _context.Subjects
            .Include(s => s.Class)
            .FirstOrDefaultAsync(s => s.SubjectId == id);
    }

    public async Task<List<Subject>> GetSubjectsByClassIdAsync(int classId)
    {
        return await _context.Subjects
            .Where(s => s.ClassId == classId)
            .Include(s => s.Class)
            .ToListAsync();
    }

    public async Task<Subject> CreateSubjectAsync(Subject subject)
    {
        _context.Subjects.Add(subject);
        await _context.SaveChangesAsync();
        return subject;
    }

    public async Task<Subject?> UpdateSubjectAsync(int id, Subject subject)
    {
        var existing = await _context.Subjects.FindAsync(id);
        if (existing == null) return null;

        existing.Name = subject.Name;
        existing.ClassId = subject.ClassId;
        existing.TeacherId = subject.TeacherId;

        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteSubjectAsync(int id)
    {
        var subject = await _context.Subjects.FindAsync(id);
        if (subject == null) return false;

        _context.Subjects.Remove(subject);
        await _context.SaveChangesAsync();
        return true;
    }
}

