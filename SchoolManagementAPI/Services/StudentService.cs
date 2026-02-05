using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Data;
using SchoolManagementAPI.Models;
using BCrypt.Net;

namespace SchoolManagementAPI.Services;

public class StudentService : IStudentService
{
    private readonly ApplicationDbContext _context;

    public StudentService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<User>> GetAllStudentsAsync()
    {
        return await _context.Users
            .Include(u => u.UserRoles)
            .Where(u => u.UserRoles.Any(ur => ur.Role == UserRole.Student))
            .Include(s => s.Class)
            .Include(s => s.Section)
            .Include(s => s.Parent)
            .ToListAsync();
    }

    public async Task<User?> GetStudentByIdAsync(int id)
    {
        return await _context.Users
            .Include(u => u.UserRoles)
            .Where(u => u.UserId == id && u.UserRoles.Any(ur => ur.Role == UserRole.Student))
            .Include(s => s.Class)
            .Include(s => s.Section)
            .Include(s => s.Parent)
            .FirstOrDefaultAsync();
    }

    public async Task<User> CreateStudentAsync(User student)
    {
        // Hash password if it's not already hashed (check if it looks like a BCrypt hash)
        if (!string.IsNullOrEmpty(student.Password) && !student.Password.StartsWith("$2"))
        {
            student.Password = BCrypt.Net.BCrypt.HashPassword(student.Password);
        }
        
        _context.Users.Add(student);
        
        // Add Student role if not already present
        if (student.UserRoles == null)
        {
            student.UserRoles = new List<UserRoleMapping>();
        }
        if (!student.UserRoles.Any(ur => ur.Role == UserRole.Student))
        {
            student.UserRoles.Add(new UserRoleMapping { Role = UserRole.Student });
        }
        
        await _context.SaveChangesAsync();
        return student;
    }

    public async Task<User?> UpdateStudentAsync(int id, User student)
    {
        var existingStudent = await _context.Users
            .Include(u => u.UserRoles)
            .FirstOrDefaultAsync(u => u.UserId == id && u.UserRoles.Any(ur => ur.Role == UserRole.Student));
        if (existingStudent == null) return null;

        existingStudent.Name = student.Name;
        existingStudent.Birthday = student.Birthday;
        existingStudent.Age = student.Age;
        existingStudent.Sex = student.Sex;
        existingStudent.Email = student.Email;
        existingStudent.Phone = student.Phone;
        existingStudent.Address = student.Address;
        existingStudent.ClassId = student.ClassId;
        existingStudent.SectionId = student.SectionId;
        existingStudent.ParentId = student.ParentId;
        existingStudent.Roll = student.Roll;
        existingStudent.Session = student.Session;

        await _context.SaveChangesAsync();
        return existingStudent;
    }

    public async Task<bool> DeleteStudentAsync(int id)
    {
        var student = await _context.Users
            .Include(u => u.UserRoles)
            .FirstOrDefaultAsync(u => u.UserId == id && u.UserRoles.Any(ur => ur.Role == UserRole.Student));
        if (student == null) return false;

        // Remove only the Student role, not the entire user
        var studentRole = student.UserRoles.FirstOrDefault(ur => ur.Role == UserRole.Student);
        if (studentRole != null)
        {
            _context.UserRoleMappings.Remove(studentRole);
            await _context.SaveChangesAsync();
            return true;
        }
        return false;
    }

    public async Task<List<User>> GetStudentsByClassIdAsync(int classId)
    {
        return await _context.Users
            .Include(u => u.UserRoles)
            .Where(u => u.UserRoles.Any(ur => ur.Role == UserRole.Student) && u.ClassId == classId)
            .Include(s => s.Section)
            .Include(s => s.Parent)
            .ToListAsync();
    }
}

