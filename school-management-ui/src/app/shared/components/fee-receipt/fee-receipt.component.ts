import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-fee-receipt',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="show" class="receipt-overlay" (click)="onBackdropClick()">
      <div class="receipt-dialog" (click)="$event.stopPropagation()">
        <div class="receipt-toolbar">
          <div class="toolbar-left">
            <span class="toolbar-title">
              <i class="fa fa-receipt"></i>
              Payment Receipt
            </span>
            <span class="toolbar-subtitle">
              Receipt #{{ receiptNumber || '—' }} ·
              {{ paidAt ? (paidAt | date: 'dd MMM, yyyy · h:mm a') : 'No date' }}
            </span>
          </div>
          <div class="toolbar-actions">
            <button class="btn btn-secondary" type="button" (click)="close()">
              <i class="fa fa-times"></i>
              Close
            </button>
            <button class="btn btn-primary" type="button" (click)="printReceipt()">
              <i class="fa fa-print"></i>
              Print
            </button>
          </div>
        </div>

        <div #receiptContainer class="receipt-paper">
          <div class="receipt-header">
            <div class="school-identity">
              <div class="school-name">{{ schoolName || 'Your School Name' }}</div>
              <div class="school-meta">
                <span *ngIf="schoolAddress">{{ schoolAddress }}</span>
                <span *ngIf="schoolPhone">
                  · Phone: {{ schoolPhone }}
                </span>
              </div>
            </div>
            <div class="receipt-meta">
              <div class="meta-row">
                <span class="meta-label">Receipt #</span>
                <span class="meta-value">#{{ receiptNumber || '—' }}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Challan Ref.</span>
                <span class="meta-value">{{ challanNumber || '—' }}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Date</span>
                <span class="meta-value">
                  {{
                    paidAt
                      ? (paidAt | date: 'dd MMM, yyyy')
                      : (currentDate | date: 'dd MMM, yyyy')
                  }}
                </span>
              </div>
            </div>
          </div>

          <div class="receipt-body">
            <div class="section">
              <div class="section-title">
                <i class="fa fa-user-graduate"></i>
                Student Information
              </div>
              <div class="section-grid">
                <div class="field">
                  <div class="field-label">Student Name</div>
                  <div class="field-value">{{ studentName || '—' }}</div>
                </div>
                <div class="field">
                  <div class="field-label">Class / Section</div>
                  <div class="field-value">
                    {{ className || '—' }}<span *ngIf="sectionName"> · {{ sectionName }}</span>
                  </div>
                </div>
                <div class="field">
                  <div class="field-label">Payment Method</div>
                  <div class="field-value method-pill">
                    <i class="fa fa-money-bill-wave" *ngIf="paymentMethod | lowercase as m" [ngClass]="{
                      'fa-university': m === 'bank' || m === 'transfer' || m === 'bank transfer',
                      'fa-credit-card': m === 'card' || m === 'online' || m === 'credit card' || m === 'debit card',
                      'fa-money-bill-wave': m === 'cash' || !m
                    }"></i>
                    {{ paymentMethod || 'Cash' }}
                  </div>
                </div>
                <div class="field">
                  <div class="field-label">Received By</div>
                  <div class="field-value">{{ receivedBy || '—' }}</div>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">
                <i class="fa fa-list"></i>
                Payment Details
              </div>

              <table class="amount-table">
                <tbody>
                  <tr>
                    <td class="label-cell">Total Challan Amount</td>
                    <td class="value-cell">
                      {{ totalAmount | number: '1.0-0' }} PKR
                    </td>
                  </tr>
                  <tr>
                    <td class="label-cell">Amount Paid</td>
                    <td class="value-cell highlight">
                      {{ amountPaid | number: '1.0-0' }} PKR
                    </td>
                  </tr>
                  <tr>
                    <td class="label-cell">Remaining Balance</td>
                    <td class="value-cell balance" [ngClass]="{ 'zero': balanceRemaining <= 0 }">
                      <span *ngIf="balanceRemaining > 0">
                        {{ balanceRemaining | number: '1.0-0' }} PKR
                      </span>
                      <span *ngIf="balanceRemaining <= 0">
                        0 PKR (Paid in full)
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div class="amount-in-words" *ngIf="amountInWords">
                Amount in words:
                <span class="words">{{ amountInWords }}</span>
              </div>
            </div>

            <div class="section footer-section">
              <div class="notes">
                <div class="notes-title">
                  <i class="fa fa-info-circle"></i>
                  Notes
                </div>
                <div class="notes-text">
                  {{ notes || 'This is a system-generated receipt for the recorded payment against the above challan.' }}
                </div>
              </div>
              <div class="signature-block">
                <div class="signature-line"></div>
                <div class="signature-label">Authorized Signature</div>
              </div>
            </div>
          </div>

          <div class="receipt-footer">
            <span>Thank you for your payment.</span>
            <span class="footer-meta">
              Generated on {{ currentDate | date: 'dd MMM, yyyy · h:mm a' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .receipt-overlay {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.65);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 11000;
        padding: 1.5rem;
      }

      .receipt-dialog {
        background: transparent;
        max-width: 900px;
        width: 100%;
      }

      .receipt-toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        margin-bottom: 0.75rem;
        color: #e5e7eb;
      }

      .toolbar-left {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
      }

      .toolbar-title {
        font-weight: 600;
        font-size: 0.98rem;
        display: flex;
        align-items: center;
        gap: 0.4rem;
      }

      .toolbar-title i {
        color: #fbbf24;
      }

      .toolbar-subtitle {
        font-size: 0.8rem;
        color: #9ca3af;
      }

      .toolbar-actions {
        display: flex;
        gap: 0.5rem;
      }

      .btn {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        border-radius: 999px;
        border: none;
        cursor: pointer;
        padding: 0.45rem 1rem;
        font-size: 0.85rem;
        font-weight: 600;
        transition: all 0.2s;
      }

      .btn-primary {
        background: linear-gradient(135deg, #1e3a8a, #2563eb);
        color: #f9fafb;
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.45);
      }

      .btn-primary:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 18px rgba(37, 99, 235, 0.55);
      }

      .btn-secondary {
        background: rgba(15, 23, 42, 0.75);
        color: #e5e7eb;
        border: 1px solid rgba(148, 163, 184, 0.6);
      }

      .btn-secondary:hover {
        background: rgba(15, 23, 42, 0.95);
      }

      .receipt-paper {
        background: #f9fafb;
        border-radius: 16px;
        padding: 1.75rem 2rem;
        box-shadow: 0 20px 40px rgba(15, 23, 42, 0.45);
        border: 1px solid #e5e7eb;
        position: relative;
      }

      .receipt-header {
        display: flex;
        justify-content: space-between;
        gap: 1.5rem;
        border-bottom: 1px dashed #d1d5db;
        padding-bottom: 1rem;
        margin-bottom: 1.25rem;
      }

      .school-identity {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .school-name {
        font-size: 1.25rem;
        font-weight: 700;
        color: #0f172a;
        letter-spacing: 0.03em;
        text-transform: uppercase;
      }

      .school-meta {
        font-size: 0.8rem;
        color: #6b7280;
      }

      .receipt-meta {
        min-width: 220px;
        align-self: flex-start;
        background: #f3f4f6;
        border-radius: 0.75rem;
        padding: 0.75rem 1rem;
        border: 1px solid #e5e7eb;
      }

      .meta-row {
        display: flex;
        justify-content: space-between;
        font-size: 0.8rem;
        margin-bottom: 0.35rem;
      }

      .meta-row:last-child {
        margin-bottom: 0;
      }

      .meta-label {
        color: #6b7280;
        font-weight: 500;
      }

      .meta-value {
        color: #111827;
        font-weight: 600;
      }

      .receipt-body {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }

      .section {
        border-radius: 0.75rem;
        padding: 0.9rem 1rem;
        background: #ffffff;
        border: 1px solid #e5e7eb;
      }

      .section-title {
        font-size: 0.9rem;
        font-weight: 600;
        color: #111827;
        display: flex;
        align-items: center;
        gap: 0.4rem;
        margin-bottom: 0.75rem;
      }

      .section-title i {
        color: #2563eb;
      }

      .section-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 0.75rem 1.5rem;
      }

      .field-label {
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #9ca3af;
        margin-bottom: 0.15rem;
      }

      .field-value {
        font-size: 0.9rem;
        font-weight: 600;
        color: #111827;
      }

      .method-pill {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.2rem 0.6rem;
        border-radius: 999px;
        font-size: 0.78rem;
        background: #e0f2fe;
        color: #0369a1;
      }

      .method-pill i {
        font-size: 0.78rem;
      }

      .amount-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 0.25rem;
        font-size: 0.9rem;
      }

      .amount-table td {
        padding: 0.4rem 0;
      }

      .label-cell {
        color: #4b5563;
      }

      .value-cell {
        text-align: right;
        font-weight: 600;
        color: #111827;
        white-space: nowrap;
      }

      .value-cell.highlight {
        color: #059669;
      }

      .value-cell.balance {
        color: #dc2626;
      }

      .value-cell.balance.zero {
        color: #16a34a;
      }

      .amount-in-words {
        margin-top: 0.75rem;
        font-size: 0.82rem;
        color: #4b5563;
      }

      .amount-in-words .words {
        font-weight: 600;
      }

      .footer-section {
        display: flex;
        justify-content: space-between;
        gap: 1.25rem;
        align-items: flex-end;
      }

      .notes {
        flex: 1;
      }

      .notes-title {
        font-size: 0.82rem;
        font-weight: 600;
        color: #6b7280;
        display: flex;
        align-items: center;
        gap: 0.3rem;
        margin-bottom: 0.25rem;
      }

      .notes-title i {
        color: #f59e0b;
      }

      .notes-text {
        font-size: 0.82rem;
        color: #6b7280;
      }

      .signature-block {
        min-width: 180px;
        text-align: center;
      }

      .signature-line {
        border-bottom: 1px solid #9ca3af;
        margin-bottom: 0.35rem;
        margin-top: 1.2rem;
      }

      .signature-label {
        font-size: 0.8rem;
        color: #6b7280;
      }

      .receipt-footer {
        margin-top: 1.15rem;
        border-top: 1px dashed #d1d5db;
        padding-top: 0.7rem;
        display: flex;
        justify-content: space-between;
        font-size: 0.78rem;
        color: #6b7280;
      }

      .footer-meta {
        font-style: italic;
      }

      @media (max-width: 768px) {
        .receipt-overlay {
          padding: 0.75rem;
          align-items: stretch;
        }

        .receipt-paper {
          padding: 1.25rem 1.2rem;
          border-radius: 12px;
        }

        .receipt-header {
          flex-direction: column;
        }

        .receipt-meta {
          width: 100%;
        }

        .footer-section {
          flex-direction: column;
          align-items: stretch;
        }

        .signature-block {
          align-self: flex-end;
        }

        .receipt-toolbar {
          flex-direction: column;
          align-items: flex-start;
        }

        .toolbar-actions {
          align-self: stretch;
          justify-content: flex-end;
        }
      }

      @media print {
        .receipt-overlay {
          position: static;
          background: transparent;
          padding: 0;
        }

        .receipt-dialog {
          max-width: 100%;
        }

        .receipt-toolbar {
          display: none !important;
        }

        .receipt-paper {
          box-shadow: none;
          border-radius: 0;
          border: none;
          padding: 0;
        }
      }
    `,
  ],
})
export class FeeReceiptComponent implements OnChanges {
  @Input() show: boolean = false;

  // Receipt meta
  @Input() receiptNumber: string | null = null;
  @Input() challanNumber: string | null = null;
  @Input() paidAt: string | null = null;

  // Student & payment info
  @Input() studentName: string | null = null;
  @Input() className: string | null = null;
  @Input() sectionName: string | null = null;
  @Input() paymentMethod: string | null = null;
  @Input() receivedBy: string | null = null;

  // Amounts
  @Input() totalAmount: number = 0;
  @Input() amountPaid: number = 0;
  @Input() balanceRemaining: number = 0;
  @Input() amountInWords: string | null = null;

  // Notes
  @Input() notes: string | null = null;

  // School branding (optional)
  @Input() schoolName: string | null = null;
  @Input() schoolAddress: string | null = null;
  @Input() schoolPhone: string | null = null;

  // Behavior
  @Input() autoPrint: boolean = false;

  @Output() closed = new EventEmitter<void>();

  @ViewChild('receiptContainer') receiptContainer?: ElementRef<HTMLDivElement>;

  currentDate = new Date();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['show'] && this.show) {
      this.currentDate = new Date();
      if (this.autoPrint) {
        // Give Angular time to render the receipt before printing
        setTimeout(() => this.printReceipt(), 300);
      }
    }
  }

  onBackdropClick(): void {
    this.close();
  }

  close(): void {
    this.show = false;
    this.closed.emit();
  }

  printReceipt(): void {
    if (!this.receiptContainer) {
      window.print();
      return;
    }

    const printContents = this.receiptContainer.nativeElement.innerHTML;
    const popupWin = window.open('', '_blank', 'width=900,height=600,scrollbars=yes');

    if (!popupWin) {
      // Fallback to normal print if popup blocked
      window.print();
      return;
    }

    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
          <title>Payment Receipt</title>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
          <style>
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              background: #f3f4f6;
              padding: 1.5rem;
            }
            .print-wrapper {
              max-width: 900px;
              margin: 0 auto;
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="print-wrapper">
            ${printContents}
          </div>
        </body>
      </html>
    `);
    popupWin.document.close();
  }
}

