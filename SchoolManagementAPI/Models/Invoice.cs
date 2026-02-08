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

    // Fee Management Fields
    [Column("fee_type_id")]
    public int? FeeTypeId { get; set; }

    [Column("due_date")]
    public DateTime? DueDate { get; set; }

    [Column("fine_amount")]
    public decimal FineAmount { get; set; } = 0;

    [Column("discount_amount")]
    public decimal DiscountAmount { get; set; } = 0;

    [Column("final_amount")]
    public decimal FinalAmount { get; set; }

    // Navigation Properties
    [ForeignKey("StudentId")]
    public virtual Student Student { get; set; } = null!;

    [ForeignKey("FeeTypeId")]
    public virtual FeeType? FeeType { get; set; }
}

