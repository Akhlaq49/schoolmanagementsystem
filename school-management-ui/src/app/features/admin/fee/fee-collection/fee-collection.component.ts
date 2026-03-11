import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FeeService } from '../../../../core/services/fee.service';
import { CollectionPayment } from '../../../../core/models/fee.model';
import { NotificationService } from '../../../../shared/services/notification.service';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';

interface PaymentRecord {
  receiptNumber: string;
  studentName: string;
  challanNumber: string;
  amount: number;
  paymentMethod: string;
  receivedBy: string;
  paidAt: string;
  challanId: number;
  paymentId: number;
}

@Component({
  selector: 'app-fee-collection',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent],
  template: `
    <div class="collection-container">
      <app-loading [show]="loading" [message]="'Loading collection data...'"></app-loading>

      <!-- Header -->
      <div class="page-header-card">
        <div class="header-content">
          <div>
            <h2><i class="fa fa-money"></i> Fee Collection Register</h2>
            <p class="page-subtitle">
              View daily and date-range collection records with payment summaries.
            </p>
          </div>
          <button class="btn btn-primary" (click)="printRegister()" [disabled]="filteredPayments.length === 0">
            <i class="fa fa-print"></i> Print Register
          </button>
        </div>
      </div>

      <!-- Date Range Filter -->
      <div class="filters-card">
        <div class="date-filter-group">
          <label class="filter-label">Date Range</label>
          <div class="date-inputs">
            <div class="date-input-wrapper">
              <i class="fa fa-calendar"></i>
              <input
                type="date"
                class="academy-input date-input"
                [(ngModel)]="startDate"
                (change)="applyDateFilter()">
            </div>
            <span class="date-separator">to</span>
            <div class="date-input-wrapper">
              <i class="fa fa-calendar"></i>
              <input
                type="date"
                class="academy-input date-input"
                [(ngModel)]="endDate"
                (change)="applyDateFilter()">
            </div>
            <button class="btn btn-secondary btn-sm" (click)="setToday()">Today</button>
            <button class="btn btn-secondary btn-sm" (click)="setThisMonth()">This Month</button>
          </div>
        </div>
        <div class="filter-summary">
          <span><strong>{{ filteredPayments.length }}</strong> payment(s) found</span>
          <span>Total: <strong>{{ totalAmount | number:'1.0-0' }} PKR</strong></span>
        </div>
      </div>

      <!-- Summary Cards by Payment Method -->
      <div class="summary-grid">
        <div class="summary-card card-cash">
          <div class="card-icon"><i class="fa fa-money"></i></div>
          <div class="card-data">
            <span class="card-value">{{ cashTotal | number:'1.0-0' }}</span>
            <span class="card-label">Cash Total (PKR)</span>
            <span class="card-count">{{ cashCount }} payment(s)</span>
          </div>
        </div>
        <div class="summary-card card-bank">
          <div class="card-icon"><i class="fa fa-bank"></i></div>
          <div class="card-data">
            <span class="card-value">{{ bankTotal | number:'1.0-0' }}</span>
            <span class="card-label">Bank Transfer (PKR)</span>
            <span class="card-count">{{ bankCount }} payment(s)</span>
          </div>
        </div>
        <div class="summary-card card-online">
          <div class="card-icon"><i class="fa fa-credit-card"></i></div>
          <div class="card-data">
            <span class="card-value">{{ onlineTotal | number:'1.0-0' }}</span>
            <span class="card-label">Online Payment (PKR)</span>
            <span class="card-count">{{ onlineCount }} payment(s)</span>
          </div>
        </div>
        <div class="summary-card card-total">
          <div class="card-icon"><i class="fa fa-calculator"></i></div>
          <div class="card-data">
            <span class="card-value">{{ totalAmount | number:'1.0-0' }}</span>
            <span class="card-label">Grand Total (PKR)</span>
            <span class="card-count">{{ filteredPayments.length }} payment(s)</span>
          </div>
        </div>
      </div>

      <!-- Payments Table -->
      <div class="academy-table-card">
        <div class="academy-table-header">
          <span class="academy-table-title">
            <i class="fa fa-table"></i> Collection Register
          </span>
          <span class="academy-table-count">
            <i class="fa fa-database"></i> {{ filteredPayments.length }} record{{ filteredPayments.length !== 1 ? 's' : '' }}
          </span>
        </div>

        <div class="academy-table-responsive">
          <table class="academy-table" *ngIf="filteredPayments.length > 0; else emptyState">
            <thead>
              <tr>
                <th>#</th>
                <th>Receipt #</th>
                <th>Student</th>
                <th>Challan #</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Received By</th>
                <th>Date & Time</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let payment of pagedPayments; let i = index">
                <td><span class="id-badge">{{ (currentPage - 1) * pageSize + i + 1 }}</span></td>
                <td>
                  <span class="receipt-number">#{{ payment.receiptNumber }}</span>
                </td>
                <td>
                  <div class="student-name">{{ payment.studentName }}</div>
                </td>
                <td>
                  <span class="challan-badge">{{ payment.challanNumber }}</span>
                </td>
                <td>
                  <span class="amount-value">{{ payment.amount | number:'1.0-0' }} PKR</span>
                </td>
                <td>
                  <span class="method-pill" [ngClass]="'method-' + payment.paymentMethod.toLowerCase()">
                    {{ getMethodLabel(payment.paymentMethod) }}
                  </span>
                </td>
                <td>{{ payment.receivedBy || 'N/A' }}</td>
                <td>
                  <div class="datetime-cell">
                    <div class="date-part">{{ formatDate(payment.paidAt) }}</div>
                    <div class="time-part">{{ formatTime(payment.paidAt) }}</div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <ng-template #emptyState>
            <div class="academy-table-empty">
              <i class="fa fa-inbox"></i>
              <p *ngIf="!startDate && !endDate">
                Select a date range to view collection records.
              </p>
              <p *ngIf="startDate || endDate">
                No payments found for the selected date range.
              </p>
            </div>
          </ng-template>
        </div>

        <!-- Pagination -->
        <div class="pagination-bar" *ngIf="totalPages > 1">
          <span class="pagination-info">
            Showing
            {{ (currentPage - 1) * pageSize + 1 }}
            –
            {{
              currentPage * pageSize > filteredPayments.length
                ? filteredPayments.length
                : currentPage * pageSize
            }}
            of {{ filteredPayments.length }}
          </span>
          <div class="pagination-controls">
            <button class="page-btn" (click)="changePage(currentPage - 1)" [disabled]="currentPage === 1">
              <i class="fa fa-chevron-left"></i>
            </button>
            <button
              *ngFor="let p of pageNumbers"
              class="page-num"
              [class.active]="p === currentPage"
              (click)="changePage(p)">
              {{ p }}
            </button>
            <button class="page-btn" (click)="changePage(currentPage + 1)" [disabled]="currentPage === totalPages">
              <i class="fa fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .collection-container { padding: 0; position: relative; }

    .page-header-card {
      background: #fff; border-radius: 16px; padding: 1.5rem 2rem; margin-bottom: 1.25rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;
    }
    .header-content {
      display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap;
    }
    .page-header-card h2 {
      margin: 0; font-size: 1.5rem; font-weight: 700; color: #0f2744;
      display: flex; align-items: center; gap: 0.6rem;
    }
    .page-header-card h2 i { color: #1e3a5f; }
    .page-subtitle { margin: 0.25rem 0 0; font-size: 0.9rem; color: #6a8cad; }

    .btn {
      display: inline-flex; align-items: center; gap: 0.45rem;
      border-radius: 999px; border: none; cursor: pointer;
      padding: 0.55rem 1.25rem; font-size: 0.9rem; font-weight: 600;
      transition: all 0.2s;
    }
    .btn:disabled {
      opacity: 0.5; cursor: not-allowed;
    }
    .btn-primary {
      background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); color: #fff;
      box-shadow: 0 4px 14px rgba(30,58,95,0.35);
    }
    .btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(30,58,95,0.4); }
    .btn-secondary {
      background: #6b7280; color: #fff;
    }
    .btn-secondary:hover { background: #4b5563; }
    .btn-sm {
      padding: 0.4rem 0.9rem; font-size: 0.85rem;
    }

    .filters-card {
      display: flex; gap: 1rem; margin-bottom: 1.25rem; padding: 1rem 1.2rem;
      background: #fff; border-radius: 12px; border: 1px solid #e5e7eb;
      box-shadow: 0 1px 3px rgba(15,23,42,0.04); flex-wrap: wrap; align-items: flex-end;
    }
    .date-filter-group {
      flex: 1; min-width: 300px;
    }
    .filter-label {
      display: block; margin-bottom: 0.4rem; font-size: 0.75rem;
      text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280; font-weight: 600;
    }
    .date-inputs {
      display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;
    }
    .date-input-wrapper {
      position: relative; display: flex; align-items: center;
    }
    .date-input-wrapper i {
      position: absolute; left: 0.9rem; color: #9ca3af; z-index: 1;
    }
    .date-input {
      padding: 0.6rem 0.9rem 0.6rem 2.5rem; border-radius: 0.75rem;
      border: 2px solid #d1d5db; font-size: 0.9rem; width: 180px;
    }
    .date-input:focus {
      outline: none; border-color: #1e3a5f; box-shadow: 0 0 0 3px rgba(30,58,95,0.12);
    }
    .date-separator {
      color: #6b7280; font-size: 0.9rem; font-weight: 500;
    }
    .filter-summary {
      display: flex; flex-direction: column; gap: 0.15rem; font-size: 0.85rem; color: #4b5563;
      min-width: 200px; text-align: right;
    }

    .summary-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1rem; margin-bottom: 1.25rem;
    }
    .summary-card {
      background: #fff; border-radius: 12px; padding: 1.25rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;
      display: flex; align-items: center; gap: 1rem;
    }
    .card-icon {
      width: 56px; height: 56px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem; flex-shrink: 0;
    }
    .card-cash .card-icon { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #fff; }
    .card-bank .card-icon { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #fff; }
    .card-online .card-icon { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: #fff; }
    .card-total .card-icon { background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); color: #fff; }
    .card-data {
      flex: 1; display: flex; flex-direction: column; gap: 0.15rem;
    }
    .card-value {
      font-size: 1.5rem; font-weight: 700; color: #111827;
    }
    .card-label {
      font-size: 0.85rem; color: #6b7280; font-weight: 500;
    }
    .card-count {
      font-size: 0.75rem; color: #9ca3af;
    }

    .academy-table-card {
      background: #fff; border-radius: 16px; overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;
    }
    .academy-table-header {
      padding: 1rem 1.25rem; background: #f7f9fc; border-bottom: 1px solid #e2e8f0;
      display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;
    }
    .academy-table-title {
      font-size: 0.98rem; font-weight: 700; color: #0f2744;
      display: flex; align-items: center; gap: 0.45rem;
    }
    .academy-table-count {
      font-size: 0.85rem; color: #6b7280;
      display: flex; align-items: center; gap: 0.35rem;
    }
    .academy-table-responsive { overflow-x: auto; }

    .academy-table {
      width: 100%; border-collapse: collapse; font-size: 0.9rem;
    }
    .academy-table thead { background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); }
    .academy-table th,
    .academy-table td {
      padding: 0.8rem 1rem; border-bottom: 1px solid #e5e7eb; text-align: left;
    }
    .academy-table th {
      color: #fff; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.06em;
    }
    .academy-table tbody tr:hover { background: #f7f9fc; }

    .id-badge {
      display: inline-flex; align-items: center; justify-content: center;
      min-width: 28px; height: 24px; border-radius: 999px;
      background: #eef2f7; color: #4b5563; font-weight: 600; font-size: 0.8rem;
    }
    .receipt-number {
      font-weight: 600; color: #1e3a5f; font-family: 'Courier New', monospace;
    }
    .student-name {
      font-weight: 600; color: #111827;
    }
    .challan-badge {
      padding: 0.15rem 0.5rem; border-radius: 6px;
      background: #eef2f7; color: #1e3a5f; font-size: 0.8rem; font-weight: 600;
      font-family: 'Courier New', monospace;
    }
    .amount-value {
      font-weight: 700; color: #059669; font-size: 0.95rem;
    }
    .method-pill {
      padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.78rem; font-weight: 600;
    }
    .method-pill.method-cash {
      background: #dcfce7; color: #166534;
    }
    .method-pill.method-bank {
      background: #dbeafe; color: #1e40af;
    }
    .method-pill.method-online {
      background: #ede9fe; color: #6d28d9;
    }
    .method-pill.method-cheque {
      background: #fef3c7; color: #92400e;
    }
    .datetime-cell {
      display: flex; flex-direction: column; gap: 0.1rem;
    }
    .date-part {
      font-size: 0.85rem; color: #111827; font-weight: 500;
    }
    .time-part {
      font-size: 0.75rem; color: #6b7280;
    }

    .academy-table-empty {
      padding: 2.5rem 1.5rem; text-align: center; color: #6b7280;
    }
    .academy-table-empty i {
      font-size: 2rem; margin-bottom: 0.5rem; color: #cbd5f5; display: block;
    }

    .pagination-bar {
      display: flex; justify-content: space-between; align-items: center;
      padding: 0.85rem 1.25rem; border-top: 1px solid #e2e8f0;
      background: #fafbfc; flex-wrap: wrap; gap: 0.6rem;
    }
    .pagination-info {
      font-size: 0.8rem; color: #6b7280;
    }
    .pagination-controls {
      display: flex; gap: 0.25rem;
    }
    .page-btn, .page-num {
      border-radius: 999px; border: 1px solid #e5e7eb; background: #fff;
      padding: 0.25rem 0.6rem; font-size: 0.78rem; cursor: pointer;
      min-width: 26px; transition: all 0.2s;
    }
    .page-btn:disabled {
      opacity: 0.5; cursor: not-allowed;
    }
    .page-num.active {
      background: #1e3a5f; border-color: #1e3a5f; color: #fff;
    }

    @media (max-width: 768px) {
      .summary-grid { grid-template-columns: 1fr; }
      .date-inputs { flex-direction: column; align-items: stretch; }
      .date-input { width: 100%; }
      .filters-card { flex-direction: column; align-items: stretch; }
      .filter-summary { text-align: left; }
    }

    @media print {
      .page-header-card, .filters-card, .summary-grid, .pagination-bar, .btn { display: none; }
      .collection-container { padding: 0; }
      .academy-table-card { box-shadow: none; border: none; }
      .academy-table { font-size: 0.8rem; }
      .academy-table th, .academy-table td { padding: 0.5rem; }
    }
  `]
})
export class FeeCollectionComponent implements OnInit {
  loading = false;
  allPayments: PaymentRecord[] = [];
  filteredPayments: PaymentRecord[] = [];
  pagedPayments: PaymentRecord[] = [];

