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

// ─── Fee Reports DTOs ───────────────────────────────────

public class MonthlyClassSummaryRowDto
{
    public int ClassId { get; set; }
    public string ClassName { get; set; } = string.Empty;
    public decimal Billed { get; set; }
    public decimal Collected { get; set; }
    public decimal Outstanding { get; set; }
    public decimal CollectionRate { get; set; }
}

public class MonthlySummaryReportDto
{
    public int Month { get; set; }
    public int Year { get; set; }
    public decimal TotalBilled { get; set; }
    public decimal TotalCollected { get; set; }
    public decimal TotalOutstanding { get; set; }
    public decimal CollectionRate { get; set; }
    public List<MonthlyClassSummaryRowDto> Rows { get; set; } = new();
}

public class ClassSummaryReportRowDto
{
    public int ClassId { get; set; }
    public string ClassName { get; set; } = string.Empty;
    public decimal Billed { get; set; }
    public decimal Collected { get; set; }
    public decimal Outstanding { get; set; }
    public decimal CollectionRate { get; set; }
}

public class AgingBucketDto
{
    public string Label { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public int Count { get; set; }
}

public class AgingDetailRowDto
{
    public string StudentName { get; set; } = string.Empty;
    public string ClassName { get; set; } = string.Empty;
    public string ChallanNumber { get; set; } = string.Empty;
    public DateTime DueDate { get; set; }
    public int DaysOverdue { get; set; }
    public decimal Outstanding { get; set; }
    public string Bucket { get; set; } = string.Empty;
}

public class AgingReportDto
{
    public DateTime AsOfDate { get; set; }
    public List<AgingBucketDto> Buckets { get; set; } = new();
    public List<AgingDetailRowDto> Details { get; set; } = new();
}

public class DiscountReportRowDto
{
    public string DiscountName { get; set; } = string.Empty;
    public string Scope { get; set; } = string.Empty;
    public string TargetName { get; set; } = string.Empty;
    public string ChallanNumber { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime AppliedAt { get; set; }
}

public class DiscountReportDto
{
    public decimal TotalAmount { get; set; }
    public int TargetCount { get; set; }
    public List<DiscountReportRowDto> Rows { get; set; } = new();
}

public class IncomeExpenseRowDto
{
    public string Type { get; set; } = string.Empty; // Income | Expense
    public string Category { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}

public class IncomeExpenseReportDto
{
    public DateTime Start { get; set; }
    public DateTime End { get; set; }
    public decimal Income { get; set; }
    public decimal Expense { get; set; }
    public decimal Net => Income - Expense;
    public List<IncomeExpenseRowDto> Rows { get; set; } = new();
}
