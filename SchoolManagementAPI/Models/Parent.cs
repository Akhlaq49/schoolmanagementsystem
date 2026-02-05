using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolManagementAPI.Models;

[Table("parent")]
public class Parent
{
    [Key]
    [Column("parent_id")]
    public int ParentId { get; set; }

    [Required]
    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [EmailAddress]
    [Column("email")]
    public string? Email { get; set; }

    [Column("phone")]
    public string? Phone { get; set; }

    [Column("address")]
    public string? Address { get; set; }

    [Column("profession")]
    public string? Profession { get; set; }

    [Required]
    [Column("password")]
    public string Password { get; set; } = string.Empty;

    [Column("login_status")]
    public string LoginStatus { get; set; } = "0";
}

