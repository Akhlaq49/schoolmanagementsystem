using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    // User Table (unified)
    public DbSet<User> Users { get; set; }
    public DbSet<UserRoleMapping> UserRoleMappings { get; set; }
    public DbSet<Parent> Parents { get; set; }

    // Academic Tables
    public DbSet<Class> Classes { get; set; }
    public DbSet<Section> Sections { get; set; }
    public DbSet<Subject> Subjects { get; set; }
    public DbSet<AcademicSyllabus> AcademicSyllabi { get; set; }

    // Attendance
    public DbSet<Attendance> Attendances { get; set; }

    // Exam & Marks
    public DbSet<Exam> Exams { get; set; }
    public DbSet<ExamQuestion> ExamQuestions { get; set; }
    public DbSet<Mark> Marks { get; set; }
    public DbSet<QuestionBank> QuestionBanks { get; set; }

    // Payment
    public DbSet<Invoice> Invoices { get; set; }
    public DbSet<Payment> Payments { get; set; }

    // Assignment & Study Material
    public DbSet<Assignment> Assignments { get; set; }
    public DbSet<StudyMaterial> StudyMaterials { get; set; }

    // Other Tables
    public DbSet<Noticeboard> Noticeboards { get; set; }
    public DbSet<Club> Clubs { get; set; }
    public DbSet<Circular> Circulars { get; set; }
    public DbSet<Department> Departments { get; set; }
    public DbSet<Dormitory> Dormitories { get; set; }
    public DbSet<Transport> Transports { get; set; }
    public DbSet<Setting> Settings { get; set; }
    public DbSet<ExpenseCategory> ExpenseCategories { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure relationships and constraints
        modelBuilder.Entity<User>()
            .HasOne(u => u.Class)
            .WithMany()
            .HasForeignKey(u => u.ClassId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<User>()
            .HasOne(u => u.Section)
            .WithMany()
            .HasForeignKey(u => u.SectionId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<User>()
            .HasOne(u => u.Parent)
            .WithMany()
            .HasForeignKey(u => u.ParentId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<User>()
            .HasOne(u => u.Department)
            .WithMany()
            .HasForeignKey(u => u.DepartmentId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure UserRoleMapping
        modelBuilder.Entity<UserRoleMapping>()
            .HasOne(urm => urm.User)
            .WithMany(u => u.UserRoles)
            .HasForeignKey(urm => urm.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserRoleMapping>()
            .Property(urm => urm.Role)
            .HasConversion<int>();

        // Create unique index to prevent duplicate role assignments
        modelBuilder.Entity<UserRoleMapping>()
            .HasIndex(urm => new { urm.UserId, urm.Role })
            .IsUnique();

        modelBuilder.Entity<Subject>()
            .HasOne(s => s.Class)
            .WithMany()
            .HasForeignKey(s => s.ClassId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Section>()
            .HasOne(s => s.Class)
            .WithMany()
            .HasForeignKey(s => s.ClassId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<QuestionBank>()
            .HasOne(q => q.Subject)
            .WithMany()
            .HasForeignKey(q => q.SubjectId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<QuestionBank>()
            .HasOne(q => q.Class)
            .WithMany()
            .HasForeignKey(q => q.ClassId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<QuestionBank>()
            .HasOne(q => q.Teacher)
            .WithMany()
            .HasForeignKey(q => q.TeacherId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
