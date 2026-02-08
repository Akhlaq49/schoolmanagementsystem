using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolManagementAPI.Models;

[Table("fine_rule")]
public class FineRule
{
    [Key]
    [Column("rule_id")]
    public int RuleId { get; set; }

    [Column("fee_type_id")]
    public int? FeeTypeId { get; set; } // Null means applies to all fee types

    [Column("days_after_due")]
    public int DaysAfterDue { get; set; } // Number of days late before fine applies

    [Column("fine_type")]
    public string FineType { get; set; } = "Fixed"; // Fixed or Percentage

    [Column("fine_amount")]
    public decimal FineAmount { get; set; } // Amount if Fixed, or percentage if Percentage

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
