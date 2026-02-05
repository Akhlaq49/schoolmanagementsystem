using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolManagementAPI.Models;

[Table("admin")]
public class Admin
{
    [Key]
    [Column("admin_id")]
    public int AdminId { get; set; }

    [Required]
    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [Column("email")]
    public string Email { get; set; } = string.Empty;

    [Column("phone")]
    public string? Phone { get; set; }

    [Required]
    [Column("password")]
    public string Password { get; set; } = string.Empty;

    [Column("level")]
    public string Level { get; set; } = "1";

    [Column("login_status")]
    public string LoginStatus { get; set; } = "0";
}

