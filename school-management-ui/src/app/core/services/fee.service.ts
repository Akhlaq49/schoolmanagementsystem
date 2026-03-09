import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FeeStructure, CreateFeeStructure, UpdateFeeStructure } from '../models/fee.model';

@Injectable({ providedIn: 'root' })
export class FeeService {
  private base = `${environment.apiUrl}/api/fee`;

  constructor(private http: HttpClient) {}

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
}
