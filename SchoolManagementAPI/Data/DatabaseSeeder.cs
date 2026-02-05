using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Models;
using BCrypt.Net;

namespace SchoolManagementAPI.Data;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {

        // Seed Admins
        if (!await context.UserRoleMappings.AnyAsync(urm => urm.Role == UserRole.Admin))
        {
            var admin = new User
            {
                Name = "System Administrator",
                Email = "admin@school.com",
                Phone = "1234567890",
                Password = BCrypt.Net.BCrypt.HashPassword("admin123"),
                Level = "1",
                LoginStatus = "0",
                UserRoles = new List<UserRoleMapping>
                {
                    new UserRoleMapping { Role = UserRole.Admin }
                }
            };
            context.Users.Add(admin);
            await context.SaveChangesAsync();
        }

        // Seed Departments
        if (!await context.Departments.AnyAsync())
        {
            var departments = new[]
            {
                new Department { Name = "Mathematics" },
                new Department { Name = "Science" },
                new Department { Name = "English" },
                new Department { Name = "Social Studies" },
                new Department { Name = "Physical Education" },
                new Department { Name = "Arts" }
            };
            context.Departments.AddRange(departments);
            await context.SaveChangesAsync();
        }

        // Seed Classes
        if (!await context.Classes.AnyAsync())
        {
            var classes = new[]
            {
                new Class { Name = "Grade 1", NameNumeric = "1" },
                new Class { Name = "Grade 2", NameNumeric = "2" },
                new Class { Name = "Grade 3", NameNumeric = "3" },
                new Class { Name = "Grade 4", NameNumeric = "4" },
                new Class { Name = "Grade 5", NameNumeric = "5" },
                new Class { Name = "Grade 6", NameNumeric = "6" },
                new Class { Name = "Grade 7", NameNumeric = "7" },
                new Class { Name = "Grade 8", NameNumeric = "8" },
                new Class { Name = "Grade 9", NameNumeric = "9" },
                new Class { Name = "Grade 10", NameNumeric = "10" },
                new Class { Name = "Grade 11", NameNumeric = "11" },
                new Class { Name = "Grade 12", NameNumeric = "12" }
            };
            context.Classes.AddRange(classes);
            await context.SaveChangesAsync();
        }

        // Seed Sections
        if (!await context.Sections.AnyAsync())
        {
            var classes = await context.Classes.ToListAsync();
            var sections = new List<Section>();
            
            foreach (var classItem in classes)
            {
                sections.Add(new Section { Name = "Section A", ClassId = classItem.ClassId });
                sections.Add(new Section { Name = "Section B", ClassId = classItem.ClassId });
            }
            
            context.Sections.AddRange(sections);
            await context.SaveChangesAsync();
        }

        // Seed Teachers
        if (!await context.UserRoleMappings.AnyAsync(urm => urm.Role == UserRole.Teacher))
        {
            var departments = await context.Departments.Take(6).ToListAsync();
            var teachers = new[]
            {
                new User
                {
                    Name = "John Smith",
                    Email = "john.smith@school.com",
                    Phone = "1234567891",
                    Password = BCrypt.Net.BCrypt.HashPassword("teacher123"),
                    Address = "123 Teacher Street",
                    DepartmentId = departments[0]?.DepartmentId,
                    LoginStatus = "0",
                    UserRoles = new List<UserRoleMapping>
                    {
                        new UserRoleMapping { Role = UserRole.Teacher }
                    }
                },
                new User
                {
                    Name = "Jane Doe",
                    Email = "jane.doe@school.com",
                    Phone = "1234567892",
                    Password = BCrypt.Net.BCrypt.HashPassword("teacher123"),
                    Address = "456 Teacher Avenue",
                    DepartmentId = departments[1]?.DepartmentId,
                    LoginStatus = "0",
                    UserRoles = new List<UserRoleMapping>
                    {
                        new UserRoleMapping { Role = UserRole.Teacher }
                    }
                },
                new User
                {
                    Name = "Robert Johnson",
                    Email = "robert.johnson@school.com",
                    Phone = "1234567893",
                    Password = BCrypt.Net.BCrypt.HashPassword("teacher123"),
                    Address = "789 Teacher Road",
                    DepartmentId = departments[2]?.DepartmentId,
                    LoginStatus = "0",
                    UserRoles = new List<UserRoleMapping>
                    {
                        new UserRoleMapping { Role = UserRole.Teacher }
                    }
                }
            };
            context.Users.AddRange(teachers);
            await context.SaveChangesAsync();
        }

