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

  getAssignmentsByStudent(studentId: number | null | undefined): Observable<Assignment[]> {
    if (!studentId || studentId <= 0) {
      return new Observable(observer => {
        observer.error(new Error('Invalid student ID'));
      });
    }
    return this.http.get<Assignment[]>(`${this.apiUrl}/student/${studentId}`);
  }

  createAssignment(assignment: Assignment): Observable<Assignment> {
    // Clean the assignment data - only send necessary fields
    const createData = {
      name: assignment.name,
      subjectId: assignment.subjectId ? Number(assignment.subjectId) : undefined,
      classId: assignment.classId ? Number(assignment.classId) : undefined,
      teacherId: assignment.teacherId ? Number(assignment.teacherId) : undefined,
      description: assignment.description,
      fileName: assignment.fileName,
      fileType: assignment.fileType
    };
    return this.http.post<Assignment>(this.apiUrl, createData);
  }

  updateAssignment(id: number, assignment: Assignment): Observable<Assignment> {
    // Clean the assignment data - exclude navigation properties
    const updateData = {
      name: assignment.name,
      subjectId: assignment.subjectId ? Number(assignment.subjectId) : undefined,
      classId: assignment.classId ? Number(assignment.classId) : undefined,
      teacherId: assignment.teacherId ? Number(assignment.teacherId) : undefined,
      description: assignment.description,
      fileName: assignment.fileName,
      fileType: assignment.fileType
    };
    return this.http.put<Assignment>(`${this.apiUrl}/${id}`, updateData);
  }

  deleteAssignment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

