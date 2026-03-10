import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  FeeStructure, CreateFeeStructure, UpdateFeeStructure,
  FeeChallan, ChallanSummary, ChallanGenerateRequest, RecordPaymentRequest
} from '../models/fee.model';

@Injectable({ providedIn: 'root' })
export class FeeService {
  private base = `${environment.apiUrl}/api/fee`;

  constructor(private http: HttpClient) {}

  // ─── Fee Structures ──────────────────────────────────

  getFeeStructures(): Observable<FeeStructure[]> {
    return this.http.get<FeeStructure[]>(`${this.base}/structures`);
  }

  getFeeStructureById(id: number): Observable<FeeStructure> {
    return this.http.get<FeeStructure>(`${this.base}/structures/${id}`);
  }

  createFeeStructure(dto: CreateFeeStructure): Observable<FeeStructure> {
    return this.http.post<FeeStructure>(`${this.base}/structures`, dto);
  }

  updateFeeStructure(id: number, dto: UpdateFeeStructure): Observable<FeeStructure> {
    return this.http.put<FeeStructure>(`${this.base}/structures/${id}`, dto);
  }

  deleteFeeStructure(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/structures/${id}`);
  }

  // ─── Fee Challans ────────────────────────────────────

  getChallans(month?: number, year?: number, status?: string): Observable<FeeChallan[]> {
    let params = new HttpParams();
    if (month) params = params.set('month', month);
    if (year) params = params.set('year', year);
    if (status) params = params.set('status', status);
    return this.http.get<FeeChallan[]>(`${this.base}/challans`, { params });
  }

  getChallanById(id: number): Observable<FeeChallan> {
    return this.http.get<FeeChallan>(`${this.base}/challans/${id}`);
  }

  getChallanSummary(month?: number, year?: number): Observable<ChallanSummary> {
    let params = new HttpParams();
    if (month) params = params.set('month', month);
    if (year) params = params.set('year', year);
    return this.http.get<ChallanSummary>(`${this.base}/challans/summary`, { params });
  }

  getStudentChallans(studentId: number, status?: string): Observable<FeeChallan[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<FeeChallan[]>(`${this.base}/student/${studentId}/challans`, { params });
  }

  getDefaulters(classId?: number, status?: string): Observable<FeeChallan[]> {
    let params = new HttpParams();
    if (classId) params = params.set('classId', classId);
    if (status) params = params.set('status', status);
    return this.http.get<FeeChallan[]>(`${this.base}/defaulters`, { params });
  }

  generateChallans(req: ChallanGenerateRequest): Observable<{ count: number }> {
    return this.http.post<{ count: number }>(`${this.base}/challans/generate`, req);
  }

  recordPayment(challanId: number, req: RecordPaymentRequest): Observable<FeeChallan> {
    return this.http.post<FeeChallan>(`${this.base}/challans/${challanId}/pay`, req);
  }

  waiveChallan(challanId: number, reason: string): Observable<FeeChallan> {
    return this.http.post<FeeChallan>(`${this.base}/challans/${challanId}/waive`, { reason });
  }
}
