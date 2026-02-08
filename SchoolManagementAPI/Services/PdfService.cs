using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using SchoolManagementAPI.Data;

namespace SchoolManagementAPI.Services;

public class PdfService : IPdfService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<PdfService> _logger;

    static PdfService()
    {
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public PdfService(ApplicationDbContext context, ILogger<PdfService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<byte[]> GenerateFeeReceiptAsync(int invoiceId)
    {
        var invoice = await _context.Invoices
            .Include(i => i.FeeType)
            .FirstOrDefaultAsync(i => i.InvoiceId == invoiceId);

        if (invoice == null)
        {
            throw new InvalidOperationException($"Invoice {invoiceId} not found.");
        }

        var student = await _context.Users
            .Include(u => u.Class)
            .Include(u => u.Section)
            .FirstOrDefaultAsync(u => u.UserId == invoice.StudentId);

        var issuedAt = DateTime.Now;

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(40);
                page.DefaultTextStyle(x => x.FontSize(12));

                page.Header().Column(header =>
                {
                    header.Item().Text("Fee Receipt").FontSize(20).SemiBold();
                    header.Item().Text("School Management System").FontSize(10).FontColor(Colors.Grey.Darken1);
                });

                page.Content().Column(column =>
                {
                    column.Spacing(6);
                    column.Item().Text($"Receipt No: {invoice.InvoiceId}");
                    column.Item().Text($"Issued: {issuedAt:yyyy-MM-dd HH:mm}");

                    column.Item().LineHorizontal(1);

                    column.Item().Text("Student Details").SemiBold();
                    column.Item().Text($"Name: {student?.Name ?? "N/A"}");
                    column.Item().Text($"Class: {student?.Class?.Name ?? "N/A"}");
                    column.Item().Text($"Section: {student?.Section?.Name ?? "N/A"}");
                    column.Item().Text($"Roll: {student?.Roll ?? "N/A"}");

                    column.Item().LineHorizontal(1);

                    column.Item().Text("Fee Details").SemiBold();
                    column.Item().Text($"Title: {invoice.Title}");
                    column.Item().Text($"Type: {invoice.FeeType?.Name ?? "N/A"}");
                    column.Item().Text($"Amount: {invoice.Amount:0.00}");
                    column.Item().Text($"Fine: {invoice.FineAmount:0.00}");
                    column.Item().Text($"Discount: {invoice.DiscountAmount:0.00}");
                    column.Item().Text($"Final Amount: {invoice.FinalAmount:0.00}");
                    column.Item().Text($"Paid: {invoice.AmountPaid:0.00}");
                    column.Item().Text($"Due: {invoice.Due:0.00}");
                    column.Item().Text($"Status: {invoice.Status}");
                });

                page.Footer().AlignCenter().Text(text =>
                {
                    text.Span("Generated on ");
                    text.Span($"{issuedAt:yyyy-MM-dd}");
                });
            });
        }).GeneratePdf();
    }

    public async Task<byte[]> GenerateResultCardAsync(int studentId, int examId)
    {
        var student = await _context.Users
            .Include(u => u.Class)
            .Include(u => u.Section)
            .FirstOrDefaultAsync(u => u.UserId == studentId);

        if (student == null)
        {
            throw new InvalidOperationException($"Student {studentId} not found.");
        }

        var exam = await _context.Exams.FirstOrDefaultAsync(e => e.ExamId == examId);
        if (exam == null)
        {
            throw new InvalidOperationException($"Exam {examId} not found.");
        }

        var result = await _context.StudentResults
            .FirstOrDefaultAsync(sr => sr.StudentId == studentId && sr.ExamId == examId);

        var marks = await _context.Marks
            .Include(m => m.Subject)
            .Where(m => m.StudentId == studentId && m.ExamId == examId)
            .ToListAsync();

        decimal totalMarks = result?.TotalMarks ?? 0;
        decimal obtainedMarks = result?.ObtainedMarks ?? 0;
        decimal percentage = result?.Percentage ?? 0;
        decimal gpa = result?.GPA ?? 0;
        string grade = result?.Grade ?? "N/A";
        int position = result?.Position ?? 0;

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(40);
                page.DefaultTextStyle(x => x.FontSize(12));

                page.Header().Column(header =>
                {
                    header.Item().Text("Result Card").FontSize(20).SemiBold();
                    header.Item().Text($"Exam: {exam.Name}").FontSize(10).FontColor(Colors.Grey.Darken1);
                });

                page.Content().Column(column =>
                {
                    column.Spacing(6);
                    column.Item().Text("Student Details").SemiBold();
                    column.Item().Text($"Name: {student.Name}");
                    column.Item().Text($"Class: {student.Class?.Name ?? "N/A"}");
                    column.Item().Text($"Section: {student.Section?.Name ?? "N/A"}");
                    column.Item().Text($"Roll: {student.Roll ?? "N/A"}");

                    column.Item().LineHorizontal(1);

                    column.Item().Text("Marks").SemiBold();
                    column.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn(4);
                            columns.RelativeColumn(2);
                            columns.RelativeColumn(2);
                            columns.RelativeColumn(2);
                        });

                        table.Header(header =>
                        {
                            header.Cell().Text("Subject").SemiBold();
                            header.Cell().AlignRight().Text("Classwork").SemiBold();
                            header.Cell().AlignRight().Text("Exam").SemiBold();
                            header.Cell().AlignRight().Text("Total").SemiBold();
                        });

                        foreach (var mark in marks)
                        {
                            decimal classwork = (mark.ClassScore1 ?? 0) + (mark.ClassScore2 ?? 0) + (mark.ClassScore3 ?? 0);
                            decimal examScore = mark.ExamScore ?? 0;
                            decimal total = classwork + examScore;

                            table.Cell().Text(mark.Subject?.Name ?? "N/A");
                            table.Cell().AlignRight().Text($"{classwork:0.##}");
                            table.Cell().AlignRight().Text($"{examScore:0.##}");
                            table.Cell().AlignRight().Text($"{total:0.##}");
                        }
                    });

                    column.Item().LineHorizontal(1);

                    column.Item().Text("Summary").SemiBold();
                    column.Item().Text($"Total Marks: {totalMarks:0.##}");
                    column.Item().Text($"Obtained Marks: {obtainedMarks:0.##}");
                    column.Item().Text($"Percentage: {percentage:0.##}%");
                    column.Item().Text($"GPA: {gpa:0.##}");
                    column.Item().Text($"Grade: {grade}");
                    column.Item().Text($"Position: {position}");
                });
            });
        }).GeneratePdf();
    }

    public async Task<byte[]> GenerateAttendanceReportAsync(int classId, DateTime startDate, DateTime endDate)
    {
        var classEntity = await _context.Classes.FirstOrDefaultAsync(c => c.ClassId == classId);
        if (classEntity == null)
        {
            throw new InvalidOperationException($"Class {classId} not found.");
        }

        var attendanceEntries = await _context.Attendances
            .Include(a => a.Student)
                .ThenInclude(s => s.Class)
            .Include(a => a.Student)
                .ThenInclude(s => s.Section)
            .Where(a => a.Student.ClassId == classId && a.Date >= startDate && a.Date <= endDate)
            .ToListAsync();

        var grouped = attendanceEntries
            .GroupBy(a => a.StudentId)
            .Select(g => new
            {
                Student = g.First().Student,
                Present = g.Count(a => a.Status == 1),
                Absent = g.Count(a => a.Status == 2),
                Holiday = g.Count(a => a.Status == 3),
                HalfDay = g.Count(a => a.Status == 4),
                Late = g.Count(a => a.Status == 5),
                Total = g.Count(a => a.Status != 3)
            })
            .OrderBy(s => s.Student.Name)
            .ToList();

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(40);
                page.DefaultTextStyle(x => x.FontSize(11));

                page.Header().Column(header =>
                {
                    header.Item().Text("Attendance Report").FontSize(20).SemiBold();
                    header.Item().Text($"Class: {classEntity.Name}").FontSize(10).FontColor(Colors.Grey.Darken1);
                    header.Item().Text($"Period: {startDate:yyyy-MM-dd} to {endDate:yyyy-MM-dd}").FontSize(10).FontColor(Colors.Grey.Darken1);
                });

                page.Content().Column(column =>
                {
                    column.Spacing(6);

                    column.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn(4);
                            columns.RelativeColumn(2);
                            columns.RelativeColumn(2);
                            columns.RelativeColumn(2);
                            columns.RelativeColumn(2);
                            columns.RelativeColumn(2);
                            columns.RelativeColumn(2);
                        });

                        table.Header(header =>
                        {
                            header.Cell().Text("Student").SemiBold();
                            header.Cell().AlignRight().Text("Roll").SemiBold();
                            header.Cell().AlignRight().Text("Present").SemiBold();
                            header.Cell().AlignRight().Text("Absent").SemiBold();
                            header.Cell().AlignRight().Text("Late").SemiBold();
                            header.Cell().AlignRight().Text("Half Day").SemiBold();
                            header.Cell().AlignRight().Text("Total").SemiBold();
                        });

                        foreach (var item in grouped)
                        {
                            table.Cell().Text(item.Student?.Name ?? "N/A");
                            table.Cell().AlignRight().Text(item.Student?.Roll ?? "N/A");
                            table.Cell().AlignRight().Text(item.Present.ToString());
                            table.Cell().AlignRight().Text(item.Absent.ToString());
                            table.Cell().AlignRight().Text(item.Late.ToString());
                            table.Cell().AlignRight().Text(item.HalfDay.ToString());
                            table.Cell().AlignRight().Text(item.Total.ToString());
                        }
                    });
                });
            });
        }).GeneratePdf();
    }

    public async Task<byte[]> GenerateStudentIdCardAsync(int studentId)
    {
        var student = await _context.Users
            .Include(u => u.Class)
            .Include(u => u.Section)
            .FirstOrDefaultAsync(u => u.UserId == studentId);

        if (student == null)
        {
            throw new InvalidOperationException($"Student {studentId} not found.");
        }

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A7);
                page.Margin(16);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Content().Column(column =>
                {
                    column.Spacing(4);
                    column.Item().Text("School Management System").SemiBold().FontSize(12);
                    column.Item().Text("Student ID Card").FontSize(9).FontColor(Colors.Grey.Darken1);
                    column.Item().LineHorizontal(1);

                    column.Item().Text($"Name: {student.Name}");
                    column.Item().Text($"Class: {student.Class?.Name ?? "N/A"}");
                    column.Item().Text($"Section: {student.Section?.Name ?? "N/A"}");
                    column.Item().Text($"Roll: {student.Roll ?? "N/A"}");
                    column.Item().Text($"Email: {student.Email ?? "N/A"}");
                    column.Item().Text($"Phone: {student.Phone ?? "N/A"}");

                    column.Item().LineHorizontal(1);
                    column.Item().Text("Valid for current academic year").FontSize(8).FontColor(Colors.Grey.Darken1);
                });
            });
        }).GeneratePdf();
    }
}
