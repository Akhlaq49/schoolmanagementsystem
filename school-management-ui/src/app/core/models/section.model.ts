import { Class } from './student.model';

export interface Section {
  sectionId: number;
  name: string;
  classId?: number;
  teacherId?: number;
  class?: Class;
}

