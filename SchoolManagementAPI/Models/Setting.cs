using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolManagementAPI.Models;

[Table("settings")]
public class Setting
{
    [Key]
    [Column("settings_id")]
    public int SettingsId { get; set; }

    [Required]
    [Column("type")]
    public string Type { get; set; } = string.Empty;

    [Column("description")]
    public string? Description { get; set; }
}

