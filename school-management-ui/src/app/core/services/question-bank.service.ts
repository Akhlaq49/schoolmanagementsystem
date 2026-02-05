import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { QuestionBank } from '../models/question-bank.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QuestionBankService {
  private apiUrl = `${environment.apiUrl}/api/QuestionBank`;

  constructor(private http: HttpClient) {}

  getAllQuestions(): Observable<QuestionBank[]> {
    return this.http.get<QuestionBank[]>(this.apiUrl);
  }

  getQuestionById(id: number): Observable<QuestionBank> {
    return this.http.get<QuestionBank>(`${this.apiUrl}/${id}`);
  }

  getQuestionsBySubject(subjectId: number): Observable<QuestionBank[]> {
    return this.http.get<QuestionBank[]>(`${this.apiUrl}/subject/${subjectId}`);
  }

  getQuestionsByClass(classId: number): Observable<QuestionBank[]> {
    return this.http.get<QuestionBank[]>(`${this.apiUrl}/class/${classId}`);
  }

  getQuestionsBySubjectAndClass(subjectId: number, classId: number): Observable<QuestionBank[]> {
    return this.http.get<QuestionBank[]>(`${this.apiUrl}/subject/${subjectId}/class/${classId}`);
  }

  getQuestionsByChapter(subjectId: number, classId: number, chapterName: string): Observable<QuestionBank[]> {
    return this.http.get<QuestionBank[]>(`${this.apiUrl}/subject/${subjectId}/class/${classId}/chapter/${encodeURIComponent(chapterName)}`);
  }

  getQuestionsByTeacher(teacherId: number): Observable<QuestionBank[]> {
    return this.http.get<QuestionBank[]>(`${this.apiUrl}/teacher/${teacherId}`);
  }

  getChapters(subjectId: number, classId: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/chapters/subject/${subjectId}/class/${classId}`);
  }

  createQuestion(question: QuestionBank): Observable<QuestionBank> {
    return this.http.post<QuestionBank>(this.apiUrl, question);
  }

  updateQuestion(id: number, question: QuestionBank): Observable<QuestionBank> {
    return this.http.put<QuestionBank>(`${this.apiUrl}/${id}`, question);
  }

  deleteQuestion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  uploadExcel(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.apiUrl}/upload-excel`, formData);
  }

  downloadTemplate(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download-template`, {
      responseType: 'blob'
    });
  }

  getQuestionsForExam(request: any): Observable<QuestionBank[]> {
    return this.http.post<QuestionBank[]>(`${this.apiUrl}/exam-questions`, request);
  }
}



