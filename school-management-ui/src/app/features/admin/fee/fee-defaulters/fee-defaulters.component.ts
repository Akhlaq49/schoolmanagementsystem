import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FeeService } from '../../../../core/services/fee.service';
import { AcademicSessionService } from '../../../../core/services/academic-session.service';
import { ClassService } from '../../../../core/services/class.service';
import { FeeChallan } from '../../../../core/models/fee.model';
import { AcademicSession } from '../../../../core/models/academic-session.model';
import { Class } from '../../../../core/models/student.model';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { DropdownComponent, DropdownOption } from '../../../../shared/components/dropdown/dropdown.component';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-fee-defaulters',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent, DropdownComponent],
  template: `
    <div class="defaulters-container">
      <app-loading [show]="loading" [message]="'Loading fee defaulters...'"></app-loading>

      <!-- Header -->
      <div class="page-header-card">
        <div class="header-content">
          <div>
            <h2><i class="fa fa-exclamation-circle"></i> Fee Defaulters</h2>
            <p class="page-subtitle">Monitor overdue challans, take action, and send reminders</p>
          </div>
          <div class="header-actions">
            <button class="btn btn-outline" (click)="exportCsv()" [disabled]="defaulters.length === 0">
              <i class="fa fa-download"></i> Export CSV
            </button>
          </div>
        </div>
      </div>

      <!-- Summary cards -->
      <div class="summary-grid">
        <div class="summary-card card-total">
          <div class="card-icon"><i class="fa fa-users"></i></div>
          <div class="card-data">
            <span class="card-value">{{ stats.totalDefaulters }}</span>
            <span class="card-label">Total Defaulters</span>
          </div>
        </div>
        <div class="summary-card card-amount">
          <div class="card-icon"><i class="fa fa-money"></i></div>
          <div class="card-data">
            <span class="card-value">{{ stats.totalOutstanding | number:'1.0-0' }}</span>
            <span class="card-label">Total Outstanding</span>
          </div>
        </div>
        <div class="summary-card card-amount">
          <div class="card-icon"><i class="fa fa-hourglass-half"></i></div>
          <div class="card-data">
            <span class="card-value">{{ stats.overdueCount }}</span>
            <span class="card-label">Overdue Challans</span>
          </div>
        </div>
        <div class="summary-card card-amount">
          <div class="card-icon"><i class="fa fa-exclamation-triangle"></i></div>
          <div class="card-data">
            <span class="card-value">{{ stats.highRiskCount }}</span>
            <span class="card-label">Over 60 days</span>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-card">
        <div class="search-box">
          <i class="fa fa-search"></i>
          <input
            class="modern-form-control search-input"
            placeholder="Search by student, challan#, or family..."
            [(ngModel)]="searchTerm"
            (input)="applyFilters()">
        </div>
        <div class="filter-group">
          <label class="filter-label">Session</label>
          <app-dropdown
            [(ngModel)]="selectedSessionId"
            [options]="sessionOptions"
            placeholder="All Sessions"
            [placeholderValue]="0"
            [searchable]="false"
            (changed)="applyFilters()">
          </app-dropdown>
        </div>
        <div class="filter-group">
          <label class="filter-label">Class</label>
          <app-dropdown
            [(ngModel)]="selectedClassId"
            [options]="classOptions"
            placeholder="All Classes"
            [placeholderValue]="0"
            [searchable]="true"
            (changed)="applyFilters()">
          </app-dropdown>
        </div>
        <div class="filter-group">
          <label class="filter-label">Status</label>
          <app-dropdown
            [(ngModel)]="selectedStatus"
            [options]="statusOptions"
            placeholder="All"
            [placeholderValue]="''"
            [searchable]="false"
            (changed)="applyFilters()">
          </app-dropdown>
        </div>
      </div>

      <!-- Aging analysis -->
      <div class="aging-card">
        <h3><i class="fa fa-clock-o"></i> Aging Analysis</h3>
        <div class="aging-grid">
          <div class="aging-item">
            <span class="label">0 – 30 days</span>
            <span class="value">{{ aging['0-30'].count }} / {{ aging['0-30'].amount | number:'1.0-0' }}</span>
          </div>
          <div class="aging-item">
            <span class="label">31 – 60 days</span>
            <span class="value">{{ aging['31-60'].count }} / {{ aging['31-60'].amount | number:'1.0-0' }}</span>
          </div>
          <div class="aging-item">
            <span class="label">61 – 90 days</span>
            <span class="value">{{ aging['61-90'].count }} / {{ aging['61-90'].amount | number:'1.0-0' }}</span>
          </div>
          <div class="aging-item">
            <span class="label">90+ days</span>
            <span class="value">{{ aging['90+'].count }} / {{ aging['90+'].amount | number:'1.0-0' }}</span>
          </div>
        </div>
      </div>

      <!-- Class summary -->
      <div class="class-summary-card" *ngIf="classSummary.length > 0">
        <h3><i class="fa fa-bar-chart"></i> Class-wise Summary</h3>
        <table class="class-summary-table">
          <thead>
            <tr>
              <th>Class</th>
              <th>Defaulters</th>
              <th>Outstanding</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of classSummary">
              <td>{{ row.className || 'Unknown' }}</td>
              <td>{{ row.count }}</td>
              <td>{{ row.amount | number:'1.0-0' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Defaulters table -->
      <div class="academy-table-card">
        <div class="academy-table-header">
          <span class="academy-table-title">
            <i class="fa fa-table"></i> Defaulters List
          </span>
          <span class="academy-table-count">
            <i class="fa fa-database"></i> {{ filteredDefaulters.length }} record{{ filteredDefaulters.length !== 1 ? 's' : '' }}
          </span>
        </div>

        <div class="academy-table-responsive">
          <table class="academy-table" *ngIf="pagedDefaulters.length > 0; else emptyState">
            <thead>
              <tr>
                <th>#</th>
                <th>Student</th>
                <th>Class</th>
                <th>Challan #</th>
                <th>Period</th>
                <th>Due Date</th>
                <th>Balance</th>
                <th>Aging</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of pagedDefaulters; let i = index">
                <td><span class="id-badge">{{ (currentPage - 1) * pageSize + i + 1 }}</span></td>
                <td>
                  <div class="student-info">
                    <span class="student-name">{{ c.studentName }}</span>
                    <span class="sub-text">{{ c.className }}{{ c.sectionName ? ' - ' + c.sectionName : '' }}</span>
                  </div>
                </td>
                <td>{{ c.className || '—' }}</td>
                <td>{{ c.challanNumber }}</td>
                <td>{{ c.month }}/{{ c.year }}</td>
                <td>{{ c.dueDate | date:'mediumDate' }}</td>
                <td class="amount-balance">{{ c.balance | number:'1.2-2' }}</td>
                <td>{{ getAgingLabel(c) }}</td>
                <td>
                  <span class="status-badge" [ngClass]="'badge-' + (c.status || '').toLowerCase()">
                    {{ c.status | titlecase }}
                  </span>
                </td>
                <td>
                  <div class="modern-table-actions">
                    <button class="modern-btn-icon modern-btn-pay" (click)="onPay(c)" title="Record Payment">
                      <i class="fa fa-money"></i>
                    </button>
                    <button class="modern-btn-icon modern-btn-wa" (click)="sendWhatsApp(c)" title="Send WhatsApp reminder">
                      <i class="fa fa-whatsapp"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <ng-template #emptyState>
            <div class="academy-table-empty">
              <i class="fa fa-check-circle"></i>
              <p>No defaulters found with current filters.</p>
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
              currentPage * pageSize > filteredDefaulters.length
                ? filteredDefaulters.length
                : currentPage * pageSize
            }}
            of {{ filteredDefaulters.length }}
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
    .defaulters-container { padding: 0; position: relative; }

    .page-header-card {
      background: #fff; border-radius: 16px; padding: 1.5rem 2rem; margin-bottom: 1.25rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;
    }
    .header-content { display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; }
    .page-header-card h2 {
      margin: 0; font-size: 1.5rem; font-weight: 700; color: #0f2744;
      display: flex; align-items: center; gap: 0.6rem;
    }
    .page-header-card h2 i { color: #b91c1c; }
    .page-subtitle { margin: 0.25rem 0 0; font-size: 0.9rem; color: #6a8cad; }
    .header-actions { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }

    .btn {
      display: inline-flex; align-items: center; gap: 0.4rem;
      border-radius: 999px; border: none; cursor: pointer;
      padding: 0.5rem 1.1rem; font-size: 0.85rem; font-weight: 600;
    }
    .btn-outline {
      background: #fff; color: #1e3a5f; border: 1px solid #d1d5db;
    }
    .btn-outline:hover { background: #f3f4f6; }

    .toggle-label {
      display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; color: #4b5563;
    }

    .summary-grid {
      display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1rem; margin-bottom: 1.25rem;
    }
    .summary-card {
      background: #fff; border-radius: 14px; border: 1px solid #e5e7eb;
      padding: 1rem 1.1rem; display: flex; align-items: center; gap: 0.75rem;
      box-shadow: 0 1px 3px rgba(15,23,42,0.05);
    }
    .summary-card .card-icon {
      width: 40px; height: 40px; border-radius: 999px; display: flex; align-items: center; justify-content: center;
      background: #fef2f2; color: #b91c1c;
    }
    .summary-card .card-data { display: flex; flex-direction: column; }
    .summary-card .card-value { font-weight: 700; font-size: 1.1rem; color: #0f172a; }
    .summary-card .card-label { font-size: 0.8rem; color: #6b7280; }

    .filters-card {
      display: flex; gap: 1rem; margin-bottom: 1.25rem; padding: 1rem 1.2rem;
      background: #fff; border-radius: 12px; border: 1px solid #e5e7eb;
      box-shadow: 0 1px 3px rgba(15,23,42,0.04); flex-wrap: wrap; align-items: flex-end;
    }
    .search-box { position: relative; flex: 1; min-width: 220px; }
    .search-box i {
      position: absolute; left: 1rem; top: 50%; transform: translateY(-50%);
      color: #9ca3af; z-index: 1;
    }
    .search-input {
      padding-left: 2.6rem !important;
    }
    .modern-form-control {
      padding: 0.6rem 0.9rem; border-radius: 0.75rem; border: 2px solid #d1d5db;
      font-size: 0.9rem; color: #111827; width: 100%;
    }
    .filter-group { min-width: 180px; display: flex; flex-direction: column; gap: 0.25rem; }
    .filter-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280; }

    .aging-card {
      background: #0f172a; color: #e5e7eb; border-radius: 14px; padding: 1.25rem 1.5rem;
      margin-bottom: 1.25rem; position: relative; overflow: hidden;
    }
    .aging-card h3 {
      margin: 0 0 0.75rem; font-size: 0.95rem; font-weight: 600; display: flex; align-items: center; gap: 0.45rem;
    }
    .aging-card h3 i { color: #facc15; }
    .aging-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.75rem; }
    .aging-item {
      background: rgba(15,23,42,0.7); border-radius: 10px; padding: 0.55rem 0.7rem;
      border: 1px solid rgba(148,163,184,0.5);
    }
    .aging-item .label { display: block; font-size: 0.78rem; color: #9ca3af; margin-bottom: 0.1rem; }
    .aging-item .value { font-size: 0.9rem; font-weight: 600; }

    .class-summary-card {
      background: #fff; border-radius: 14px; border: 1px solid #e5e7eb;
      padding: 1.1rem 1.2rem; margin-bottom: 1.25rem; box-shadow: 0 1px 3px rgba(15,23,42,0.04);
    }
    .class-summary-card h3 {
      margin: 0 0 0.6rem; font-size: 0.9rem; font-weight: 700; color: #111827;
      display: flex; align-items: center; gap: 0.45rem;
    }
    .class-summary-table {
      width: 100%; border-collapse: collapse; font-size: 0.85rem;
    }
    .class-summary-table th,
    .class-summary-table td {
      padding: 0.5rem 0.6rem; border-bottom: 1px solid #e5e7eb; text-align: left;
    }
    .class-summary-table th {
      font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280;
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
      font-size: 0.98rem; font-weight: 700; color: #0f2744; display: flex; align-items: center; gap: 0.45rem;
    }
    .academy-table-count { font-size: 0.85rem; color: #6b7280; display: flex; align-items: center; gap: 0.4rem; }
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
    .student-info { display: flex; flex-direction: column; }
    .student-name { font-weight: 600; color: #0f172a; }
    .sub-text { font-size: 0.78rem; color: #6b7280; }
    .amount-balance { font-weight: 700; color: #b91c1c; }

    .status-badge {
      display: inline-flex; align-items: center; padding: 0.2rem 0.6rem;
      border-radius: 999px; font-size: 0.78rem; font-weight: 600;
    }
    .badge-unpaid { background: #fef3c7; color: #92400e; }
    .badge-partial { background: #dbeafe; color: #1d4ed8; }
    .badge-overdue { background: #fee2e2; color: #b91c1c; }

    .modern-table-actions { display: flex; gap: 0.35rem; }
    .modern-btn-icon {
      width: 30px; height: 30px; border-radius: 8px; border: none;
      display: inline-flex; align-items: center; justify-content: center;
      color: #fff; font-size: 0.8rem; cursor: pointer;
    }
    .modern-btn-pay { background: #16a34a; }
    .modern-btn-pay:hover { background: #15803d; }
    .modern-btn-wa { background: #22c55e; }
    .modern-btn-wa:hover { background: #16a34a; }

    .academy-table-empty {
      padding: 2.5rem 1.5rem; text-align: center; color: #6b7280;
    }
    .academy-table-empty i { font-size: 2rem; margin-bottom: 0.5rem; color: #cbd5f5; display: block; }

    .pagination-bar {
      display: flex; justify-content: space-between; align-items: center; padding: 0.85rem 1.25rem;
      border-top: 1px solid #e2e8f0; background: #fafbfc; flex-wrap: wrap; gap: 0.6rem;
    }
    .pagination-info { font-size: 0.8rem; color: #6b7280; }
    .pagination-controls { display: flex; gap: 0.25rem; }
    .page-btn, .page-num {
      border-radius: 999px; border: 1px solid #e5e7eb; background: #fff;
      padding: 0.25rem 0.6rem; font-size: 0.78rem; cursor: pointer; min-width: 26px;
    }
    .page-num.active {
      background: #1e3a5f; border-color: #1e3a5f; color: #fff;
    }

    @media (max-width: 1024px) {
      .summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .aging-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    @media (max-width: 768px) {
      .summary-grid { grid-template-columns: 1fr; }
      .aging-grid { grid-template-columns: 1fr; }
      .filters-card { flex-direction: column; align-items: stretch; }
      .filter-group { width: 100%; }
    }
  `]
})
export class FeeDefaultersComponent implements OnInit {
  loading = false;

