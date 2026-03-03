using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolManagementAPI.Models;

[Table("family")]
public class Family
{
    [Key]
    [Column("family_id")]
    public int FamilyId { get; set; }

    [Required]
    [Column("father_name")]
    public string FatherName { get; set; } = string.Empty;

    [Column("father_phone")]
    public string? FatherPhone { get; set; }

    [Column("father_cnic")]
    public string? FatherCnic { get; set; }

    [Column("father_occupation")]
    public string? FatherOccupation { get; set; }

    [Column("guardian_name")]
    public string? GuardianName { get; set; }

    [Column("mother_name")]
    public string? MotherName { get; set; }

    [Column("mother_phone")]
    public string? MotherPhone { get; set; }

    [Column("mother_cnic")]
    public string? MotherCnic { get; set; }

    [Required]
    [Column("sms_number")]
    public string SmsNumber { get; set; } = string.Empty;
}

