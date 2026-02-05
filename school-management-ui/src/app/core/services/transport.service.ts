import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Transport } from '../models/transport.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TransportService {
  private apiUrl = `${environment.apiUrl}/api/transports`;

  constructor(private http: HttpClient) {}

  getAllTransports(): Observable<Transport[]> {
    return this.http.get<Transport[]>(this.apiUrl);
  }

  getTransportById(id: number): Observable<Transport> {
    return this.http.get<Transport>(`${this.apiUrl}/${id}`);
  }

  createTransport(transport: Transport): Observable<Transport> {
    return this.http.post<Transport>(this.apiUrl, transport);
  }

  updateTransport(id: number, transport: Transport): Observable<Transport> {
    return this.http.put<Transport>(`${this.apiUrl}/${id}`, transport);
  }

  deleteTransport(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}





