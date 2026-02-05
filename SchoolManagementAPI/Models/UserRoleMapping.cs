using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SchoolManagementAPI.Models;

[Table("user_role_mappings")]
public class UserRoleMapping
{
    [Key]
    [Column("user_role_mapping_id")]
    public int UserRoleMappingId { get; set; }

    [Required]
    [Column("user_id")]
    public int UserId { get; set; }

    [Required]
    [Column("role")]
    public UserRole Role { get; set; }

    // Navigation Properties
    [ForeignKey("UserId")]
    [JsonIgnore] // Prevent circular reference in JSON serialization
    public virtual User User { get; set; } = null!;
}

