import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Attendance, CheckInRequest, CheckOutRequest, LeaveApplication } from '../models/attendance.model';
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

  /** Student: today's attendance status */
  getTodayAttendance(studentId: number): Observable<Attendance | null> {
    return this.http.get<Attendance | null>(`${this.apiUrl}/today/${studentId}`);
  }

  /** Student: check-in (PP or PO) */
  checkIn(req: CheckInRequest): Observable<Attendance> {
    return this.http.post<Attendance>(`${this.apiUrl}/checkin`, req);
  }

  /** Student: check-out */
  checkOut(req: CheckOutRequest): Observable<Attendance> {
    return this.http.patch<Attendance>(`${this.apiUrl}/checkout`, req);
  }

  /** Leave applications: list own */
  getMyLeaves(applicantType: 'student' | 'teacher' | 'staff', applicantId: number): Observable<LeaveApplication[]> {
    const params = new HttpParams()
      .set('applicantType', applicantType)
      .set('applicantId', applicantId.toString());
    return this.http.get<LeaveApplication[]>(`${this.apiUrl}/leaves`, { params });
  }

  /** Apply leave */
  applyLeave(dto: Partial<LeaveApplication>): Observable<LeaveApplication> {
    return this.http.post<LeaveApplication>(`${this.apiUrl}/leaves`, dto);
  }

  /** Update pending leave */
  updateLeave(id: number, dto: Partial<LeaveApplication>): Observable<LeaveApplication> {
    return this.http.put<LeaveApplication>(`${this.apiUrl}/leaves/${id}`, dto);
  }

  /** Cancel pending leave */
  cancelLeave(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/leaves/${id}`);
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

