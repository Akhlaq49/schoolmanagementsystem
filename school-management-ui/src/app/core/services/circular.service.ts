import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Circular } from '../models/circular.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CircularService {
  private apiUrl = `${environment.apiUrl}/api/circulars`;

  constructor(private http: HttpClient) {}

  getAllCirculars(): Observable<Circular[]> {
    return this.http.get<Circular[]>(this.apiUrl);
  }

  getCircularById(id: number): Observable<Circular> {
    return this.http.get<Circular>(`${this.apiUrl}/${id}`);
  }

  createCircular(circular: Circular): Observable<Circular> {
    return this.http.post<Circular>(this.apiUrl, circular);
  }

  updateCircular(id: number, circular: Circular): Observable<Circular> {
    return this.http.put<Circular>(`${this.apiUrl}/${id}`, circular);
  }

  deleteCircular(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}





