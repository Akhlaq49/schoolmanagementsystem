using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public interface INoticeboardService
{
    Task<List<Noticeboard>> GetAllNoticesAsync();
    Task<Noticeboard?> GetNoticeByIdAsync(int id);
    Task<Noticeboard> CreateNoticeAsync(Noticeboard notice);
    Task<Noticeboard?> UpdateNoticeAsync(int id, Noticeboard notice);
    Task<bool> DeleteNoticeAsync(int id);
}

