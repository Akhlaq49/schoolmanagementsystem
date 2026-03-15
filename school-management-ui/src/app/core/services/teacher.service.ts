import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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

  /** Current logged-in teacher (teacher role only). Maps API User to Teacher. */
  getCurrentTeacher(): Observable<Teacher> {
    return this.http.get<any>(`${this.apiUrl}/me`).pipe(
      map(u => ({
        teacherId: u.userId ?? u.teacherId,
        name: u.name ?? '',
        email: u.email,
        phone: u.phone,
        address: u.address,
        password: '',
        loginStatus: u.loginStatus ?? '0',
        departmentId: u.departmentId,
        department: u.department
      }))
    );
  }

  getTeacherById(id: number): Observable<Teacher> {
    return this.http.get<Teacher>(`${this.apiUrl}/${id}`);
  }

  createTeacher(teacher: Teacher): Observable<Teacher> {
    return this.http.post<Teacher>(this.apiUrl, teacher);
  }

  updateTeacher(id: number, teacher: Teacher): Observable<Teacher> {
    return this.http.put<Teacher>(`${this.apiUrl}/${id}`, teacher);
  }

  deleteTeacher(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

