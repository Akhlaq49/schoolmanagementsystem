import { Student } from './student.model';

/** Status codes: 0=Not Marked, 1=PP, 2=PO, 3=Absent, 4=SL, 5=FL, 6=Holiday, 7=Late */
export interface Attendance {
  attendanceId: number;
  status: number;
  studentId?: number;
  teacherId?: number;
  date: Date | string;
  session?: string;
  timeIn?: string;
  timeOut?: string;
  markedBy?: string;
  markedAt?: string;
  isAutoMarked?: boolean;
  leaveReason?: string;
  remarks?: string;
  classId?: number;
  sectionId?: number;
  className?: string;
  sectionName?: string;
  student?: Student;
}

/// <summary>Admin: staff attendance row (one per staff member).</summary>
export interface StaffAttendance {
  staffId: number;
  name: string;
  department: string;
  status: number; // 0=Not Marked, 1=PP, 2=PO, 3=Absent
  timeIn: string;  // HH:mm (empty if not set)
  timeOut: string; // HH:mm (empty if not set)
}

export interface StaffAttendanceBulkRecord {
  staffId: number;
  status: number;
  timeIn?: string | null;
  timeOut?: string | null;
}

export interface StaffAttendanceBulkRequest {
  date: string;
  records: StaffAttendanceBulkRecord[];
}

export interface StaffAttendanceHistory {
  date: string; // yyyy-MM-dd
  status: string; // PP/PO/A/Not Marked
  timeIn: string; // HH:mm
  timeOut: string; // HH:mm
}

/** One row from admin class attendance sheet API (student + attendance for a date). */
export interface ClassAttendanceSheetItem {
  studentId: number;
  studentName: string;
  rollNumber?: string;
  classId?: number;
  sectionId?: number;
  className?: string;
  sectionName?: string;
  attendanceId?: number;
  status: number;
  timeIn?: string;
  timeOut?: string;
  remarks?: string;
  leaveReason?: string;
}

export interface LeaveApplication {
  leaveApplicationId: number;
  applicantType: 'student' | 'teacher' | 'staff';
  applicantId: number;
  leaveType: 'short' | 'full';
  leaveFrom: string;
  leaveTo: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewerId?: number;
  reviewerRemarks?: string;
  attachmentUrl?: string;
  createdAt: string;
}

export interface CheckInRequest {
  studentId: number;
  date: string;
  mode: 'PP' | 'PO';
  timeIn: string;
  remarks?: string;
}

export interface CheckOutRequest {
  studentId: number;
  date: string;
  timeOut: string;
  remarks?: string; // Reason for leaving early
}

/** Edit attendance - partial update */
export interface UpdateAttendanceRequest {
  status?: number;
  timeIn?: string;
  timeOut?: string;
  remarks?: string;
  leaveReason?: string;
}

/** Attendance report with summary */
export interface AttendanceReportSummary {
  totalDays: number;
  presentCount: number;
  absentCount: number;
  leaveCount: number;
  holidayCount: number;
  notMarkedCount: number;
  attendancePercent: number;
}

export interface AttendanceReportRecord {
  attendanceId: number;
  studentId: number;
  date: string;
  status: number;
  timeIn?: string;
  timeOut?: string;
  remarks?: string;
}

export interface AttendanceReportResponse {
  records: AttendanceReportRecord[];
  summary: AttendanceReportSummary;
}

/** Attendance correction request (student/teacher submits, admin approves) */
export interface AttendanceCorrection {
  attendanceCorrectionId: number;
  attendanceId: number;
  studentId?: number;
  teacherId?: number;
  reason: string;
  requestedStatus?: number;
  requestedTimeIn?: string;
  requestedTimeOut?: string;
  requestedRemarks?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewerRemarks?: string;
  requestedAt: string;
  reviewedAt?: string;
  attendance?: Attendance;
}

export interface CreateCorrectionRequest {
  attendanceId: number;
  studentId?: number;
  teacherId?: number;
  reason: string;
  requestedStatus?: number;
  requestedTimeIn?: string;
  requestedTimeOut?: string;
  requestedRemarks?: string;
}

export type AttendanceCalendarDayType = 'holiday' | 'event' | 'half-day' | 'special';

export interface AttendanceCalendarItem {
  id: number;
  date: string; // yyyy-MM-dd
  title: string;
  type: AttendanceCalendarDayType;
  description?: string;
}

export interface UpsertAttendanceCalendarItemRequest {
  date: string; // yyyy-MM-dd
  title: string;
  type: AttendanceCalendarDayType;
  description?: string;
}

// -----------------------------
// Admin: Daily attendance summary
// -----------------------------
export interface AdminAttendanceDailyStats {
  total: number;
  present: number;
  absent: number;
  notMarked: number;
  percent: number;
}

export type AdminAttendanceDailyBreakdownStatus = 'complete' | 'partial' | 'pending';

export interface AdminAttendanceClassBreakdown {
  classId: number;
  sectionId: number;
  className: string;
  section: string;
  total: number;
  present: number;
  absent: number;
  notMarked: number;
  percent: number;
  status: AdminAttendanceDailyBreakdownStatus;
}

export type AdminAttendanceNotMarkedType = 'class' | 'staff';

export interface AdminAttendanceNotMarkedItem {
  id: number;
  className: string;
  section?: string | null;
  teacher?: string | null;
  type: AdminAttendanceNotMarkedType;
}

export interface AdminAttendanceDailySummary {
  stats: AdminAttendanceDailyStats;
  classBreakdown: AdminAttendanceClassBreakdown[];
  notMarkedList: AdminAttendanceNotMarkedItem[];
}

// -----------------------------
// Admin: Monthly Grid
// -----------------------------

/** P=Present, A=Absent, L=Leave, H=Holiday, ''=Not Marked */
export type MonthlyGridStatus = 'P' | 'A' | 'L' | 'H' | '';

export interface MonthlyGridStudent {
  studentId: number;
  roll: string;
  name: string;
  className?: string;
  sectionName?: string;
}

export interface MonthlyGridCell {
  studentId: number;
  day: number;
  status: MonthlyGridStatus;
  rawStatus: number;
  timeIn?: string;
  timeOut?: string;
  remarks?: string;
}

export interface MonthlyGridResponse {
  month: number;
  year: number;
  daysInMonth: number;
  monthLabel: string;
  students: MonthlyGridStudent[];
  gridCells: MonthlyGridCell[];
}

