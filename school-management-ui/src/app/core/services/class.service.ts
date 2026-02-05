import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Class } from '../models/student.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClassService {
  private apiUrl = `${environment.apiUrl}/api/classes`;

  constructor(private http: HttpClient) {}

  getAllClasses(): Observable<Class[]> {
    return this.http.get<Class[]>(this.apiUrl);
  }

  getClassById(id: number): Observable<Class> {
    return this.http.get<Class>(`${this.apiUrl}/${id}`);
  }

  createClass(classEntity: Class): Observable<Class> {
    return this.http.post<Class>(this.apiUrl, classEntity);
  }

  updateClass(id: number, classEntity: Class): Observable<Class> {
    return this.http.put<Class>(`${this.apiUrl}/${id}`, classEntity);
  }

  deleteClass(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

