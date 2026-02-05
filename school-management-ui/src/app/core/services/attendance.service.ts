import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Attendance } from '../models/attendance.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private apiUrl = `${environment.apiUrl}/api/attendance`;

  constructor(private http: HttpClient) {}

  getAttendance(date: string, classId?: number, sectionId?: number): Observable<Attendance[]> {
    let params = new HttpParams().set('date', date);
    if (classId) params = params.set('classId', classId.toString());
    if (sectionId) params = params.set('sectionId', sectionId.toString());
    
    return this.http.get<Attendance[]>(this.apiUrl, { params });
  }

  getAttendanceById(id: number): Observable<Attendance> {
    return this.http.get<Attendance>(`${this.apiUrl}/${id}`);
  }

  getAttendanceReport(studentId: number, month: number, year: number): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(`${this.apiUrl}/report/${studentId}`, {
      params: { month: month.toString(), year: year.toString() }
    });
  }

  createAttendance(attendance: Attendance): Observable<Attendance> {
    return this.http.post<Attendance>(this.apiUrl, attendance);
  }

  updateAttendance(id: number, attendance: Attendance): Observable<Attendance> {
    return this.http.put<Attendance>(`${this.apiUrl}/${id}`, attendance);
  }

  deleteAttendance(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

