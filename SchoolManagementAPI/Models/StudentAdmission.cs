using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolManagementAPI.Models;

[Table("student_admission")]
public class StudentAdmission
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [Column("user_id")]
    public int UserId { get; set; }

    [Column("admission_date")]
    public DateTime? AdmissionDate { get; set; }

    [Column("fee")]
    public decimal? Fee { get; set; }

    [Column("fee_type")]
    public string? FeeType { get; set; }

    [Column("fee_discount")]
    public decimal? FeeDiscount { get; set; }

    [Column("transport_charges")]
    public decimal? TransportCharges { get; set; }

    [ForeignKey("UserId")]
    public virtual User? User { get; set; }
}
