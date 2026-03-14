import { Student } from './student.model';

/** Status codes: 0=Not Marked, 1=PP, 2=PO, 3=Absent, 4=SL, 5=FL, 6=Holiday, 7=Late */
export interface Attendance {
  attendanceId: number;
  status: number;
  studentId: number;
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

