import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WhatsAppMessageRequest, WhatsAppMessageResponse, ParentInfo } from '../models/whatsapp-message.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WhatsAppService {
  private apiUrl = `${environment.apiUrl}/api/WhatsApp`;

  constructor(private http: HttpClient) {}

  sendMessage(request: WhatsAppMessageRequest): Observable<WhatsAppMessageResponse> {
    return this.http.post<WhatsAppMessageResponse>(`${this.apiUrl}/send`, request);
  }

  getParents(): Observable<ParentInfo[]> {
    return this.http.get<ParentInfo[]>(`${this.apiUrl}/parents`);
  }

  getParentsByClass(classId: number): Observable<ParentInfo[]> {
    return this.http.get<ParentInfo[]>(`${this.apiUrl}/parents/by-class/${classId}`);
  }
}
