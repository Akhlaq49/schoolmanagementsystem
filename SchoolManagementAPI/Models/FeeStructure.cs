using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolManagementAPI.Models;

[Table("fee_structure")]
public class FeeStructure
{
    [Key]
    [Column("fee_structure_id")]
    public int FeeStructureId { get; set; }

    [Required]
    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Column("class_id")]
    public int ClassId { get; set; }

    [Column("academic_session_id")]
    public int AcademicSessionId { get; set; }

    [Column("monthly_amount", TypeName = "decimal(18,2)")]
    public decimal MonthlyAmount { get; set; }

    [Column("due_day_of_month")]
    public int DueDayOfMonth { get; set; } = 10;

    [Column("late_fine_per_day", TypeName = "decimal(18,2)")]
    public decimal LateFinePerDay { get; set; }

    [Column("description")]
    public string? Description { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation Properties
    [ForeignKey("ClassId")]
    public virtual Class Class { get; set; } = null!;

    [ForeignKey("AcademicSessionId")]
    public virtual AcademicSession AcademicSession { get; set; } = null!;

    public virtual ICollection<FeeStructureAddon> Addons { get; set; } = new List<FeeStructureAddon>();
}
