using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolManagementAPI.Models;

[Table("invoice")]
public class Invoice
{
    [Key]
    [Column("invoice_id")]
    public int InvoiceId { get; set; }

    [Column("student_id")]
    public int StudentId { get; set; }

    [Column("title")]
    public string Title { get; set; } = string.Empty;

    [Column("description")]
    public string? Description { get; set; }

    [Column("amount")]
    public decimal Amount { get; set; }

    [Column("amount_paid")]
    public decimal AmountPaid { get; set; }

    [Column("due")]
    public decimal Due { get; set; }

    [Column("status")]
    public string Status { get; set; } = "unpaid";

    [Column("creation_timestamp")]
    public DateTime CreationTimestamp { get; set; }

    // Navigation Properties
    [ForeignKey("StudentId")]
    public virtual Student Student { get; set; } = null!;
}

