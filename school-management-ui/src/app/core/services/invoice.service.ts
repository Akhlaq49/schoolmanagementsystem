import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Invoice, Payment } from '../models/invoice.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private apiUrl = `${environment.apiUrl}/api/invoices`;

  constructor(private http: HttpClient) {}

  getAllInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(this.apiUrl);
  }

  getInvoiceById(id: number): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.apiUrl}/${id}`);
  }

  getInvoicesByStudent(studentId: number): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.apiUrl}/student/${studentId}`);
  }

  createInvoice(invoice: Invoice): Observable<Invoice> {
    return this.http.post<Invoice>(this.apiUrl, invoice);
  }

  updateInvoice(id: number, invoice: Invoice): Observable<Invoice> {
    return this.http.put<Invoice>(`${this.apiUrl}/${id}`, invoice);
  }

  deleteInvoice(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  createPayment(invoiceId: number, payment: Payment): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/${invoiceId}/payments`, payment);
  }
}

