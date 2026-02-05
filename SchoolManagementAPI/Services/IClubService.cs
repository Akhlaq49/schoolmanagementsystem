using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public interface IClubService
{
    Task<List<Club>> GetAllClubsAsync();
    Task<Club?> GetClubByIdAsync(int id);
    Task<Club> CreateClubAsync(Club club);
    Task<Club?> UpdateClubAsync(int id, Club club);
    Task<bool> DeleteClubAsync(int id);
}

