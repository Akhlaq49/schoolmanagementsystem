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

    public async Task<List<CollectionPaymentDto>> GetCollectionPaymentsAsync(DateTime? start, DateTime? end)
    {
        var query = _context.FeePayments
            .AsNoTracking()
            .Include(p => p.FeeChallan)
                .ThenInclude(c => c.Student)
            .AsQueryable();

        if (start.HasValue)
        {
            var s = start.Value.Date;
            query = query.Where(p => p.PaidAt >= s);
        }

        if (end.HasValue)
        {
            var e = end.Value.Date.AddDays(1).AddTicks(-1);
            query = query.Where(p => p.PaidAt <= e);
        }

        var list = await query
            .OrderByDescending(p => p.PaidAt)
            .ToListAsync();

        return list.Select(p => new CollectionPaymentDto
        {
            FeePaymentId = p.FeePaymentId,
            FeeChallanId = p.FeeChallanId,
            ChallanNumber = p.FeeChallan.ChallanNumber,
            StudentId = p.FeeChallan.StudentId,
            StudentName = p.FeeChallan.Student?.Name ?? string.Empty,
            Amount = p.Amount,
            PaymentMethod = p.PaymentMethod,
            TransactionReference = p.TransactionReference,
            ReceivedBy = p.ReceivedBy,
            Remarks = p.Remarks,
            PaidAt = p.PaidAt
        }).ToList();
    }

    public async Task<CollectionSummaryDto> GetCollectionSummaryAsync(DateTime? start, DateTime? end)
    {
        var payments = await GetCollectionPaymentsAsync(start, end);

        decimal cashTotal = 0;
        int cashCount = 0;
        decimal bankTotal = 0;
        int bankCount = 0;
        decimal onlineTotal = 0;
        int onlineCount = 0;
        decimal grandTotal = 0;
        int totalCount = payments.Count;

        foreach (var p in payments)
        {
            grandTotal += p.Amount;
            var method = p.PaymentMethod?.ToLowerInvariant() ?? "cash";

            if (method == "cash")
            {
                cashTotal += p.Amount;
                cashCount++;
            }
            else if (method == "bank" || method == "bank transfer" || method == "transfer")
            {
                bankTotal += p.Amount;
                bankCount++;
            }
            else if (method == "online" || method == "card" || method == "credit card" || method == "debit card")
            {
                onlineTotal += p.Amount;
                onlineCount++;
            }
        }

        return new CollectionSummaryDto
        {
            CashTotal = cashTotal,
            CashCount = cashCount,
            BankTotal = bankTotal,
            BankCount = bankCount,
            OnlineTotal = onlineTotal,
            OnlineCount = onlineCount,
            GrandTotal = grandTotal,
            TotalCount = totalCount
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

        // Load all active discount assignments with their discount details
        var discountAssignments = await _context.FeeDiscountAssignments
            .Include(a => a.FeeDiscount)
            .Where(a => a.FeeDiscount.IsActive)
            .ToListAsync();

        // Create lookup dictionaries for quick access
        var studentDiscounts = discountAssignments
            .Where(a => a.StudentId.HasValue)
            .GroupBy(a => a.StudentId!.Value)
            .ToDictionary(g => g.Key, g => g.Select(a => a.FeeDiscount).ToList());

        var familyDiscounts = discountAssignments
            .Where(a => a.FamilyId.HasValue)
            .GroupBy(a => a.FamilyId!.Value)
            .ToDictionary(g => g.Key, g => g.Select(a => a.FeeDiscount).ToList());

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

            // Calculate discount amount
            var discountAmount = CalculateDiscountAmount(
                student.StudentId,
                student.FamilyId,
                baseAmount + addonsAmount,
                studentDiscounts,
                familyDiscounts);

            var totalAmount = baseAmount + addonsAmount - discountAmount + lateFine;

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
                DiscountAmount = discountAmount,
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

    private static decimal CalculateDiscountAmount(
        int studentId,
        int? familyId,
        decimal baseAmount,
        Dictionary<int, List<FeeDiscount>> studentDiscounts,
        Dictionary<int, List<FeeDiscount>> familyDiscounts)
    {
        var applicableDiscounts = new List<FeeDiscount>();

        // Get student-level discounts
        if (studentDiscounts.TryGetValue(studentId, out var studentDiscs))
        {
            applicableDiscounts.AddRange(studentDiscs);
        }

        // Get family-level discounts
        if (familyId.HasValue && familyDiscounts.TryGetValue(familyId.Value, out var familyDiscs))
        {
            applicableDiscounts.AddRange(familyDiscs);
        }

        if (applicableDiscounts.Count == 0)
            return 0;

        // Calculate total discount amount
        // If multiple discounts, we sum them (you can change this logic if needed)
        decimal totalDiscount = 0;

        foreach (var discount in applicableDiscounts)
        {
            if (discount.Type == "percentage")
            {
                // Percentage discount: calculate percentage of base amount
                totalDiscount += baseAmount * (discount.Value / 100m);
            }
            else if (discount.Type == "fixed")
            {
                // Fixed discount: subtract fixed amount
                totalDiscount += discount.Value;
            }
        }

        // Ensure discount doesn't exceed the base amount
        return totalDiscount > baseAmount ? baseAmount : totalDiscount;
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
