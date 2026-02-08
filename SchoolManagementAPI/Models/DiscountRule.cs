using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolManagementAPI.Models;

[Table("discount_rule")]
public class DiscountRule
{
    [Key]
    [Column("rule_id")]
    public int RuleId { get; set; }

    [Column("name")]
    public string Name { get; set; } = string.Empty; // e.g., "Sibling Discount", "Merit Discount"

    [Column("discount_type")]
    public string DiscountType { get; set; } = "Sibling"; // Sibling, Merit, Early, Other

    [Column("calculation_type")]
    public string CalculationType { get; set; } = "Fixed"; // Fixed or Percentage

    [Column("discount_amount")]
    public decimal DiscountAmount { get; set; } // Amount if Fixed, or percentage if Percentage

    [Column("conditions")]
    public string? Conditions { get; set; } // JSON string for complex conditions

    [Column("fee_type_id")]
    public int? FeeTypeId { get; set; } // Null means applies to all fee types

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("description")]
    public string? Description { get; set; }

    [Column("created_date")]
    public DateTime CreatedDate { get; set; } = DateTime.Now;

    [Column("modified_date")]
    public DateTime ModifiedDate { get; set; } = DateTime.Now;

    // Navigation Properties
    [ForeignKey("FeeTypeId")]
    public virtual FeeType? FeeType { get; set; }
}