        // Create an example user with multiple roles (Admin and Teacher)
        var adminTeacherEmail = "admin.teacher@school.com";
        if (!await context.Users.AnyAsync(u => u.Email == adminTeacherEmail))
        {
            var departments = await context.Departments.FirstOrDefaultAsync();
            var adminTeacher = new User
            {
                Name = "Admin Teacher",
                Email = adminTeacherEmail,
                Phone = "1234567898",
                Password = BCrypt.Net.BCrypt.HashPassword("adminteacher123"),
                Address = "123 Admin Teacher Street",
                DepartmentId = departments?.DepartmentId,
                Level = "1",
                LoginStatus = "0",
                UserRoles = new List<UserRoleMapping>
                {
                    new UserRoleMapping { Role = UserRole.Admin },
                    new UserRoleMapping { Role = UserRole.Teacher }
                }
            };
            context.Users.Add(adminTeacher);
            await context.SaveChangesAsync();
        }

        // Seed Subjects
        if (!await context.Subjects.AnyAsync())
        {
            var classes = await context.Classes.Take(6).ToListAsync();
            var teachers = await context.Users
                .Include(u => u.UserRoles)
                .Where(u => u.UserRoles.Any(ur => ur.Role == UserRole.Teacher))
                .ToListAsync();
            
            var subjects = new List<Subject>();
            var subjectNames = new[] { "Mathematics", "Science", "English", "Social Studies", "Physical Education", "Arts" };
            
            for (int i = 0; i < classes.Count && i < subjectNames.Length; i++)
            {
                int? teacherId = null;
                if (teachers.Count > i && teachers[i] != null)
                {
                    teacherId = teachers[i].UserId;
                }
                
                subjects.Add(new Subject
                {
                    Name = subjectNames[i],
                    ClassId = classes[i].ClassId,
                    TeacherId = teacherId
                });
            }
            
            context.Subjects.AddRange(subjects);
            await context.SaveChangesAsync();
        }

        // Seed Parents
        if (!await context.UserRoleMappings.AnyAsync(urm => urm.Role == UserRole.Parent))
        {
            var parents = new[]
            {
                new User
                {
                    Name = "Michael Brown",
                    Email = "michael.brown@email.com",
                    Phone = "1234567894",
                    Password = BCrypt.Net.BCrypt.HashPassword("parent123"),
                    Address = "123 Parent Street",
                    Profession = "Engineer",
                    LoginStatus = "0",
                    UserRoles = new List<UserRoleMapping>
                    {
                        new UserRoleMapping { Role = UserRole.Parent }
                    }
                },
                new User
                {
                    Name = "Sarah Wilson",
                    Email = "sarah.wilson@email.com",
                    Phone = "1234567895",
                    Password = BCrypt.Net.BCrypt.HashPassword("parent123"),
                    Address = "456 Parent Avenue",
                    Profession = "Doctor",
                    LoginStatus = "0",
                    UserRoles = new List<UserRoleMapping>
                    {
                        new UserRoleMapping { Role = UserRole.Parent }
                    }
                }
            };
            context.Users.AddRange(parents);
            await context.SaveChangesAsync();
        }

        // Seed Students
        if (!await context.UserRoleMappings.AnyAsync(urm => urm.Role == UserRole.Student))
        {
            var classes = await context.Classes.FirstOrDefaultAsync();
            var classId = classes?.ClassId;
            var sections = classId.HasValue 
                ? await context.Sections.Where(s => s.ClassId == classId.Value).FirstOrDefaultAsync()
                : null;
            var parents = await context.Users
                .Include(u => u.UserRoles)
                .Where(u => u.UserRoles.Any(ur => ur.Role == UserRole.Parent))
                .ToListAsync();
            
            var students = new[]
            {
                new User
                {
                    Name = "Alice Brown",
                    Email = "alice.brown@school.com",
                    Phone = "1234567896",
                    Password = BCrypt.Net.BCrypt.HashPassword("student123"),
                    Birthday = DateTime.Parse("2010-05-15"),
                    Age = 13,
                    Sex = "Female",
                    Address = "123 Student Street",
                    ClassId = classes?.ClassId,
                    SectionId = sections?.SectionId,
                    ParentId = parents.Count > 0 ? parents[0].UserId : null,
                    Roll = "001",
                    Session = "2024-2025",
                    LoginStatus = "0",
                    UserRoles = new List<UserRoleMapping>
                    {
                        new UserRoleMapping { Role = UserRole.Student }
                    }
                },
                new User
                {
                    Name = "Bob Wilson",
                    Email = "bob.wilson@school.com",
                    Phone = "1234567897",
                    Password = BCrypt.Net.BCrypt.HashPassword("student123"),
                    Birthday = DateTime.Parse("2010-08-20"),
                    Age = 13,
                    Sex = "Male",
                    Address = "456 Student Avenue",
                    ClassId = classes?.ClassId,
                    SectionId = sections?.SectionId,
                    ParentId = parents.Count > 1 ? parents[1].UserId : null,
                    Roll = "002",
                    Session = "2024-2025",
                    LoginStatus = "0",
                    UserRoles = new List<UserRoleMapping>
                    {
                        new UserRoleMapping { Role = UserRole.Student }
                    }
                }
            };
            context.Users.AddRange(students);
            await context.SaveChangesAsync();
        }

