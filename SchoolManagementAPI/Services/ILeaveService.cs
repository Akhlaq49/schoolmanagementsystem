using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public interface ILeaveService
{
    Task<List<LeaveApplication>> GetByApplicantAsync(string applicantType, int applicantId);
    Task<List<LeaveApplication>> GetAllAsync(string? applicantType = null, string? status = null);
    Task<LeaveApplication?> GetByIdAsync(int id);
    Task<LeaveApplication> CreateAsync(LeaveApplication leave);
    Task<LeaveApplication?> UpdateAsync(int id, LeaveApplication leave);
    Task<LeaveApplication?> ReviewAsync(int id, string status, int? reviewerId = null, string? reviewerRemarks = null);
    Task<bool> DeleteAsync(int id);
}
