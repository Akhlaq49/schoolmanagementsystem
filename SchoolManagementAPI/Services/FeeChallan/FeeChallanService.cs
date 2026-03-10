using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Data;
using SchoolManagementAPI.DTOs;
using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public class FeeChallanService : IFeeChallanService
{
    private readonly ApplicationDbContext _context;

    public FeeChallanService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<FeeChallanResponseDto>> GetAllAsync(int? month, int? year, string? status)
    {
        var query = _context.FeeChallans
            .AsNoTracking()
            .Include(c => c.Student).ThenInclude(s => s.Class)
            .Include(c => c.Student).ThenInclude(s => s.Section)
            .Include(c => c.FeeStructure)
            .Include(c => c.Payments)
            .AsQueryable();

        if (month.HasValue && month.Value > 0)
            query = query.Where(c => c.Month == month.Value);

        if (year.HasValue && year.Value > 0)
            query = query.Where(c => c.Year == year.Value);

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(c => c.Status == status);

        var list = await query.OrderByDescending(c => c.CreatedAt).ToListAsync();
        return list.Select(MapToResponse).ToList();
    }

    public async Task<FeeChallanResponseDto?> GetByIdAsync(int id)
    {
        var entity = await GetEntityWithIncludes(id);
        return entity is null ? null : MapToResponse(entity);
    }

    public async Task<ChallanSummaryDto> GetSummaryAsync(int? month, int? year)
    {
        var query = _context.FeeChallans.AsNoTracking().AsQueryable();

        if (month.HasValue && month.Value > 0)
            query = query.Where(c => c.Month == month.Value);

        if (year.HasValue && year.Value > 0)
            query = query.Where(c => c.Year == year.Value);

        var challans = await query.ToListAsync();

        return new ChallanSummaryDto
        {
            TotalChallans = challans.Count,
            PaidCount = challans.Count(c => c.Status == "Paid"),
            UnpaidCount = challans.Count(c => c.Status == "Unpaid"),
            PartialCount = challans.Count(c => c.Status == "Partial"),
            OverdueCount = challans.Count(c => c.Status == "Overdue"),
            TotalAmount = challans.Sum(c => c.TotalAmount),
            CollectedAmount = challans.Sum(c => c.PaidAmount),
            PendingAmount = challans.Sum(c => c.Balance)
        };
    }

    public async Task<List<FeeChallanResponseDto>> GetByStudentAsync(int studentId, string? status)
    {
        var query = _context.FeeChallans
            .AsNoTracking()
            .Include(c => c.Student).ThenInclude(s => s.Class)
            .Include(c => c.Student).ThenInclude(s => s.Section)
            .Include(c => c.FeeStructure)
            .Include(c => c.Payments)
            .Where(c => c.StudentId == studentId)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(c => c.Status == status);
        }

        var list = await query
            .OrderByDescending(c => c.Year)
            .ThenByDescending(c => c.Month)
            .ThenByDescending(c => c.FeeChallanId)
            .ToListAsync();

        return list.Select(MapToResponse).ToList();
    }

    public async Task<List<FeeChallanResponseDto>> GetDefaultersAsync(int? classId, string? status)
    {
        var query = _context.FeeChallans
            .AsNoTracking()
            .Include(c => c.Student).ThenInclude(s => s.Class)
            .Include(c => c.Student).ThenInclude(s => s.Section)
            .Include(c => c.FeeStructure)
            .Include(c => c.Payments)
            .AsQueryable();

        // base defaulter set: unpaid / overdue / partial
        query = query.Where(c =>
            c.Status == "Unpaid" ||
            c.Status == "Overdue" ||
            c.Status == "Partial");

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(c => c.Status == status);
        }

        if (classId.HasValue && classId.Value > 0)
        {
            query = query.Where(c => c.Student.ClassId == classId.Value);
        }

        var list = await query
            .OrderByDescending(c => c.Year)
            .ThenByDescending(c => c.Month)
            .ThenByDescending(c => c.FeeChallanId)
            .ToListAsync();

        return list.Select(MapToResponse).ToList();
    }

    public async Task<int> GenerateChallansAsync(ChallanGenerateRequestDto dto)
    {
        var studentsQuery = _context.Students
            .Include(s => s.Class)
            .Where(s => s.Status != "Dropped");

        if (dto.ClassId.HasValue && dto.ClassId.Value > 0)
            studentsQuery = studentsQuery.Where(s => s.ClassId == dto.ClassId.Value);

        var students = await studentsQuery.ToListAsync();

        var feeStructures = await _context.FeeStructures
            .Include(fs => fs.Addons)
            .Where(fs => fs.AcademicSessionId == dto.AcademicSessionId && fs.IsActive)
            .ToListAsync();

        var existingChallans = await _context.FeeChallans
            .Where(c => c.Month == dto.Month && c.Year == dto.Year)
            .Select(c => c.StudentId)
            .ToListAsync();

        var existingSet = new HashSet<int>(existingChallans);
        var newChallans = new List<FeeChallan>();
        var counter = await _context.FeeChallans.CountAsync() + 1;

        foreach (var student in students)
        {
            if (existingSet.Contains(student.StudentId))
                continue;

            var structure = feeStructures.FirstOrDefault(fs => fs.ClassId == student.ClassId);
            var baseAmount = structure?.MonthlyAmount ?? 0;
            var addonsAmount = structure?.Addons.Sum(a => a.Amount) ?? 0;
            var dueDay = dto.DueDayOverride ?? structure?.DueDayOfMonth ?? 10;
            var lateFine = dto.ApplyLateFine && structure != null
                ? CalculateLateFine(structure.LateFinePerDay, dto.Month, dto.Year, dueDay)
                : 0;
            var totalAmount = baseAmount + addonsAmount - 0 + lateFine;

            newChallans.Add(new FeeChallan
            {
                ChallanNumber = $"CH-{dto.Year}{dto.Month:D2}-{counter:D5}",
                StudentId = student.StudentId,
                FeeStructureId = structure?.FeeStructureId,
                Month = dto.Month,
                Year = dto.Year,
                DueDate = new DateTime(dto.Year, dto.Month, Math.Min(dueDay, DateTime.DaysInMonth(dto.Year, dto.Month))),
                BaseAmount = baseAmount,
                AddonsAmount = addonsAmount,
                DiscountAmount = 0,
                LateFine = lateFine,
                TotalAmount = totalAmount,
                PaidAmount = 0,
                Balance = totalAmount,
                Status = "Unpaid",
                IsProRated = false,
                CreatedAt = DateTime.UtcNow
            });

            counter++;
        }

        if (newChallans.Count > 0)
        {
            _context.FeeChallans.AddRange(newChallans);
            await _context.SaveChangesAsync();
        }

        return newChallans.Count;
    }

    public async Task<FeeChallanResponseDto?> RecordPaymentAsync(int challanId, RecordPaymentRequestDto dto)
    {
        var challan = await _context.FeeChallans
            .Include(c => c.Payments)
            .FirstOrDefaultAsync(c => c.FeeChallanId == challanId);

        if (challan is null) return null;

        var payment = new FeePayment
        {
            FeeChallanId = challanId,
            Amount = dto.Amount,
            PaymentMethod = dto.PaymentMethod,
            TransactionReference = dto.TransactionReference,
            ReceivedBy = dto.ReceivedBy,
            Remarks = dto.Remarks,
            PaidAt = DateTime.UtcNow
        };

        challan.Payments.Add(payment);
        challan.PaidAmount += dto.Amount;
        challan.Balance = challan.TotalAmount - challan.PaidAmount;
        challan.Status = challan.Balance <= 0 ? "Paid" : "Partial";

        await _context.SaveChangesAsync();

        var updated = await GetEntityWithIncludes(challanId);
        return MapToResponse(updated!);
    }

    public async Task<FeeChallanResponseDto?> WaiveChallanAsync(int challanId, string reason)
    {
        var challan = await _context.FeeChallans.FindAsync(challanId);
        if (challan is null) return null;

        challan.Status = "Waived";
        challan.Balance = 0;
        challan.Remarks = reason;

        await _context.SaveChangesAsync();

        var updated = await GetEntityWithIncludes(challanId);
        return MapToResponse(updated!);
    }

    private static decimal CalculateLateFine(decimal finePerDay, int month, int year, int dueDay)
    {
        var dueDate = new DateTime(year, month, Math.Min(dueDay, DateTime.DaysInMonth(year, month)));
        var today = DateTime.UtcNow.Date;
        if (today <= dueDate) return 0;
        var daysLate = (today - dueDate).Days;
        return daysLate * finePerDay;
    }

    private async Task<FeeChallan?> GetEntityWithIncludes(int id)
    {
        return await _context.FeeChallans
            .AsNoTracking()
            .Include(c => c.Student).ThenInclude(s => s.Class)
            .Include(c => c.Student).ThenInclude(s => s.Section)
            .Include(c => c.FeeStructure)
            .Include(c => c.Payments)
            .FirstOrDefaultAsync(c => c.FeeChallanId == id);
    }

    private static FeeChallanResponseDto MapToResponse(FeeChallan c)
    {
        return new FeeChallanResponseDto
        {
            FeeChallanId = c.FeeChallanId,
            ChallanNumber = c.ChallanNumber,
            StudentId = c.StudentId,
            StudentName = c.Student?.Name,
            ClassName = c.Student?.Class?.Name,
            SectionName = c.Student?.Section?.Name,
            FeeStructureId = c.FeeStructureId,
            FeeStructureName = c.FeeStructure?.Name,
            Month = c.Month,
            Year = c.Year,
            DueDate = c.DueDate,
            BaseAmount = c.BaseAmount,
            AddonsAmount = c.AddonsAmount,
            DiscountAmount = c.DiscountAmount,
            LateFine = c.LateFine,
            TotalAmount = c.TotalAmount,
            PaidAmount = c.PaidAmount,
            Balance = c.Balance,
            Status = c.Status,
            IsProRated = c.IsProRated,
            Remarks = c.Remarks,
            CreatedAt = c.CreatedAt,
            Payments = c.Payments.Select(p => new FeePaymentResponseDto
            {
                FeePaymentId = p.FeePaymentId,
                FeeChallanId = p.FeeChallanId,
                Amount = p.Amount,
                PaymentMethod = p.PaymentMethod,
                TransactionReference = p.TransactionReference,
                ReceivedBy = p.ReceivedBy,
                Remarks = p.Remarks,
                PaidAt = p.PaidAt
            }).OrderByDescending(p => p.PaidAt).ToList()
        };
    }
}
