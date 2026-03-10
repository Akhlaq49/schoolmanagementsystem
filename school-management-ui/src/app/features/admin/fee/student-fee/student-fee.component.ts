import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { StudentService } from '../../../../core/services/student.service';
import { FeeService } from '../../../../core/services/fee.service';
import { AcademicSessionService } from '../../../../core/services/academic-session.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { Student } from '../../../../core/models/student.model';
import { FeeChallan, FeePayment, ChallanSummary } from '../../../../core/models/fee.model';
import { AcademicSession } from '../../../../core/models/academic-session.model';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { DropdownComponent, DropdownOption } from '../../../../shared/components/dropdown/dropdown.component';

@Component({
  selector: 'app-student-fee',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LoadingComponent, DropdownComponent],
  template: `
    <div class="student-fee-container">
      <app-loading [show]="loading" [message]="'Loading student fee history...'"></app-loading>

      <!-- Header -->
      <div class="page-header-card">
        <div class="header-content">
          <div>
            <button class="back-link" routerLink="/admin/fee/challans">
              <i class="fa fa-arrow-left"></i>
              <span>Back to Challans</span>
            </button>
            <h2><i class="fa fa-id-card"></i> Student Fee History</h2>
            <p class="page-subtitle">View challans, payments and running balance for a single student</p>
          </div>
        </div>
      </div>

      <!-- Search + Filters row -->
      <div class="filters-row">
        <div class="student-search">
          <label class="field-label">Search Student</label>
          <div class="search-input-wrap">
            <i class="fa fa-search"></i>
            <input
              type="text"
              class="modern-form-control"
              placeholder="Search by name, roll, class..."
              [(ngModel)]="studentSearch"
              (input)="onStudentSearchChange()">
          </div>
        </div>

        <div class="filter-group-inline">
          <div class="filter-item">
            <label class="field-label">Session</label>
            <app-dropdown
              [(ngModel)]="selectedSessionId"
              [options]="sessionOptions"
              placeholder="All Sessions"
              [placeholderValue]="0"
              [searchable]="false"
              (changed)="applyFilters()">
            </app-dropdown>
          </div>
          <div class="filter-item">
            <label class="field-label">Status</label>
            <app-dropdown
              [(ngModel)]="filterStatus"
              [options]="statusOptions"
              placeholder="All Status"
              [placeholderValue]="''"
              [searchable]="false"
              (changed)="applyFilters()">
            </app-dropdown>
          </div>
        </div>
      </div>

      <!-- Students list -->
      <div class="students-list-card">
        <table class="students-table" *ngIf="filteredStudents.length > 0; else noStudentsFound">
          <thead>
            <tr>
              <th>Student</th>
              <th>Class</th>
              <th>Roll</th>
              <th>Session</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr
              *ngFor="let s of pagedStudents"
              (click)="selectStudent(s)"
              [class.selected]="selectedStudent?.studentId === s.studentId">
              <td>
                <div class="student-cell">
                  <div class="avatar">{{ getInitials(s.name) }}</div>
                  <div class="info">
                    <div class="name">{{ s.name }}</div>
                    <div class="meta" *ngIf="s.smsNumber || s.phone">
                      {{ s.smsNumber || s.phone }}
                    </div>
                  </div>
                </div>
              </td>
              <td>{{ s.class?.name || '—' }}</td>
              <td>{{ s.roll || '—' }}</td>
              <td>{{ s.session || '—' }}</td>
              <td>{{ s.status || 'Active' }}</td>
            </tr>
          </tbody>
        </table>
        <div class="students-pagination" *ngIf="totalStudentPages > 1">
          <span class="pagination-info">
            Showing
            {{ (studentCurrentPage - 1) * studentPageSize + 1 }}
            –
            {{
              studentCurrentPage * studentPageSize > filteredStudents.length
                ? filteredStudents.length
                : studentCurrentPage * studentPageSize
            }}
            of {{ filteredStudents.length }} students
          </span>
          <div class="pagination-controls">
            <button
              class="page-btn"
              (click)="changeStudentPage(studentCurrentPage - 1)"
              [disabled]="studentCurrentPage === 1">
              <i class="fa fa-chevron-left"></i>
            </button>
            <button
              *ngFor="let p of studentPageNumbers"
              class="page-num"
              [class.active]="p === studentCurrentPage"
              (click)="changeStudentPage(p)">
              {{ p }}
            </button>
            <button
              class="page-btn"
              (click)="changeStudentPage(studentCurrentPage + 1)"
              [disabled]="studentCurrentPage === totalStudentPages">
              <i class="fa fa-chevron-right"></i>
            </button>
          </div>
        </div>
        <ng-template #noStudentsFound>
          <div class="students-empty">
            <i class="fa fa-users"></i>
            <p>No students found. Adjust your search.</p>
          </div>
        </ng-template>
      </div>

      <!-- Student summary -->
      <div class="summary-layout" *ngIf="selectedStudent; else noStudent">
        <div class="student-card">
          <div class="student-header">
            <div class="avatar-lg">{{ getInitials(selectedStudent.name) }}</div>
            <div class="student-main">
              <div class="student-name">{{ selectedStudent.name }}</div>
              <div class="student-meta">
                <span *ngIf="selectedStudent.class?.name">Class {{ selectedStudent.class?.name }}</span>
                <span *ngIf="selectedStudent.section?.name">• {{ selectedStudent.section?.name }}</span>
                <span *ngIf="selectedStudent.roll">• Roll {{ selectedStudent.roll }}</span>
              </div>
              <div class="student-meta">
                <span *ngIf="selectedStudent.session">Session {{ selectedStudent.session }}</span>
                <span *ngIf="selectedStudent.feeType">• {{ selectedStudent.feeType }}</span>
              </div>
            </div>
          </div>
          <div class="student-contact">
            <div><i class="fa fa-phone"></i> {{ selectedStudent.smsNumber || selectedStudent.phone || 'No phone' }}</div>
            <div *ngIf="selectedStudent.address"><i class="fa fa-home"></i> {{ selectedStudent.address }}</div>
          </div>
        </div>

        <div class="balance-card">
          <h3><i class="fa fa-calculator"></i> Running Balance</h3>
          <div class="balance-grid">
            <div class="balance-item">
              <span class="label">Total Billed</span>
              <span class="value">{{ totals.totalAmount | number:'1.2-2' }}</span>
            </div>
            <div class="balance-item">
              <span class="label">Total Paid</span>
              <span class="value text-success">{{ totals.paidAmount | number:'1.2-2' }}</span>
            </div>
            <div class="balance-item">
              <span class="label">Total Waived</span>
              <span class="value text-muted">{{ totals.waivedAmount | number:'1.2-2' }}</span>
            </div>
            <div class="balance-item highlight">
              <span class="label">Outstanding Balance</span>
              <span class="value text-danger">{{ totals.balance | number:'1.2-2' }}</span>
            </div>
          </div>
        </div>
      </div>

      <ng-template #noStudent>
        <div class="empty-state">
          <i class="fa fa-user-search"></i>
          <p>Select a student to view fee history.</p>
        </div>
      </ng-template>

      <!-- Challan list -->
      <div class="challan-list" *ngIf="selectedStudent">
        <div class="challan-card" *ngFor="let c of filteredChallans">
          <div class="challan-header">
            <div>
              <div class="challan-title">Challan {{ c.challanNumber }}</div>
              <div class="challan-sub">
                {{ getMonthName(c.month) }} {{ c.year }} • Due {{ c.dueDate | date:'mediumDate' }}
              </div>
            </div>
            <span class="status-pill" [ngClass]="'pill-' + (c.status || '').toLowerCase()">
              {{ c.status | titlecase }}
            </span>
          </div>

          <div class="amount-row">
            <div class="amount-block">
              <span class="label">Total</span>
              <span class="value">{{ c.totalAmount | number:'1.2-2' }}</span>
            </div>
            <div class="amount-block">
              <span class="label">Paid</span>
              <span class="value text-success">{{ c.paidAmount | number:'1.2-2' }}</span>
            </div>
            <div class="amount-block">
              <span class="label">Balance</span>
              <span class="value text-danger">{{ c.balance | number:'1.2-2' }}</span>
            </div>
          </div>

          <div class="breakdown-row">
            <span>Base: {{ c.baseAmount | number:'1.2-2' }}</span>
            <span>• Add-ons: {{ c.addonsAmount | number:'1.2-2' }}</span>
            <span *ngIf="c.discountAmount">• Discount: -{{ c.discountAmount | number:'1.2-2' }}</span>
            <span *ngIf="c.lateFine">• Late fine: +{{ c.lateFine | number:'1.2-2' }}</span>
          </div>

          <div class="card-actions">
            <button class="btn-sm" (click)="printChallan(c)">
              <i class="fa fa-print"></i> Print
            </button>
            <button class="btn-sm ghost" routerLink="/admin/fee/challans">
              <i class="fa fa-external-link"></i> Open in Challans
            </button>
          </div>

          <div class="payments-section" *ngIf="c.payments && c.payments.length">
            <h4><i class="fa fa-history"></i> Payment History</h4>
            <table class="payments-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Ref</th>
                  <th>Received By</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let p of c.payments">
                  <td>{{ p.paidAt | date:'medium' }}</td>
                  <td class="amount">{{ p.amount | number:'1.2-2' }}</td>
                  <td>{{ p.paymentMethod | titlecase }}</td>
                  <td>{{ p.transactionReference || '—' }}</td>
                  <td>{{ p.receivedBy || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="empty-state" *ngIf="filteredChallans.length === 0">
          <i class="fa fa-file-text-o"></i>
          <p>No challans found for this student with selected filters.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .student-fee-container { padding: 0; position: relative; }

    .page-header-card {
      background: #fff; border-radius: 16px; padding: 1.5rem 2rem; margin-bottom: 1.25rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;
    }
    .header-content { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; }
    .page-header-card h2 {
      margin: 0.5rem 0 0; font-size: 1.5rem; font-weight: 700; color: #0f2744;
      display: flex; align-items: center; gap: 0.6rem;
    }
    .page-header-card h2 i { color: #1e3a5f; }
    .page-subtitle { margin: 0.25rem 0 0; font-size: 0.9rem; color: #6a8cad; }
    .back-link {
      display: inline-flex; align-items: center; gap: 0.4rem;
      border: none; background: transparent; color: #1e3a5f;
      font-size: 0.9rem; cursor: pointer; padding: 0; margin: 0;
    }
    .back-link i { font-size: 0.85rem; }

    .filters-row {
      display: flex; gap: 1.5rem; margin-bottom: 1.5rem; flex-wrap: wrap;
    }
    .student-search { flex: 2; min-width: 260px; }
    .field-label { display: block; margin-bottom: 0.35rem; font-size: 0.8rem; font-weight: 600; color: #6a8cad; text-transform: uppercase; letter-spacing: 0.06em; }
    .search-input-wrap { position: relative; }
    .search-input-wrap i {
      position: absolute; left: 1rem; top: 50%; transform: translateY(-50%);
      color: #8aa8c4; z-index: 1;
    }
    .modern-form-control {
      padding: 0.65rem 1rem 0.65rem 2.6rem; border-radius: 0.75rem; border: 2px solid #d9e2ec;
      width: 100%; font-size: 0.9375rem; color: #0f2744; transition: border-color 0.2s, box-shadow 0.2s;
    }
    .modern-form-control:focus {
      outline: none; border-color: #1e3a5f; box-shadow: 0 0 0 3px rgba(30,58,95,0.12);
    }

    .students-list-card {
      margin-bottom: 1.5rem; background: #fff; border-radius: 14px; border: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(15,23,42,0.05); overflow: hidden;
    }
    .students-table {
      width: 100%; border-collapse: collapse; font-size: 0.88rem;
    }
    .students-table thead {
      background: #f7f9fc;
    }
    .students-table th,
    .students-table td {
      padding: 0.6rem 0.9rem; border-bottom: 1px solid #e5e7eb; text-align: left;
    }
    .students-table th {
      font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.05em;
      color: #6b7280; font-weight: 600;
    }
    .students-table tr {
      cursor: pointer; transition: background 0.12s;
    }
    .students-table tr:hover {
      background: #f9fafb;
    }
    .students-table tr.selected {
      background: #eff6ff;
    }
    .student-cell {
      display: flex; align-items: center; gap: 0.6rem;
    }
    .student-cell .avatar {
      width: 30px; height: 30px; border-radius: 999px;
      background: #1e3a5f; color: #fff; display: flex; align-items: center; justify-content: center;
      font-size: 0.78rem; font-weight: 700;
    }
    .student-cell .info { display: flex; flex-direction: column; }
    .student-cell .name { font-size: 0.9rem; font-weight: 600; color: #0f172a; }
    .student-cell .meta { font-size: 0.78rem; color: #6b7280; }

    .students-empty {
      padding: 1.25rem; text-align: center; color: #6b7280; font-size: 0.9rem;
    }
    .students-empty i {
      font-size: 1.4rem; margin-bottom: 0.25rem; color: #cbd5f5; display: block;
    }

    .students-pagination {
      display: flex; justify-content: space-between; align-items: center;
      padding: 0.75rem 0.9rem; border-top: 1px solid #e5e7eb; background: #f9fafb;
      flex-wrap: wrap; gap: 0.6rem;
    }
    .students-pagination .pagination-info {
      font-size: 0.8rem; color: #6b7280;
    }
    .students-pagination .pagination-controls {
      display: flex; align-items: center; gap: 0.25rem;
    }
    .students-pagination .page-btn,
    .students-pagination .page-num {
      padding: 0.25rem 0.55rem; border-radius: 999px; border: 1px solid #e5e7eb;
      background: #fff; font-size: 0.78rem; cursor: pointer; min-width: 26px;
      display: inline-flex; align-items: center; justify-content: center;
      color: #374151; transition: background 0.15s, border-color 0.15s, color 0.15s;
    }
    .students-pagination .page-btn[disabled] {
      opacity: 0.4; cursor: default; background: #f3f4f6;
    }
    .students-pagination .page-num.active {
      background: #1e3a5f; border-color: #1e3a5f; color: #fff;
    }

    .filter-group-inline { display: flex; gap: 1rem; flex-wrap: wrap; align-items: flex-end; }
    .filter-item { min-width: 170px; }

    .summary-layout {
      display: grid; grid-template-columns: 1.8fr 1.2fr; gap: 1.25rem; margin-bottom: 1.5rem;
    }
    .student-card {
      background: #fff; border-radius: 14px; border: 1px solid #e2e8f0;
      padding: 1.25rem 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .student-header { display: flex; gap: 1rem; align-items: center; }
    .avatar-lg {
      width: 52px; height: 52px; border-radius: 16px;
      background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%);
      color: #fff; display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 1rem;
    }
    .student-main { display: flex; flex-direction: column; gap: 0.1rem; }
    .student-name { font-size: 1.125rem; font-weight: 700; color: #0f2744; }
    .student-meta { font-size: 0.85rem; color: #6a8cad; }
    .student-contact {
      margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px dashed #e2e8f0;
      font-size: 0.85rem; color: #4b5563; display: flex; flex-direction: column; gap: 0.25rem;
    }
    .student-contact i { margin-right: 0.45rem; color: #6b7280; }

    .balance-card {
      background: #0f172a; color: #e5e7eb; border-radius: 14px; padding: 1.25rem 1.5rem;
      box-shadow: 0 12px 30px rgba(15,23,42,0.6); position: relative; overflow: hidden;
    }
    .balance-card::before {
      content: ''; position: absolute; inset: -40%; background:
        radial-gradient(circle at 0% 0%, rgba(56,189,248,0.2), transparent 55%),
        radial-gradient(circle at 100% 100%, rgba(251,191,36,0.18), transparent 55%);
      opacity: 0.9;
    }
    .balance-card > * { position: relative; z-index: 1; }
    .balance-card h3 {
      margin: 0 0 0.75rem; font-size: 1rem; font-weight: 600;
      display: flex; align-items: center; gap: 0.5rem; color: #f9fafb;
    }
    .balance-card h3 i { color: #fde68a; }
    .balance-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.75rem; }
    .balance-item {
      padding: 0.6rem 0.7rem; border-radius: 10px; background: rgba(15,23,42,0.55);
      border: 1px solid rgba(148,163,184,0.35);
    }
    .balance-item.highlight {
      background: linear-gradient(135deg, rgba(30,64,175,0.7), rgba(30,64,175,0.45));
      border-color: rgba(191,219,254,0.6);
    }
    .balance-item .label { display: block; font-size: 0.78rem; color: #9ca3af; margin-bottom: 0.1rem; }
    .balance-item .value { font-size: 0.98rem; font-weight: 700; }
    .text-success { color: #4ade80; }
    .text-danger { color: #fca5a5; }
    .text-muted { color: #d1d5db; }

    .challan-list { display: flex; flex-direction: column; gap: 1rem; }
    .challan-card {
      background: #fff; border-radius: 14px; border: 1px solid #e2e8f0;
      padding: 1.1rem 1.3rem; box-shadow: 0 1px 3px rgba(15,23,42,0.06);
    }
    .challan-header {
      display: flex; justify-content: space-between; align-items: center; gap: 0.75rem;
      margin-bottom: 0.55rem;
    }
    .challan-title { font-size: 0.95rem; font-weight: 700; color: #0f2744; }
    .challan-sub { font-size: 0.8rem; color: #6b7280; }
    .status-pill {
      padding: 0.2rem 0.7rem; border-radius: 999px; font-size: 0.78rem; font-weight: 600;
    }
    .pill-paid { background: #d1fae5; color: #166534; }
    .pill-unpaid { background: #fef3c7; color: #92400e; }
    .pill-partial { background: #dbeafe; color: #1d4ed8; }
    .pill-overdue { background: #fee2e2; color: #b91c1c; }
    .pill-waived { background: #e5e7eb; color: #4b5563; }

    .amount-row {
      display: flex; gap: 1rem; margin: 0.3rem 0 0.4rem; flex-wrap: wrap;
    }
    .amount-block {
      flex: 1; min-width: 120px; background: #f9fafb; border-radius: 10px;
      padding: 0.45rem 0.65rem;
    }
    .amount-block .label { font-size: 0.78rem; color: #6b7280; display: block; margin-bottom: 0.05rem; }
    .amount-block .value { font-size: 0.95rem; font-weight: 600; color: #111827; }

    .breakdown-row {
      font-size: 0.8rem; color: #6b7280; display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.6rem;
    }

    .card-actions {
      display: flex; gap: 0.5rem; margin-bottom: 0.5rem;
    }
    .btn-sm {
      border-radius: 999px; border: none; padding: 0.3rem 0.75rem; font-size: 0.8rem;
      display: inline-flex; align-items: center; gap: 0.35rem; cursor: pointer;
      background: #1e3a5f; color: #fff; transition: background 0.15s, transform 0.1s;
    }
    .btn-sm:hover { background: #1d4ed8; transform: translateY(-1px); }
    .btn-sm.ghost {
      background: #f3f4f6; color: #374151;
    }
    .btn-sm.ghost:hover { background: #e5e7eb; }

    .payments-section { margin-top: 0.4rem; }
    .payments-section h4 {
      margin: 0 0 0.4rem; font-size: 0.8rem; font-weight: 700; color: #1f2937;
      display: flex; align-items: center; gap: 0.4rem;
    }
    .payments-section h4 i { color: #4b5563; }
    .payments-table {
      width: 100%; border-collapse: collapse; font-size: 0.8rem;
    }
    .payments-table th,
    .payments-table td {
      padding: 0.35rem 0.35rem; text-align: left; border-bottom: 1px solid #e5e7eb;
    }
    .payments-table thead th { color: #6b7280; font-weight: 600; }
    .payments-table td.amount { text-align: right; font-weight: 600; color: #16a34a; }

    .empty-state {
      margin: 2rem 0; text-align: center; color: #6b7280;
    }
    .empty-state i { font-size: 2rem; margin-bottom: 0.5rem; color: #cbd5f5; display: block; }

    @media (max-width: 900px) {
      .summary-layout { grid-template-columns: 1fr; }
    }
    @media (max-width: 768px) {
      .page-header-card { padding: 1.25rem 1rem; }
      .filters-row { flex-direction: column; }
      .filter-group-inline { width: 100%; }
      .filter-item { flex: 1; min-width: 0; }
    }
  `]
})
export class StudentFeeComponent implements OnInit {
  loading = false;

