using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolManagementAPI.Models;

[Table("fee_schedule")]
public class FeeSchedule
{
    [Key]
    [Column("schedule_id")]
    public int ScheduleId { get; set; }

    [Column("class_id")]
    public int ClassId { get; set; }

    [Column("section_id")]
    public int? SectionId { get; set; }

    [Column("fee_type_id")]
    public int FeeTypeId { get; set; }

    [Column("amount")]
    public decimal Amount { get; set; }

    [Column("due_day")]
    public int DueDay { get; set; } = 1; // Day of month when fee is due (1-31)

    [Column("recurrence_type")]
    public string RecurrenceType { get; set; } = "Monthly"; // Monthly, Quarterly, Annual

    [Column("start_date")]
    public DateTime StartDate { get; set; } = DateTime.Now;

    [Column("end_date")]
    public DateTime? EndDate { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_date")]
    public DateTime CreatedDate { get; set; } = DateTime.Now;

    [Column("modified_date")]
    public DateTime ModifiedDate { get; set; } = DateTime.Now;

    // Navigation Properties
    [ForeignKey("ClassId")]
    public virtual Class Class { get; set; } = null!;

    [ForeignKey("SectionId")]
    public virtual Section? Section { get; set; }

    [ForeignKey("FeeTypeId")]
    public virtual FeeType FeeType { get; set; } = null!;
}
