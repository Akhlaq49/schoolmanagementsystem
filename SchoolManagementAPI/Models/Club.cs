using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolManagementAPI.Models;

[Table("club")]
public class Club
{
    [Key]
    [Column("club_id")]
    public int ClubId { get; set; }

    [Required]
    [Column("club_name")]
    public string ClubName { get; set; } = string.Empty;

    [Column("desc")]
    public string? Description { get; set; }

    [Column("date")]
    public DateTime? Date { get; set; }
}

