namespace SchoolManagementAPI.DTOs;

public class CreateFeeDiscountDto
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = "percentage";
    public decimal Value { get; set; }
    public string Scope { get; set; } = "student";
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateFeeDiscountDto
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = "percentage";
    public decimal Value { get; set; }
    public string Scope { get; set; } = "student";
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
}

public class FeeDiscountResponseDto
{
    public int FeeDiscountId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public decimal Value { get; set; }
    public string Scope { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public int AssignedCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class FeeDiscountAssignmentResponseDto
{
    public int FeeDiscountAssignmentId { get; set; }
    public int FeeDiscountId { get; set; }
    public int? StudentId { get; set; }
    public string? StudentName { get; set; }
    public int? FamilyId { get; set; }
    public string? FamilyDisplayName { get; set; }
    public DateTime CreatedAt { get; set; }
}
