import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  FeeStructure, CreateFeeStructure, UpdateFeeStructure,
  FeeChallan, ChallanSummary, ChallanGenerateRequest, RecordPaymentRequest,
  FeeDiscount, CreateFeeDiscount, UpdateFeeDiscount, FeeDiscountAssignment,
  CollectionPayment, CollectionSummary
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

  // ─── Collection Register ───────────────────────────────

  getCollectionPayments(start?: string, end?: string): Observable<CollectionPayment[]> {
    let params = new HttpParams();
    if (start) params = params.set('start', start);
    if (end) params = params.set('end', end);
    return this.http.get<CollectionPayment[]>(`${this.base}/collection/payments`, { params });
  }

  getCollectionSummary(start?: string, end?: string): Observable<CollectionSummary> {
    let params = new HttpParams();
    if (start) params = params.set('start', start);
    if (end) params = params.set('end', end);
    return this.http.get<CollectionSummary>(`${this.base}/collection/summary`, { params });
  }

  // ─── Fee Discounts ────────────────────────────────────

  getDiscounts(scope?: string, status?: string): Observable<FeeDiscount[]> {
    let params = new HttpParams();
    if (scope) params = params.set('scope', scope);
    if (status) params = params.set('status', status);
    return this.http.get<FeeDiscount[]>(`${this.base}/discounts`, { params });
  }

  getDiscountById(id: number): Observable<FeeDiscount> {
    return this.http.get<FeeDiscount>(`${this.base}/discounts/${id}`);
  }

  createDiscount(dto: CreateFeeDiscount): Observable<FeeDiscount> {
    return this.http.post<FeeDiscount>(`${this.base}/discounts`, dto);
  }

  updateDiscount(id: number, dto: UpdateFeeDiscount): Observable<FeeDiscount> {
    return this.http.put<FeeDiscount>(`${this.base}/discounts/${id}`, dto);
  }

  deleteDiscount(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/discounts/${id}`);
  }

  getDiscountAssignments(discountId: number): Observable<FeeDiscountAssignment[]> {
    return this.http.get<FeeDiscountAssignment[]>(`${this.base}/discounts/${discountId}/assignments`);
  }

  assignDiscountToStudent(discountId: number, studentId: number): Observable<FeeDiscountAssignment> {
    return this.http.post<FeeDiscountAssignment>(`${this.base}/discounts/${discountId}/assign/student/${studentId}`, {});
  }

  assignDiscountToFamily(discountId: number, familyId: number): Observable<FeeDiscountAssignment> {
    return this.http.post<FeeDiscountAssignment>(`${this.base}/discounts/${discountId}/assign/family/${familyId}`, {});
  }

  unassignDiscount(assignmentId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/discounts/assignments/${assignmentId}`);
  }
}