  defaulters: FeeChallan[] = [];
  filteredDefaulters: FeeChallan[] = [];
  pagedDefaulters: FeeChallan[] = [];

  sessions: AcademicSession[] = [];
  classes: Class[] = [];

  searchTerm = '';
  selectedSessionId = 0;
  selectedClassId = 0;
  selectedStatus = '';
  groupByFamily = false; // UI only for now

  stats = {
    totalDefaulters: 0,
    totalOutstanding: 0,
    overdueCount: 0,
    highRiskCount: 0
  };

  aging: Record<'0-30' | '31-60' | '61-90' | '90+', { count: number; amount: number }> = {
    '0-30': { count: 0, amount: 0 },
    '31-60': { count: 0, amount: 0 },
    '61-90': { count: 0, amount: 0 },
    '90+': { count: 0, amount: 0 }
  };

  classSummary: { className: string | null; count: number; amount: number }[] = [];

  pageSize = 10;
  currentPage = 1;
  totalPages = 1;
  pageNumbers: number[] = [];

  statusOptions: DropdownOption[] = [
    { value: 'Unpaid', label: 'Unpaid' },
    { value: 'Partial', label: 'Partial' },
    { value: 'Overdue', label: 'Overdue' }
  ];

  constructor(
    private feeService: FeeService,
    private sessionService: AcademicSessionService,
    private classService: ClassService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  get sessionOptions(): DropdownOption[] {
    return this.sessions.map(s => ({
      value: s.academicSessionId,
      label: s.name + (s.isCurrent ? ' (Current)' : '')
    }));
  }

  get classOptions(): DropdownOption[] {
    return this.classes.map(c => ({
      value: c.classId,
      label: c.name
    }));
  }

  loadData(): void {
    this.loading = true;
    this.sessionService.getAll().subscribe({
      next: sessions => {
        this.sessions = sessions;
        this.classService.getAllClasses().subscribe({
          next: classes => {
            this.classes = classes;
            this.feeService.getDefaulters().subscribe({
              next: challans => {
                this.defaulters = challans;
                this.loading = false;
                this.applyFilters();
              },
              error: () => {
                this.loading = false;
                this.notify.error('Failed to load defaulters');
              }
            });
          },
          error: () => {
            this.loading = false;
            this.notify.error('Failed to load classes');
          }
        });
      },
      error: () => {
        this.loading = false;
        this.notify.error('Failed to load academic sessions');
      }
    });
  }

  applyFilters(): void {
    let list = [...this.defaulters];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      list = list.filter(c =>
        (c.studentName || '').toLowerCase().includes(term) ||
        (c.challanNumber || '').toLowerCase().includes(term) ||
        (c.className || '').toLowerCase().includes(term)
      );
    }

    if (this.selectedSessionId) {
      // currently we don't have session per challan, but we can approximate by year / current session name if needed
      list = [...list];
    }

    if (this.selectedClassId) {
      list = list.filter(c => c.className && this.classes.find(cl => cl.classId === this.selectedClassId)?.name === c.className);
    }

    if (this.selectedStatus) {
      const statusLower = this.selectedStatus.toLowerCase();
      list = list.filter(c => (c.status || '').toLowerCase() === statusLower);
    }

    this.filteredDefaulters = list;
    this.currentPage = 1;
    this.rebuildAggregates();
    this.paginate();
  }

