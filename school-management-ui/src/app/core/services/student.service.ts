import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Student } from '../models/student.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = `${environment.apiUrl}/api/students`;

  constructor(private http: HttpClient) {}

  getAllStudents(): Observable<Student[]> {
    return this.http.get<Student[]>(this.apiUrl);
  }

  getStudentById(id: number | null | undefined): Observable<Student> {
    // Guard against undefined or null IDs
    if (!id || id <= 0) {
      return new Observable(observer => {
        observer.error(new Error('Invalid student ID'));
      });
    }
    return this.http.get<Student>(`${this.apiUrl}/${id}`);
  }

  getStudentsByClass(classId: number): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.apiUrl}/class/${classId}`);
  }

  createStudent(student: Student): Observable<Student> {
    // Clean the student data - only send necessary fields for creation (no password needed)
    const createData = {
      name: student.name,
      email: student.email,
      phone: student.phone,
      address: student.address,
      classId: student.classId ? Number(student.classId) : undefined,
      sectionId: student.sectionId ? Number(student.sectionId) : undefined,
      roll: student.roll,
      birthday: student.birthday,
      age: student.age ? Number(student.age) : undefined,
      sex: student.sex,
      session: student.session,
      parentId: student.parentId ? Number(student.parentId) : undefined
    };
    return this.http.post<Student>(this.apiUrl, createData);
  }

  updateStudent(id: number, student: Student): Observable<Student> {
    // Clean the student data - only send editable fields, exclude navigation properties
    const updateData = {
      name: student.name,
      email: student.email,
      phone: student.phone,
      address: student.address,
      classId: student.classId ? Number(student.classId) : undefined,
      sectionId: student.sectionId ? Number(student.sectionId) : undefined,
      roll: student.roll,
      birthday: student.birthday,
      age: student.age ? Number(student.age) : undefined,
      sex: student.sex,
      session: student.session,
      parentId: student.parentId ? Number(student.parentId) : undefined
    };
    return this.http.put<Student>(`${this.apiUrl}/${id}`, updateData);
  }

  deleteStudent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

