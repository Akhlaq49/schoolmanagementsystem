using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolManagementAPI.Models;

[Table("fee_challan")]
public class FeeChallan
{
    [Key]
    [Column("fee_challan_id")]
    public int FeeChallanId { get; set; }

    [Required]
    [Column("challan_number")]
    public string ChallanNumber { get; set; } = string.Empty;

    [Required]
    [Column("student_id")]
    public int StudentId { get; set; }

    [Column("fee_structure_id")]
    public int? FeeStructureId { get; set; }

    [Required]
    [Column("month")]
    public int Month { get; set; }

    [Required]
    [Column("year")]
    public int Year { get; set; }

    [Required]
    [Column("due_date")]
    public DateTime DueDate { get; set; }

    [Column("base_amount", TypeName = "decimal(18,2)")]
    public decimal BaseAmount { get; set; }

    [Column("addons_amount", TypeName = "decimal(18,2)")]
    public decimal AddonsAmount { get; set; }

    [Column("discount_amount", TypeName = "decimal(18,2)")]
    public decimal DiscountAmount { get; set; }

    [Column("late_fine", TypeName = "decimal(18,2)")]
    public decimal LateFine { get; set; }

    [Column("total_amount", TypeName = "decimal(18,2)")]
    public decimal TotalAmount { get; set; }

    [Column("paid_amount", TypeName = "decimal(18,2)")]
    public decimal PaidAmount { get; set; }

    [Column("balance", TypeName = "decimal(18,2)")]
    public decimal Balance { get; set; }

    [Required]
    [Column("status")]
    public string Status { get; set; } = "Unpaid";

    [Column("is_pro_rated")]
    public bool IsProRated { get; set; }

    [Column("remarks")]
    public string? Remarks { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation Properties
    [ForeignKey("StudentId")]
    public virtual Student Student { get; set; } = null!;

    [ForeignKey("FeeStructureId")]
    public virtual FeeStructure? FeeStructure { get; set; }

    public virtual ICollection<FeePayment> Payments { get; set; } = new List<FeePayment>();
}
