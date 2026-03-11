using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolManagementAPI.Models;

[Table("fee_discount")]
public class FeeDiscount
{
    [Key]
    [Column("fee_discount_id")]
    public int FeeDiscountId { get; set; }

    [Required]
    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Required]
    [Column("type")]
    public string Type { get; set; } = "percentage"; // percentage | fixed

    [Required]
    [Column("value", TypeName = "decimal(18,2)")]
    public decimal Value { get; set; }

    [Required]
    [Column("scope")]
    public string Scope { get; set; } = "student"; // student | family | both

    [Column("description")]
    public string? Description { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public virtual ICollection<FeeDiscountAssignment> Assignments { get; set; } = new List<FeeDiscountAssignment>();
}
