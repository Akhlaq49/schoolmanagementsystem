using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolManagementAPI.Models;

[Table("circular")]
public class Circular
{
    [Key]
    [Column("circular_id")]
    public int CircularId { get; set; }

    [Required]
    [Column("title")]
    public string Title { get; set; } = string.Empty;

    [Column("reference")]
    public string? Reference { get; set; }

    [Column("content")]
    public string? Content { get; set; }

    [Column("date")]
    public DateTime Date { get; set; }
}

