namespace SchoolManagementAPI.DTOs;

// ─── Request DTOs (what the client sends) ───────────────

public class CreateFeeStructureDto
{
    public string Name { get; set; } = string.Empty;
    public int ClassId { get; set; }
    public int AcademicSessionId { get; set; }
    public decimal MonthlyAmount { get; set; }
    public int DueDayOfMonth { get; set; } = 10;
    public decimal LateFinePerDay { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public List<FeeStructureAddonDto> Addons { get; set; } = new();
}

public class UpdateFeeStructureDto
{
    public string Name { get; set; } = string.Empty;
    public int ClassId { get; set; }
    public int AcademicSessionId { get; set; }
    public decimal MonthlyAmount { get; set; }
    public int DueDayOfMonth { get; set; } = 10;
    public decimal LateFinePerDay { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public List<FeeStructureAddonDto> Addons { get; set; } = new();
}

public class FeeStructureAddonDto
{
    public int FeeAddonId { get; set; }
    public decimal Amount { get; set; }
}

// ─── Response DTOs (what the client receives) ───────────

public class FeeStructureResponseDto
{
    public int FeeStructureId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int ClassId { get; set; }
    public string? ClassName { get; set; }
    public int AcademicSessionId { get; set; }
    public string? AcademicSessionName { get; set; }
    public decimal MonthlyAmount { get; set; }
    public int DueDayOfMonth { get; set; }
    public decimal LateFinePerDay { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<FeeStructureAddonResponseDto> Addons { get; set; } = new();
}

public class FeeStructureAddonResponseDto
{
    public int FeeStructureAddonId { get; set; }
    public int FeeAddonId { get; set; }
    public string? FeeAddonName { get; set; }
    public decimal Amount { get; set; }
}
