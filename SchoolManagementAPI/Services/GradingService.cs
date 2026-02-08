using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Data;
using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public class GradingService : IGradingService
{
    private readonly ApplicationDbContext _context;

    public GradingService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<GradingScale>> GetAllScalesAsync()
    {
        return await _context.GradingScales
            .Include(gs => gs.Class)
            .OrderBy(gs => gs.Class.Name)
            .ThenBy(gs => gs.MinMarks)
            .ToListAsync();
    }

    public async Task<GradingScale?> GetScaleByIdAsync(int id)
    {
        return await _context.GradingScales
            .Include(gs => gs.Class)
            .FirstOrDefaultAsync(gs => gs.ScaleId == id);
    }

    public async Task<IEnumerable<GradingScale>> GetScalesByClassAsync(int classId)
    {
        return await _context.GradingScales
            .Where(gs => gs.ClassId == classId && gs.IsActive)
            .OrderBy(gs => gs.MinMarks)
            .ToListAsync();
    }

    public async Task<GradingScale> CreateScaleAsync(GradingScale scale)
    {
        scale.CreatedDate = DateTime.Now;
        scale.ModifiedDate = DateTime.Now;
        _context.GradingScales.Add(scale);
        await _context.SaveChangesAsync();
        return scale;
    }

    public async Task<GradingScale?> UpdateScaleAsync(int id, GradingScale scale)
    {
        var existing = await _context.GradingScales.FindAsync(id);
        if (existing == null) return null;

        existing.ClassId = scale.ClassId;
        existing.MinMarks = scale.MinMarks;
        existing.MaxMarks = scale.MaxMarks;
        existing.Grade = scale.Grade;
        existing.GradePoint = scale.GradePoint;
        existing.Remarks = scale.Remarks;
        existing.IsActive = scale.IsActive;
        existing.ModifiedDate = DateTime.Now;

        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteScaleAsync(int id)
    {
        var scale = await _context.GradingScales.FindAsync(id);
        if (scale == null) return false;

        _context.GradingScales.Remove(scale);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task SeedDefaultGradingScalesAsync()
    {
        // Check if scales already exist
        if (await _context.GradingScales.AnyAsync()) return;

        var classes = await _context.Classes.ToListAsync();
        var scales = new List<GradingScale>();

        // Default grading scale (same for all classes)
        var defaultScales = new[]
        {
            new { MinMarks = 90m, MaxMarks = 100m, Grade = "A+", GradePoint = 4.0m, Remarks = "Excellent" },
            new { MinMarks = 85m, MaxMarks = 89m, Grade = "A", GradePoint = 3.7m, Remarks = "Excellent" },
            new { MinMarks = 80m, MaxMarks = 84m, Grade = "B+", GradePoint = 3.3m, Remarks = "Good" },
            new { MinMarks = 75m, MaxMarks = 79m, Grade = "B", GradePoint = 3.0m, Remarks = "Good" },
            new { MinMarks = 70m, MaxMarks = 74m, Grade = "C+", GradePoint = 2.7m, Remarks = "Satisfactory" },
            new { MinMarks = 65m, MaxMarks = 69m, Grade = "C", GradePoint = 2.3m, Remarks = "Satisfactory" },
            new { MinMarks = 60m, MaxMarks = 64m, Grade = "D", GradePoint = 2.0m, Remarks = "Pass" },
            new { MinMarks = 0m, MaxMarks = 59m, Grade = "F", GradePoint = 0.0m, Remarks = "Fail" }
        };

        foreach (var classItem in classes)
        {
            foreach (var scale in defaultScales)
            {
                scales.Add(new GradingScale
                {
                    ClassId = classItem.ClassId,
                    MinMarks = scale.MinMarks,
                    MaxMarks = scale.MaxMarks,
                    Grade = scale.Grade,
                    GradePoint = scale.GradePoint,
                    Remarks = scale.Remarks,
                    IsActive = true,
                    CreatedDate = DateTime.Now,
                    ModifiedDate = DateTime.Now
                });
            }
        }

        _context.GradingScales.AddRange(scales);
        await _context.SaveChangesAsync();
    }
}
