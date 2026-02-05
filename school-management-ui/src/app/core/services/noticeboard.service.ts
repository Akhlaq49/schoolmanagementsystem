import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Noticeboard } from '../models/noticeboard.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NoticeboardService {
  private apiUrl = `${environment.apiUrl}/api/noticeboards`;

  constructor(private http: HttpClient) {}

  getAllNotices(): Observable<Noticeboard[]> {
    return this.http.get<Noticeboard[]>(this.apiUrl);
  }

  getNoticeById(id: number): Observable<Noticeboard> {
    return this.http.get<Noticeboard>(`${this.apiUrl}/${id}`);
  }

  createNotice(notice: Noticeboard): Observable<Noticeboard> {
    return this.http.post<Noticeboard>(this.apiUrl, notice);
  }

  updateNotice(id: number, notice: Noticeboard): Observable<Noticeboard> {
    return this.http.put<Noticeboard>(`${this.apiUrl}/${id}`, notice);
  }

  deleteNotice(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}





