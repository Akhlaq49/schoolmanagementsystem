import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FeeService } from '../../../../core/services/fee.service';
import { AcademicSessionService } from '../../../../core/services/academic-session.service';
import {
  FeeChallan, FeePayment, ChallanSummary,
  ChallanGenerateRequest, RecordPaymentRequest
} from '../../../../core/models/fee.model';
import { AcademicSession } from '../../../../core/models/academic-session.model';
import { NotificationService } from '../../../../shared/services/notification.service';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { DropdownComponent, DropdownOption } from '../../../../shared/components/dropdown/dropdown.component';
import { FeeReceiptComponent } from '../../../../shared/components/fee-receipt/fee-receipt.component';
import { WaiveChallanModalComponent } from '../../../../shared/components/waive-challan-modal/waive-challan-modal.component';

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

@Component({
  selector: 'app-fee-challans',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent, ConfirmDialogComponent, DropdownComponent, FeeReceiptComponent, WaiveChallanModalComponent],
  template: `
    <div class="challans-container">
      <app-loading [show]="loading" [message]="'Loading challans...'"></app-loading>

      <!-- ─── Page Header ───────────────────────────────────── -->
      <div class="page-header-card">
        <div class="header-content">
          <div>
            <h2><i class="fa fa-file-text-o"></i> Fee Challans</h2>
            <p class="page-subtitle">Generate, manage and track fee challans</p>
          </div>
          <button class="btn btn-primary" (click)="openGenerateModal()">
            <i class="fa fa-plus-circle"></i> Generate Monthly
          </button>
        </div>
      </div>

      <!-- ─── Summary Cards ─────────────────────────────────── -->
      <div class="summary-grid">
        <div class="summary-card card-total">
          <div class="card-icon"><i class="fa fa-files-o"></i></div>
          <div class="card-data">
            <span class="card-value">{{ summary.totalChallans }}</span>
            <span class="card-label">Total Challans</span>
          </div>
        </div>
        <div class="summary-card card-paid">
          <div class="card-icon"><i class="fa fa-check-circle"></i></div>
          <div class="card-data">
            <span class="card-value">{{ summary.paidCount }}</span>
            <span class="card-label">Paid</span>
          </div>
        </div>
        <div class="summary-card card-unpaid">
          <div class="card-icon"><i class="fa fa-clock-o"></i></div>
          <div class="card-data">
            <span class="card-value">{{ summary.unpaidCount }}</span>
            <span class="card-label">Unpaid</span>
          </div>
        </div>
        <div class="summary-card card-overdue">
          <div class="card-icon"><i class="fa fa-exclamation-triangle"></i></div>
          <div class="card-data">
            <span class="card-value">{{ summary.overdueCount }}</span>
            <span class="card-label">Overdue</span>
          </div>
        </div>
        <div class="summary-card card-collected">
          <div class="card-icon"><i class="fa fa-money"></i></div>
          <div class="card-data">
            <span class="card-value">{{ summary.collectedAmount | number:'1.0-0' }}</span>
            <span class="card-label">Collected</span>
          </div>
        </div>
        <div class="summary-card card-pending">
          <div class="card-icon"><i class="fa fa-hourglass-half"></i></div>
          <div class="card-data">
            <span class="card-value">{{ summary.pendingAmount | number:'1.0-0' }}</span>
            <span class="card-label">Pending</span>
          </div>
        </div>
      </div>

      <!-- ─── Filters ───────────────────────────────────────── -->
      <div class="filters-card">
        <div class="search-box">
          <i class="fa fa-search"></i>
          <input class="modern-form-control search-input"
                 placeholder="Search by student name, challan#..."
                 [(ngModel)]="searchTerm" (input)="applyFilters()">
        </div>
        <div class="filter-group">
          <app-dropdown
            [(ngModel)]="filterMonth"
            [options]="monthOptions"
            placeholder="All Months"
            [placeholderValue]="0"
            (changed)="onFilterChange()">
          </app-dropdown>
        </div>
        <div class="filter-group">
          <app-dropdown
            [(ngModel)]="filterYear"
            [options]="yearOptions"
            [showPlaceholderOption]="false"
            [searchable]="false"
            (changed)="onFilterChange()">
          </app-dropdown>
        </div>
        <div class="filter-group">
          <app-dropdown
            [(ngModel)]="filterStatus"
            [options]="statusOptions"
            placeholder="All Status"
            [placeholderValue]="''"
            [searchable]="false"
            (changed)="onFilterChange()">
          </app-dropdown>
        </div>
      </div>

      <!-- ─── Table Card ────────────────────────────────────── -->
      <div class="academy-table-card">
        <div class="academy-table-header">
          <span class="academy-table-title">
            <i class="fa fa-table"></i> Challans
          </span>
          <div class="academy-table-toolbar">
            <div class="show-entries">
              Show
              <app-dropdown
                [(ngModel)]="pageSize"
                [options]="pageSizeOptions"
                [showPlaceholderOption]="false"
                [searchable]="false"
                size="sm"
                (changed)="applyFilters()">
              </app-dropdown>
              entries
            </div>
            <span class="academy-table-count">
              <i class="fa fa-database"></i> {{ filteredList.length }} record{{ filteredList.length !== 1 ? 's' : '' }}
            </span>
          </div>
        </div>

        <div class="academy-table-responsive">
          <table class="academy-table" *ngIf="filteredList.length > 0">
            <thead>
              <tr>
                <th>#</th>
                <th>Challan #</th>
                <th>Student</th>
                <th>Period</th>
                <th>Due Date</th>
                <th>Amount</th>
                <th>Paid</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of paginatedList; let i = index">
                <td><span class="id-badge">{{ (currentPage - 1) * pageSize + i + 1 }}</span></td>
                <td>
                  <span class="challan-number">{{ c.challanNumber }}</span>
                  <span class="pro-rata-badge" *ngIf="c.isProRated">Pro-rata</span>
                </td>
                <td>
                  <div class="student-info">
                    <span class="student-name">{{ c.studentName }}</span>
                    <span class="sub-text">{{ c.className }}{{ c.sectionName ? ' - ' + c.sectionName : '' }}</span>
                  </div>
                </td>
                <td>{{ getMonthName(c.month) }} {{ c.year }}</td>
                <td>{{ c.dueDate | date:'mediumDate' }}</td>
                <td class="amount-cell">{{ c.totalAmount | number:'1.2-2' }}</td>
                <td class="amount-paid">{{ c.paidAmount | number:'1.2-2' }}</td>
                <td class="amount-balance">{{ c.balance | number:'1.2-2' }}</td>
                <td>
                  <span class="status-badge" [ngClass]="'badge-' + (c.status || '').toLowerCase()">
                    {{ c.status | titlecase }}
                  </span>
                </td>
                <td>
                  <div class="modern-table-actions">
                    <button class="modern-btn-icon modern-btn-pay"
                            *ngIf="canPayOrWaive(c)"
                            title="Record Payment"
                            (click)="openPaymentModal(c)">
                      <i class="fa fa-money"></i>
                    </button>
                    <button class="modern-btn-icon modern-btn-view"
                            title="View Detail"
                            (click)="openDetailModal(c)">
                      <i class="fa fa-eye"></i>
                    </button>
                    <button class="modern-btn-icon modern-btn-print"
                            title="Print"
                            (click)="printChallan(c)">
                      <i class="fa fa-print"></i>
                    </button>
                    <button class="modern-btn-icon modern-btn-waive"
                            *ngIf="canPayOrWaive(c)"
                            title="Waive"
                            (click)="waive(c)">
                      <i class="fa fa-ban"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="academy-table-empty" *ngIf="filteredList.length === 0 && !loading">
            <i class="fa fa-file-text-o"></i>
            <p>No challans found</p>
          </div>
        </div>

        <!-- Pagination -->
        <div class="pagination-bar" *ngIf="totalPages > 1">
          <span class="pagination-info">
            Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ currentPage * pageSize > filteredList.length ? filteredList.length : currentPage * pageSize }} of {{ filteredList.length }}
          </span>
          <div class="pagination-controls">
            <button class="page-btn" (click)="currentPage = currentPage - 1; paginate()" [disabled]="currentPage === 1">
              <i class="fa fa-chevron-left"></i>
            </button>
            <div class="page-numbers">
              <button *ngFor="let p of pageNumbers" class="page-num"
                      [class.active]="p === currentPage" (click)="currentPage = p; paginate()">
                {{ p }}
              </button>
            </div>
            <button class="page-btn" (click)="currentPage = currentPage + 1; paginate()" [disabled]="currentPage === totalPages">
              <i class="fa fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════
           MODAL: Generate Monthly Challans
           ═══════════════════════════════════════════════════════ -->
      <div class="modal-backdrop" *ngIf="showGenerateModal" (click)="showGenerateModal = false">
        <div class="modal-card modal-md" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3><i class="fa fa-calendar-plus-o"></i> Generate Monthly Challans</h3>
            <button class="modal-close" (click)="showGenerateModal = false"><i class="fa fa-times"></i></button>
          </div>
          <div class="modal-body">
            <div class="academy-form-row">
              <div class="academy-form-group">
                <label>Month <span class="required">*</span></label>
                <app-dropdown
                  [(ngModel)]="genForm.month"
                  [options]="monthOptions"
                  [showPlaceholderOption]="false">
                </app-dropdown>
              </div>
              <div class="academy-form-group">
                <label>Year <span class="required">*</span></label>
                <app-dropdown
                  [(ngModel)]="genForm.year"
                  [options]="yearOptions"
                  [showPlaceholderOption]="false"
                  [searchable]="false">
                </app-dropdown>
              </div>
            </div>
            <div class="academy-form-row">
              <div class="academy-form-group">
                <label>Academic Session <span class="required">*</span></label>
                <app-dropdown
                  [(ngModel)]="genForm.academicSessionId"
                  [options]="sessionOptions"
                  placeholder="Select session"
                  [placeholderValue]="0">
                </app-dropdown>
              </div>
              <div class="academy-form-group">
                <label>Due Day Override</label>
                <input type="number" class="academy-input" [(ngModel)]="genForm.dueDayOverride"
                       placeholder="Leave blank to use structure default" min="1" max="28">
                <span class="form-hint">1-28. Blank = use fee structure setting</span>
              </div>
            </div>
            <div class="academy-form-row single-col">
              <div class="academy-form-group">
                <label class="toggle-label">
                  <input type="checkbox" [(ngModel)]="genForm.applyLateFine">
                  <span class="toggle-text">Apply late fine for overdue challans</span>
                </label>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="showGenerateModal = false">Cancel</button>
            <button class="btn btn-primary" (click)="generateChallans()" [disabled]="generating">
              <i class="fa" [ngClass]="generating ? 'fa-spinner fa-spin' : 'fa-bolt'"></i>
              {{ generating ? 'Generating...' : 'Generate Challans' }}
            </button>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════
           MODAL: Record Payment
           ═══════════════════════════════════════════════════════ -->
      <div class="modal-backdrop" *ngIf="showPaymentModal" (click)="showPaymentModal = false">
        <div class="modal-card modal-md" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3><i class="fa fa-money"></i> Record Payment</h3>
            <button class="modal-close" (click)="showPaymentModal = false"><i class="fa fa-times"></i></button>
          </div>
          <div class="modal-body" *ngIf="selectedChallan">
            <div class="balance-box">
              <div class="balance-row">
                <span>Total Amount</span>
                <strong>{{ selectedChallan.totalAmount | number:'1.2-2' }}</strong>
              </div>
              <div class="balance-row">
                <span>Paid So Far</span>
                <strong class="text-success">{{ selectedChallan.paidAmount | number:'1.2-2' }}</strong>
              </div>
              <div class="balance-row balance-highlight">
                <span>Balance Due</span>
                <strong class="text-danger">{{ selectedChallan.balance | number:'1.2-2' }}</strong>
              </div>
            </div>

            <div class="academy-form-row" style="margin-top:1.25rem">
              <div class="academy-form-group">
                <label>Amount <span class="required">*</span></label>
                <input type="number" class="academy-input" [(ngModel)]="payForm.amount"
                       [max]="selectedChallan.balance" min="1">
              </div>
              <div class="academy-form-group">
                <label>Payment Method <span class="required">*</span></label>
                <app-dropdown
                  [(ngModel)]="payForm.paymentMethod"
                  [options]="paymentMethodOptions"
                  placeholder="Select method"
                  [placeholderValue]="''"
                  [searchable]="false">
                </app-dropdown>
              </div>
            </div>
            <div class="academy-form-row">
              <div class="academy-form-group">
                <label>Transaction Reference</label>
                <input type="text" class="academy-input" [(ngModel)]="payForm.transactionReference"
                       placeholder="e.g. Receipt #, Cheque #">
              </div>
              <div class="academy-form-group">
                <label>Received By</label>
                <input type="text" class="academy-input" [(ngModel)]="payForm.receivedBy"
                       placeholder="Name of collector">
              </div>
            </div>
            <div class="academy-form-row single-col">
              <div class="academy-form-group">
                <label>Remarks</label>
                <textarea class="academy-input" rows="2" [(ngModel)]="payForm.remarks"
                          placeholder="Optional notes..."></textarea>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="showPaymentModal = false">Cancel</button>
            <button class="btn btn-primary" (click)="recordPayment()" [disabled]="paying">
              <i class="fa" [ngClass]="paying ? 'fa-spinner fa-spin' : 'fa-check'"></i>
              {{ paying ? 'Processing...' : 'Record Payment' }}
            </button>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════
           MODAL: Challan Detail
           ═══════════════════════════════════════════════════════ -->
      <div class="modal-backdrop" *ngIf="showDetailModal" (click)="showDetailModal = false">
        <div class="modal-card modal-lg" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3><i class="fa fa-file-text"></i> Challan Detail</h3>
            <button class="modal-close" (click)="showDetailModal = false"><i class="fa fa-times"></i></button>
          </div>
          <div class="modal-body" *ngIf="detailChallan">
            <!-- Student Info -->
            <div class="detail-student-bar">
              <div class="detail-avatar">{{ getStudentInitials(detailChallan) }}</div>
              <div class="detail-student-info">
                <span class="detail-student-name">{{ detailChallan.studentName }}</span>
                <span class="sub-text">{{ detailChallan.className }}{{ detailChallan.sectionName ? ' - ' + detailChallan.sectionName : '' }}</span>
              </div>
              <span class="status-badge" [ngClass]="'badge-' + (detailChallan.status || '').toLowerCase()" style="margin-left:auto">
                {{ detailChallan.status | titlecase }}
              </span>
            </div>

            <!-- Breakdown Table -->
            <div class="detail-section">
              <h4><i class="fa fa-list-ul"></i> Fee Breakdown</h4>
              <table class="detail-table">
                <tbody>
                  <tr>
                    <td>Challan #</td>
                    <td class="text-right"><strong>{{ detailChallan.challanNumber }}</strong></td>
                  </tr>
                  <tr>
                    <td>Period</td>
                    <td class="text-right">{{ getMonthName(detailChallan.month) }} {{ detailChallan.year }}</td>
                  </tr>
                  <tr>
                    <td>Due Date</td>
                    <td class="text-right">{{ detailChallan.dueDate | date:'mediumDate' }}</td>
                  </tr>
                  <tr>
                    <td>Base Amount</td>
                    <td class="text-right">{{ detailChallan.baseAmount | number:'1.2-2' }}</td>
                  </tr>
                  <tr>
                    <td>Add-ons</td>
                    <td class="text-right">{{ detailChallan.addonsAmount | number:'1.2-2' }}</td>
                  </tr>
                  <tr *ngIf="detailChallan.discountAmount > 0">
                    <td>Discount</td>
                    <td class="text-right text-success">-{{ detailChallan.discountAmount | number:'1.2-2' }}</td>
                  </tr>
                  <tr *ngIf="detailChallan.lateFine > 0">
                    <td>Late Fine</td>
                    <td class="text-right text-danger">+{{ detailChallan.lateFine | number:'1.2-2' }}</td>
                  </tr>
                  <tr class="total-row">
                    <td><strong>Total</strong></td>
                    <td class="text-right"><strong>{{ detailChallan.totalAmount | number:'1.2-2' }}</strong></td>
                  </tr>
                  <tr>
                    <td>Paid</td>
                    <td class="text-right text-success">{{ detailChallan.paidAmount | number:'1.2-2' }}</td>
                  </tr>
                  <tr class="balance-row-detail">
                    <td><strong>Balance</strong></td>
                    <td class="text-right text-danger"><strong>{{ detailChallan.balance | number:'1.2-2' }}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Payment History -->
            <div class="detail-section" *ngIf="detailChallan.payments && detailChallan.payments.length > 0">
              <h4><i class="fa fa-history"></i> Payment History</h4>
              <table class="academy-table mini-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Reference</th>
                    <th>Received By</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let p of detailChallan.payments">
                    <td>{{ p.paidAt | date:'medium' }}</td>
                    <td class="amount-cell">{{ p.amount | number:'1.2-2' }}</td>
                    <td><span class="method-badge">{{ p.paymentMethod | titlecase }}</span></td>
                    <td>{{ p.transactionReference || '—' }}</td>
                    <td>{{ p.receivedBy || '—' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="detail-section" *ngIf="detailChallan.remarks">
              <h4><i class="fa fa-sticky-note-o"></i> Remarks</h4>
              <p class="remarks-text">{{ detailChallan.remarks }}</p>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="showDetailModal = false">Close</button>
            <button class="btn btn-primary" (click)="printChallan(detailChallan!)" *ngIf="detailChallan">
              <i class="fa fa-print"></i> Print
            </button>
          </div>
        </div>
      </div>

      <!-- Waive Challan Modal -->
      <app-waive-challan-modal
        [show]="showWaiveModal"
        [loading]="waiving"
        [challan]="waiveChallan && {
          challanNumber: waiveChallan.challanNumber,
          studentName: waiveChallan.studentName || '',
          className: waiveChallan.className || '',
          sectionName: waiveChallan.sectionName || '',
          month: waiveChallan.month,
          year: waiveChallan.year,
          totalAmount: waiveChallan.totalAmount,
          paidAmount: waiveChallan.paidAmount,
          balance: waiveChallan.balance
        }"
        (cancelled)="showWaiveModal = false"
        (confirmed)="onWaiveConfirmed($event)">
      </app-waive-challan-modal>

      <!-- Confirm Dialog -->
      <app-confirm-dialog
        *ngIf="confirmVisible"
        [show]="true"
        [title]="confirmTitle"
        [message]="confirmMessage"
        (confirmed)="onConfirmed()"
        (cancelled)="confirmVisible = false">
      </app-confirm-dialog>
      <!-- Printable Payment Receipt -->
      <app-fee-receipt
        [show]="receiptVisible"
        [receiptNumber]="latestReceipt?.receiptNumber || null"
        [challanNumber]="latestReceipt?.challanNumber || null"
        [paidAt]="latestReceipt?.paidAt || null"
        [studentName]="latestReceipt?.studentName || null"
        [className]="latestReceipt?.className || null"
        [sectionName]="latestReceipt?.sectionName || null"
        [paymentMethod]="latestReceipt?.paymentMethod || null"
        [receivedBy]="latestReceipt?.receivedBy || null"
        [totalAmount]="latestReceipt?.totalAmount || 0"
        [amountPaid]="latestReceipt?.amountPaid || 0"
        [balanceRemaining]="latestReceipt?.balanceRemaining || 0"
        [amountInWords]="latestReceipt?.amountInWords || null"
        [autoPrint]="true"
        (closed)="receiptVisible = false">
      </app-fee-receipt>
    </div>
  `,
  styles: [`
    /* ─── Container ──────────────────────────────────────── */
    .challans-container { padding: 0; position: relative; }

    /* ─── Page Header ────────────────────────────────────── */
    .page-header-card {
      background: #fff; border-radius: 16px; padding: 1.75rem 2rem; margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;
    }
    .header-content { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
    .page-header-card h2 {
      margin: 0; font-size: 1.5rem; font-weight: 700; color: #0f2744;
      display: flex; align-items: center; gap: 0.75rem;
    }
    .page-header-card h2 i { color: #1e3a5f; }
    .page-subtitle { margin: 0.25rem 0 0 0; font-size: 0.9375rem; color: #6a8cad; padding-left: 2.1rem; }

    /* ─── Summary Grid ───────────────────────────────────── */
    .summary-grid {
      display: grid; grid-template-columns: repeat(6, 1fr); gap: 1rem; margin-bottom: 1.5rem;
    }
    .summary-card {
      display: flex; align-items: center; gap: 1rem; padding: 1.25rem 1.25rem;
      background: #fff; border-radius: 14px; border: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06); position: relative; overflow: hidden;
    }
    .summary-card::before {
      content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%;
      border-radius: 14px 0 0 14px;
    }
    .card-total::before  { background: #1e3a5f; }
    .card-paid::before   { background: #059669; }
    .card-unpaid::before { background: #d97706; }
    .card-overdue::before{ background: #dc2626; }
    .card-collected::before { background: #2563eb; }
    .card-pending::before   { background: #7c3aed; }

    .card-icon {
      width: 46px; height: 46px; border-radius: 12px; display: flex;
      align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0;
    }
    .card-total .card-icon  { background: rgba(30,58,95,0.1);  color: #1e3a5f; }
    .card-paid .card-icon   { background: rgba(5,150,105,0.1); color: #059669; }
    .card-unpaid .card-icon { background: rgba(217,119,6,0.1); color: #d97706; }
    .card-overdue .card-icon{ background: rgba(220,38,38,0.1); color: #dc2626; }
    .card-collected .card-icon { background: rgba(37,99,235,0.1); color: #2563eb; }
    .card-pending .card-icon   { background: rgba(124,58,237,0.1); color: #7c3aed; }

    .card-data { display: flex; flex-direction: column; }
    .card-value { font-size: 1.375rem; font-weight: 700; color: #0f2744; line-height: 1.2; }
    .card-label { font-size: 0.8125rem; color: #6a8cad; font-weight: 500; margin-top: 0.15rem; }

    /* ─── Buttons ─────────────────────────────────────────── */
    .btn {
      display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.65rem 1.25rem;
      border: none; border-radius: 0.75rem; font-size: 0.9375rem; font-weight: 600;
      cursor: pointer; transition: all 0.2s;
    }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none !important; }
    .btn-primary {
      background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); color: #fff;
      box-shadow: 0 4px 14px rgba(30,58,95,0.35);
    }
    .btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(30,58,95,0.4); }
    .btn-secondary { background: #6b7280; color: #fff; }
    .btn-secondary:hover:not(:disabled) { background: #4b5563; }

    /* ─── Filters ─────────────────────────────────────────── */
    .filters-card {
      display: flex; gap: 1rem; margin-bottom: 1.5rem; padding: 1.25rem 1.5rem;
      background: #fff; border-radius: 12px; border: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04); flex-wrap: wrap; align-items: center;
    }
    .search-box { position: relative; flex: 1; min-width: 260px; }
    .search-box i { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #8aa8c4; z-index: 1; }
    .search-input { padding-left: 2.75rem !important; }
    .modern-form-control {
      padding: 0.65rem 1rem; border: 2px solid #d9e2ec; border-radius: 0.75rem;
      font-size: 0.9375rem; font-weight: 500; color: #0f2744; background: #fff;
      transition: border-color 0.2s, box-shadow 0.2s; width: 100%; box-sizing: border-box;
    }
    .modern-form-control:focus { outline: none; border-color: #1e3a5f; box-shadow: 0 0 0 4px rgba(30,58,95,0.12); }
    .filter-group { min-width: 170px; }
    .filter-select { min-width: 170px; cursor: pointer; }

    /* ─── Table Card ──────────────────────────────────────── */
    .academy-table-card {
      background: #fff; border-radius: 16px; overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;
    }
    .academy-table-header {
      padding: 1.25rem 1.5rem; background: #f7f9fc; border-bottom: 1px solid #e2e8f0;
      display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;
    }
    .academy-table-title {
      font-size: 1.0625rem; font-weight: 700; color: #0f2744;
      display: flex; align-items: center; gap: 0.5rem;
    }
    .academy-table-title i { color: #2c5282; }
    .academy-table-toolbar { display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap; }
    .show-entries { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; color: #6a8cad; }
    .entries-select {
      padding: 0.35rem 0.6rem; border-radius: 8px; border: 1px solid #e2e8f0;
      font-size: 0.9rem; background: white; min-width: 60px; cursor: pointer;
    }
    .academy-table-count {
      display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; color: #6a8cad;
    }

    /* ─── Table ───────────────────────────────────────────── */
    .academy-table-responsive { overflow-x: auto; }
    .academy-table { width: 100%; border-collapse: collapse; font-size: 0.9375rem; }
    .academy-table thead { background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); }
    .academy-table th {
      padding: 0.875rem 1rem; text-align: left; font-size: 0.8125rem;
      font-weight: 600; color: #fff; text-transform: uppercase; letter-spacing: 0.05em;
      white-space: nowrap;
    }
    .academy-table td { padding: 0.875rem 1rem; border-bottom: 1px solid #eef2f7; color: #435d7a; }
    .academy-table tbody tr:hover { background: #f7f9fc; }

    .id-badge {
      display: inline-flex; align-items: center; justify-content: center;
      min-width: 32px; height: 28px; padding: 0 0.5rem; background: #eef2f7;
      border-radius: 8px; font-weight: 600; color: #435d7a; font-size: 0.875rem;
    }
    .challan-number { font-weight: 700; color: #0f2744; font-size: 0.9rem; }
    .pro-rata-badge {
      display: inline-block; margin-left: 0.5rem; padding: 0.15rem 0.5rem;
      background: #fef3c7; color: #92400e; border-radius: 6px; font-size: 0.7rem;
      font-weight: 600; vertical-align: middle;
    }
    .student-info { display: flex; flex-direction: column; }
    .student-name { font-weight: 600; color: #0f2744; }
    .sub-text { font-size: 0.78rem; color: #8aa8c4; margin-top: 0.2rem; }
    .amount-cell { font-weight: 700; color: #0f2744; }
    .amount-paid { font-weight: 600; color: #059669; }
    .amount-balance { font-weight: 600; color: #dc2626; }

    .status-badge {
      display: inline-flex; padding: 0.25rem 0.7rem; border-radius: 20px;
      font-size: 0.78rem; font-weight: 600; letter-spacing: 0.02em;
    }
    .badge-paid    { background: #d1fae5; color: #065f46; }
    .badge-unpaid  { background: #fef3c7; color: #92400e; }
    .badge-partial { background: #dbeafe; color: #1e40af; }
    .badge-overdue { background: #fee2e2; color: #991b1b; }
    .badge-waived  { background: #e5e7eb; color: #4b5563; }

    /* ─── Table Actions ──────────────────────────────────── */
    .modern-table-actions { display: flex; gap: 0.4rem; }
    .modern-btn-icon {
      width: 32px; height: 32px; border-radius: 8px; border: none; cursor: pointer;
      display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s;
      color: #fff; font-size: 0.8rem;
    }
    .modern-btn-pay   { background: #059669; }
    .modern-btn-pay:hover { background: #047857; }
    .modern-btn-view  { background: #2563eb; }
    .modern-btn-view:hover { background: #1d4ed8; }
    .modern-btn-print { background: #6b7280; }
    .modern-btn-print:hover { background: #4b5563; }
    .modern-btn-waive { background: #d97706; }
    .modern-btn-waive:hover { background: #b45309; }

    /* ─── Table Empty ─────────────────────────────────────── */
    .academy-table-empty {
      text-align: center; padding: 3rem; color: #6a8cad;
    }
    .academy-table-empty i { font-size: 2.5rem; display: block; margin-bottom: 0.75rem; color: #c5d5e4; }
    .academy-table-empty p { margin: 0; font-size: 1rem; }

    /* ─── Pagination ──────────────────────────────────────── */
    .pagination-bar {
      display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem;
      border-top: 1px solid #e2e8f0; background: #fafbfc; flex-wrap: wrap; gap: 1rem;
    }
    .pagination-info { font-size: 0.9rem; color: #64748b; font-weight: 500; }
    .pagination-controls { display: flex; align-items: center; gap: 0.35rem; }
    .page-btn, .page-num {
      padding: 0.5rem 0.75rem; border: 1px solid #e2e8f0; background: #fff;
      border-radius: 8px; cursor: pointer; font-size: 0.9rem; font-weight: 500;
      min-width: 38px; color: #334155; transition: all 0.2s ease;
    }
    .page-btn:hover:not(:disabled), .page-num:hover:not(.active) {
      background: #f1f5f9; border-color: #cbd5e1; color: #0f172a;
    }
    .page-btn:disabled { opacity: 0.4; cursor: not-allowed; background: #f8fafc; }
    .page-num.active {
      background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%);
      color: white; border-color: transparent;
    }
    .page-numbers { display: flex; gap: 0.35rem; }

    /* ─── Modal ───────────────────────────────────────────── */
    .modal-backdrop {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(15, 39, 68, 0.45); backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center;
      z-index: 1000; padding: 1rem;
    }
    .modal-card {
      background: #fff; border-radius: 16px; width: 100%;
      box-shadow: 0 25px 60px rgba(0,0,0,0.2); max-height: 90vh;
      display: flex; flex-direction: column;
    }
    .modal-md { max-width: 580px; }
    .modal-lg { max-width: 740px; }
    .modal-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 1.5rem 2rem; border-bottom: 1px solid #e2e8f0;
    }
    .modal-header h3 {
      margin: 0; font-size: 1.25rem; font-weight: 700; color: #0f2744;
      display: flex; align-items: center; gap: 0.6rem;
    }
    .modal-header h3 i { color: #1e3a5f; }
    .modal-close {
      width: 36px; height: 36px; border-radius: 10px; border: none;
      background: #f1f5f9; color: #64748b; cursor: pointer;
      display: flex; align-items: center; justify-content: center; transition: all 0.2s;
    }
    .modal-close:hover { background: #e2e8f0; color: #0f172a; }
    .modal-body { padding: 1.5rem 2rem; overflow-y: auto; }
    .modal-footer {
      display: flex; gap: 0.75rem; justify-content: flex-end;
      padding: 1.25rem 2rem; border-top: 1px solid #e2e8f0;
    }

    /* ─── Form inside Modal ──────────────────────────────── */
    .academy-form-row {
      display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; margin-bottom: 1.25rem;
    }
    .academy-form-row.single-col { grid-template-columns: 1fr; }
    .academy-form-group { display: flex; flex-direction: column; }
    .academy-form-group label { margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 600; color: #1e3a5f; }
    .required { color: #dc2626; }
    .academy-input {
      padding: 0.75rem 1rem; border: 2px solid #d9e2ec; border-radius: 0.75rem;
      font-size: 0.9375rem; font-weight: 500; color: #0f2744; background: #fff;
      transition: border-color 0.2s, box-shadow 0.2s; width: 100%; box-sizing: border-box;
    }
    .academy-input:focus { outline: none; border-color: #1e3a5f; box-shadow: 0 0 0 4px rgba(30,58,95,0.12); }
    .form-hint { margin-top: 0.35rem; font-size: 0.78rem; color: #8aa8c4; }
    .waive-prompt { margin: 0; font-size: 0.9375rem; color: #435d7a; line-height: 1.6; }
    .waive-error { display: block; margin-top: 0.5rem; font-size: 0.8125rem; color: #dc2626; }
    .toggle-label {
      display: flex; align-items: center; gap: 0.6rem; cursor: pointer;
      font-size: 0.9375rem; font-weight: 500; color: #435d7a;
    }
    .toggle-text { user-select: none; }

    /* ─── Payment Balance Box ────────────────────────────── */
    .balance-box {
      background: #f7f9fc; border-radius: 12px; padding: 1rem 1.25rem;
      border: 1px solid #e2e8f0;
    }
    .balance-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 0.5rem 0; font-size: 0.9375rem; color: #435d7a;
    }
    .balance-row + .balance-row { border-top: 1px solid #eef2f7; }
    .balance-highlight {
      background: rgba(30,58,95,0.04); margin: 0 -1.25rem; padding: 0.65rem 1.25rem;
      border-radius: 0 0 12px 12px;
    }
    .text-success { color: #059669; }
    .text-danger  { color: #dc2626; }
    .text-right { text-align: right; }

    /* ─── Detail Modal ───────────────────────────────────── */
    .detail-student-bar {
      display: flex; align-items: center; gap: 1rem; padding: 1rem 1.25rem;
      background: #f7f9fc; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 1.5rem;
    }
    .detail-avatar {
      width: 48px; height: 48px; border-radius: 12px;
      background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%);
      color: #fff; font-weight: 700; font-size: 1rem;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .detail-student-info { display: flex; flex-direction: column; }
    .detail-student-name { font-weight: 700; color: #0f2744; font-size: 1.0625rem; }

    .detail-section { margin-bottom: 1.5rem; }
    .detail-section h4 {
      margin: 0 0 0.75rem 0; font-size: 0.9375rem; font-weight: 700; color: #1e3a5f;
      display: flex; align-items: center; gap: 0.5rem;
    }
    .detail-section h4 i { color: #2c5282; font-size: 0.875rem; }

    .detail-table {
      width: 100%; border-collapse: collapse;
    }
    .detail-table td {
      padding: 0.6rem 0.75rem; border-bottom: 1px solid #eef2f7;
      font-size: 0.9375rem; color: #435d7a;
    }
    .detail-table .total-row td {
      border-top: 2px solid #1e3a5f; border-bottom: 1px solid #e2e8f0;
      background: #f7f9fc; font-weight: 700; color: #0f2744;
    }
    .detail-table .balance-row-detail td {
      background: #fef2f2; font-weight: 700;
    }

    .mini-table { font-size: 0.875rem; }
    .mini-table thead { background: #f7f9fc !important; }
    .mini-table th {
      color: #6a8cad !important; font-size: 0.75rem !important;
      background: transparent !important; padding: 0.6rem 0.75rem !important;
      border-bottom: 2px solid #e2e8f0;
    }
    .mini-table td { padding: 0.5rem 0.75rem; }
    .method-badge {
      display: inline-flex; padding: 0.15rem 0.5rem; background: #eef2f7;
      border-radius: 6px; font-size: 0.78rem; color: #435d7a; font-weight: 600;
    }
    .remarks-text { margin: 0; color: #435d7a; font-size: 0.9375rem; line-height: 1.6; }

    /* ─── Responsive ──────────────────────────────────────── */
    @media (max-width: 1200px) {
      .summary-grid { grid-template-columns: repeat(3, 1fr); }
    }
    @media (max-width: 768px) {
      .header-content { flex-direction: column; align-items: flex-start; }
      .summary-grid { grid-template-columns: repeat(2, 1fr); }
      .filters-card { flex-direction: column; }
      .search-box { min-width: 100%; }
      .filter-group { min-width: 100%; }
      .academy-form-row { grid-template-columns: 1fr; }
      .modal-card { margin: 0.5rem; }
    }
    @media (max-width: 480px) {
      .summary-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class FeeChallansComponent implements OnInit {
  challans: FeeChallan[] = [];
  filteredList: FeeChallan[] = [];
  paginatedList: FeeChallan[] = [];
  sessions: AcademicSession[] = [];
  loading = false;

  summary: ChallanSummary = {
    totalChallans: 0, paidCount: 0, unpaidCount: 0, partialCount: 0,
    overdueCount: 0, totalAmount: 0, collectedAmount: 0, pendingAmount: 0
  };

  // Filters
  searchTerm = '';
  filterMonth = 0;
  filterYear = new Date().getFullYear();
  filterStatus = '';

  // Pagination
  pageSize = 10;
  currentPage = 1;
  totalPages = 1;
  pageNumbers: number[] = [];

  // Month / Year options
  months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: MONTH_NAMES[i + 1] }));
  years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  statusOptions: DropdownOption[] = [
    { value: 'Unpaid', label: 'Unpaid' },
    { value: 'Partial', label: 'Partial' },
    { value: 'Paid', label: 'Paid' },
    { value: 'Overdue', label: 'Overdue' },
    { value: 'Waived', label: 'Waived' }
  ];
  pageSizeOptions: DropdownOption[] = [
    { value: 10, label: '10' },
    { value: 25, label: '25' },
    { value: 50, label: '50' }
  ];
  paymentMethodOptions: DropdownOption[] = [
    { value: 'cash', label: 'Cash' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'online', label: 'Online' }
  ];

  get monthOptions(): DropdownOption[] {
    return this.months.map(m => ({ value: m.value, label: m.label }));
  }

  get yearOptions(): DropdownOption[] {
    return this.years.map(y => ({ value: y, label: String(y) }));
  }

  get sessionOptions(): DropdownOption[] {
    return this.sessions.map(s => ({
      value: s.academicSessionId,
      label: s.name + (s.isCurrent ? ' (Current)' : '')
    }));
  }

  // Generate Modal
  showGenerateModal = false;
  generating = false;
  genForm: ChallanGenerateRequest = {
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    academicSessionId: 0,
    applyLateFine: false
  };

  // Payment Modal
  showPaymentModal = false;
  paying = false;
  selectedChallan: FeeChallan | null = null;
  payForm: RecordPaymentRequest = { amount: 0, paymentMethod: '', remarks: '' };

  // Detail Modal
  showDetailModal = false;
  detailChallan: FeeChallan | null = null;

  // Waive Modal
  showWaiveModal = false;
  waiveChallan: FeeChallan | null = null;
  waiving = false;

  // Confirm
  confirmVisible = false;
  confirmTitle = '';
  confirmMessage = '';
  private pendingAction: (() => void) | null = null;

  // Receipt Modal
  receiptVisible = false;
  latestReceipt: {
    receiptNumber: string;
    challanNumber: string;
    paidAt: string;
    studentName: string;
    className: string;
    sectionName?: string | null;
    paymentMethod: string;
    receivedBy?: string | null;
    totalAmount: number;
    amountPaid: number;
    balanceRemaining: number;
    amountInWords?: string | null;
  } | null = null;

  constructor(
    private feeService: FeeService,
    private sessionService: AcademicSessionService,
    private notify: NotificationService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData(skipFullLoading = false) {
    if (!skipFullLoading) this.loading = true;
    const m = this.filterMonth || undefined;
    const y = this.filterYear || undefined;
    const s = (this.filterStatus || '').trim() || undefined;

    forkJoin({
      challans: this.feeService.getChallans(m, y, s).pipe(catchError(() => of([] as FeeChallan[]))),
      summary: this.feeService.getChallanSummary(m, y).pipe(catchError(() => of(this.summary))),
      sessions: this.sessionService.getAll().pipe(catchError(() => of([] as AcademicSession[])))
    }).subscribe({
      next: (res) => {
        this.challans = res.challans;
        this.summary = res.summary;
        this.sessions = res.sessions;

        const current = this.sessions.find(s => s.isCurrent);
        if (current && this.genForm.academicSessionId === 0) {
          this.genForm.academicSessionId = current.academicSessionId!;
        }

        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.notify.error('Failed to load challan data');
        this.loading = false;
      }
    });
  }

  onFilterChange() {
    this.loadData(true);
  }

  applyFilters() {
    let list = [...this.challans];

    if (this.filterStatus) {
      const statusLower = (this.filterStatus || '').toLowerCase();
      list = list.filter(c => (c.status || '').toLowerCase() === statusLower);
    }
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      list = list.filter(c =>
        (c.studentName || '').toLowerCase().includes(term) ||
        (c.challanNumber || '').toLowerCase().includes(term) ||
        (c.className || '').toLowerCase().includes(term)
      );
    }

    this.filteredList = list;
    this.currentPage = 1;
    this.paginate();
  }

  paginate() {
    this.totalPages = Math.max(1, Math.ceil(this.filteredList.length / this.pageSize));
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
    const start = (this.currentPage - 1) * this.pageSize;
    this.paginatedList = this.filteredList.slice(start, start + this.pageSize);
    this.buildPageNumbers();
  }

  buildPageNumbers() {
    const pages: number[] = [];
    const maxVisible = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let endPage = startPage + maxVisible - 1;
    if (endPage > this.totalPages) {
      endPage = this.totalPages;
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    this.pageNumbers = pages;
  }

  getMonthName(m: number): string {
    return MONTH_NAMES[m] || '';
  }

  getStudentInitials(c: FeeChallan): string {
    if (!c.studentName) return '?';
    return c.studentName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  canPayOrWaive(c: FeeChallan): boolean {
    const s = (c.status || '').toLowerCase();
    return s !== 'paid' && s !== 'waived';
  }

  // ─── Generate ──────────────────────────────────────────

  openGenerateModal() {
    this.genForm = {
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      academicSessionId: this.sessions.find(s => s.isCurrent)?.academicSessionId || 0,
      applyLateFine: false
    };
    this.showGenerateModal = true;
  }

  generateChallans() {
    if (!this.genForm.academicSessionId) {
      this.notify.error('Please select an academic session');
      return;
    }
    this.generating = true;
    this.feeService.generateChallans(this.genForm).subscribe({
      next: (res) => {
        this.notify.success(`${res.count} challan(s) generated successfully`);
        this.showGenerateModal = false;
        this.generating = false;
        this.loadData();
      },
      error: (err) => {
        this.notify.error(err?.error?.message || 'Failed to generate challans');
        this.generating = false;
      }
    });
  }

  // ─── Payment ───────────────────────────────────────────

  openPaymentModal(c: FeeChallan) {
    this.selectedChallan = c;
    this.payForm = { amount: c.balance, paymentMethod: '', remarks: '' };
    this.showPaymentModal = true;
  }

  recordPayment() {
    if (!this.selectedChallan) return;
    if (this.payForm.amount <= 0) {
      this.notify.error('Amount must be greater than 0');
      return;
    }
    if (!this.payForm.paymentMethod) {
      this.notify.error('Please select a payment method');
      return;
    }
    this.paying = true;
    this.feeService.recordPayment(this.selectedChallan.feeChallanId, this.payForm).subscribe({
      next: (updatedChallan) => {
        this.notify.success('Payment recorded successfully');
        this.showPaymentModal = false;
        this.paying = false;

        // Prepare printable receipt using latest payment info
        this.prepareLatestReceipt(updatedChallan);
        this.receiptVisible = true;

        // Refresh challans/summary
        this.loadData();
      },
      error: (err) => {
        this.notify.error(err?.error?.message || 'Failed to record payment');
        this.paying = false;
      }
    });
  }

  // ─── Detail ────────────────────────────────────────────

  openDetailModal(c: FeeChallan) {
    this.detailChallan = null;
    this.showDetailModal = true;
    this.feeService.getChallanById(c.feeChallanId).subscribe({
      next: (full) => this.detailChallan = full,
      error: () => {
        this.detailChallan = c;
      }
    });
  }

  // ─── Print ─────────────────────────────────────────────

  printChallan(c: FeeChallan) {
    const w = window.open('', '_blank', 'width=800,height=600');
    if (!w) return;
    w.document.write(`
      <html><head><title>Challan ${c.challanNumber}</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; padding: 2rem; color: #1a1a1a; }
        h2 { color: #1e3a5f; margin-bottom: 0.25rem; }
        .sub { color: #666; margin-bottom: 1.5rem; }
        table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
        th, td { padding: 0.6rem 0.75rem; border: 1px solid #ddd; text-align: left; font-size: 0.9rem; }
        th { background: #f5f7fa; font-weight: 600; }
        .total td { font-weight: 700; background: #f0f4f8; }
        .footer { margin-top: 2rem; text-align: center; font-size: 0.8rem; color: #999; }
      </style></head><body>
        <h2>Fee Challan</h2>
        <p class="sub">${c.challanNumber} &mdash; ${this.getMonthName(c.month)} ${c.year}</p>
        <table>
          <tr><td><strong>Student</strong></td><td>${c.studentName}</td></tr>
          <tr><td><strong>Class</strong></td><td>${c.className}${c.sectionName ? ' - ' + c.sectionName : ''}</td></tr>
          <tr><td><strong>Due Date</strong></td><td>${c.dueDate}</td></tr>
        </table>
        <table>
          <tr><th>Description</th><th style="text-align:right">Amount</th></tr>
          <tr><td>Base Fee</td><td style="text-align:right">${c.baseAmount.toFixed(2)}</td></tr>
          <tr><td>Add-ons</td><td style="text-align:right">${c.addonsAmount.toFixed(2)}</td></tr>
          ${c.discountAmount > 0 ? `<tr><td>Discount</td><td style="text-align:right">-${c.discountAmount.toFixed(2)}</td></tr>` : ''}
          ${c.lateFine > 0 ? `<tr><td>Late Fine</td><td style="text-align:right">+${c.lateFine.toFixed(2)}</td></tr>` : ''}
          <tr class="total"><td>Total</td><td style="text-align:right">${c.totalAmount.toFixed(2)}</td></tr>
          <tr><td>Paid</td><td style="text-align:right">${c.paidAmount.toFixed(2)}</td></tr>
          <tr class="total"><td>Balance Due</td><td style="text-align:right">${c.balance.toFixed(2)}</td></tr>
        </table>
        <p class="footer">This is a computer-generated challan. No signature required.</p>
      </body></html>
    `);
    w.document.close();
    w.print();
  }

  // ─── Waive ─────────────────────────────────────────────

  waive(c: FeeChallan) {
    this.waiveChallan = c;
    this.showWaiveModal = true;
  }

  submitWaive() {
    // kept for backward compatibility if referenced elsewhere
  }

  onWaiveConfirmed(payload: { reason: string; authorizedBy: string }) {
    if (!this.waiveChallan) return;
    const reason = payload.reason?.trim();
    if (!reason) return;

    this.waiving = true;
    this.feeService.waiveChallan(this.waiveChallan.feeChallanId, reason).subscribe({
      next: () => {
        this.notify.success('Challan waived successfully');
        this.showWaiveModal = false;
        this.waiveChallan = null;
        this.waiving = false;
        this.loadData();
      },
      error: (err) => {
        this.notify.error(err?.error?.message || 'Failed to waive challan');
        this.waiving = false;
      }
    });
  }

  onConfirmed() {
    this.confirmVisible = false;
    if (this.pendingAction) {
      this.pendingAction();
      this.pendingAction = null;
    }
  }

  private prepareLatestReceipt(challan: FeeChallan): void {
    const payments: FeePayment[] = challan.payments || [];
    // Try to infer the latest payment from payments array (fallback to current payForm)
    let latest: FeePayment | null = null;
    if (payments.length > 0) {
      latest = [...payments].sort((a, b) => {
        const aTime = new Date(a.paidAt).getTime();
        const bTime = new Date(b.paidAt).getTime();
        return bTime - aTime;
      })[0];
    }

    const feePaymentId = latest?.feePaymentId;
    const receiptNumber = feePaymentId != null
      ? `RCP-${feePaymentId.toString().padStart(6, '0')}`
      : challan.challanNumber || 'RECEIPT';

    this.latestReceipt = {
      receiptNumber,
      challanNumber: challan.challanNumber,
      paidAt: latest?.paidAt || new Date().toISOString(),
      studentName: challan.studentName || '',
      className: challan.className || '',
      sectionName: challan.sectionName || '',
      paymentMethod: latest?.paymentMethod || this.payForm.paymentMethod || '',
      receivedBy: latest?.receivedBy || this.payForm.receivedBy || '',
      totalAmount: challan.totalAmount,
      amountPaid: latest?.amount ?? this.payForm.amount,
      balanceRemaining: challan.balance,
      amountInWords: null
    };
  }
}
