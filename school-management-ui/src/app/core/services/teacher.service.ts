import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Teacher } from '../models/teacher.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TeacherService {
  private apiUrl = `${environment.apiUrl}/api/teachers`;

  constructor(private http: HttpClient) {}

  getAllTeachers(): Observable<Teacher[]> {
    return this.http.get<Teacher[]>(this.apiUrl);
  }

  getTeacherById(id: number): Observable<Teacher> {
    return this.http.get<Teacher>(`${this.apiUrl}/${id}`);
  }

  createTeacher(teacher: Teacher): Observable<Teacher> {
    // Clean the teacher data - only send necessary fields for creation (no password needed)
    const createData = {
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone,
      address: teacher.address,
      departmentId: teacher.departmentId ? Number(teacher.departmentId) : undefined,
      designationId: teacher.designationId ? Number(teacher.designationId) : undefined
    };
    return this.http.post<Teacher>(this.apiUrl, createData);
  }

  updateTeacher(id: number, teacher: Teacher): Observable<Teacher> {
    // Clean the teacher data - only send editable fields, exclude navigation properties
    const updateData = {
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone,
      address: teacher.address,
      departmentId: teacher.departmentId ? Number(teacher.departmentId) : undefined,
      designationId: teacher.designationId ? Number(teacher.designationId) : undefined
    };
    return this.http.put<Teacher>(`${this.apiUrl}/${id}`, updateData);
  }

  deleteTeacher(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

