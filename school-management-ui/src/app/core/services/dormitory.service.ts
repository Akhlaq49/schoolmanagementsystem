import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Dormitory } from '../models/dormitory.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DormitoryService {
  private apiUrl = `${environment.apiUrl}/api/dormitories`;

  constructor(private http: HttpClient) {}

  getAllDormitories(): Observable<Dormitory[]> {
    return this.http.get<Dormitory[]>(this.apiUrl);
  }

  getDormitoryById(id: number): Observable<Dormitory> {
    return this.http.get<Dormitory>(`${this.apiUrl}/${id}`);
  }

  createDormitory(dormitory: Dormitory): Observable<Dormitory> {
    return this.http.post<Dormitory>(this.apiUrl, dormitory);
  }

  updateDormitory(id: number, dormitory: Dormitory): Observable<Dormitory> {
    return this.http.put<Dormitory>(`${this.apiUrl}/${id}`, dormitory);
  }

  deleteDormitory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}





