using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public interface ICircularService
{
    Task<List<Circular>> GetAllCircularsAsync();
    Task<Circular?> GetCircularByIdAsync(int id);
    Task<Circular> CreateCircularAsync(Circular circular);
    Task<Circular?> UpdateCircularAsync(int id, Circular circular);
    Task<bool> DeleteCircularAsync(int id);
}

