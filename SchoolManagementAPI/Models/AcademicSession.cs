using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolManagementAPI.Models;

[Table("academic_session")]
public class AcademicSession
{
    [Key]
    [Column("academic_session_id")]
    public int AcademicSessionId { get; set; }

    [Required]
    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Column("start_date")]
    public DateTime? StartDate { get; set; }

    [Column("end_date")]
    public DateTime? EndDate { get; set; }

    [Column("is_current")]
    public bool IsCurrent { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; } = true;
}

