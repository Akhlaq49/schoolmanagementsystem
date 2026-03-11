using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Data;
using SchoolManagementAPI.DTOs;
using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public class FeeDiscountService : IFeeDiscountService
{
    private readonly ApplicationDbContext _context;

    public FeeDiscountService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<FeeDiscountResponseDto>> GetAllAsync(string? scope, string? status)
    {
        var query = _context.FeeDiscounts
            .AsNoTracking()
            .Include(d => d.Assignments)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(scope))
            query = query.Where(d => d.Scope == scope);

        if (!string.IsNullOrWhiteSpace(status))
        {
            var isActive = status.Equals("active", StringComparison.OrdinalIgnoreCase);
            query = query.Where(d => d.IsActive == isActive);
        }

        var list = await query.OrderBy(d => d.Name).ToListAsync();
        return list.Select(MapToResponse).ToList();
    }

    public async Task<FeeDiscountResponseDto?> GetByIdAsync(int id)
    {
        var entity = await _context.FeeDiscounts
            .AsNoTracking()
            .Include(d => d.Assignments)
            .FirstOrDefaultAsync(d => d.FeeDiscountId == id);
        return entity is null ? null : MapToResponse(entity);
    }

    public async Task<FeeDiscountResponseDto> CreateAsync(CreateFeeDiscountDto dto)
    {
        var entity = new FeeDiscount
        {
            Name = dto.Name.Trim(),
            Type = dto.Type ?? "percentage",
            Value = dto.Value,
            Scope = dto.Scope ?? "student",
            Description = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim(),
            IsActive = dto.IsActive
        };
        _context.FeeDiscounts.Add(entity);
        await _context.SaveChangesAsync();
        return MapToResponse(entity);
    }

    public async Task<FeeDiscountResponseDto?> UpdateAsync(int id, UpdateFeeDiscountDto dto)
    {
        var entity = await _context.FeeDiscounts
            .Include(d => d.Assignments)
            .FirstOrDefaultAsync(d => d.FeeDiscountId == id);
        if (entity == null) return null;

        entity.Name = dto.Name.Trim();
        entity.Type = dto.Type ?? "percentage";
        entity.Value = dto.Value;
        entity.Scope = dto.Scope ?? "student";
        entity.Description = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim();
        entity.IsActive = dto.IsActive;
        await _context.SaveChangesAsync();
        return MapToResponse(entity);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var entity = await _context.FeeDiscounts.FindAsync(id);
        if (entity == null) return false;
        _context.FeeDiscounts.Remove(entity);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<FeeDiscountAssignmentResponseDto>> GetAssignmentsAsync(int discountId)
    {
        var list = await _context.FeeDiscountAssignments
            .AsNoTracking()
            .Include(a => a.Student)
            .Include(a => a.Family)
            .Where(a => a.FeeDiscountId == discountId)
            .OrderBy(a => a.CreatedAt)
            .ToListAsync();
        return list.Select(MapAssignmentToResponse).ToList();
    }

    public async Task<FeeDiscountAssignmentResponseDto?> AssignToStudentAsync(int discountId, int studentId)
    {
        var discount = await _context.FeeDiscounts.FindAsync(discountId);
        if (discount == null) return null;
        if (discount.Scope != "student" && discount.Scope != "both")
            return null;

        var exists = await _context.FeeDiscountAssignments
            .AnyAsync(a => a.FeeDiscountId == discountId && a.StudentId == studentId);
        if (exists) return null;

        var student = await _context.Students.FindAsync(studentId);
        if (student == null) return null;

        var assignment = new FeeDiscountAssignment
        {
            FeeDiscountId = discountId,
            StudentId = studentId,
            FamilyId = null
        };
        _context.FeeDiscountAssignments.Add(assignment);
        await _context.SaveChangesAsync();

        assignment.Student = student;
        return MapAssignmentToResponse(assignment);
    }

    public async Task<FeeDiscountAssignmentResponseDto?> AssignToFamilyAsync(int discountId, int familyId)
    {
        var discount = await _context.FeeDiscounts.FindAsync(discountId);
        if (discount == null) return null;
        if (discount.Scope != "family" && discount.Scope != "both")
            return null;

        var exists = await _context.FeeDiscountAssignments
            .AnyAsync(a => a.FeeDiscountId == discountId && a.FamilyId == familyId);
        if (exists) return null;

        var family = await _context.Families.FindAsync(familyId);
        if (family == null) return null;

        var assignment = new FeeDiscountAssignment
        {
            FeeDiscountId = discountId,
            StudentId = null,
            FamilyId = familyId
        };
        _context.FeeDiscountAssignments.Add(assignment);
        await _context.SaveChangesAsync();

        assignment.Family = family;
        return MapAssignmentToResponse(assignment);
    }

    public async Task<bool> UnassignAsync(int assignmentId)
    {
        var entity = await _context.FeeDiscountAssignments.FindAsync(assignmentId);
        if (entity == null) return false;
        _context.FeeDiscountAssignments.Remove(entity);
        await _context.SaveChangesAsync();
        return true;
    }

    private static FeeDiscountResponseDto MapToResponse(FeeDiscount d)
    {
        return new FeeDiscountResponseDto
        {
            FeeDiscountId = d.FeeDiscountId,
            Name = d.Name,
            Type = d.Type,
            Value = d.Value,
            Scope = d.Scope,
            Description = d.Description,
            IsActive = d.IsActive,
            AssignedCount = d.Assignments?.Count ?? 0,
            CreatedAt = d.CreatedAt
        };
    }

    private static FeeDiscountAssignmentResponseDto MapAssignmentToResponse(FeeDiscountAssignment a)
    {
        return new FeeDiscountAssignmentResponseDto
        {
            FeeDiscountAssignmentId = a.FeeDiscountAssignmentId,
            FeeDiscountId = a.FeeDiscountId,
            StudentId = a.StudentId,
            StudentName = a.Student?.Name,
            FamilyId = a.FamilyId,
            FamilyDisplayName = a.Family != null ? a.Family.FatherName + (string.IsNullOrEmpty(a.Family.MotherName) ? "" : " / " + a.Family.MotherName) : null,
            CreatedAt = a.CreatedAt
        };
    }
}
