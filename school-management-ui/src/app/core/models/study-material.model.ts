import { Class } from './student.model';
import { Subject } from './subject.model';

export interface StudyMaterial {
  studyMaterialId: number;
  title: string;
  description?: string;
  classId?: number;
  subjectId?: number;
  fileName?: string;
  fileType?: string;
  timestamp: Date;
  class?: Class;
  subject?: Subject;
}

