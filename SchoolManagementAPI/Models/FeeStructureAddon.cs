using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolManagementAPI.Models;

[Table("fee_structure_addon")]
public class FeeStructureAddon
{
    [Key]
    [Column("fee_structure_addon_id")]
    public int FeeStructureAddonId { get; set; }

    [Column("fee_structure_id")]
    public int FeeStructureId { get; set; }

    [Column("fee_addon_id")]
    public int FeeAddonId { get; set; }

    [Column("amount", TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    // Navigation Properties
    [ForeignKey("FeeStructureId")]
    public virtual FeeStructure FeeStructure { get; set; } = null!;

    [ForeignKey("FeeAddonId")]
    public virtual FeeAddon FeeAddon { get; set; } = null!;
}
