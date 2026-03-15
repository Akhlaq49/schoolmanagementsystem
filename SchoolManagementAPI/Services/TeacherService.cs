using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Data;
using SchoolManagementAPI.Models;
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
            .ToListAsync();
    }

    public async Task<User?> GetTeacherByIdAsync(int id)
    {
        return await _context.Users
            .Include(u => u.UserRoles)
            .Where(u => u.UserId == id && u.UserRoles.Any(ur => ur.Role == UserRole.Teacher))
            .FirstOrDefaultAsync();
    }

    public async Task<User> CreateTeacherAsync(User teacher)
    {
        // Hash password if it's not already hashed (check if it looks like a BCrypt hash)
        if (!string.IsNullOrEmpty(teacher.Password) && !teacher.Password.StartsWith("$2"))
        {
            teacher.Password = BCrypt.Net.BCrypt.HashPassword(teacher.Password);
        }
        
        _context.Users.Add(teacher);
        
        // Add Teacher role if not already present
        if (teacher.UserRoles == null)
        {
            teacher.UserRoles = new List<UserRoleMapping>();
        }
        if (!teacher.UserRoles.Any(ur => ur.Role == UserRole.Teacher))
        {
            teacher.UserRoles.Add(new UserRoleMapping { Role = UserRole.Teacher });
        }
        
        await _context.SaveChangesAsync();
        return teacher;
    }

    public async Task<User?> UpdateTeacherAsync(int id, User teacher)
    {
        var existingTeacher = await _context.Users
            .Include(u => u.UserRoles)
            .FirstOrDefaultAsync(u => u.UserId == id && u.UserRoles.Any(ur => ur.Role == UserRole.Teacher));
        if (existingTeacher == null) return null;

        existingTeacher.Name = teacher.Name;
        existingTeacher.Email = teacher.Email;
        existingTeacher.Phone = teacher.Phone;
        existingTeacher.Address = teacher.Address;
        existingTeacher.DepartmentId = teacher.DepartmentId;
        existingTeacher.DesignationId = teacher.DesignationId;

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

