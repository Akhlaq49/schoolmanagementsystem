import { Subject } from './subject.model';
import { Class } from './student.model';

export interface QuestionBank {
  questionBankId: number;
  subjectId: number;
  classId: number;
  chapterName: string;
  questionText: string;
  questionType: 'MultipleChoice' | 'TrueFalse' | 'ShortAnswer' | 'Essay';
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctAnswer?: string;
  explanation?: string;
  marks: number;
  difficultyLevel: 'Easy' | 'Medium' | 'Hard';
  teacherId: number;
  createdAt: string;
  updatedAt?: string;
  subject?: Subject;
  class?: Class;
  teacher?: any;
}



