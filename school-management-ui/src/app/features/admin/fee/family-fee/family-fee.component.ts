import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';

interface FamilyChildFeeRow {
  studentId: number;
  studentName: string;
  className: string;
  sectionName?: string | null;
  outstandingAmount: number;
  lastPaymentDate?: string | null;
}

@Component({
  selector: 'app-family-fee',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="family-fee-container">
      <!-- Header -->
      <div class="page-header-card">
        <div class="header-content">
          <div>
            <h2>
              <i class="fa fa-users"></i>
              Family Fee Summary
            </h2>
            <p class="page-subtitle">
              View fee status for all children in a family, with combined outstanding balance.
            </p>
          </div>
        </div>
      </div>

      <!-- Search / Family Selection -->
      <div class="filters-card">
        <div class="search-section">
          <label class="filter-label">Search Family</label>
          <div class="search-group">
            <div class="search-input-wrapper">
              <i class="fa fa-search"></i>
              <input
                type="text"
                class="academy-input search-input"
                placeholder="Search by family name, father name or phone..."
                [(ngModel)]="searchText"
                (keyup.enter)="onSearch()"
              />
            </div>
            <button class="btn btn-secondary btn-sm" type="button" (click)="onSearch()">
              <i class="fa fa-search"></i>
              Search
            </button>
          </div>
          <p class="filter-hint">
            You can also open this view directly from Defaulter Families or by family ID in the URL.
          </p>
        </div>
        <div class="family-summary" *ngIf="familyName">
          <div class="family-label">Selected Family</div>
          <div class="family-name">
            <i class="fa fa-home"></i>
            {{ familyName }}
          </div>
          <div class="family-meta" *ngIf="children.length > 0">
            <span>{{ children.length }} child{{ children.length !== 1 ? 'ren' : '' }}</span>
            <span>·</span>
            <span>
              Combined Outstanding:
              <strong>{{ combinedOutstanding | number: '1.0-0' }} PKR</strong>
            </span>
          </div>
        </div>
      </div>

      <!-- Summary Card -->
      <div class="summary-grid" *ngIf="children.length > 0">
        <div class="summary-card card-outstanding">
          <div class="card-icon">
            <i class="fa fa-balance-scale"></i>
          </div>
          <div class="card-data">
            <span class="card-value">
              {{ combinedOutstanding | number: '1.0-0' }} PKR
            </span>
            <span class="card-label">Combined Outstanding</span>
            <span class="card-sub">
              Across {{ children.length }} child{{ children.length !== 1 ? 'ren' : '' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Children Table -->
      <div class="modern-table-card">
        <div class="modern-table-header">
          <div class="modern-table-title">
            <i class="fa fa-table"></i>
            Children Fee Overview
          </div>
          <div class="modern-table-count" *ngIf="children.length > 0">
            <i class="fa fa-users"></i>
            {{ children.length }} child{{ children.length !== 1 ? 'ren' : '' }}
          </div>
        </div>

        <div *ngIf="children.length === 0" class="modern-table-empty">
          <i class="fa fa-inbox"></i>
          <p>No family selected yet.</p>
          <span>Search by family to view fee details for all associated students.</span>
        </div>

        <div class="modern-table-responsive" *ngIf="children.length > 0">
          <table class="modern-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Student</th>
                <th>Class / Section</th>
                <th>Outstanding</th>
                <th>Last Payment</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let child of children; let i = index">
                <td>{{ i + 1 }}</td>
                <td>
                  <div class="student-cell">
                    <div class="avatar">
                      {{ getInitials(child.studentName) }}
                    </div>
                    <div class="student-meta">
                      <div class="student-name">{{ child.studentName }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="class-pill">
                    {{ child.className }}
                    <span *ngIf="child.sectionName"> · {{ child.sectionName }}</span>
                  </span>
                </td>
                <td>
                  <span
                    class="amount-badge"
                    [ngClass]="{
                      'amount-zero': child.outstandingAmount <= 0,
                      'amount-positive': child.outstandingAmount > 0
                    }"
                  >
                    {{ child.outstandingAmount | number: '1.0-0' }} PKR
                  </span>
                </td>
                <td>
                  <span *ngIf="child.lastPaymentDate; else noPayment">
                    {{ child.lastPaymentDate | date: 'dd MMM, yyyy' }}
                  </span>
                  <ng-template #noPayment>
                    <span class="no-payment">No payments yet</span>
                  </ng-template>
                </td>
                <td class="actions-cell">
                  <div class="actions-group">
                    <button
                      class="btn btn-primary btn-xs"
                      type="button"
                      (click)="onPay(child)"
                      [disabled]="child.outstandingAmount <= 0"
                    >
                      <i class="fa fa-money"></i>
                      Pay
                    </button>
                    <a
                      class="btn btn-secondary btn-xs"
                      [routerLink]="['/admin/fee/student', child.studentId]"
                    >
                      <i class="fa fa-external-link"></i>
                      View
                    </a>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .family-fee-container {
        padding: 0;
        position: relative;
      }

      .page-header-card {
        background: #fff;
        border-radius: 16px;
        padding: 1.75rem 2rem;
        margin-bottom: 1.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
        border: 1px solid #e2e8f0;
      }

      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 1rem;
      }

      .page-header-card h2 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 700;
        color: #0f2744;
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .page-header-card h2 i {
        color: #1e3a5f;
      }

      .page-subtitle {
        margin: 0.25rem 0 0 0;
        font-size: 0.9375rem;
        color: #6a8cad;
        padding-left: 2.1rem;
      }

      .filters-card {
        display: flex;
        gap: 1.5rem;
        margin-bottom: 1.5rem;
        padding: 1.25rem 1.5rem;
        background: #fff;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        flex-wrap: wrap;
        align-items: flex-start;
      }

      .search-section {
        flex: 1;
        min-width: 260px;
      }

      .filter-label {
        display: block;
        margin-bottom: 0.4rem;
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: #6b7280;
        font-weight: 600;
      }

      .search-group {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .search-input-wrapper {
        position: relative;
        flex: 1;
        min-width: 220px;
      }

      .search-input-wrapper i {
        position: absolute;
        left: 0.9rem;
        top: 50%;
        transform: translateY(-50%);
        color: #9ca3af;
        z-index: 1;
      }

      .search-input {
        padding-left: 2.4rem;
      }

      .academy-input {
        padding: 0.6rem 0.9rem;
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

      .filter-hint {
        margin-top: 0.5rem;
        font-size: 0.8rem;
        color: #9ca3af;
      }

      .family-summary {
        min-width: 240px;
        padding-left: 1rem;
        border-left: 1px dashed #e5e7eb;
      }

      .family-label {
        font-size: 0.78rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #9ca3af;
        margin-bottom: 0.15rem;
        font-weight: 600;
      }

      .family-name {
        font-size: 1rem;
        font-weight: 700;
        color: #111827;
        display: flex;
        align-items: center;
        gap: 0.4rem;
      }

      .family-name i {
        color: #1e3a5f;
      }

      .family-meta {
        margin-top: 0.35rem;
        font-size: 0.85rem;
        color: #6b7280;
        display: flex;
        gap: 0.35rem;
        align-items: center;
      }

      .btn {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        border-radius: 999px;
        border: none;
        cursor: pointer;
        padding: 0.5rem 1rem;
        font-size: 0.85rem;
        font-weight: 600;
        transition: all 0.2s;
      }

      .btn-sm {
        padding: 0.4rem 0.9rem;
        font-size: 0.8rem;
      }

      .btn-xs {
        padding: 0.3rem 0.7rem;
        font-size: 0.78rem;
      }

      .btn-primary {
        background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%);
        color: #fff;
        box-shadow: 0 4px 10px rgba(30, 58, 95, 0.35);
      }

      .btn-primary:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(30, 58, 95, 0.45);
      }

      .btn-secondary {
        background: #6b7280;
        color: #fff;
      }

      .btn-secondary:hover {
        background: #4b5563;
      }

      .summary-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 1rem;
        margin-bottom: 1.25rem;
      }

      .summary-card {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1.25rem 1.25rem;
        background: #fff;
        border-radius: 14px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
        position: relative;
        overflow: hidden;
      }

      .summary-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 4px;
        height: 100%;
        border-radius: 14px 0 0 14px;
      }

      .card-outstanding::before {
        background: #dc2626;
      }

      .card-icon {
        width: 46px;
        height: 46px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        flex-shrink: 0;
        background: rgba(248, 113, 113, 0.12);
        color: #b91c1c;
      }

      .card-data {
        display: flex;
        flex-direction: column;
      }

      .card-value {
        font-size: 1.4rem;
        font-weight: 700;
        color: #111827;
      }

      .card-label {
        font-size: 0.86rem;
        color: #6b7280;
        font-weight: 500;
        margin-top: 0.1rem;
      }

      .card-sub {
        font-size: 0.78rem;
        color: #9ca3af;
        margin-top: 0.15rem;
      }

      .modern-table-card {
        background: #fff;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
        border: 1px solid #e2e8f0;
      }

      .modern-table-header {
        padding: 1.2rem 1.5rem;
        background: #f7f9fc;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 1rem;
      }

      .modern-table-title {
        font-size: 1rem;
        font-weight: 700;
        color: #0f2744;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .modern-table-title i {
        color: #2c5282;
      }

      .modern-table-count {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.88rem;
        color: #6a8cad;
        padding: 0.25rem 0.75rem;
        border-radius: 999px;
        border: 1px solid #d1d5db;
        background: #fff;
      }

      .modern-table-empty {
        padding: 3rem 2rem;
        text-align: center;
        color: #6a8cad;
      }

      .modern-table-empty i {
        font-size: 3rem;
        display: block;
        margin-bottom: 0.75rem;
        color: #c5d5e4;
      }

      .modern-table-empty p {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
      }

      .modern-table-empty span {
        display: block;
        margin-top: 0.35rem;
        font-size: 0.86rem;
      }

      .modern-table-responsive {
        overflow-x: auto;
      }

      .modern-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.92rem;
      }

      .modern-table thead {
        background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%);
      }

      .modern-table th,
      .modern-table td {
        padding: 0.8rem 1rem;
        border-bottom: 1px solid #e5e7eb;
        text-align: left;
      }

      .modern-table th {
        color: #fff;
        font-size: 0.78rem;
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }

      .modern-table tbody tr:hover {
        background: #f7f9fc;
      }

      .student-cell {
        display: flex;
        align-items: center;
        gap: 0.65rem;
      }

      .avatar {
        width: 32px;
        height: 32px;
        border-radius: 10px;
        background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%);
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
      }

      .class-pill {
        display: inline-flex;
        align-items: center;
        padding: 0.2rem 0.6rem;
        border-radius: 999px;
        background: #eef2f7;
        color: #1f2937;
        font-size: 0.8rem;
        font-weight: 600;
      }

      .amount-badge {
        display: inline-flex;
        align-items: center;
        padding: 0.2rem 0.6rem;
        border-radius: 999px;
        font-size: 0.8rem;
        font-weight: 600;
      }

      .amount-positive {
        background: #fee2e2;
        color: #b91c1c;
      }

      .amount-zero {
        background: #dcfce7;
        color: #166534;
      }

      .no-payment {
        font-size: 0.8rem;
        color: #9ca3af;
      }

      .actions-cell {
        text-align: right;
      }

      .actions-group {
        display: inline-flex;
        gap: 0.4rem;
      }

      @media (max-width: 768px) {
        .filters-card {
          flex-direction: column;
        }

        .family-summary {
          padding-left: 0;
          border-left: none;
          border-top: 1px dashed #e5e7eb;
          padding-top: 0.75rem;
          margin-top: 0.75rem;
          width: 100%;
        }

        .modern-table {
          min-width: 720px;
        }
      }
    `,
  ],
})
export class FamilyFeeComponent implements OnInit {
  searchText = '';
  familyName: string | null = null;
  children: FamilyChildFeeRow[] = [];

  constructor(private route: ActivatedRoute) {}

  get combinedOutstanding(): number {
    return this.children.reduce((sum, c) => sum + (c.outstandingAmount || 0), 0);
  }

  ngOnInit(): void {
    const familyIdParam = this.route.snapshot.paramMap.get('familyId');
    if (familyIdParam) {
      // Placeholder: in real implementation, load by familyId
      this.familyName = `Family #${familyIdParam}`;
    }
  }

  onSearch(): void {
    const term = (this.searchText || '').trim();
    if (!term) {
      return;
    }

    // Placeholder: in real implementation, call backend to search family and children
    this.familyName = `Sample Family (${term})`;
    this.children = [
      {
        studentId: 101,
        studentName: 'Ali Khan',
        className: 'Grade 5',
        sectionName: 'A',
        outstandingAmount: 4500,
        lastPaymentDate: new Date().toISOString(),
      },
      {
        studentId: 102,
        studentName: 'Ayesha Khan',
        className: 'Grade 3',
        sectionName: 'B',
        outstandingAmount: 2500,
        lastPaymentDate: null,
      },
    ];
  }

  onPay(child: FamilyChildFeeRow): void {
    // Placeholder for now: in real implementation, navigate to child's payment / challan view
    // or open a payment dialog scoped to this student.
    console.log('Pay clicked for student', child.studentId);
  }
}