  allStudents: Student[] = [];
  filteredStudents: Student[] = [];
  pagedStudents: Student[] = [];
  studentSearch = '';
  selectedStudent: Student | null = null;

  private initialStudentId: number | null = null;

  allChallans: FeeChallan[] = [];
  filteredChallans: FeeChallan[] = [];

  sessions: AcademicSession[] = [];
  selectedSessionId = 0;
  filterStatus = '';

  totals: { totalAmount: number; paidAmount: number; waivedAmount: number; balance: number } = {
    totalAmount: 0, paidAmount: 0, waivedAmount: 0, balance: 0
  };

  // students pagination
  studentPageSize = 10;
  studentCurrentPage = 1;
  totalStudentPages = 1;
  studentPageNumbers: number[] = [];

  statusOptions: DropdownOption[] = [
    { value: 'Unpaid', label: 'Unpaid' },
    { value: 'Partial', label: 'Partial' },
    { value: 'Paid', label: 'Paid' },
    { value: 'Overdue', label: 'Overdue' },
    { value: 'Waived', label: 'Waived' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private studentService: StudentService,
    private feeService: FeeService,
    private sessionService: AcademicSessionService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  get sessionOptions(): DropdownOption[] {
    const opts = this.sessions.map(s => ({
      value: s.academicSessionId,
      label: s.name + (s.isCurrent ? ' (Current)' : '')
    }));
    return opts;
  }

  loadInitialData(): void {
    this.loading = true;

    const paramId = Number(this.route.snapshot.paramMap.get('id'));
    this.initialStudentId = Number.isNaN(paramId) ? null : paramId;

    this.sessionService.getAll().pipe(
      catchError(() => of([] as AcademicSession[]))
    ).subscribe({
      next: sessions => {
        this.sessions = sessions;

        if (this.initialStudentId) {
          this.studentService.getStudentById(this.initialStudentId).subscribe({
            next: s => {
              this.selectStudent(s, false);
              this.loading = false;
            },
            error: () => {
              this.loading = false;
            }
          });
        } else {
          this.loading = false;
        }

        // Load student list (doesn't affect global loading spinner)
        this.studentService.getActiveStudents().subscribe({
          next: list => {
            this.allStudents = list;
            this.applyStudentSearchFilter();

            if (!this.selectedStudent && this.initialStudentId) {
              const match = list.find(s => s.studentId === this.initialStudentId);
              if (match) {
                this.selectStudent(match, false);
              }
            }
          }
        });
      },
      error: () => {
        this.notify.error('Failed to load academic sessions');
        this.loading = false;
      }
    });
  }

  onStudentSearchChange(): void {
    this.applyStudentSearchFilter();
  }

  selectStudent(student: Student, updateRoute: boolean = true): void {
    this.selectedStudent = student;
    this.studentSearch = student.name;
    if (updateRoute) {
      this.router.navigate(['/admin/fee/student', student.studentId], { replaceUrl: true });
    }

    const status = this.filterStatus || undefined;
    this.loading = true;
    this.feeService.getStudentChallans(student.studentId, status).subscribe({
      next: challans => {
        this.allChallans = challans;
        this.loading = false;
        this.applyFilters();
      },
      error: () => {
        this.notify.error('Failed to load challans for student');
        this.allChallans = [];
        this.loading = false;
        this.applyFilters();
      }
    });
  }

  private applyStudentSearchFilter(): void {
    const term = this.studentSearch.trim().toLowerCase();
    if (!term) {
      this.filteredStudents = [...this.allStudents];
    } else {
      this.filteredStudents = this.allStudents.filter(s =>
        s.name.toLowerCase().includes(term) ||
        (s.roll || '').toLowerCase().includes(term) ||
        (s.class?.name || '').toLowerCase().includes(term)
      );
    }
    this.studentCurrentPage = 1;
    this.paginateStudents();
  }

  private paginateStudents(): void {
    this.totalStudentPages = Math.max(1, Math.ceil(this.filteredStudents.length / this.studentPageSize));
    if (this.studentCurrentPage > this.totalStudentPages) {
      this.studentCurrentPage = this.totalStudentPages;
    }
    const start = (this.studentCurrentPage - 1) * this.studentPageSize;
    this.pagedStudents = this.filteredStudents.slice(start, start + this.studentPageSize);
    this.buildStudentPageNumbers();
  }

  private buildStudentPageNumbers(): void {
    const maxVisible = 5;
    const pages: number[] = [];
    let start = Math.max(1, this.studentCurrentPage - Math.floor(maxVisible / 2));
    let end = start + maxVisible - 1;
    if (end > this.totalStudentPages) {
      end = this.totalStudentPages;
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let p = start; p <= end; p++) {
      pages.push(p);
    }
    this.studentPageNumbers = pages;
  }

  changeStudentPage(p: number): void {
    if (p < 1 || p > this.totalStudentPages || p === this.studentCurrentPage) return;
    this.studentCurrentPage = p;
    this.paginateStudents();
  }

  applyFilters(): void {
    if (!this.selectedStudent) {
      this.filteredChallans = [];
      this.resetTotals();
      return;
    }

    let list = [...this.allChallans];
    if (this.filterStatus) {
      const statusLower = this.filterStatus.toLowerCase();
      list = list.filter(c => (c.status || '').toLowerCase() === statusLower);
    }

    if (this.selectedSessionId && this.sessions.length > 0) {
      const sessionName = this.sessions.find(s => s.academicSessionId === this.selectedSessionId)?.name;
      if (sessionName) {
        list = list.filter(c => (this.selectedStudent?.session || '').toLowerCase().includes(sessionName.toLowerCase()));
      }
    }

    this.filteredChallans = list.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      if (a.month !== b.month) return b.month - a.month;
      return (b.feeChallanId || 0) - (a.feeChallanId || 0);
    });

    this.computeTotals();
  }

  computeTotals(): void {
    const t = { totalAmount: 0, paidAmount: 0, waivedAmount: 0, balance: 0 };
    for (const c of this.filteredChallans) {
      t.totalAmount += c.totalAmount || 0;
      t.paidAmount += c.paidAmount || 0;
      if ((c.status || '').toLowerCase() === 'waived') {
        t.waivedAmount += c.totalAmount || 0;
      }
      t.balance += c.balance || 0;
    }
    this.totals = t;
  }

  resetTotals(): void {
    this.totals = { totalAmount: 0, paidAmount: 0, waivedAmount: 0, balance: 0 };
  }

  getInitials(name: string | undefined | null): string {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  getMonthName(m: number): string {
    const names = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return names[m] || '';
  }

  printChallan(c: FeeChallan): void {
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
          <tr><td><strong>Student</strong></td><td>${this.selectedStudent?.name || ''}</td></tr>
          <tr><td><strong>Class</strong></td><td>${c.className || this.selectedStudent?.class?.name || ''}${c.sectionName ? ' - ' + c.sectionName : ''}</td></tr>
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
}

