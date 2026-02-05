import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StudyMaterial } from '../models/study-material.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StudyMaterialService {
  private apiUrl = `${environment.apiUrl}/api/studymaterials`;

  constructor(private http: HttpClient) {}

  getAllStudyMaterials(): Observable<StudyMaterial[]> {
    return this.http.get<StudyMaterial[]>(this.apiUrl);
  }

  getStudyMaterialById(id: number): Observable<StudyMaterial> {
    return this.http.get<StudyMaterial>(`${this.apiUrl}/${id}`);
  }

  getStudyMaterialsByClass(classId: number): Observable<StudyMaterial[]> {
    return this.http.get<StudyMaterial[]>(`${this.apiUrl}/class/${classId}`);
  }

  getStudyMaterialsByStudent(studentId: number): Observable<StudyMaterial[]> {
    return this.http.get<StudyMaterial[]>(`${this.apiUrl}/student/${studentId}`);
  }

  createStudyMaterial(material: StudyMaterial): Observable<StudyMaterial> {
    return this.http.post<StudyMaterial>(this.apiUrl, material);
  }

  updateStudyMaterial(id: number, material: StudyMaterial): Observable<StudyMaterial> {
    return this.http.put<StudyMaterial>(`${this.apiUrl}/${id}`, material);
  }

  deleteStudyMaterial(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

