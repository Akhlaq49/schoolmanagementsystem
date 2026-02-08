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

  getMarksByStudent(studentId: number | null | undefined): Observable<Mark[]> {
    if (!studentId || studentId <= 0) {
      return new Observable(observer => {
        observer.error(new Error('Invalid student ID'));
      });
    }
    return this.http.get<Mark[]>(`${this.apiUrl}/student/${studentId}`);
  }

  getMarksByExam(examId: number): Observable<Mark[]> {
    return this.http.get<Mark[]>(`${this.apiUrl}/exam/${examId}`);
  }

  getMarksByExamAndStudent(examId: number, studentId: number): Observable<Mark[]> {
    return this.http.get<Mark[]>(`${this.apiUrl}/exam/${examId}/student/${studentId}`);
  }

  createMark(mark: Mark): Observable<Mark> {
    // Clean the mark data - only send necessary fields
    const createData = {
      studentId: mark.studentId ? Number(mark.studentId) : undefined,
      examId: mark.examId ? Number(mark.examId) : undefined,
      subjectId: mark.subjectId ? Number(mark.subjectId) : undefined,
      classScore1: mark.classScore1 ? Number(mark.classScore1) : undefined,
      classScore2: mark.classScore2 ? Number(mark.classScore2) : undefined,
      classScore3: mark.classScore3 ? Number(mark.classScore3) : undefined,
      examScore: mark.examScore ? Number(mark.examScore) : undefined,
      comment: mark.comment
    };
    return this.http.post<Mark>(this.apiUrl, createData);
  }

  updateMark(id: number, mark: Mark): Observable<Mark> {
    // Clean the mark data - exclude navigation properties
    const updateData = {
      studentId: mark.studentId ? Number(mark.studentId) : undefined,
      examId: mark.examId ? Number(mark.examId) : undefined,
      subjectId: mark.subjectId ? Number(mark.subjectId) : undefined,
      classScore1: mark.classScore1 ? Number(mark.classScore1) : undefined,
      classScore2: mark.classScore2 ? Number(mark.classScore2) : undefined,
      classScore3: mark.classScore3 ? Number(mark.classScore3) : undefined,
      examScore: mark.examScore ? Number(mark.examScore) : undefined,
      comment: mark.comment
    };
    return this.http.put<Mark>(`${this.apiUrl}/${id}`, updateData);
  }

  bulkUpdateMarks(marks: Mark[]): Observable<any> {
    // Clean each mark in the array
    const cleanedMarks = marks.map(mark => ({
      markId: mark.markId ? Number(mark.markId) : undefined,
      studentId: mark.studentId ? Number(mark.studentId) : undefined,
      examId: mark.examId ? Number(mark.examId) : undefined,
      subjectId: mark.subjectId ? Number(mark.subjectId) : undefined,
      classScore1: mark.classScore1 !== undefined && mark.classScore1 !== null ? Number(mark.classScore1) : null,
      classScore2: mark.classScore2 !== undefined && mark.classScore2 !== null ? Number(mark.classScore2) : null,
      classScore3: mark.classScore3 !== undefined && mark.classScore3 !== null ? Number(mark.classScore3) : null,
      examScore: mark.examScore !== undefined && mark.examScore !== null ? Number(mark.examScore) : null,
      comment: mark.comment
    }));
    return this.http.put<any>(`${this.apiUrl}/bulk`, cleanedMarks);
  }

  deleteMark(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

