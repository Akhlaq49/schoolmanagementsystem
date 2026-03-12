using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolManagementAPI.Models;

[Table("payment")]
public class Payment
{
    [Key]
    [Column("payment_id")]
    public int PaymentId { get; set; }

    [Column("invoice_id")]
    public int? InvoiceId { get; set; }

    [Column("amount")]
    public decimal Amount { get; set; }

    [Column("timestamp")]
    public DateTime Timestamp { get; set; }

    [Column("payment_method")]
    public string? PaymentMethod { get; set; }

    [Column("transaction_id")]
    public string? TransactionId { get; set; }

    [Column("payment_type")]
    public string? PaymentType { get; set; } // 'income' or 'expense'

    [Column("title")]
    public string? Title { get; set; }

    [Column("description")]
    public string? Description { get; set; }

    [Column("expense_category_id")]
    public int? ExpenseCategoryId { get; set; }

    [Column("method")]
    public string? Method { get; set; }

    [Column("year")]
    public string? Year { get; set; }

    [Column("student_id")]
    public int? StudentId { get; set; }

    // Navigation Properties
    [ForeignKey("InvoiceId")]
    public virtual Invoice? Invoice { get; set; }

    [ForeignKey("ExpenseCategoryId")]
    public virtual ExpenseCategory? ExpenseCategory { get; set; }
}
