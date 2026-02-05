import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Mark } from '../models/mark.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MarkService {
  private apiUrl = `${environment.apiUrl}/api/marks`;

  constructor(private http: HttpClient) {}

  getAllMarks(): Observable<Mark[]> {
    return this.http.get<Mark[]>(this.apiUrl);
  }

  getMarkById(id: number): Observable<Mark> {
    return this.http.get<Mark>(`${this.apiUrl}/${id}`);
  }

  getMarksByStudent(studentId: number): Observable<Mark[]> {
    return this.http.get<Mark[]>(`${this.apiUrl}/student/${studentId}`);
  }

  getMarksByExam(examId: number): Observable<Mark[]> {
    return this.http.get<Mark[]>(`${this.apiUrl}/exam/${examId}`);
  }

  getMarksByExamAndStudent(examId: number, studentId: number): Observable<Mark[]> {
    return this.http.get<Mark[]>(`${this.apiUrl}/exam/${examId}/student/${studentId}`);
  }

  createMark(mark: Mark): Observable<Mark> {
    return this.http.post<Mark>(this.apiUrl, mark);
  }

  updateMark(id: number, mark: Mark): Observable<Mark> {
    return this.http.put<Mark>(`${this.apiUrl}/${id}`, mark);
  }

  bulkUpdateMarks(marks: Mark[]): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/bulk`, marks);
  }

  deleteMark(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

