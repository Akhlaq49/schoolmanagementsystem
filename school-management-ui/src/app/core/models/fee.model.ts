export interface FeeStructure {
  feeStructureId?: number;
  name: string;
  classId: number;
  className?: string;
  academicSessionId: number;
  academicSessionName?: string;
  monthlyAmount: number;
  dueDayOfMonth: number;
  lateFinePerDay: number;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  addons: FeeStructureAddon[];
}

export interface FeeStructureAddon {
  feeStructureAddonId?: number;
  feeAddonId: number;
  feeAddonName?: string;
  amount: number;
}

export interface CreateFeeStructure {
  name: string;
  classId: number;
  academicSessionId: number;
  monthlyAmount: number;
  dueDayOfMonth: number;
  lateFinePerDay: number;
  description?: string;
  isActive: boolean;
  addons: { feeAddonId: number; amount: number }[];
}

export interface UpdateFeeStructure {
  name: string;
  classId: number;
  academicSessionId: number;
  monthlyAmount: number;
  dueDayOfMonth: number;
  lateFinePerDay: number;
  description?: string;
  isActive: boolean;
  addons: { feeAddonId: number; amount: number }[];
}

// ─── Fee Challans ──────────────────────────────────────

export interface FeeChallan {
  feeChallanId: number;
  challanNumber: string;
  studentId: number;
  studentName?: string;
  className?: string;
  sectionName?: string;
  feeStructureId?: number;
  feeStructureName?: string;
  month: number;
  year: number;
  dueDate: string;
  baseAmount: number;
  addonsAmount: number;
  discountAmount: number;
  lateFine: number;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  status: string;
  isProRated: boolean;
  remarks?: string;
  createdAt: string;
  payments?: FeePayment[];
}

export interface FeePayment {
  feePaymentId: number;
  feeChallanId: number;
  amount: number;
  paymentMethod: string;
  transactionReference?: string;
  receivedBy?: string;
  remarks?: string;
  paidAt: string;
}

export interface ChallanGenerateRequest {
  month: number;
  year: number;
  classId?: number;
  academicSessionId: number;
  dueDayOverride?: number;
  applyLateFine: boolean;
}

export interface RecordPaymentRequest {
  amount: number;
  paymentMethod: string;
  transactionReference?: string;
  receivedBy?: string;
  remarks?: string;
}

export interface ChallanSummary {
  totalChallans: number;
  paidCount: number;
  unpaidCount: number;
  partialCount: number;
  overdueCount: number;
  totalAmount: number;
  collectedAmount: number;
  pendingAmount: number;
}

// ─── Collection Register ─────────────────────────────────

export interface CollectionPayment {
  feePaymentId: number;
  feeChallanId: number;
  challanNumber: string;
  studentId: number;
  studentName: string;
  amount: number;
  paymentMethod: string;
  transactionReference?: string;
  receivedBy?: string;
  remarks?: string;
  paidAt: string;
}

export interface CollectionSummary {
  cashTotal: number;
  cashCount: number;
  bankTotal: number;
  bankCount: number;
  onlineTotal: number;
  onlineCount: number;
  grandTotal: number;
  totalCount: number;
}

// ─── Fee Discounts ──────────────────────────────────────

export interface FeeDiscount {
  feeDiscountId: number;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  scope: 'student' | 'family' | 'both';
  description?: string;
  isActive: boolean;
  assignedCount: number;
  createdAt?: string;
}

export interface CreateFeeDiscount {
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  scope: 'student' | 'family' | 'both';
  description?: string;
  isActive: boolean;
}

export interface UpdateFeeDiscount {
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  scope: 'student' | 'family' | 'both';
  description?: string;
  isActive: boolean;
}

export interface FeeDiscountAssignment {
  feeDiscountAssignmentId: number;
  feeDiscountId: number;
  studentId?: number;
  studentName?: string;
  familyId?: number;
  familyDisplayName?: string;
  createdAt: string;
}

// ─── Fee Reports ─────────────────────────────────────────

export interface MonthlyClassSummaryRow {
  classId: number;
  className: string;
  billed: number;
  collected: number;
  outstanding: number;
  collectionRate: number;
}

export interface MonthlySummaryReport {
  month: number;
  year: number;
  totalBilled: number;
  totalCollected: number;
  totalOutstanding: number;
  collectionRate: number;
  rows: MonthlyClassSummaryRow[];
}

export interface ClassSummaryReportRow {
  classId: number;
  className: string;
  billed: number;
  collected: number;
  outstanding: number;
  collectionRate: number;
}

export interface AgingBucket {
  label: string;
  amount: number;
  count: number;
}

export interface AgingDetailRow {
  studentName: string;
  className: string;
  challanNumber: string;
  dueDate: string;
  daysOverdue: number;
  outstanding: number;
  bucket: string;
}

export interface AgingReport {
  asOfDate: string;
  buckets: AgingBucket[];
  details: AgingDetailRow[];
}

export interface DiscountReportRow {
  discountName: string;
  scope: string;
  targetName: string;
  challanNumber: string;
  amount: number;
  appliedAt: string;
}

export interface DiscountReport {
  totalAmount: number;
  targetCount: number;
  rows: DiscountReportRow[];
}

export interface IncomeExpenseRow {
  type: string;
  category: string;
  amount: number;
}

export interface IncomeExpenseReport {
  start: string;
  end: string;
  income: number;
  expense: number;
  net: number;
  rows: IncomeExpenseRow[];
}

// ─── Family Fee Summary ───────────────────────────────────

export interface FamilyChildFeeRow {
  studentId: number;
  studentName: string;
  className: string;
  sectionName?: string;
  outstandingAmount: number;
  lastPaymentDate?: string;
}

export interface FamilyFeeSummary {
  familyId: number;
  familyName: string;
  fatherName?: string;
  smsNumber?: string;
  combinedOutstanding: number;
  children: FamilyChildFeeRow[];
}
