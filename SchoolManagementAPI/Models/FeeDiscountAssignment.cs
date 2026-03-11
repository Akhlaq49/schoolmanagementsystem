using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolManagementAPI.Models;

[Table("fee_discount_assignment")]
public class FeeDiscountAssignment
{
    [Key]
    [Column("fee_discount_assignment_id")]
    public int FeeDiscountAssignmentId { get; set; }

    [Required]
    [Column("fee_discount_id")]
    public int FeeDiscountId { get; set; }

    [Column("student_id")]
    public int? StudentId { get; set; }

    [Column("family_id")]
    public int? FamilyId { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("FeeDiscountId")]
    public virtual FeeDiscount FeeDiscount { get; set; } = null!;

    [ForeignKey("StudentId")]
    public virtual Student? Student { get; set; }

    [ForeignKey("FamilyId")]
    public virtual Family? Family { get; set; }
}
