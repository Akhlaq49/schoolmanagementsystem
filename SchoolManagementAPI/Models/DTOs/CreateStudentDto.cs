namespace SchoolManagementAPI.Models.DTOs;

public class CreateStudentDto
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public DateTime? Birthday { get; set; }
    public string? Sex { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public int? ClassId { get; set; }
    public int? SectionId { get; set; }
    public string? Roll { get; set; }
    public string? Session { get; set; }
    public int? FamilyId { get; set; }
    public string? SchoolRegNum { get; set; }
    public string? BFormCnic { get; set; }
    public string? Religion { get; set; }
    public string? BloodGroup { get; set; }
    public string Status { get; set; } = "Active";
    /// <summary>When FamilyId is null, use these to create a new Family</summary>
    public FamilyDto? Family { get; set; }
    public AdmissionDto? Admission { get; set; }
    public PreviousInstituteDto? PreviousInstitute { get; set; }
}

public class FamilyDto
{
    public string? FatherName { get; set; }
    public string? FatherPhone { get; set; }
    public string? FatherCnic { get; set; }
    public string? FatherOccupation { get; set; }
    public string? GuardianName { get; set; }
    public string? MotherName { get; set; }
    public string? MotherPhone { get; set; }
    public string? MotherCnic { get; set; }
    public string SmsNumber { get; set; } = string.Empty;
}

public class AdmissionDto
{
    public DateTime? AdmissionDate { get; set; }
    public decimal? Fee { get; set; }
    public string? FeeType { get; set; }
    public decimal? FeeDiscount { get; set; }
    public decimal? TransportCharges { get; set; }
}

public class PreviousInstituteDto
{
    public string? PreviousInstituteName { get; set; }
    public string? PassingClass { get; set; }
    public decimal? PassingPercentage { get; set; }
    public int? PassingYear { get; set; }
    public string? InstituteAddress { get; set; }
}

public class UpdateStudentDto
{
    public string? Name { get; set; }
    public string? Email { get; set; }
    public DateTime? Birthday { get; set; }
    public string? Sex { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public int? ClassId { get; set; }
    public int? SectionId { get; set; }
    public string? Roll { get; set; }
    public string? Session { get; set; }
    public int? FamilyId { get; set; }
    public string? SchoolRegNum { get; set; }
    public string? BFormCnic { get; set; }
    public string? Religion { get; set; }
    public string? BloodGroup { get; set; }
    public string? Status { get; set; }
    public FamilyDto? Family { get; set; }
    public AdmissionDto? Admission { get; set; }
    public PreviousInstituteDto? PreviousInstitute { get; set; }
}
