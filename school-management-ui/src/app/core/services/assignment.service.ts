import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Assignment } from '../models/assignment.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AssignmentService {
  private apiUrl = `${environment.apiUrl}/api/assignments`;

  constructor(private http: HttpClient) {}

  getAllAssignments(): Observable<Assignment[]> {
    return this.http.get<Assignment[]>(this.apiUrl);
  }

  getAssignmentById(id: number): Observable<Assignment> {
    return this.http.get<Assignment>(`${this.apiUrl}/${id}`);
  }

  getAssignmentsByClass(classId: number): Observable<Assignment[]> {
    return this.http.get<Assignment[]>(`${this.apiUrl}/class/${classId}`);
  }

  getAssignmentsByStudent(studentId: number): Observable<Assignment[]> {
    return this.http.get<Assignment[]>(`${this.apiUrl}/student/${studentId}`);
  }

  createAssignment(assignment: Assignment): Observable<Assignment> {
    return this.http.post<Assignment>(this.apiUrl, assignment);
  }

  updateAssignment(id: number, assignment: Assignment): Observable<Assignment> {
    return this.http.put<Assignment>(`${this.apiUrl}/${id}`, assignment);
  }

  deleteAssignment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