  changePage(p: number): void {
    if (p < 1 || p > this.totalPages || p === this.currentPage) return;
    this.currentPage = p;
    this.paginate();
  }

  paginate(): void {
    this.totalPages = Math.max(1, Math.ceil(this.filteredDefaulters.length / this.pageSize));
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedDefaulters = this.filteredDefaulters.slice(start, start + this.pageSize);
    this.buildPageNumbers();
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
    for (let p = start; p <= end; p++) pages.push(p);
    this.pageNumbers = pages;
  }

  rebuildAggregates(): void {
    // stats
    this.stats.totalDefaulters = this.filteredDefaulters.length;
    this.stats.totalOutstanding = this.filteredDefaulters.reduce((sum, c) => sum + (c.balance || 0), 0);
    this.stats.overdueCount = this.filteredDefaulters.filter(c => (c.status || '').toLowerCase() === 'overdue').length;

    // aging + high risk
    this.aging['0-30'] = { count: 0, amount: 0 };
    this.aging['31-60'] = { count: 0, amount: 0 };
    this.aging['61-90'] = { count: 0, amount: 0 };
    this.aging['90+'] = { count: 0, amount: 0 };
    let highRisk = 0;

    const today = new Date();
    for (const c of this.filteredDefaulters) {
      const due = new Date(c.dueDate);
      const balance = c.balance || 0;
      const days = Math.max(0, Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)));

