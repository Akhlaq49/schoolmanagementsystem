import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  private apiUrl = `${environment.apiUrl}/api/pdf-reports`;

  constructor(private http: HttpClient) {}

  getFeeReceipt(invoiceId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/fee-receipt/${invoiceId}`, {
      responseType: 'blob'
    });
  }

  getResultCard(studentId: number | null | undefined, examId: number | null | undefined): Observable<Blob> {
    if (!studentId || studentId <= 0 || !examId || examId <= 0) {
      return new Observable(observer => {
        observer.error(new Error('Invalid student ID or exam ID'));
      });
    }
    return this.http.get(`${this.apiUrl}/result-card/${studentId}/${examId}`, {
      responseType: 'blob'
    });
  }

  getAttendanceReport(classId: number, startDate: string, endDate: string): Observable<Blob> {
    const params = new HttpParams()
      .set('classId', classId.toString())
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get(`${this.apiUrl}/attendance-report`, {
      params,
      responseType: 'blob'
    });
  }

  getStudentIdCard(studentId: number | null | undefined): Observable<Blob> {
    if (!studentId || studentId <= 0) {
      return new Observable(observer => {
        observer.error(new Error('Invalid student ID'));
      });
    }
    return this.http.get(`${this.apiUrl}/id-card/${studentId}`, {
      responseType: 'blob'
    });
  }
}