  startDate: string = '';
  endDate: string = '';

  cashTotal = 0;
  cashCount = 0;
  bankTotal = 0;
  bankCount = 0;
  onlineTotal = 0;
  onlineCount = 0;
  totalAmount = 0;

  pageSize = 20;
  currentPage = 1;
  totalPages = 1;
  pageNumbers: number[] = [];

  constructor(
    private feeService: FeeService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.setToday();
  }

  setToday(): void {
    const today = new Date();
    this.startDate = this.formatDateForInput(today);
    this.endDate = this.formatDateForInput(today);
    this.applyDateFilter();
  }

  setThisMonth(): void {
    const today = new Date();
    this.startDate = this.formatDateForInput(new Date(today.getFullYear(), today.getMonth(), 1));
    this.endDate = this.formatDateForInput(today);
    this.applyDateFilter();
  }

  applyDateFilter(): void {
    if (!this.startDate && !this.endDate) {
      this.filteredPayments = [];
      this.updateSummaryFromBackend(0, 0, 0, 0, 0, 0, 0, 0);
      this.paginate();
      return;
    }

    this.loadFromBackend();
  }

  private loadFromBackend(): void {
    this.loading = true;

    const start = this.startDate || undefined;
    const end = this.endDate || undefined;

    this.feeService.getCollectionPayments(start, end).subscribe({
      next: (payments) => {
        this.allPayments = this.mapPayments(payments);
        this.filteredPayments = [...this.allPayments];
        this.paginate();
      },
      error: () => {
        this.notify.error('Failed to load collection payments.');
        this.loading = false;
      }
    });

    this.feeService.getCollectionSummary(start, end).subscribe({
      next: (summary) => {
        this.updateSummaryFromBackend(
          summary.cashTotal,
          summary.cashCount,
          summary.bankTotal,
          summary.bankCount,
          summary.onlineTotal,
          summary.onlineCount,
          summary.grandTotal,
          summary.totalCount
        );
      },
      error: () => {
        // Do not block UI if summary fails
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  private mapPayments(apiPayments: CollectionPayment[]): PaymentRecord[] {
    return apiPayments
      .map(p => ({
        receiptNumber: `RCP-${p.feePaymentId.toString().padStart(6, '0')}`,
        studentName: p.studentName || 'Unknown',
        challanNumber: p.challanNumber,
        amount: p.amount,
        paymentMethod: p.paymentMethod || 'Cash',
        receivedBy: p.receivedBy || 'N/A',
        paidAt: p.paidAt,
        challanId: p.feeChallanId,
        paymentId: p.feePaymentId
      }))
      .sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());
  }

  private updateSummaryFromBackend(
    cashTotal: number,
    cashCount: number,
    bankTotal: number,
    bankCount: number,
    onlineTotal: number,
    onlineCount: number,
    grandTotal: number,
    totalCount: number
  ): void {
    this.cashTotal = cashTotal;
    this.cashCount = cashCount;
    this.bankTotal = bankTotal;
    this.bankCount = bankCount;
    this.onlineTotal = onlineTotal;
    this.onlineCount = onlineCount;
    this.totalAmount = grandTotal;
  }

  paginate(): void {
    this.totalPages = Math.max(1, Math.ceil(this.filteredPayments.length / this.pageSize));
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedPayments = this.filteredPayments.slice(start, start + this.pageSize);
    this.buildPageNumbers();
  }

  changePage(p: number): void {
    if (p < 1 || p > this.totalPages || p === this.currentPage) return;
    this.currentPage = p;
    this.paginate();
  }

  buildPageNumbers(): void {
    const maxVisible = 5;
    const pages: number[] = [];
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = start + maxVisible - 1;
    if (end > this.totalPages) {
      end = this.totalPages;
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    this.pageNumbers = pages;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getMethodLabel(method: string): string {
    const methodMap: { [key: string]: string } = {
      'cash': 'Cash',
      'bank': 'Bank Transfer',
      'transfer': 'Bank Transfer',
      'bank transfer': 'Bank Transfer',
      'online': 'Online',
      'card': 'Card',
      'credit card': 'Credit Card',
      'debit card': 'Debit Card',
      'cheque': 'Cheque'
    };
    return methodMap[method.toLowerCase()] || method;
  }

  printRegister(): void {
    window.print();
  }
}
