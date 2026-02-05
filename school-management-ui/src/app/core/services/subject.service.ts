import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Subject } from '../models/subject.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SubjectService {
  private apiUrl = `${environment.apiUrl}/api/subjects`;

  constructor(private http: HttpClient) {}

  getAllSubjects(): Observable<Subject[]> {
    return this.http.get<Subject[]>(this.apiUrl);
  }

  getSubjectById(id: number): Observable<Subject> {
    return this.http.get<Subject>(`${this.apiUrl}/${id}`);
  }

  getSubjectsByClass(classId: number): Observable<Subject[]> {
    return this.http.get<Subject[]>(`${this.apiUrl}/class/${classId}`);
  }

  createSubject(subject: Subject): Observable<Subject> {
    return this.http.post<Subject>(this.apiUrl, subject);
  }

  updateSubject(id: number, subject: Subject): Observable<Subject> {
    return this.http.put<Subject>(`${this.apiUrl}/${id}`, subject);
  }

  deleteSubject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