        // Seed Expense Categories
        if (!await context.ExpenseCategories.AnyAsync())
        {
            var categories = new[]
            {
                new ExpenseCategory { Name = "Salaries" },
                new ExpenseCategory { Name = "Utilities" },
                new ExpenseCategory { Name = "Maintenance" },
                new ExpenseCategory { Name = "Supplies" },
                new ExpenseCategory { Name = "Transportation" },
                new ExpenseCategory { Name = "Other" }
            };
            context.ExpenseCategories.AddRange(categories);
            await context.SaveChangesAsync();
        }

        // Seed Dormitories
        if (!await context.Dormitories.AnyAsync())
        {
            var dormitories = new[]
            {
                new Dormitory
                {
                    Name = "Boys Hostel A",
                    NumberOfRoom = 20,
                    Description = "Boys dormitory with 20 rooms"
                },
                new Dormitory
                {
                    Name = "Girls Hostel A",
                    NumberOfRoom = 20,
                    Description = "Girls dormitory with 20 rooms"
                }
            };
            context.Dormitories.AddRange(dormitories);
            await context.SaveChangesAsync();
        }

        // Seed Transports
        if (!await context.Transports.AnyAsync())
        {
            var transports = new[]
            {
                new Transport
                {
                    RouteName = "Route 1 - North Zone",
                    NumberOfVehicle = 2,
                    RouteFare = 500.00m,
                    Description = "Transport route covering north zone areas"
                },
                new Transport
                {
                    RouteName = "Route 2 - South Zone",
                    NumberOfVehicle = 2,
                    RouteFare = 500.00m,
                    Description = "Transport route covering south zone areas"
                }
            };
            context.Transports.AddRange(transports);
            await context.SaveChangesAsync();
        }

        // Seed Clubs
        if (!await context.Clubs.AnyAsync())
        {
            var clubs = new[]
            {
                new Club
                {
                    ClubName = "Science Club",
                    Description = "Science enthusiasts club",
                    Date = DateTime.Now
                },
                new Club
                {
                    ClubName = "Sports Club",
                    Description = "Sports and fitness activities",
                    Date = DateTime.Now
                },
                new Club
                {
                    ClubName = "Music Club",
                    Description = "Music and arts activities",
                    Date = DateTime.Now
                }
            };
            context.Clubs.AddRange(clubs);
            await context.SaveChangesAsync();
        }

        // Seed Noticeboards
        if (!await context.Noticeboards.AnyAsync())
        {
            var notices = new[]
            {
                new Noticeboard
                {
                    NoticeTitle = "Welcome to New Academic Year",
                    Notice = "Welcome all students and staff to the new academic year 2024-2025. We wish you all the best!",
                    CreateTimestamp = DateTime.Now
                },
                new Noticeboard
                {
                    NoticeTitle = "Parent-Teacher Meeting",
                    Notice = "Parent-Teacher meeting scheduled for next week. Please check the schedule.",
                    CreateTimestamp = DateTime.Now
                }
            };
            context.Noticeboards.AddRange(notices);
            await context.SaveChangesAsync();
        }

        // Seed Circulars
        if (!await context.Circulars.AnyAsync())
        {
            var circulars = new[]
            {
                new Circular
                {
                    Title = "School Holiday Notice",
                    Reference = "CIR-2024-001",
                    Content = "School will be closed on the following dates for holidays.",
                    Date = DateTime.Now
                },
                new Circular
                {
                    Title = "Examination Schedule",
                    Reference = "CIR-2024-002",
                    Content = "Mid-term examinations will begin next month. Please prepare accordingly.",
                    Date = DateTime.Now
                }
            };
            context.Circulars.AddRange(circulars);
            await context.SaveChangesAsync();
        }
    }
}

