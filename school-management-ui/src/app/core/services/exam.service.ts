import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Exam } from '../models/exam.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExamService {
  private apiUrl = `${environment.apiUrl}/api/exams`;

  constructor(private http: HttpClient) {}

  getAllExams(): Observable<Exam[]> {
    return this.http.get<Exam[]>(this.apiUrl);
  }

  getExamById(id: number): Observable<Exam> {
    return this.http.get<Exam>(`${this.apiUrl}/${id}`);
  }

  createExam(exam: Exam): Observable<Exam> {
    // Clean the exam data - only send necessary fields
    const createData = {
      name: exam.name,
      date: exam.date,
      comment: exam.comment
    };
    return this.http.post<Exam>(this.apiUrl, createData);
  }

  updateExam(id: number, exam: Exam): Observable<Exam> {
    // Clean the exam data - only send necessary fields
    const updateData = {
      name: exam.name,
      date: exam.date,
      comment: exam.comment
    };
    return this.http.put<Exam>(`${this.apiUrl}/${id}`, updateData);
  }

  deleteExam(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

