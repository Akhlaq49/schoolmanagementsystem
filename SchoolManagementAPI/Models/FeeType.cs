using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolManagementAPI.Models;

[Table("fee_type")]
public class FeeType
{
    [Key]
    [Column("fee_type_id")]
    public int FeeTypeId { get; set; }

    [Required]
    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Column("description")]
    public string? Description { get; set; }

    [Column("is_recurring")]
    public bool IsRecurring { get; set; } = false;

    [Column("default_amount")]
    public decimal DefaultAmount { get; set; } = 0;

    [Column("created_date")]
    public DateTime CreatedDate { get; set; } = DateTime.Now;

    [Column("modified_date")]
    public DateTime ModifiedDate { get; set; } = DateTime.Now;
}
