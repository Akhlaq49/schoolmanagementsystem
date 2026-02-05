using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolManagementAPI.Models;

[Table("class")]
public class Class
{
    [Key]
    [Column("class_id")]
    public int ClassId { get; set; }

    [Required]
    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Column("name_numeric")]
    public string? NameNumeric { get; set; }

    [Column("teacher_id")]
    public int? TeacherId { get; set; }
}

