using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolManagementAPI.Models;

[Table("dormitory")]
public class Dormitory
{
    [Key]
    [Column("dormitory_id")]
    public int DormitoryId { get; set; }

    [Required]
    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Column("number_of_room")]
    public int? NumberOfRoom { get; set; }

    [Column("description")]
    public string? Description { get; set; }
}

