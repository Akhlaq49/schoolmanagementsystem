import { Student } from './student.model';
import { Subject } from './subject.model';
import { Exam } from './exam.model';

export interface Mark {
  markId?: number;
  studentId?: number;
  examId?: number;
  subjectId?: number;
  classScore1?: number;
  classScore2?: number;
  classScore3?: number;
  examScore?: number;
  comment?: string;
  student?: Student;
  exam?: Exam;
  subject?: Subject;
}

