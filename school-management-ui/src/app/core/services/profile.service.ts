import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = `${environment.apiUrl}/api/profiles`;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  updateProfile(profile: any): Observable<any> {
    return this.http.put<any>(this.apiUrl, profile);
  }

  changePassword(passwordData: { newPassword: string; confirmPassword: string }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/change-password`, passwordData);
  }
}





