import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvoiceService } from '../../../core/services/invoice.service';
import { StudentService } from '../../../core/services/student.service';
import { Invoice, Payment } from '../../../core/models/invoice.model';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="invoices-container">
      <div class="page-header">
        <h2>Invoice Management</h2>
        <button class="btn btn-primary" (click)="showAddForm = true">
          <i class="fa fa-plus"></i> Create Invoice
        </button>
      </div>

      <div *ngIf="showAddForm" class="form-card">
        <h3>Create New Invoice</h3>
        <form (ngSubmit)="saveInvoice()">
          <div class="form-row">
            <div class="form-group">
              <label>Student *</label>
              <select [(ngModel)]="invoiceForm.studentId" name="studentId" required class="form-control">
                <option value="">Select Student</option>
                <option *ngFor="let student of students" [value]="student.studentId">{{ student.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Title *</label>
              <input type="text" [(ngModel)]="invoiceForm.title" name="title" required class="form-control">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Amount *</label>
              <input type="number" [(ngModel)]="invoiceForm.amount" name="amount" required class="form-control" step="0.01">
            </div>
            <div class="form-group">
              <label>Amount Paid</label>
              <input type="number" [(ngModel)]="invoiceForm.amountPaid" name="amountPaid" class="form-control" step="0.01" value="0">
            </div>
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea [(ngModel)]="invoiceForm.description" name="description" class="form-control" rows="3"></textarea>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Create Invoice</button>
            <button type="button" class="btn btn-secondary" (click)="cancelForm()">Cancel</button>
          </div>
        </form>
      </div>

      <div class="table-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Student</th>
              <th>Title</th>
              <th>Amount</th>
              <th>Paid</th>
              <th>Due</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let invoice of invoices">
              <td>{{ invoice.invoiceId }}</td>
              <td>{{ invoice.student?.name || '-' }}</td>
              <td>{{ invoice.title }}</td>
              <td>{{ invoice.amount | currency }}</td>
              <td>{{ invoice.amountPaid | currency }}</td>
              <td>{{ invoice.due | currency }}</td>
              <td>
                <span [class]="'badge ' + (invoice.status === 'paid' ? 'badge-success' : 'badge-warning')">
                  {{ invoice.status }}
                </span>
              </td>
              <td>
                <button class="btn btn-sm btn-payment" (click)="showPaymentForm(invoice)">
                  <i class="fa fa-money"></i>
                </button>
                <button class="btn btn-sm btn-edit" (click)="editInvoice(invoice)">
                  <i class="fa fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-delete" (click)="deleteInvoice(invoice.invoiceId)">
                  <i class="fa fa-trash"></i>
                </button>
              </td>
            </tr>
            <tr *ngIf="invoices.length === 0">
              <td colspan="8" class="text-center">No invoices found</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Payment Modal -->
      <div *ngIf="showPaymentModal" class="modal-overlay" (click)="closePaymentModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h3>Record Payment</h3>
          <form (ngSubmit)="savePayment()">
            <div class="form-group">
              <label>Amount *</label>
              <input type="number" [(ngModel)]="paymentForm.amount" name="amount" required class="form-control" step="0.01">
            </div>
            <div class="form-group">
              <label>Payment Method</label>
              <select [(ngModel)]="paymentForm.paymentMethod" name="paymentMethod" class="form-control">
                <option value="cash">Cash</option>
                <option value="bank">Bank Transfer</option>
                <option value="online">Online Payment</option>
              </select>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary">Record Payment</button>
              <button type="button" class="btn btn-secondary" (click)="closePaymentModal()">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .invoices-container {
      padding: 2rem;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
    }
    .btn-primary {
      background: #667eea;
      color: white;
    }
    .btn-secondary {
      background: #6c757d;
      color: white;
    }
    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }
    .btn-payment {
      background: #2ecc71;
      color: white;
      margin-right: 0.5rem;
    }
    .btn-edit {
      background: #3498db;
      color: white;
      margin-right: 0.5rem;
    }
    .btn-delete {
      background: #e74c3c;
      color: white;
    }
    .badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.875rem;
    }
    .badge-success {
      background: #2ecc71;
      color: white;
    }
    .badge-warning {
      background: #f39c12;
      color: white;
    }
    .form-card {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .form-row {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      margin-bottom: 1rem;
    }
    .form-group label {
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
    }
    .table-card {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
    }
    .data-table thead {
      background: #667eea;
      color: white;
    }
    .data-table th,
    .data-table td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    .data-table tbody tr:hover {
      background: #f8f9fa;
    }
    .text-center {
      text-align: center;
    }
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal-content {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      width: 90%;
      max-width: 500px;
    }
  `]
})
export class InvoicesComponent implements OnInit {
  invoices: Invoice[] = [];
  students: any[] = [];
  showAddForm: boolean = false;
  showPaymentModal: boolean = false;
  selectedInvoice: Invoice | null = null;
  editingInvoice: Invoice | null = null;
  
  invoiceForm: Partial<Invoice> = {
    studentId: undefined,
    title: '',
    amount: 0,
    amountPaid: 0,
    description: ''
  };

  paymentForm: Partial<Payment> = {
    amount: 0,
    paymentMethod: 'cash'
  };

  constructor(
    private invoiceService: InvoiceService,
    private studentService: StudentService
  ) {}

  ngOnInit() {
    this.loadInvoices();
    this.loadStudents();
  }

  loadInvoices() {
    this.invoiceService.getAllInvoices().subscribe(invoices => {
      this.invoices = invoices;
    });
  }

  loadStudents() {
    this.studentService.getAllStudents().subscribe(students => {
      this.students = students;
    });
  }

  saveInvoice() {
    this.invoiceService.createInvoice(this.invoiceForm as Invoice)
      .subscribe(() => {
        this.loadInvoices();
        this.cancelForm();
      });
  }

  editInvoice(invoice: Invoice) {
    this.editingInvoice = invoice;
    this.invoiceForm = { ...invoice };
    this.showAddForm = true;
  }

  deleteInvoice(id: number) {
    if (confirm('Are you sure you want to delete this invoice?')) {
      this.invoiceService.deleteInvoice(id).subscribe(() => {
        this.loadInvoices();
      });
    }
  }

  showPaymentForm(invoice: Invoice) {
    this.selectedInvoice = invoice;
    this.paymentForm.amount = invoice.due;
    this.showPaymentModal = true;
  }

  savePayment() {
    if (this.selectedInvoice) {
      const payment: Payment = {
        invoiceId: this.selectedInvoice.invoiceId,
        amount: this.paymentForm.amount || 0,
        paymentMethod: this.paymentForm.paymentMethod || 'cash',
        timestamp: new Date()
      };
      this.invoiceService.createPayment(this.selectedInvoice.invoiceId, payment)
        .subscribe(() => {
          this.loadInvoices();
          this.closePaymentModal();
        });
    }
  }

  closePaymentModal() {
    this.showPaymentModal = false;
    this.selectedInvoice = null;
    this.paymentForm = {
      amount: 0,
      paymentMethod: 'cash'
    };
  }

  cancelForm() {
    this.showAddForm = false;
    this.editingInvoice = null;
    this.invoiceForm = {
      studentId: undefined,
      title: '',
      amount: 0,
      amountPaid: 0,
      description: ''
    };
  }
}

