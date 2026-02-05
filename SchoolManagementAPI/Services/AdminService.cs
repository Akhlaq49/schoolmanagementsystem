using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Data;
using SchoolManagementAPI.Models;
using BCrypt.Net;

namespace SchoolManagementAPI.Services;

public class AdminService : IAdminService
{
    private readonly ApplicationDbContext _context;

    public AdminService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<User>> GetAllAdminsAsync()
    {
        return await _context.Users
            .Include(u => u.UserRoles)
            .Where(u => u.UserRoles.Any(ur => ur.Role == UserRole.Admin))
            .ToListAsync();
    }

    public async Task<User?> GetAdminByIdAsync(int id)
    {
        return await _context.Users
            .Include(u => u.UserRoles)
            .FirstOrDefaultAsync(u => u.UserId == id && u.UserRoles.Any(ur => ur.Role == UserRole.Admin));
    }

    public async Task<User> CreateAdminAsync(User admin)
    {
        // Hash password if it's not already hashed (check if it looks like a BCrypt hash)
        if (!string.IsNullOrEmpty(admin.Password) && !admin.Password.StartsWith("$2"))
        {
            admin.Password = BCrypt.Net.BCrypt.HashPassword(admin.Password);
        }
        
        _context.Users.Add(admin);
        
        // Add Admin role if not already present
        if (admin.UserRoles == null)
        {
            admin.UserRoles = new List<UserRoleMapping>();
        }
        if (!admin.UserRoles.Any(ur => ur.Role == UserRole.Admin))
        {
            admin.UserRoles.Add(new UserRoleMapping { Role = UserRole.Admin });
        }
        
        await _context.SaveChangesAsync();
        return admin;
    }

    // Helper method to add Admin role to an existing user
    public async Task<bool> AddAdminRoleAsync(int userId)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles)
            .FirstOrDefaultAsync(u => u.UserId == userId);
        
        if (user == null) return false;
        
        if (!user.UserRoles.Any(ur => ur.Role == UserRole.Admin))
        {
            user.UserRoles.Add(new UserRoleMapping { Role = UserRole.Admin });
            await _context.SaveChangesAsync();
            return true;
        }
        return false;
    }

    public async Task<User?> UpdateAdminAsync(int id, User admin)
    {
        var existingAdmin = await _context.Users
            .Include(u => u.UserRoles)
            .FirstOrDefaultAsync(u => u.UserId == id && u.UserRoles.Any(ur => ur.Role == UserRole.Admin));
        if (existingAdmin == null) return null;

        existingAdmin.Name = admin.Name;
        existingAdmin.Email = admin.Email;
        existingAdmin.Phone = admin.Phone;
        existingAdmin.Level = admin.Level;

        await _context.SaveChangesAsync();
        return existingAdmin;
    }

    public async Task<bool> DeleteAdminAsync(int id)
    {
        var admin = await _context.Users
            .Include(u => u.UserRoles)
            .FirstOrDefaultAsync(u => u.UserId == id && u.UserRoles.Any(ur => ur.Role == UserRole.Admin));
        if (admin == null) return false;

        // Remove only the Admin role, not the entire user
        var adminRole = admin.UserRoles.FirstOrDefault(ur => ur.Role == UserRole.Admin);
        if (adminRole != null)
        {
            _context.UserRoleMappings.Remove(adminRole);
            await _context.SaveChangesAsync();
            return true;
        }
        return false;
    }
}

