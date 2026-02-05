export interface ExamQuestionRequest {
  classId: number;
  subjectId: number;
  isFullBook: boolean;
  selectedChapters?: string[];
}
