import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../../shared/services/notification.service';
import { AttendanceService } from '../../../../core/services/attendance.service';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';

type StatusCode = 0 | 1 | 2 | 3; // 0=Not Marked, 1=PP, 2=PO, 3=Absent

interface StaffRow {
  staffId: number;
  name: string;
  department: string;
  status: StatusCode;
  timeIn: string;
  timeOut: string;
}

@Component({
  selector: 'app-admin-attendance-staff',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LoadingComponent],
  template: `
    <div class="page-container">
      <div class="page-header-card">
        <div class="header-content">
          <div>
            <a routerLink="/admin/dashboard" class="back-link">
              <i class="fa fa-arrow-left"></i> Back to Dashboard
            </a>
            <h2><i class="fa fa-chalkboard-teacher"></i> Staff Attendance</h2>
            <p class="page-subtitle">Mark teacher/staff attendance &amp; punctuality (check-in/out, late/early)</p>
          </div>
        </div>
      </div>

      <div class="filters-card">
        <h3>Select Date</h3>
        <div class="filter-row">
          <div class="filter-group">
            <label>Date</label>
            <input
              type="date"
              [(ngModel)]="selectedDate"
              [max]="todayDate"
              (ngModelChange)="onSelectedDateChange()"
              class="form-control"
            >
          </div>
          <div class="filter-group">
            <label>Punctuality filter</label>
            <select [(ngModel)]="punctualityFilter" (ngModelChange)="currentPage = 1" class="form-control">
              <option value="all">All</option>
              <option value="late">Late only</option>
              <option value="early">Early leave only</option>
            </select>
          </div>
        </div>
      </div>

      <div class="analytics-row" *ngIf="rows.length > 0">
        <div class="analytics-card"><span class="val">{{ onTimeCount }}</span><span class="lbl">On time</span></div>
        <div class="analytics-card late"><span class="val">{{ lateCount }}</span><span class="lbl">Late</span></div>
        <div class="analytics-card early"><span class="val">{{ earlyLeaveCount }}</span><span class="lbl">Early leave</span></div>
        <div class="analytics-card absent"><span class="val">{{ absentCount }}</span><span class="lbl">Absent</span></div>
      </div>

      <div class="table-card" *ngIf="rows.length > 0">
        <div class="table-header">
          <h3>Staff ({{ rows.length }})</h3>
          <div class="bulk-actions">
            <input
              type="text"
              [(ngModel)]="nameSearch"
              (ngModelChange)="currentPage = 1"
              placeholder="Search by name"
              class="form-control name-search"
            >
            <button class="btn btn-sm btn-success" (click)="markAllPresent()">
              <i class="fa fa-check"></i> Mark All Present
            </button>
            <button class="btn btn-sm btn-danger" (click)="markAllAbsent()">
              <i class="fa fa-times"></i> Mark All Absent
            </button>
            <button class="btn btn-primary" (click)="saveAttendance()" [disabled]="saving">
              <i class="fa fa-save"></i> Save
            </button>
          </div>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Department</th>
              <th>Status</th>
              <th>Marked</th>
              <th>Time In</th>
              <th>Time Out</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of paginatedRows; let i = index" [class.late-row]="isLate(r)" [class.early-row]="isEarlyLeave(r)">
              <td>{{ (currentPage - 1) * pageSize + i + 1 }}</td>
              <td>{{ r.name }}</td>
              <td>{{ r.department }}</td>
              <td>
                <div class="status-btns">
                  <button class="status-btn pp" [class.active]="r.status === 1" (click)="setStatus(r, 1)" title="PP">PP</button>
                  <button class="status-btn po" [class.active]="r.status === 2" (click)="setStatus(r, 2)" title="PO">PO</button>
                  <button class="status-btn a" [class.active]="r.status === 3" (click)="setStatus(r, 3)" title="Absent">A</button>
                </div>
              </td>
              <td>
                <span
                  class="marked-badge"
                  [ngClass]="isMarkedStatus(r.status) ? 'marked-badge--yes' : 'marked-badge--not'"
                >
                  <i
                    class="fa"
                    [ngClass]="isMarkedStatus(r.status) ? 'fa fa-check-circle' : 'fa fa-times-circle-o'"
                  ></i>
                  {{ isMarkedStatus(r.status) ? 'Marked' : 'Not Marked' }}
                </span>
              </td>
              <td>
                <div class="time-cell">
                  <input type="time" [(ngModel)]="r.timeIn" class="time-input" *ngIf="r.status === 1 || r.status === 2 || r.timeIn" [disabled]="r.status === 3">
                  <span class="badge badge-late" *ngIf="isLate(r)" title="Arrived after {{ expectedTimeIn }}">Late</span>
                </div>
              </td>
              <td>
                <div class="time-cell">
                  <input type="time" [(ngModel)]="r.timeOut" class="time-input" *ngIf="r.status === 1 || r.status === 2 || r.timeOut" [disabled]="r.status === 3">
                  <span class="badge badge-early" *ngIf="isEarlyLeave(r)" title="Left before {{ expectedTimeOut }}">Early</span>
                </div>
              </td>
              <td>
                <div class="row-actions">
                  <button type="button" class="btn-icon" (click)="openEdit(r)" title="Edit">
                    <i class="fa fa-pencil"></i>
                  </button>
                  <a [routerLink]="['/admin/attendance/staff-history', r.staffId]" class="btn-icon" title="View History">
                    <i class="fa fa-history"></i>
                  </a>
                  <button type="button" class="btn-icon btn-clear" (click)="clearRow(r)" title="Clear row">
                    <i class="fa fa-eraser"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="pagination-bar" *ngIf="totalPages > 1">
          <span class="pagination-info">Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ endIndex }} of {{ filteredRows.length }}</span>
          <div class="pagination-controls">
            <button type="button" class="page-btn" (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 1">
              <i class="fa fa-chevron-left"></i>
            </button>
            <button type="button" class="page-btn" (click)="goToPage(currentPage + 1)" [disabled]="currentPage === totalPages">
              <i class="fa fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="editRowData" class="edit-overlay" (click)="closeEdit()">
        <div class="edit-modal" (click)="$event.stopPropagation()">
          <h3>Edit Attendance — {{ editRowData.name }}</h3>
          <div class="edit-form">
            <div class="edit-field">
              <label>Status</label>
              <div class="status-btns">
                <button type="button" class="status-btn pp" [class.active]="editRowData.status === 1" (click)="editRowData.status = 1">PP</button>
                <button type="button" class="status-btn po" [class.active]="editRowData.status === 2" (click)="editRowData.status = 2">PO</button>
                <button
                  type="button"
                  class="status-btn a"
                  [class.active]="editRowData.status === 3"
                  (click)="editRowData.status = 3; editRowData.timeIn = ''; editRowData.timeOut = ''"
                >A</button>
              </div>
            </div>
            <div class="edit-row">
              <div class="edit-field">
                <label>Time In</label>
                <input
                  type="time"
                  [(ngModel)]="editRowData.timeIn"
                  class="form-control"
                  [disabled]="editRowData.status !== 1 && editRowData.status !== 2"
                >
              </div>
              <div class="edit-field">
                <label>Time Out</label>
                <input
                  type="time"
                  [(ngModel)]="editRowData.timeOut"
                  class="form-control"
                  [disabled]="editRowData.status !== 1 && editRowData.status !== 2"
                >
              </div>
            </div>
          </div>
          <div class="edit-actions">
            <button type="button" class="btn btn-secondary" (click)="closeEdit()">Cancel</button>
            <button type="button" class="btn btn-primary" (click)="saveEdit()">
              <i class="fa fa-check"></i> Save
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1000px; }
    .page-header-card {
      background: #fff;
      border-radius: 16px;
      padding: 1.75rem 2rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      color: #6a8cad;
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
      text-decoration: none;
    }
    .back-link:hover { color: #1e3a5f; }
    .page-header-card h2 {
      margin: 0 0 0.25rem 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: #0f2744;
    }
    .page-header-card h2 i { color: #1e3a5f; }
    .page-subtitle { margin: 0; color: #6a8cad; font-size: 0.9375rem; }
    .filters-card {
      background: #fff;
      border-radius: 16px;
      padding: 1.5rem 2rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    .filters-card h3 { margin: 0 0 1rem 0; font-size: 1rem; color: #0f2744; }
    .filter-row { display: flex; gap: 1rem; align-items: flex-end; flex-wrap: wrap; }
    .filter-group label { font-size: 0.8125rem; margin-bottom: 0.35rem; color: #6a8cad; font-weight: 500; display: block; }
    .form-control {
      padding: 0.5rem 0.75rem;
      border: 2px solid #d9e2ec;
      border-radius: 8px;
      font-size: 0.9375rem;
      min-width: 160px;
    }
    .analytics-row { display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
    .analytics-card {
      background: #fff;
      border-radius: 12px;
      padding: 1rem 1.25rem;
      min-width: 100px;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    .analytics-card .val { display: block; font-size: 1.25rem; font-weight: 700; color: #0f2744; }
    .analytics-card .lbl { font-size: 0.75rem; color: #6a8cad; }
    .analytics-card.late .val { color: #dc2626; }
    .analytics-card.early .val { color: #d97706; }
    .analytics-card.absent .val { color: #6b7280; }
    .table-card {
      background: #fff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      padding: 1.25rem 1.5rem;
      background: #f7f9fc;
      border-bottom: 1px solid #e2e8f0;
    }
    .table-header h3 { margin: 0; font-size: 1.125rem; color: #0f2744; }
    .bulk-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .name-search { 
      min-width: 240px; 
      color: #0f2744 !important;
      -webkit-text-fill-color: #0f2744;
    }
    .name-search::placeholder { color: #6a8cad !important; opacity: 1; }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.65rem 1.25rem;
      border: none;
      border-radius: 10px;
      font-size: 0.9375rem;
      font-weight: 600;
      cursor: pointer;
    }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-primary { background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); color: #fff; }
    .btn-secondary { background: #e2e8f0; color: #374151; }
    .btn-sm { padding: 0.5rem 0.75rem; font-size: 0.8125rem; }
    .btn-success { background: #059669; color: #fff; }
    .btn-danger { background: #dc2626; color: #fff; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th, .data-table td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
    .data-table th { background: #f7f9fc; font-size: 0.8125rem; color: #6a8cad; font-weight: 600; }
    .status-btns { display: flex; gap: 0.25rem; flex-wrap: wrap; }
    .status-btn {
      padding: 0.3rem 0.5rem;
      font-size: 0.75rem;
      font-weight: 600;
      border: 2px solid #e2e8f0;
      background: #fff;
      border-radius: 6px;
      cursor: pointer;
    }
    .status-btn:hover { border-color: #1e3a5f; }
    .status-btn.pp.active { background: #d1fae5; border-color: #059669; color: #059669; }
    .status-btn.po.active { background: #dbeafe; border-color: #2563eb; color: #2563eb; }
    .status-btn.a.active { background: #fee2e2; border-color: #dc2626; color: #dc2626; }
    .time-cell { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
    .time-input {
      padding: 0.4rem 0.5rem;
      border: 2px solid #d9e2ec;
      border-radius: 6px;
      font-size: 0.875rem;
      width: 90px;
    }
    .badge { padding: 0.2rem 0.4rem; border-radius: 6px; font-size: 0.7rem; font-weight: 600; }
    .marked-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.35rem 0.75rem;
      border-radius: 999px;
      font-size: 0.8125rem;
      font-weight: 800;
      border: 1px solid transparent;
      line-height: 1;
      white-space: nowrap;
    }
    .marked-badge--yes {
      background: linear-gradient(135deg, #d1fae5 0%, #ecfdf5 100%);
      color: #059669;
      border-color: #a7f3d0;
    }
    .marked-badge--not {
      background: linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%);
      color: #92400e;
      border-color: #fcd34d;
    }
    .badge-late { background: #fee2e2; color: #dc2626; }
    .badge-early { background: #fef3c7; color: #d97706; }
    .late-row { background: #fef2f2; }
    .early-row { background: #fffbeb; }
    .row-actions { display: flex; gap: 0.5rem; }
    .btn-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      padding: 0;
      border: none;
      border-radius: 8px;
      background: #f0f4f8;
      color: #1e3a5f;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s;
    }
    .btn-icon:hover { background: #e2e8f0; }
    .btn-icon.btn-clear:hover { background: #fee2e2; color: #dc2626; }
    .edit-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000; }
    .edit-modal { background: #fff; border-radius: 16px; padding: 1.5rem 2rem; min-width: 360px; max-width: 95%; box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
    .edit-modal h3 { margin: 0 0 1rem 0; font-size: 1.125rem; color: #0f2744; }
    .edit-form { margin-bottom: 1.5rem; }
    .edit-field { margin-bottom: 1rem; }
    .edit-field label { display: block; font-size: 0.8125rem; color: #6a8cad; margin-bottom: 0.35rem; font-weight: 500; }
    .edit-row { display: flex; gap: 1rem; }
    .edit-actions { display: flex; justify-content: flex-end; gap: 0.75rem; }
    .pagination-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-top: 1px solid #e2e8f0;
      background: #fafbfc;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .pagination-info { font-size: 0.875rem; color: #6a8cad; }
    .pagination-controls { display: flex; gap: 0.5rem; }
    .page-btn {
      padding: 0.4rem 0.75rem;
      border: 2px solid #e2e8f0;
      background: #fff;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.875rem;
      color: #1e3a5f;
    }
    .page-btn:hover:not(:disabled) { border-color: #1e3a5f; background: #f7f9fc; }
    .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class AdminAttendanceStaffComponent implements OnInit {
  rows: StaffRow[] = [];
  selectedDate = '';
  saving = false;
  pageSize = 15;
  currentPage = 1;
  punctualityFilter: 'all' | 'late' | 'early' = 'all';
  nameSearch = '';
  readonly todayDate = new Date().toISOString().split('T')[0];
  readonly expectedTimeIn = '08:15';
  readonly expectedTimeOut = '14:00';

  private normalizeStatus(status: number): StatusCode {
    // Backend model uses `int` for status, but admin staff UI supports 0..3 only.
    // If anything else comes in, fall back to Not Marked.
    return (status === 0 || status === 1 || status === 2 || status === 3) ? status : 0;
  }

  isMarkedStatus(status: StatusCode): boolean {
    return status !== 0;
  }

  get filteredRows(): StaffRow[] {
    const base =
      this.punctualityFilter === 'late'
        ? this.rows.filter(r => this.isLate(r))
        : this.punctualityFilter === 'early'
          ? this.rows.filter(r => this.isEarlyLeave(r))
          : this.rows;

    const q = this.nameSearch.trim().toLowerCase();
    if (!q) return base;
    return base.filter(r => (r.name || '').toLowerCase().includes(q));
  }

  get totalPages(): number {
    return Math.ceil(this.filteredRows.length / this.pageSize) || 1;
  }

  get paginatedRows(): StaffRow[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredRows.slice(start, start + this.pageSize);
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredRows.length);
  }

  get onTimeCount(): number {
    return this.rows.filter(r => (r.status === 1 || r.status === 2) && r.timeIn && !this.isLate(r)).length;
  }

  get lateCount(): number {
    return this.rows.filter(r => this.isLate(r)).length;
  }

  get earlyLeaveCount(): number {
    return this.rows.filter(r => this.isEarlyLeave(r)).length;
  }

  get absentCount(): number {
    return this.rows.filter(r => r.status === 3).length;
  }

  isLate(r: StaffRow): boolean {
    if (!r.timeIn || r.status === 3) return false;
    return r.timeIn > this.expectedTimeIn;
  }

  isEarlyLeave(r: StaffRow): boolean {
    if (!r.timeOut || r.status === 3) return false;
    return r.timeOut < this.expectedTimeOut && r.timeOut.length > 0;
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
  }

  constructor(private notify: NotificationService, private attendanceService: AttendanceService) {}

  ngOnInit(): void {
    this.selectedDate = new Date().toISOString().split('T')[0];
    this.loadStaffAttendance();
  }

  onSelectedDateChange(): void {
    this.loadStaffAttendance();
  }

  private ensureNotFutureSelectedDate(): boolean {
    // `yyyy-MM-dd` string comparison is safe for dates.
    if (!this.selectedDate) return false;
    if (this.selectedDate > this.todayDate) {
      this.notify.error('Future dates are not allowed.');
      this.selectedDate = this.todayDate;
      return false;
    }
    return true;
  }

  private loadStaffAttendance(): void {
    if (!this.ensureNotFutureSelectedDate()) return;
    this.rows = [];
    this.currentPage = 1;
    this.attendanceService.getAdminStaffAttendance(this.selectedDate).subscribe({
      next: (data) => {
        // Normalize status into the union type used by this component.
        this.rows = data.map(d => ({ ...d, status: this.normalizeStatus(d.status) }));
        this.currentPage = 1;
      },
      error: (err) => {
        this.rows = [];
        this.notify.error(err?.error?.message ?? 'Failed to load staff attendance');
      }
    });
  }

  setStatus(r: StaffRow, status: StatusCode): void {
    r.status = status;
  }

  markAllPresent(): void {
    this.filteredRows.forEach(r => { r.status = 1; r.timeIn = '08:00'; r.timeOut = this.expectedTimeOut; });
    this.notify.success('All marked Present');
  }

  markAllAbsent(): void {
    this.filteredRows.forEach(r => { r.status = 3; r.timeIn = ''; r.timeOut = ''; });
    this.notify.success('All marked Absent');
  }

  editRowData: StaffRow | null = null;

  openEdit(r: StaffRow): void {
    this.editRowData = { ...r, timeIn: r.timeIn || '', timeOut: r.timeOut || '' };
  }

  closeEdit(): void {
    this.editRowData = null;
  }

  saveEdit(): void {
    if (!this.editRowData) return;
    const r = this.rows.find(x => x.staffId === this.editRowData!.staffId);
    if (r) {
      r.status = this.editRowData.status;
      if (this.editRowData.status === 1 || this.editRowData.status === 2) {
        r.timeIn = this.editRowData.timeIn;
        r.timeOut = this.editRowData.timeOut;
      } else {
        r.timeIn = '';
        r.timeOut = '';
      }
    }
    this.notify.success('Row updated');
    this.closeEdit();
  }

  clearRow(r: StaffRow): void {
    r.status = 0;
    r.timeIn = '';
    r.timeOut = '';
    this.notify.info('Row cleared');
  }

  saveAttendance(): void {
    if (!this.ensureNotFutureSelectedDate()) return;
    this.saving = true;
    this.attendanceService.saveAdminStaffAttendance({
      date: this.selectedDate,
      records: this.rows.map(r => ({
        staffId: r.staffId,
        status: r.status,
        timeIn: (r.status === 1 || r.status === 2) ? (r.timeIn || null) : null,
        timeOut: (r.status === 1 || r.status === 2) ? (r.timeOut || null) : null
      }))
    }).subscribe({
      next: () => {
        this.saving = false;
        this.notify.success('Staff attendance saved');
        this.loadStaffAttendance();
      },
      error: (err) => {
        this.saving = false;
        this.notify.error(err?.error?.message ?? 'Failed to save staff attendance');
      }
    });
  }
}
