import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface WaiveChallanInfo {
  challanNumber: string;
  studentName: string;
  className?: string;
  sectionName?: string;
  month?: number;
  year?: number;
  totalAmount: number;
  paidAmount: number;
  balance: number;
}

@Component({
  selector: 'app-waive-challan-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop" *ngIf="show" (click)="onBackdropClick()">
      <div class="modal-card modal-md" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>
            <i class="fa fa-ban"></i>
            Waive Challan
          </h3>
          <button class="modal-close" type="button" (click)="cancel()">
            <i class="fa fa-times"></i>
          </button>
        </div>

        <div class="modal-body" *ngIf="challan">
          <!-- Challan summary -->
          <div class="challan-summary">
            <div class="summary-left">
              <div class="summary-title">
                <span class="badge">{{ challan.challanNumber }}</span>
                <span class="status-pill">Waive Request</span>
              </div>
              <div class="summary-student">
                <div class="avatar">
                  {{ getInitials(challan.studentName) }}
                </div>
                <div>
                  <div class="student-name">{{ challan.studentName }}</div>
                  <div class="student-meta">
                    <span *ngIf="challan.className">
                      {{ challan.className }}
                      <span *ngIf="challan.sectionName"> · {{ challan.sectionName }}</span>
                    </span>
                    <span *ngIf="challan.month && challan.year" class="dot-separator">•</span>
                    <span *ngIf="challan.month && challan.year">
                      {{ getMonthName(challan.month) }} {{ challan.year }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div class="summary-right">
              <div class="amount-row">
                <span>Total</span>
                <strong>{{ challan.totalAmount | number: '1.0-0' }} PKR</strong>
              </div>
              <div class="amount-row">
                <span>Paid</span>
                <strong class="text-success">{{ challan.paidAmount | number: '1.0-0' }} PKR</strong>
              </div>
              <div class="amount-row amount-balance">
                <span>Balance to Waive</span>
                <strong class="text-danger">{{ challan.balance | number: '1.0-0' }} PKR</strong>
              </div>
            </div>
          </div>

          <!-- Reason and authorization -->
          <div class="form-grid">
            <div class="form-group full-width">
              <label>
                Reason for waiving
                <span class="required">*</span>
              </label>
              <textarea
                rows="3"
                class="academy-input"
                [(ngModel)]="reason"
                placeholder="e.g. Scholarship granted, fee adjustment, management approval..."
              ></textarea>
              <div class="error-text" *ngIf="showErrors && !reason.trim()">
                Please provide a reason for waiving this challan.
              </div>
            </div>

            <div class="form-group full-width">
              <label>
                Authorized by
                <span class="required">*</span>
              </label>
              <input
                type="text"
                class="academy-input"
                [(ngModel)]="authorizedBy"
                placeholder="Name / designation of the person authorizing"
              />
              <div class="error-text" *ngIf="showErrors && !authorizedBy.trim()">
                Please specify who is authorizing this waive.
              </div>
            </div>
          </div>

          <p class="disclaimer">
            <i class="fa fa-info-circle"></i>
            This action will mark the challan as <strong>Waived</strong> and set the outstanding balance to zero.
            Make sure this has been properly approved.
          </p>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" type="button" (click)="cancel()">
            Cancel
          </button>
          <button class="btn btn-primary" type="button" (click)="confirm()" [disabled]="loading">
            <i class="fa" [ngClass]="loading ? 'fa-spinner fa-spin' : 'fa-ban'"></i>
            {{ loading ? 'Waiving...' : 'Confirm Waive' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(15, 39, 68, 0.45);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 1rem;
      }

      .modal-card {
        background: #fff;
        border-radius: 16px;
        width: 100%;
        max-width: 620px;
        box-shadow: 0 25px 60px rgba(0, 0, 0, 0.2);
        display: flex;
        flex-direction: column;
        max-height: 90vh;
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.4rem 1.8rem;
        border-bottom: 1px solid #e2e8f0;
      }

      .modal-header h3 {
        margin: 0;
        font-size: 1.2rem;
        font-weight: 700;
        color: #0f2744;
        display: flex;
        align-items: center;
        gap: 0.6rem;
      }

      .modal-header h3 i {
        color: #dc2626;
      }

      .modal-close {
        width: 34px;
        height: 34px;
        border-radius: 999px;
        border: none;
        background: #f1f5f9;
        color: #64748b;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }

      .modal-close:hover {
        background: #e2e8f0;
        color: #0f172a;
      }

      .modal-body {
        padding: 1.4rem 1.8rem 1rem;
        overflow-y: auto;
      }

      .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        padding: 1.1rem 1.8rem;
        border-top: 1px solid #e2e8f0;
      }

      .challan-summary {
        display: flex;
        gap: 1.25rem;
        align-items: stretch;
        margin-bottom: 1.25rem;
      }

      .summary-left {
        flex: 1.4;
      }

      .summary-right {
        flex: 1;
        background: #f7f9fc;
        border-radius: 12px;
        padding: 0.85rem 1rem;
        border: 1px solid #e5e7eb;
      }

      .summary-title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.6rem;
      }

      .badge {
        display: inline-flex;
        align-items: center;
        padding: 0.2rem 0.6rem;
        border-radius: 999px;
        background: #eef2ff;
        color: #312e81;
        font-size: 0.78rem;
        font-weight: 600;
      }

      .status-pill {
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #b91c1c;
        background: #fee2e2;
        border-radius: 999px;
        padding: 0.1rem 0.6rem;
        font-weight: 700;
      }

      .summary-student {
        display: flex;
        gap: 0.75rem;
        align-items: center;
      }

      .avatar {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.78rem;
        font-weight: 700;
      }

      .student-name {
        font-weight: 600;
        color: #111827;
        font-size: 0.95rem;
      }

      .student-meta {
        font-size: 0.8rem;
        color: #6b7280;
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem;
      }

      .dot-separator {
        color: #d1d5db;
      }

      .amount-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.85rem;
        padding: 0.35rem 0;
      }

      .amount-row + .amount-row {
        border-top: 1px solid #e5e7eb;
      }

      .amount-row span {
        color: #6b7280;
      }

      .amount-row strong {
        font-weight: 700;
        color: #111827;
      }

      .amount-row.amount-balance {
        margin-top: 0.15rem;
      }

      .text-success {
        color: #059669;
      }

      .text-danger {
        color: #dc2626;
      }

      .form-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1rem;
        margin-top: 0.75rem;
      }

      .form-group {
        display: flex;
        flex-direction: column;
      }

      .form-group label {
        font-size: 0.84rem;
        font-weight: 600;
        color: #1e3a5f;
        margin-bottom: 0.35rem;
      }

      .required {
        color: #dc2626;
      }

      .academy-input {
        padding: 0.7rem 0.9rem;
        border-radius: 0.75rem;
        border: 2px solid #d1d5db;
        font-size: 0.9rem;
        width: 100%;
        box-sizing: border-box;
        transition: all 0.2s;
      }

      .academy-input:focus {
        outline: none;
        border-color: #1e3a5f;
        box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.12);
      }

      .error-text {
        margin-top: 0.3rem;
        font-size: 0.78rem;
        color: #dc2626;
      }

      .disclaimer {
        margin-top: 0.9rem;
        font-size: 0.8rem;
        color: #6b7280;
        display: flex;
        gap: 0.4rem;
        align-items: flex-start;
      }

      .disclaimer i {
        color: #f97316;
        margin-top: 0.05rem;
      }

      .btn {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        border-radius: 999px;
        border: none;
        cursor: pointer;
        padding: 0.55rem 1.15rem;
        font-size: 0.85rem;
        font-weight: 600;
        transition: all 0.2s;
      }

      .btn-primary {
        background: linear-gradient(135deg, #b91c1c 0%, #dc2626 100%);
        color: #fff;
        box-shadow: 0 4px 10px rgba(220, 38, 38, 0.35);
      }

      .btn-primary:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 14px rgba(220, 38, 38, 0.45);
      }

      .btn-secondary {
        background: #6b7280;
        color: #fff;
      }

      .btn-secondary:hover {
        background: #4b5563;
      }

      @media (max-width: 640px) {
        .challan-summary {
          flex-direction: column;
        }

        .modal-card {
          margin: 0.5rem;
        }
      }
    `,
  ],
})
export class WaiveChallanModalComponent {
  @Input() show: boolean = false;
  @Input() loading: boolean = false;
  @Input() challan: WaiveChallanInfo | null = null;

  @Output() cancelled = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<{ reason: string; authorizedBy: string }>();

  reason: string = '';
  authorizedBy: string = '';
  showErrors = false;

  onBackdropClick(): void {
    this.cancel();
  }

  cancel(): void {
    this.show = false;
    this.cancelled.emit();
  }

  confirm(): void {
    this.showErrors = true;
    if (!this.reason.trim() || !this.authorizedBy.trim()) {
      return;
    }
    this.confirmed.emit({
      reason: this.reason.trim(),
      authorizedBy: this.authorizedBy.trim(),
    });
  }

  getInitials(name: string | undefined): string {
    if (!name) return '?';
    return name
      .split(' ')
      .filter((p) => !!p)
      .map((p) => p[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getMonthName(month?: number): string {
    if (!month || month < 1 || month > 12) return '';
    const names = [
      '',
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return names[month] || '';
  }
}

