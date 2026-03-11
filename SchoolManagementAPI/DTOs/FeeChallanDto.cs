namespace SchoolManagementAPI.DTOs;

// ─── Request DTOs ─────────────────────────────────────

public class ChallanGenerateRequestDto
{
    public int Month { get; set; }
    public int Year { get; set; }
    public int? ClassId { get; set; }
    public int AcademicSessionId { get; set; }
    public int? DueDayOverride { get; set; }
    public bool ApplyLateFine { get; set; }
}

public class RecordPaymentRequestDto
{
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = "Cash";
    public string? TransactionReference { get; set; }
    public string? ReceivedBy { get; set; }
    public string? Remarks { get; set; }
}

public class WaiveChallanRequestDto
{
    public string Reason { get; set; } = string.Empty;
}

// ─── Response DTOs ────────────────────────────────────

public class FeeChallanResponseDto
{
    public int FeeChallanId { get; set; }
    public string ChallanNumber { get; set; } = string.Empty;
    public int StudentId { get; set; }
    public string? StudentName { get; set; }
    public string? ClassName { get; set; }
    public string? SectionName { get; set; }
    public int? FeeStructureId { get; set; }
    public string? FeeStructureName { get; set; }
    public int Month { get; set; }
    public int Year { get; set; }
    public DateTime DueDate { get; set; }
    public decimal BaseAmount { get; set; }
    public decimal AddonsAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal LateFine { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal Balance { get; set; }
    public string Status { get; set; } = string.Empty;
    public bool IsProRated { get; set; }
    public string? Remarks { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<FeePaymentResponseDto> Payments { get; set; } = new();
}

public class FeePaymentResponseDto
{
    public int FeePaymentId { get; set; }
    public int FeeChallanId { get; set; }
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string? TransactionReference { get; set; }
    public string? ReceivedBy { get; set; }
    public string? Remarks { get; set; }
    public DateTime PaidAt { get; set; }
}

public class ChallanSummaryDto
{
    public int TotalChallans { get; set; }
    public int PaidCount { get; set; }
    public int UnpaidCount { get; set; }
    public int PartialCount { get; set; }
    public int OverdueCount { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal CollectedAmount { get; set; }
    public decimal PendingAmount { get; set; }
}

// ─── Collection Register DTOs ───────────────────────────

public class CollectionPaymentDto
{
    public int FeePaymentId { get; set; }
    public int FeeChallanId { get; set; }
    public string ChallanNumber { get; set; } = string.Empty;
    public int StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string? TransactionReference { get; set; }
    public string? ReceivedBy { get; set; }
    public string? Remarks { get; set; }
    public DateTime PaidAt { get; set; }
}

public class CollectionSummaryDto
{
    public decimal CashTotal { get; set; }
    public int CashCount { get; set; }

    public decimal BankTotal { get; set; }
    public int BankCount { get; set; }

    public decimal OnlineTotal { get; set; }
    public int OnlineCount { get; set; }

    public decimal GrandTotal { get; set; }
    public int TotalCount { get; set; }
}
