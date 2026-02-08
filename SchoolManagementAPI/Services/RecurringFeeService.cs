using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Data;
using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public class RecurringFeeService : IRecurringFeeService
{
    private readonly ApplicationDbContext _context;

    public RecurringFeeService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<FeeSchedule>> GetAllSchedulesAsync()
    {
        return await _context.FeeSchedules
            .Include(fs => fs.Class)
            .Include(fs => fs.Section)
            .Include(fs => fs.FeeType)
            .OrderBy(fs => fs.Class.Name)
            .ToListAsync();
    }

    public async Task<FeeSchedule?> GetScheduleByIdAsync(int id)
    {
        return await _context.FeeSchedules
            .Include(fs => fs.Class)
            .Include(fs => fs.Section)
            .Include(fs => fs.FeeType)
            .FirstOrDefaultAsync(fs => fs.ScheduleId == id);
    }

    public async Task<IEnumerable<FeeSchedule>> GetSchedulesByClassAsync(int classId)
    {
        return await _context.FeeSchedules
            .Where(fs => fs.ClassId == classId && fs.IsActive)
            .Include(fs => fs.FeeType)
            .ToListAsync();
    }

    public async Task<FeeSchedule> CreateScheduleAsync(FeeSchedule schedule)
    {
        schedule.CreatedDate = DateTime.Now;
        schedule.ModifiedDate = DateTime.Now;
        _context.FeeSchedules.Add(schedule);
        await _context.SaveChangesAsync();
        return schedule;
    }

    public async Task<FeeSchedule?> UpdateScheduleAsync(int id, FeeSchedule schedule)
    {
        var existing = await _context.FeeSchedules.FindAsync(id);
        if (existing == null) return null;

        existing.ClassId = schedule.ClassId;
        existing.SectionId = schedule.SectionId;
        existing.FeeTypeId = schedule.FeeTypeId;
        existing.Amount = schedule.Amount;
        existing.DueDay = schedule.DueDay;
        existing.RecurrenceType = schedule.RecurrenceType;
        existing.StartDate = schedule.StartDate;
        existing.EndDate = schedule.EndDate;
        existing.IsActive = schedule.IsActive;
        existing.ModifiedDate = DateTime.Now;

        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteScheduleAsync(int id)
    {
        var schedule = await _context.FeeSchedules.FindAsync(id);
        if (schedule == null) return false;

        _context.FeeSchedules.Remove(schedule);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<int> GenerateInvoicesForMonthAsync(int month, int year)
    {
        var invoicesCreated = 0;
        var activeSchedules = await _context.FeeSchedules
            .Where(fs => fs.IsActive && 
                   (fs.EndDate == null || fs.EndDate >= DateTime.Now))
            .Include(fs => fs.FeeType)
            .ToListAsync();

        foreach (var schedule in activeSchedules)
        {
            // Check if invoice already exists for this month
            var invoiceExists = await _context.Invoices.AnyAsync(inv =>
                inv.FeeTypeId == schedule.FeeTypeId &&
                inv.DueDate.HasValue &&
                inv.DueDate.Value.Month == month &&
                inv.DueDate.Value.Year == year &&
                inv.Student.ClassId == schedule.ClassId &&
                (schedule.SectionId == null || inv.Student.SectionId == schedule.SectionId));

            if (invoiceExists) continue;

            // Get all students in the class/section
            var studentsQuery = _context.Users
                .Where(u => u.UserRoles.Any(ur => ur.Role == UserRole.Student) &&
                           u.ClassId == schedule.ClassId);

            if (schedule.SectionId.HasValue)
            {
                studentsQuery = studentsQuery.Where(u => u.SectionId == schedule.SectionId);
            }

            var students = await studentsQuery.ToListAsync();

            // Generate invoices for each student
            var dueDate = new DateTime(year, month, Math.Min(schedule.DueDay, DateTime.DaysInMonth(year, month)));

            foreach (var student in students)
            {
                var invoice = new Invoice
                {
                    StudentId = student.UserId,
                    Title = schedule.FeeType.Name,
                    Description = $"{schedule.FeeType.Description} - {DateTime.Now.ToString("MMMM yyyy")}",
                    Amount = schedule.Amount,
                    AmountPaid = 0,
                    Due = schedule.Amount,
                    Status = "unpaid",
                    CreationTimestamp = DateTime.Now,
                    FeeTypeId = schedule.FeeTypeId,
                    DueDate = dueDate,
                    FineAmount = 0,
                    DiscountAmount = 0,
                    FinalAmount = schedule.Amount
                };

                _context.Invoices.Add(invoice);
                invoicesCreated++;
            }
        }

        if (invoicesCreated > 0)
        {
            await _context.SaveChangesAsync();
        }

        return invoicesCreated;
    }

    public async Task<int> GenerateInvoicesForAllAsync()
    {
        var now = DateTime.Now;
        return await GenerateInvoicesForMonthAsync(now.Month, now.Year);
    }
}
