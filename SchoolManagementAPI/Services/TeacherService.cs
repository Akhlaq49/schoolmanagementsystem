using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Data;
using SchoolManagementAPI.Models;
using SchoolManagementAPI.DTOs;
using BCrypt.Net;

namespace SchoolManagementAPI.Services;

public class TeacherService : ITeacherService
{
    private readonly ApplicationDbContext _context;

    public TeacherService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<User>> GetAllTeachersAsync()
    {
        return await _context.Users
            .Include(u => u.UserRoles)
            .Where(u => u.UserRoles.Any(ur => ur.Role == UserRole.Teacher))
            .Include(t => t.Department)
            .ToListAsync();
    }

    public async Task<User?> GetTeacherByIdAsync(int id)
    {
        return await _context.Users
            .Include(u => u.UserRoles)
            .Where(u => u.UserId == id && u.UserRoles.Any(ur => ur.Role == UserRole.Teacher))
            .Include(t => t.Department)
            .FirstOrDefaultAsync();
    }

    public async Task<User> CreateTeacherAsync(CreateTeacherRequest request)
    {
        var teacher = new User
        {
            Name = request.Name,
            Email = request.Email,
            Phone = request.Phone,
            Address = request.Address,
            DepartmentId = request.DepartmentId,
            DesignationId = request.DesignationId,
            Password = BCrypt.Net.BCrypt.HashPassword("defaultpass123") // Generate default password
        };
        
        _context.Users.Add(teacher);
        
        // Add Teacher role
        teacher.UserRoles = new List<UserRoleMapping>
        {
            new UserRoleMapping { Role = UserRole.Teacher }
        };
        
        await _context.SaveChangesAsync();
        return teacher;
    }

    public async Task<User?> UpdateTeacherAsync(int id, UpdateTeacherRequest request)
    {
        var existingTeacher = await _context.Users
            .Include(u => u.UserRoles)
            .FirstOrDefaultAsync(u => u.UserId == id && u.UserRoles.Any(ur => ur.Role == UserRole.Teacher));
        if (existingTeacher == null) return null;

        existingTeacher.Name = request.Name;
        existingTeacher.Email = request.Email;
        existingTeacher.Phone = request.Phone;
        existingTeacher.Address = request.Address;
        existingTeacher.DepartmentId = request.DepartmentId;
        existingTeacher.DesignationId = request.DesignationId;

        await _context.SaveChangesAsync();
        return existingTeacher;
    }

    public async Task<bool> DeleteTeacherAsync(int id)
    {
        var teacher = await _context.Users
            .Include(u => u.UserRoles)
            .FirstOrDefaultAsync(u => u.UserId == id && u.UserRoles.Any(ur => ur.Role == UserRole.Teacher));
        if (teacher == null) return false;

        // Remove only the Teacher role, not the entire user
        var teacherRole = teacher.UserRoles.FirstOrDefault(ur => ur.Role == UserRole.Teacher);
        if (teacherRole != null)
        {
            _context.UserRoleMappings.Remove(teacherRole);
            await _context.SaveChangesAsync();
            return true;
        }
        return false;
    }
}

