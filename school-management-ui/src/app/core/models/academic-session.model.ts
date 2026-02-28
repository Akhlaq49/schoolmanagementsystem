export interface AcademicSession {
  academicSessionId?: number;
  name: string;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  isCurrent: boolean;
  isActive: boolean;
}

