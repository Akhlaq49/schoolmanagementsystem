import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { FeeAddon } from '../../models/fee-addon.model';

@Injectable({
  providedIn: 'root'
})
export class FeeAddonService {
  private apiUrl = `${environment.apiUrl}/api/feeaddons`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<FeeAddon[]> {
    return this.http.get<FeeAddon[]>(this.apiUrl);
  }

  getById(id: number): Observable<FeeAddon> {
    return this.http.get<FeeAddon>(`${this.apiUrl}/${id}`);
  }

  create(feeAddon: FeeAddon): Observable<FeeAddon> {
    return this.http.post<FeeAddon>(this.apiUrl, feeAddon);
  }

  update(id: number, feeAddon: FeeAddon): Observable<FeeAddon> {
    return this.http.put<FeeAddon>(`${this.apiUrl}/${id}`, feeAddon);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
