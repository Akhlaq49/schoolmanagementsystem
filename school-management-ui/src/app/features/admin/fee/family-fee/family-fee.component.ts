import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FeeService } from '../../../../core/services/fee.service';
import { FamilyService } from '../../../../core/services/family/family.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { Family } from '../../../../core/models/family.model';
import { FamilyChildFeeRow, FamilyFeeSummary } from '../../../../core/models/fee.model';

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
          <div class="modern-table-toolbar" *ngIf="children.length > 0">
            <div class="child-filter">
              <input
                type="text"
                class="academy-input"
                placeholder="Filter children by name or class..."
                [(ngModel)]="childFilter"
                (input)="applyChildFilters()"
              />
            </div>
            <label class="toggle-label">
              <input type="checkbox" [(ngModel)]="onlyOutstanding" (change)="applyChildFilters()" />
              <span>Show only with outstanding</span>
            </label>
            <div class="page-size">
              Show
              <select [(ngModel)]="pageSize" (change)="paginate()" class="page-size-select">
                <option [ngValue]="5">5</option>
                <option [ngValue]="10">10</option>
                <option [ngValue]="25">25</option>
              </select>
              entries
            </div>
            <div class="modern-table-count">
              <i class="fa fa-users"></i>
              {{ filteredChildren.length }} child{{ filteredChildren.length !== 1 ? 'ren' : '' }}
            </div>
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
              <tr *ngFor="let child of pagedChildren; let i = index">
                <td>{{ (currentPage - 1) * pageSize + i + 1 }}</td>
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
                      *ngIf="child.outstandingAmount > 0"
                      class="btn btn-primary btn-xs"
                      type="button"
                      (click)="onPay(child)"
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

        <div class="pagination-bar" *ngIf="totalPages > 1">
          <span class="pagination-info">
            Showing
            {{ (currentPage - 1) * pageSize + 1 }}
            –
            {{
              currentPage * pageSize > filteredChildren.length
                ? filteredChildren.length
                : currentPage * pageSize
            }}
            of {{ filteredChildren.length }}
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

      .search-input {
        padding-left: 0.9rem;
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

      .modern-table-toolbar {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
        justify-content: flex-end;
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

      .page-size {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        font-size: 0.85rem;
        color: #6b7280;
      }

      .page-size-select {
        border-radius: 999px;
        border: 1px solid #d1d5db;
        padding: 0.2rem 0.6rem;
        font-size: 0.85rem;
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

      .toggle-label {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        font-size: 0.8rem;
        color: #4b5563;
      }

      .pagination-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.85rem 1.25rem;
        border-top: 1px solid #e2e8f0;
        background: #fafbfc;
        flex-wrap: wrap;
        gap: 0.6rem;
      }

      .pagination-info {
        font-size: 0.8rem;
        color: #6b7280;
      }

      .pagination-controls {
        display: flex;
        gap: 0.25rem;
      }

      .page-btn,
      .page-num {
        border-radius: 999px;
        border: 1px solid #e5e7eb;
        background: #fff;
        padding: 0.25rem 0.6rem;
        font-size: 0.78rem;
        cursor: pointer;
        min-width: 26px;
        transition: all 0.2s;
      }

      .page-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .page-num.active {
        background: #1e3a5f;
        border-color: #1e3a5f;
        color: #fff;
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

  // filtered & paged
  filteredChildren: FamilyChildFeeRow[] = [];
  pagedChildren: FamilyChildFeeRow[] = [];

  // child filters
  childFilter = '';
  onlyOutstanding = false;

  // pagination
  pageSize = 10;
  currentPage = 1;
  totalPages = 1;
  pageNumbers: number[] = [];

  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private feeService: FeeService,
    private familyService: FamilyService,
    private notify: NotificationService
  ) {}

  get combinedOutstanding(): number {
    return this.children.reduce((sum, c) => sum + (c.outstandingAmount || 0), 0);
  }

  ngOnInit(): void {
    const familyIdParam = this.route.snapshot.paramMap.get('familyId');
    if (familyIdParam) {
      const id = Number(familyIdParam);
      if (!isNaN(id) && id > 0) {
        this.loadFamilyFeeSummary(id);
      }
    }
  }

  onSearch(): void {
    const term = (this.searchText || '').trim();
    if (!term) {
      return;
    }

    // If numeric, treat as direct family ID
    const numericId = Number(term);
    if (!isNaN(numericId) && numericId > 0) {
      this.loadFamilyFeeSummary(numericId);
      return;
    }

    // Otherwise search in families list (client-side) and pick first match
    this.loading = true;
    this.familyService.getAllFamilies().subscribe({
      next: (families: Family[]) => {
        const lower = term.toLowerCase();
        const match = families.find(f =>
          (f.fatherName && f.fatherName.toLowerCase().includes(lower)) ||
          (f.motherName && f.motherName.toLowerCase().includes(lower)) ||
          (f.smsNumber && f.smsNumber.toLowerCase().includes(lower))
        );

        if (!match || !match.familyId) {
          this.notify.warning('No matching family found.');
          this.loading = false;
          return;
        }

        this.loadFamilyFeeSummary(match.familyId);
      },
      error: () => {
        this.notify.error('Failed to search families.');
        this.loading = false;
      }
    });
  }

  onPay(child: FamilyChildFeeRow): void {
    if (!child || !child.studentId) {
      return;
    }
    this.router.navigate(['/admin/fee/student', child.studentId]);
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name
      .split(' ')
      .filter(p => !!p)
      .map(p => p[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  private loadFamilyFeeSummary(familyId: number): void {
    this.loading = true;
    this.feeService.getFamilyFeeSummary(familyId).subscribe({
      next: (summary: FamilyFeeSummary) => {
        this.familyName = summary.familyName;
        this.children = summary.children || [];
        this.childFilter = '';
        this.onlyOutstanding = false;
        this.applyChildFilters();
        this.loading = false;
      },
      error: (err) => {
        if (err?.status === 404) {
          this.notify.warning('Family or fee summary not found.');
        } else {
          this.notify.error('Failed to load family fee summary.');
        }
        this.children = [];
        this.filteredChildren = [];
        this.pagedChildren = [];
        this.loading = false;
      }
    });
  }

  applyChildFilters(): void {
    let list = [...this.children];

    const term = (this.childFilter || '').toLowerCase().trim();
    if (term) {
      list = list.filter(c =>
        c.studentName.toLowerCase().includes(term) ||
        (c.className || '').toLowerCase().includes(term) ||
        (c.sectionName || '').toLowerCase().includes(term)
      );
    }

    if (this.onlyOutstanding) {
      list = list.filter(c => c.outstandingAmount > 0);
    }

    this.filteredChildren = list;
    this.currentPage = 1;
    this.paginate();
  }

  paginate(): void {
    this.totalPages = Math.max(1, Math.ceil(this.filteredChildren.length / this.pageSize));
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedChildren = this.filteredChildren.slice(start, start + this.pageSize);
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
}

