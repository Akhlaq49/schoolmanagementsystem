using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public interface ITransportService
{
    Task<List<Transport>> GetAllTransportsAsync();
    Task<Transport?> GetTransportByIdAsync(int id);
    Task<Transport> CreateTransportAsync(Transport transport);
    Task<Transport?> UpdateTransportAsync(int id, Transport transport);
    Task<bool> DeleteTransportAsync(int id);
}

