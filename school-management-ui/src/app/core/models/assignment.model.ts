import { Class } from './student.model';
import { Subject } from './subject.model';

export interface Assignment {
  assignmentId: number;
  name: string;
  subjectId: number;
  classId: number;
  teacherId: number;
  description?: string;
  fileName?: string;
  fileType?: string;
  timestamp: Date;
  class?: Class;
  subject?: Subject;
}

