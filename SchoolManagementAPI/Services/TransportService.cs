using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Data;
using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Services;

public class TransportService : ITransportService
{
    private readonly ApplicationDbContext _context;

    public TransportService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Transport>> GetAllTransportsAsync()
    {
        return await _context.Transports.ToListAsync();
    }

    public async Task<Transport?> GetTransportByIdAsync(int id)
    {
        return await _context.Transports.FindAsync(id);
    }

    public async Task<Transport> CreateTransportAsync(Transport transport)
    {
        _context.Transports.Add(transport);
        await _context.SaveChangesAsync();
        return transport;
    }

    public async Task<Transport?> UpdateTransportAsync(int id, Transport transport)
    {
        var existing = await _context.Transports.FindAsync(id);
        if (existing == null) return null;

        existing.RouteName = transport.RouteName;
        existing.NumberOfVehicle = transport.NumberOfVehicle;
        existing.Description = transport.Description;
        existing.RouteFare = transport.RouteFare;

        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteTransportAsync(int id)
    {
        var transport = await _context.Transports.FindAsync(id);
        if (transport == null) return false;

        _context.Transports.Remove(transport);
        await _context.SaveChangesAsync();
        return true;
    }
}

