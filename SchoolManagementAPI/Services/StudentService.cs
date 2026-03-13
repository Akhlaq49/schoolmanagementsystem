using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Data;
using SchoolManagementAPI.Models;
using BCrypt.Net;
using SchoolManagementAPI.DTOs;

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
        var list = await _context.Users
            .Include(u => u.UserRoles)
            .Include(u => u.StudentProfile!)
                .ThenInclude(s => s!.Class)
            .Include(u => u.StudentProfile!)
                .ThenInclude(s => s!.Section)
            .Include(u => u.StudentProfile!)
                .ThenInclude(s => s!.Family)
            .Include(u => u.Admission)
            .Include(u => u.PreviousInstitute)
            .Where(u => u.UserRoles.Any(ur => ur.Role == UserRole.Student))
            .ToListAsync();
        return list.Select(MergeStudentProfileIntoUser).ToList();
    }

    public async Task<User?> GetStudentByIdAsync(int id)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles)
            .Include(u => u.StudentProfile!)
                .ThenInclude(s => s!.Class)
            .Include(u => u.StudentProfile!)
                .ThenInclude(s => s!.Section)
            .Include(u => u.StudentProfile!)
                .ThenInclude(s => s!.Family)
            .Include(u => u.Admission)
            .Include(u => u.PreviousInstitute)
            .Where(u => u.UserId == id && u.UserRoles.Any(ur => ur.Role == UserRole.Student))
            .FirstOrDefaultAsync();
        return user == null ? null : MergeStudentProfileIntoUser(user);
    }

    public async Task<List<User>> GetActiveStudentsAsync()
    {
        var list = await _context.Users
            .Include(u => u.UserRoles)
            .Include(u => u.StudentProfile!)
                .ThenInclude(s => s!.Class)
            .Include(u => u.StudentProfile!)
                .ThenInclude(s => s!.Section)
            .Include(u => u.StudentProfile!)
                .ThenInclude(s => s!.Family)
            .Include(u => u.Admission)
            .Include(u => u.PreviousInstitute)
            .Where(u => u.UserRoles.Any(ur => ur.Role == UserRole.Student))
            .ToListAsync();
        return list.Where(u => (u.StudentProfile?.Status ?? u.Status ?? "Active") == "Active")
            .Select(MergeStudentProfileIntoUser).ToList();
    }

    public async Task<List<User>> GetDroppedStudentsAsync()
    {
        var list = await _context.Users
            .Include(u => u.UserRoles)
            .Include(u => u.StudentProfile!)
                .ThenInclude(s => s!.Class)
            .Include(u => u.StudentProfile!)
                .ThenInclude(s => s!.Section)
            .Include(u => u.StudentProfile!)
                .ThenInclude(s => s!.Family)
            .Include(u => u.Admission)
            .Include(u => u.PreviousInstitute)
            .Where(u => u.UserRoles.Any(ur => ur.Role == UserRole.Student))
            .ToListAsync();
        return list.Where(u => (u.StudentProfile?.Status ?? u.Status) == "Dropped")
            .Select(MergeStudentProfileIntoUser).ToList();
    }

    public async Task<List<User>> SearchStudentsAsync(string term, string? status)
    {
        term = term.Trim().ToLower();
        if (string.IsNullOrWhiteSpace(term))
        {
            return new List<User>();
        }

        var query = _context.Users
            .Include(u => u.UserRoles)
            .Include(u => u.StudentProfile!)
                .ThenInclude(s => s!.Class)
            .Include(u => u.StudentProfile!)
                .ThenInclude(s => s!.Section)
            .Include(u => u.Admission)
            .Where(u => u.UserRoles.Any(ur => ur.Role == UserRole.Student));

        if (!string.IsNullOrWhiteSpace(status))
        {
            status = status.ToLower();
            query = query.Where(u =>
                (u.StudentProfile!.Status ?? "Active").ToLower() == status);
        }

        var list = await query.ToListAsync();

        return list
            .Where(u =>
            {
                var name = u.StudentProfile?.Name ?? u.Name ?? "";
                var roll = u.StudentProfile?.Roll ?? u.Roll ?? "";
                var className = u.StudentProfile?.Class?.Name ?? u.Class?.Name ?? "";
                var email = u.Email ?? "";
                return (name.Length > 0 && name.ToLower().Contains(term)) ||
                       (roll.Length > 0 && roll.ToLower().Contains(term)) ||
                       (className.Length > 0 && className.ToLower().Contains(term)) ||
                       (email.Length > 0 && email.ToLower().Contains(term));
            })
            .Select(MergeStudentProfileIntoUser)
            .ToList();
    }

    private static User MergeStudentProfileIntoUser(User user)
    {
        var s = user.StudentProfile;
        if (s != null)
        {
            user.ClassId = s.ClassId;
            user.SectionId = s.SectionId;
            user.Class = s.Class;
            user.Section = s.Section;
            user.FamilyId = s.FamilyId;
            user.Family = s.Family;
            user.Roll = s.Roll;
            user.Session = s.Session;
            user.Birthday = s.Birthday;
            user.Sex = s.Sex;
            user.SchoolRegNum = s.SchoolRegNum;
            user.BFormCnic = s.BFormCnic;
            user.Religion = s.Religion;
            user.BloodGroup = s.BloodGroup;
            user.Status = s.Status ?? user.Status;
        }
        return user;
    }

    public async Task<User> CreateStudentFromDtoAsync(CreateStudentDto dto)
    {
        int? familyId = dto.FamilyId;
        string? phone = dto.Phone;

        // If no FamilyId but Family data provided, create Family
        if (!familyId.HasValue && dto.Family != null && (dto.Family.FatherName != null || dto.Family.SmsNumber != null || dto.Family.MotherName != null))
        {
            var family = new Models.Family
            {
                FatherName = dto.Family.FatherName ?? "",
                FatherPhone = dto.Family.FatherPhone,
                FatherCnic = dto.Family.FatherCnic,
                FatherOccupation = dto.Family.FatherOccupation,
                GuardianName = dto.Family.GuardianName,
                MotherName = dto.Family.MotherName,
                MotherPhone = dto.Family.MotherPhone,
                MotherCnic = dto.Family.MotherCnic,
                SmsNumber = dto.Family.SmsNumber ?? ""
            };
            _context.Families.Add(family);
            await _context.SaveChangesAsync();
            familyId = family.FamilyId;
            phone = phone ?? dto.Family.SmsNumber;
        }

        var user = new User
        {
            Name = dto.Name,
            Email = dto.Email,
            Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Phone = phone,
            Address = dto.Address,
            LoginStatus = "0",
            UserRoles = new List<UserRoleMapping> { new() { Role = UserRole.Student } }
        };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var student = new Student
        {
            UserId = user.UserId,
            Name = dto.Name,
            Email = dto.Email,
            Phone = phone,
            Address = dto.Address,
            Password = user.Password,
            Birthday = dto.Birthday,
            Sex = dto.Sex,
            ClassId = dto.ClassId,
            SectionId = dto.SectionId,
            Roll = dto.Roll,
            Session = dto.Session,
            FamilyId = familyId,
            SchoolRegNum = dto.SchoolRegNum,
            BFormCnic = dto.BFormCnic,
            Religion = dto.Religion,
            BloodGroup = dto.BloodGroup,
            Status = dto.Status ?? "Active",
            LoginStatus = "0"
        };
        _context.Students.Add(student);
        await _context.SaveChangesAsync();

        // Create StudentAdmission
        if (dto.Admission != null && (dto.Admission.Fee.HasValue || dto.Admission.AdmissionDate.HasValue || dto.Admission.FeeType != null ||
            dto.Admission.FeeDiscount.HasValue || dto.Admission.TransportCharges.HasValue))
        {
            _context.StudentAdmissions.Add(new StudentAdmission
            {
                UserId = user.UserId,
                AdmissionDate = dto.Admission.AdmissionDate,
                Fee = dto.Admission.Fee,
                FeeType = dto.Admission.FeeType,
                FeeDiscount = dto.Admission.FeeDiscount,
                TransportCharges = dto.Admission.TransportCharges
            });
            await _context.SaveChangesAsync();
        }

        if (dto.PreviousInstitute != null && (dto.PreviousInstitute.PreviousInstituteName != null || dto.PreviousInstitute.PassingClass != null ||
            dto.PreviousInstitute.PassingYear.HasValue || dto.PreviousInstitute.InstituteAddress != null))
        {
            var spi = new StudentPreviousInstitute
            {
                UserId = user.UserId,
                PreviousInstituteName = dto.PreviousInstitute.PreviousInstituteName,
                PassingClass = dto.PreviousInstitute.PassingClass,
                PassingPercentage = dto.PreviousInstitute.PassingPercentage,
                PassingYear = dto.PreviousInstitute.PassingYear,
                InstituteAddress = dto.PreviousInstitute.InstituteAddress
            };
            _context.StudentPreviousInstitutes.Add(spi);
            await _context.SaveChangesAsync();
        }

        return await GetStudentByIdAsync(user.UserId) ?? user;
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
            .Include(u => u.Admission)
            .FirstOrDefaultAsync(u => u.UserId == id && u.UserRoles.Any(ur => ur.Role == UserRole.Student));
        if (existingStudent == null) return null;

        existingStudent.Name = student.Name;
        existingStudent.Birthday = student.Birthday;
        existingStudent.Age = student.Age;
        existingStudent.Sex = student.Sex;
        existingStudent.Email = student.Email ?? existingStudent.Email;
        existingStudent.Phone = student.Phone;
        existingStudent.Address = student.Address;
        existingStudent.ClassId = student.ClassId;
        existingStudent.SectionId = student.SectionId;
        existingStudent.ParentId = student.ParentId;
        existingStudent.Roll = student.Roll;
        existingStudent.Session = student.Session;
        existingStudent.FamilyId = student.FamilyId;
        existingStudent.SchoolRegNum = student.SchoolRegNum;
        existingStudent.BFormCnic = student.BFormCnic;
        existingStudent.Religion = student.Religion;
        existingStudent.BloodGroup = student.BloodGroup;
        existingStudent.Status = student.Status ?? existingStudent.Status;

        if (student.Admission != null)
        {
            if (existingStudent.Admission != null)
            {
                existingStudent.Admission.AdmissionDate = student.Admission.AdmissionDate;
                existingStudent.Admission.Fee = student.Admission.Fee;
                existingStudent.Admission.FeeType = student.Admission.FeeType;
                existingStudent.Admission.FeeDiscount = student.Admission.FeeDiscount;
                existingStudent.Admission.TransportCharges = student.Admission.TransportCharges;
            }
            else
            {
                _context.StudentAdmissions.Add(new StudentAdmission
                {
                    UserId = existingStudent.UserId,
                    AdmissionDate = student.Admission.AdmissionDate,
                    Fee = student.Admission.Fee,
                    FeeType = student.Admission.FeeType,
                    FeeDiscount = student.Admission.FeeDiscount,
                    TransportCharges = student.Admission.TransportCharges
                });
            }
        }

        await _context.SaveChangesAsync();
        return existingStudent;
    }

    public async Task<User?> UpdateStudentFromDtoAsync(int id, UpdateStudentDto dto)
    {
        var existing = await _context.Users
            .Include(u => u.UserRoles)
            .Include(u => u.StudentProfile)
            .Include(u => u.Admission)
            .Include(u => u.PreviousInstitute)
            .FirstOrDefaultAsync(u => u.UserId == id && u.UserRoles.Any(ur => ur.Role == UserRole.Student));
        if (existing == null) return null;

        if (dto.Name != null) existing.Name = dto.Name;
        if (dto.Email != null) existing.Email = dto.Email;
        if (dto.Phone != null) existing.Phone = dto.Phone;
        if (dto.Address != null) existing.Address = dto.Address;

        var student = existing.StudentProfile;
        if (student != null)
        {
            if (dto.Name != null) student.Name = dto.Name;
            if (dto.Email != null) student.Email = dto.Email;
            if (dto.Phone != null) student.Phone = dto.Phone;
            if (dto.Address != null) student.Address = dto.Address;
            if (dto.Birthday.HasValue) student.Birthday = dto.Birthday;
            if (dto.Sex != null) student.Sex = dto.Sex;
            if (dto.ClassId.HasValue) student.ClassId = dto.ClassId;
            if (dto.SectionId.HasValue) student.SectionId = dto.SectionId;
            if (dto.Roll != null) student.Roll = dto.Roll;
            if (dto.Session != null) student.Session = dto.Session;
            if (dto.SchoolRegNum != null) student.SchoolRegNum = dto.SchoolRegNum;
            if (dto.BFormCnic != null) student.BFormCnic = dto.BFormCnic;
            if (dto.Religion != null) student.Religion = dto.Religion;
            if (dto.BloodGroup != null) student.BloodGroup = dto.BloodGroup;
            if (dto.Status != null)
            {
                student.Status = dto.Status;
                existing.Status = dto.Status;
            }
        }
        else
        {
            if (dto.Birthday.HasValue) existing.Birthday = dto.Birthday;
            if (dto.Sex != null) existing.Sex = dto.Sex;
            if (dto.ClassId.HasValue) existing.ClassId = dto.ClassId;
            if (dto.SectionId.HasValue) existing.SectionId = dto.SectionId;
            if (dto.Roll != null) existing.Roll = dto.Roll;
            if (dto.Session != null) existing.Session = dto.Session;
            if (dto.SchoolRegNum != null) existing.SchoolRegNum = dto.SchoolRegNum;
            if (dto.BFormCnic != null) existing.BFormCnic = dto.BFormCnic;
            if (dto.Religion != null) existing.Religion = dto.Religion;
            if (dto.BloodGroup != null) existing.BloodGroup = dto.BloodGroup;
            if (dto.Status != null) existing.Status = dto.Status;
        }

        if (dto.FamilyId.HasValue)
        {
            if (student != null) student.FamilyId = dto.FamilyId;
            else existing.FamilyId = dto.FamilyId;
        }
        else if (dto.Family != null && (dto.Family.FatherName != null || dto.Family.SmsNumber != null || dto.Family.MotherName != null))
        {
            var family = new Models.Family
            {
                FatherName = dto.Family.FatherName ?? "",
                FatherPhone = dto.Family.FatherPhone,
                FatherCnic = dto.Family.FatherCnic,
                FatherOccupation = dto.Family.FatherOccupation,
                GuardianName = dto.Family.GuardianName,
                MotherName = dto.Family.MotherName,
                MotherPhone = dto.Family.MotherPhone,
                MotherCnic = dto.Family.MotherCnic,
                SmsNumber = dto.Family.SmsNumber ?? ""
            };
            _context.Families.Add(family);
            await _context.SaveChangesAsync();
            if (student != null) student.FamilyId = family.FamilyId;
            else existing.FamilyId = family.FamilyId;
        }

        // Admission
        if (dto.Admission != null)
        {
            if (existing.Admission != null)
            {
                if (dto.Admission.AdmissionDate.HasValue) existing.Admission.AdmissionDate = dto.Admission.AdmissionDate;
                if (dto.Admission.Fee.HasValue) existing.Admission.Fee = dto.Admission.Fee;
                if (dto.Admission.FeeType != null) existing.Admission.FeeType = dto.Admission.FeeType;
                if (dto.Admission.FeeDiscount.HasValue) existing.Admission.FeeDiscount = dto.Admission.FeeDiscount;
                if (dto.Admission.TransportCharges.HasValue) existing.Admission.TransportCharges = dto.Admission.TransportCharges;
            }
            else
            {
                _context.StudentAdmissions.Add(new StudentAdmission
                {
                    UserId = existing.UserId,
                    AdmissionDate = dto.Admission.AdmissionDate,
                    Fee = dto.Admission.Fee,
                    FeeType = dto.Admission.FeeType,
                    FeeDiscount = dto.Admission.FeeDiscount,
                    TransportCharges = dto.Admission.TransportCharges
                });
            }
        }

        if (dto.PreviousInstitute != null)
        {
            if (existing.PreviousInstitute != null)
            {
                existing.PreviousInstitute.PreviousInstituteName = dto.PreviousInstitute.PreviousInstituteName;
                existing.PreviousInstitute.PassingClass = dto.PreviousInstitute.PassingClass;
                existing.PreviousInstitute.PassingPercentage = dto.PreviousInstitute.PassingPercentage;
                existing.PreviousInstitute.PassingYear = dto.PreviousInstitute.PassingYear;
                existing.PreviousInstitute.InstituteAddress = dto.PreviousInstitute.InstituteAddress;
            }
            else
            {
                _context.StudentPreviousInstitutes.Add(new StudentPreviousInstitute
                {
                    UserId = existing.UserId,
                    PreviousInstituteName = dto.PreviousInstitute.PreviousInstituteName,
                    PassingClass = dto.PreviousInstitute.PassingClass,
                    PassingPercentage = dto.PreviousInstitute.PassingPercentage,
                    PassingYear = dto.PreviousInstitute.PassingYear,
                    InstituteAddress = dto.PreviousInstitute.InstituteAddress
                });
            }
        }

        await _context.SaveChangesAsync();
        return await GetStudentByIdAsync(id);
    }

    public async Task<bool> DeleteStudentAsync(int id)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles)
            .FirstOrDefaultAsync(u => u.UserId == id && u.UserRoles.Any(ur => ur.Role == UserRole.Student));
        if (user == null) return false;

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<User>> GetStudentsByClassIdAsync(int classId)
    {
        var list = await _context.Users
            .Include(u => u.UserRoles)
            .Include(u => u.StudentProfile!)
                .ThenInclude(s => s!.Class)
            .Include(u => u.StudentProfile!)
                .ThenInclude(s => s!.Section)
            .Include(u => u.StudentProfile!)
                .ThenInclude(s => s!.Family)
            .Include(u => u.Admission)
            .Include(u => u.PreviousInstitute)
            .Where(u => u.UserRoles.Any(ur => ur.Role == UserRole.Student))
            .ToListAsync();
        return list.Where(u => (u.StudentProfile?.ClassId ?? u.ClassId) == classId)
            .Select(MergeStudentProfileIntoUser).ToList();
    }
}

