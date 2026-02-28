import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AcademicSession } from '../models/academic-session.model';

@Injectable({
  providedIn: 'root'
})
export class AcademicSessionService {
  private apiUrl = `${environment.apiUrl}/api/academicsessions`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<AcademicSession[]> {
    return this.http.get<AcademicSession[]>(this.apiUrl);
  }

  getById(id: number): Observable<AcademicSession> {
    return this.http.get<AcademicSession>(`${this.apiUrl}/${id}`);
  }

  create(session: AcademicSession): Observable<AcademicSession> {
    return this.http.post<AcademicSession>(this.apiUrl, session);
  }

  update(id: number, session: AcademicSession): Observable<AcademicSession> {
    return this.http.put<AcademicSession>(`${this.apiUrl}/${id}`, session);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

