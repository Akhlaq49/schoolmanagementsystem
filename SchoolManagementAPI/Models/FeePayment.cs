using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolManagementAPI.Models;

[Table("fee_payment")]
public class FeePayment
{
    [Key]
    [Column("fee_payment_id")]
    public int FeePaymentId { get; set; }

    [Required]
    [Column("fee_challan_id")]
    public int FeeChallanId { get; set; }

    [Column("amount", TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [Required]
    [Column("payment_method")]
    public string PaymentMethod { get; set; } = "Cash";

    [Column("transaction_reference")]
    public string? TransactionReference { get; set; }

    [Column("received_by")]
    public string? ReceivedBy { get; set; }

    [Column("remarks")]
    public string? Remarks { get; set; }

    [Column("paid_at")]
    public DateTime PaidAt { get; set; } = DateTime.UtcNow;

    // Navigation Properties
    [ForeignKey("FeeChallanId")]
    public virtual FeeChallan FeeChallan { get; set; } = null!;
}
