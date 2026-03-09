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