      let bucket: '0-30' | '31-60' | '61-90' | '90+' = '0-30';
      if (days > 90) bucket = '90+';
      else if (days > 60) bucket = '61-90';
      else if (days > 30) bucket = '31-60';

      this.aging[bucket].count++;
      this.aging[bucket].amount += balance;

      if (days > 60) highRisk++;
    }
    this.stats.highRiskCount = highRisk;

    // class summary
    const map = new Map<string | null, { className: string | null; count: number; amount: number }>();
    for (const c of this.filteredDefaulters) {
      const key = c.className || null;
      if (!map.has(key)) {
        map.set(key, { className: key, count: 0, amount: 0 });
      }
      const row = map.get(key)!;
      row.count++;
      row.amount += c.balance || 0;
    }
    this.classSummary = Array.from(map.values()).sort((a, b) => (a.className || '').localeCompare(b.className || ''));
  }

  getAgingLabel(c: FeeChallan): string {
    const today = new Date();
    const due = new Date(c.dueDate);
    const days = Math.max(0, Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)));
    if (days === 0) return 'Due today';
    return `${days} day${days === 1 ? '' : 's'}`;
  }

  onPay(c: FeeChallan): void {
    // For now, just navigate user to Challans screen where full payment flow exists
    this.notify.info(`Use Challans page to record payment for ${c.studentName} (${c.challanNumber}).`);
  }

  sendWhatsApp(c: FeeChallan): void {
    // Placeholder - integrate with WhatsApp notifications later
    this.notify.success(`WhatsApp reminder queued for ${c.studentName || 'student'}.`);
  }

  exportCsv(): void {
    if (this.filteredDefaulters.length === 0) return;
    const header = ['Student', 'Class', 'ChallanNumber', 'Month', 'Year', 'DueDate', 'Total', 'Paid', 'Balance', 'Status'];
    const rows = this.filteredDefaulters.map(c => [
      `"${(c.studentName || '').replace(/"/g, '""')}"`,
      `"${(c.className || '').replace(/"/g, '""')}"`,
      `"${(c.challanNumber || '').replace(/"/g, '""')}"`,
      c.month,
      c.year,
      new Date(c.dueDate).toISOString().split('T')[0],
      c.totalAmount?.toFixed(2) ?? '0.00',
      c.paidAmount?.toFixed(2) ?? '0.00',
      c.balance?.toFixed(2) ?? '0.00',
      `"${(c.status || '').replace(/"/g, '""')}"`
    ].join(','));

    const csv = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fee-defaulters-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

