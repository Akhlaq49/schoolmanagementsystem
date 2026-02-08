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

  getStudyMaterialsByStudent(studentId: number | null | undefined): Observable<StudyMaterial[]> {
    if (!studentId || studentId <= 0) {
      return new Observable(observer => {
        observer.error(new Error('Invalid student ID'));
      });
    }
    return this.http.get<StudyMaterial[]>(`${this.apiUrl}/student/${studentId}`);
  }

  createStudyMaterial(material: StudyMaterial): Observable<StudyMaterial> {
    // Clean the study material data - only send necessary fields
    const createData = {
      title: material.title,
      description: material.description,
      classId: material.classId ? Number(material.classId) : undefined,
      subjectId: material.subjectId ? Number(material.subjectId) : undefined,
      fileName: material.fileName,
      fileType: material.fileType
    };
    return this.http.post<StudyMaterial>(this.apiUrl, createData);
  }

  updateStudyMaterial(id: number, material: StudyMaterial): Observable<StudyMaterial> {
    // Clean the study material data - exclude navigation properties
    const updateData = {
      title: material.title,
      description: material.description,
      classId: material.classId ? Number(material.classId) : undefined,
      subjectId: material.subjectId ? Number(material.subjectId) : undefined,
      fileName: material.fileName,
      fileType: material.fileType
    };
    return this.http.put<StudyMaterial>(`${this.apiUrl}/${id}`, updateData);
  }

  deleteStudyMaterial(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

