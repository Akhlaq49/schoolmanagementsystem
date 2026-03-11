import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Student } from '../models/student.model';
import { CreateStudentDto, UpdateStudentDto } from '../models/create-student.dto';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = `${environment.apiUrl}/api/students`;

  constructor(private http: HttpClient) {}

  private mapApiStudentToModel(api: any): Student {
    const prev = api.previousInstitute;
    const fam = api.family;
    const adm = api.admission;
    return {
      ...api,
      studentId: api.studentProfile?.studentId ?? api.studentId ?? api.userId,
      fee: adm?.fee ?? api.fee,
      feeType: adm?.feeType ?? api.feeType,
      feeDiscount: adm?.feeDiscount ?? api.feeDiscount,
      transportCharges: adm?.transportCharges ?? api.transportCharges,
      admissionDate: adm?.admissionDate ?? api.admissionDate,
      fatherName: fam?.fatherName ?? api.fatherName,
      guardianName: fam?.guardianName ?? api.guardianName,
      fatherGuardianCnic: fam?.fatherCnic ?? api.fatherGuardianCnic,
      fatherOccupation: fam?.fatherOccupation ?? api.fatherOccupation,
      smsNumber: fam?.smsNumber ?? api.smsNumber,
      motherName: fam?.motherName ?? api.motherName,
      motherPhone: fam?.motherPhone ?? api.motherPhone,
      motherCnic: fam?.motherCnic ?? api.motherCnic,
      fatherGuardianPhone: fam?.fatherPhone ?? api.fatherGuardianPhone,
      previousInstituteName: prev?.previousInstituteName,
      passingClass: prev?.passingClass,
      passingPercentage: prev?.passingPercentage,
      passingYear: prev?.passingYear,
      instituteAddress: prev?.instituteAddress
    };
  }

  getAllStudents(): Observable<Student[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(list => list.map(s => this.mapApiStudentToModel(s)))
    );
  }

  getActiveStudents(): Observable<Student[]> {
    return this.http.get<any[]>(`${this.apiUrl}?status=active`).pipe(
      map(list => list.map(s => this.mapApiStudentToModel(s)))
    );
  }

  getDroppedStudents(): Observable<Student[]> {
    return this.http.get<any[]>(`${this.apiUrl}?status=dropped`).pipe(
      map(list => list.map(s => this.mapApiStudentToModel(s)))
    );
  }

  getStudentById(id: number): Observable<Student> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(s => this.mapApiStudentToModel(s))
    );
  }

  searchActiveStudents(term: string): Observable<Student[]> {
    return this.http.get<any[]>(`${this.apiUrl}/search`, {
      params: { term, status: 'active' }
    }).pipe(
      map(list => list.map(s => this.mapApiStudentToModel(s)))
    );
  }

  getStudentsByClass(classId: number): Observable<Student[]> {
    return this.http.get<any[]>(`${this.apiUrl}/class/${classId}`).pipe(
      map(list => list.map(s => this.mapApiStudentToModel(s)))
    );
  }

  createStudent(dto: CreateStudentDto): Observable<Student> {
    return this.http.post<any>(this.apiUrl, dto).pipe(
      map(s => this.mapApiStudentToModel(s))
    );
  }

  updateStudent(id: number, student: Partial<Student> | UpdateStudentDto): Observable<Student> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, student).pipe(
      map(s => this.mapApiStudentToModel(s))
    );
  }

  deleteStudent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

