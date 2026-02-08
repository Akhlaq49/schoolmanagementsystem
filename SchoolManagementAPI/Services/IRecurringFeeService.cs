using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public interface IRecurringFeeService
{
    Task<IEnumerable<FeeSchedule>> GetAllSchedulesAsync();
    Task<FeeSchedule?> GetScheduleByIdAsync(int id);
    Task<IEnumerable<FeeSchedule>> GetSchedulesByClassAsync(int classId);
    Task<FeeSchedule> CreateScheduleAsync(FeeSchedule schedule);
    Task<FeeSchedule?> UpdateScheduleAsync(int id, FeeSchedule schedule);
    Task<bool> DeleteScheduleAsync(int id);
    Task<int> GenerateInvoicesForMonthAsync(int month, int year);
    Task<int> GenerateInvoicesForAllAsync();
}
