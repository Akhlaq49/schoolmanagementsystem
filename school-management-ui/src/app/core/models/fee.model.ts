import { Class } from './student.model';
import { AcademicSession } from './academic-session.model';
import { FeeAddon } from './fee-addon.model';

export interface FeeStructure {
  feeStructureId?: number;
  name: string;
  classId: number;
  academicSessionId: number;
  monthlyAmount: number;
  dueDayOfMonth: number;
  lateFinePerDay: number;
  description?: string;
  isActive: boolean;
  createdAt?: Date;

  class?: Class;
  academicSession?: AcademicSession;
  addons?: FeeStructureAddon[];
}

export interface FeeStructureAddon {
  feeStructureAddonId?: number;
  feeStructureId?: number;
  feeAddonId: number;
  amount: number;

  feeAddon?: FeeAddon;
}
