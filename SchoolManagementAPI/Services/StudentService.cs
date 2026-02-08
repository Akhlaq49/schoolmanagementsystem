using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Data;
using SchoolManagementAPI.Models;
using SchoolManagementAPI.DTOs;
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

    public async Task<User> CreateStudentAsync(CreateStudentRequest request)
    {
        var student = new User
        {
            Name = request.Name,
            Email = request.Email,
            Phone = request.Phone,
            Address = request.Address,
            Birthday = request.Birthday,
            Age = request.Age,
            Sex = request.Sex,
            ClassId = request.ClassId,
            SectionId = request.SectionId,
            ParentId = request.ParentId,
            Roll = request.Roll,
            Session = request.Session,
            Password = BCrypt.Net.BCrypt.HashPassword("defaultpass123") // Generate default password
        };
        
        _context.Users.Add(student);
        
        // Add Student role
        student.UserRoles = new List<UserRoleMapping>
        {
            new UserRoleMapping { Role = UserRole.Student }
        };
        
        await _context.SaveChangesAsync();
        return student;
    }

    public async Task<User?> UpdateStudentAsync(int id, UpdateStudentRequest request)
    {
        var existingStudent = await _context.Users
            .Include(u => u.UserRoles)
            .FirstOrDefaultAsync(u => u.UserId == id && u.UserRoles.Any(ur => ur.Role == UserRole.Student));
        if (existingStudent == null) return null;

        existingStudent.Name = request.Name;
        existingStudent.Birthday = request.Birthday;
        existingStudent.Age = request.Age;
        existingStudent.Sex = request.Sex;
        existingStudent.Email = request.Email;
        existingStudent.Phone = request.Phone;
        existingStudent.Address = request.Address;
        existingStudent.ClassId = request.ClassId;
        existingStudent.SectionId = request.SectionId;
        existingStudent.ParentId = request.ParentId;
        existingStudent.Roll = request.Roll;
        existingStudent.Session = request.Session;

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

