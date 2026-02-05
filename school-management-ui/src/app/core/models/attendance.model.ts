import { Student } from './student.model';

export interface Attendance {
  attendanceId: number;
  status: number; // 0 undefined, 1 present, 2 absent, 3 holiday, 4 half day, 5 late
  studentId: number;
  date: Date;
  session?: string;
  student?: Student;
}

