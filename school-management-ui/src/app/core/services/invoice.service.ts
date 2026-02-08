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

  getInvoicesByStudent(studentId: number | null | undefined): Observable<Invoice[]> {
    if (!studentId || studentId <= 0) {
      return new Observable(observer => {
        observer.error(new Error('Invalid student ID'));
      });
    }
    return this.http.get<Invoice[]>(`${this.apiUrl}/student/${studentId}`);
  }

  createInvoice(invoice: Invoice): Observable<Invoice> {
    // Clean the invoice data - only send necessary fields
    const createData = {
      studentId: invoice.studentId ? Number(invoice.studentId) : undefined,
      title: invoice.title,
      description: invoice.description,
      amount: invoice.amount ? Number(invoice.amount) : undefined
    };
    return this.http.post<Invoice>(this.apiUrl, createData);
  }

  updateInvoice(id: number, invoice: Invoice): Observable<Invoice> {
    // Clean the invoice data - exclude navigation properties
    const updateData = {
      studentId: invoice.studentId ? Number(invoice.studentId) : undefined,
      title: invoice.title,
      description: invoice.description,
      amount: invoice.amount ? Number(invoice.amount) : undefined,
      amountPaid: invoice.amountPaid ? Number(invoice.amountPaid) : undefined,
      status: invoice.status
    };
    return this.http.put<Invoice>(`${this.apiUrl}/${id}`, updateData);
  }

  deleteInvoice(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  createPayment(invoiceId: number, payment: Payment): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/${invoiceId}/payments`, payment);
  }
}

