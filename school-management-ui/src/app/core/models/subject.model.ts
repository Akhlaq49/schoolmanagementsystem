import { Class } from './student.model';

export interface Subject {
  subjectId?: number;
  name: string;
  classId?: number;
  teacherId?: number;
  class?: Class;
}

