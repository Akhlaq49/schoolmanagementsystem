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

    public async Task<List<Subject>> CreateSubjectsForClassesAsync(string name, IEnumerable<int> classIds, int? teacherId)
    {
        var distinctClassIds = classIds
            .Where(id => id > 0)
            .Distinct()
            .ToList();

        var subjects = new List<Subject>();

        foreach (var classId in distinctClassIds)
        {
            var subject = new Subject
            {
                Name = name,
                ClassId = classId,
                TeacherId = teacherId
            };
            subjects.Add(subject);
        }

        if (subjects.Count == 0)
        {
            return subjects;
        }

        _context.Subjects.AddRange(subjects);
        await _context.SaveChangesAsync();
        return subjects;
    }

    public async Task<List<Subject>> UpdateSubjectsForNameAsync(string originalName, string newName, IEnumerable<int> classIds, int? teacherId)
    {
        var normalizedOriginal = originalName.Trim();
        var normalizedNew = newName.Trim();

        var existing = await _context.Subjects
            .Where(s => s.Name == normalizedOriginal)
            .ToListAsync();

        var targetClassIds = classIds
            .Where(id => id > 0)
            .Distinct()
            .ToList();

        // Delete rows for classes no longer selected
        var toDelete = existing
            .Where(s => !targetClassIds.Contains(s.ClassId ?? 0))
            .ToList();

        if (toDelete.Count > 0)
        {
            _context.Subjects.RemoveRange(toDelete);
        }

        var result = new List<Subject>();

        foreach (var classId in targetClassIds)
        {
            var row = existing.FirstOrDefault(s => s.ClassId == classId);
            if (row == null)
            {
                row = new Subject
                {
                    Name = normalizedNew,
                    ClassId = classId,
                    TeacherId = teacherId
                };
                _context.Subjects.Add(row);
            }
            else
            {
                row.Name = normalizedNew;
                row.TeacherId = teacherId;
            }

            result.Add(row);
        }

        await _context.SaveChangesAsync();
        return result;
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

