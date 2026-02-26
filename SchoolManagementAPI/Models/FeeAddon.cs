using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolManagementAPI.Models;

[Table("fee_addon")]
public class FeeAddon
{
    [Key]
    [Column("fee_addon_id")]
    public int FeeAddonId { get; set; }

    [Required]
    [Column("name")]
    public string Name { get; set; } = string.Empty;
}
