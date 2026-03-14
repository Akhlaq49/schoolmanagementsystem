import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { StudentService } from '../../../../core/services/student.service';
import { AttendanceService } from '../../../../core/services/attendance.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { Student } from '../../../../core/models/student.model';
import { Attendance, AttendanceCorrection, CreateCorrectionRequest } from '../../../../core/models/attendance.model';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { formatTime12h } from '../../../../shared/utils/time.utils';

const STATUS_LABELS: Record<number, string> = {
  0: 'Not Marked',
  1: 'PP',
  2: 'PO',
  3: 'Absent',
  4: 'SL',
  5: 'FL',
  6: 'Holiday',
  7: 'Late'
};

@Component({
  selector: 'app-attendance-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent],
  template: `
    <div class="edit-container">
      <app-loading [show]="loading" [message]="'Loading...'"></app-loading>

      <div class="page-header">
        <h2><i class="fa fa-pencil-square-o"></i> Edit Attendance</h2>
        <p class="subtitle">View your attendance and request corrections. Requests are sent to admin for approval.</p>
      </div>

      <div class="filters-row">
        <div class="filter-group">
          <label>Month</label>
          <select [(ngModel)]="selectedMonth" (ngModelChange)="loadAttendance()" class="form-control">
            <option *ngFor="let m of monthOptions" [value]="m.value">{{ m.label }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Year</label>
          <select [(ngModel)]="selectedYear" (ngModelChange)="loadAttendance()" class="form-control">
            <option *ngFor="let y of yearOptions" [value]="y">{{ y }}</option>
          </select>
        </div>
      </div>

      <div class="listing-card">
        <h3>My Attendance</h3>
        <div class="empty-state" *ngIf="!loading && attendanceList.length === 0">
          <i class="fa fa-calendar-times-o"></i>
          <p>No attendance records for this month</p>
        </div>
        <div class="table-wrap" *ngIf="attendanceList.length > 0">
          <table class="edit-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Time In</th>
                <th>Time Out</th>
                <th>Remarks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let a of paginatedAttendance">
                <td>{{ formatDate(a.date) }}</td>
                <td><span class="badge" [ngClass]="'badge-' + getStatusKey(a.status)">{{ getStatusLabel(a.status) }}</span></td>
                <td>{{ formatTime12h(a.timeIn) }}</td>
                <td>{{ formatTime12h(a.timeOut) }}</td>
                <td>{{ a.remarks || '—' }}</td>
                <td>
                  <button type="button" class="btn-sm btn-edit" (click)="openRequestEdit(a)" [disabled]="hasPendingCorrection(a.attendanceId)">
                    <i class="fa fa-edit"></i> {{ hasPendingCorrection(a.attendanceId) ? 'Pending' : 'Request Edit' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pagination-bar" *ngIf="attendanceList.length > 0 && totalPages > 1">
          <span class="pagination-info">Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ endIndex }} of {{ attendanceList.length }}</span>
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

      <div class="listing-card">
        <h3>My Correction Requests</h3>
        <div class="empty-state" *ngIf="corrections.length === 0 && !loading">
          <i class="fa fa-inbox"></i>
          <p>No correction requests yet</p>
        </div>
        <div class="table-wrap" *ngIf="corrections.length > 0">
          <table class="edit-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Reason</th>
                <th>Requested Change</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of corrections">
                <td>{{ c.attendance ? formatDate(c.attendance.date) : '—' }}</td>
                <td class="reason-cell">{{ c.reason }}</td>
                <td>
                  <div class="requested-changes">
                    <span *ngIf="c.requestedStatus != null" class="change-chip">
                      <i class="fa fa-user"></i> {{ getStatusLabel(c.requestedStatus) }}
                    </span>
                    <span *ngIf="c.requestedTimeIn" class="change-chip">
                      <i class="fa fa-clock-o"></i> {{ formatTime12h(c.requestedTimeIn) }}
                    </span>
                    <span *ngIf="c.requestedTimeOut" class="change-chip">
                      <i class="fa fa-sign-out"></i> {{ formatTime12h(c.requestedTimeOut) }}
                    </span>
                    <span *ngIf="c.requestedRemarks" class="change-chip remarks-chip" [title]="c.requestedRemarks">
                      <i class="fa fa-comment-o"></i> {{ c.requestedRemarks }}
                    </span>
                    <span *ngIf="!c.requestedStatus && !c.requestedTimeIn && !c.requestedTimeOut && !c.requestedRemarks" class="change-empty">—</span>
                  </div>
                </td>
                <td><span class="badge" [ngClass]="'badge-' + c.status">{{ c.status }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div *ngIf="showRequestModal" class="modal-overlay" (click)="closeRequestModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3>Request Correction — {{ editingAttendance ? formatDate(editingAttendance.date) : '' }}</h3>
          <form (ngSubmit)="submitCorrection()">
            <div class="form-group">
              <label>Reason for correction <span class="required">*</span></label>
              <textarea [(ngModel)]="requestReason" name="reason" class="form-control" rows="2" required
                placeholder="e.g. I was present but marked absent due to late arrival"></textarea>
            </div>
            <div class="form-group">
              <label>Requested Status</label>
              <select [(ngModel)]="requestStatus" name="requestStatus" class="form-control">
                <option [ngValue]="null">— No change —</option>
                <option [ngValue]="1">PP (Physical Present)</option>
                <option [ngValue]="2">PO (Present Online)</option>
                <option [ngValue]="3">Absent</option>
                <option [ngValue]="4">Short Leave</option>
                <option [ngValue]="5">Full Leave</option>
              </select>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Time In</label>
                <input type="time" [(ngModel)]="requestTimeIn" name="requestTimeIn" class="form-control">
              </div>
              <div class="form-group">
                <label>Time Out</label>
                <input type="time" [(ngModel)]="requestTimeOut" name="requestTimeOut" class="form-control">
              </div>
            </div>
            <div class="form-group">
              <label>Remarks</label>
              <input type="text" [(ngModel)]="requestRemarks" name="requestRemarks" class="form-control" placeholder="Optional">
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="closeRequestModal()">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="saving || !requestReason.trim()">
                <i class="fa fa-paper-plane"></i> Submit Request
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .edit-container { padding: 1.5rem; max-width: 900px; margin: 0 auto; }
    .page-header h2 {
      margin: 0 0 0.25rem 0;
      font-size: 1.5rem;
      color: #0f2744;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .page-header h2 i { color: #1e3a5f; }
    .subtitle { margin: 0 0 1.5rem 0; color: #6a8cad; font-size: 0.9375rem; }
    .filters-row { display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
    .filter-group label { display: block; font-size: 0.8125rem; color: #6a8cad; margin-bottom: 0.35rem; }
    .form-control { padding: 0.5rem 0.75rem; border: 2px solid #e2e8f0; border-radius: 8px; width: 100%; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; font-size: 0.8125rem; color: #6a8cad; margin-bottom: 0.35rem; }
    .form-row { display: flex; gap: 1rem; }
    .form-row .form-group { flex: 1; }
    .listing-card {
      background: #fff;
      border-radius: 16px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      border: 1px solid #e2e8f0;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
    }
    .listing-card h3 { margin: 0 0 1rem 0; font-size: 1.125rem; color: #0f2744; }
    .edit-table { width: 100%; border-collapse: collapse; }
    .edit-table th, .edit-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
    .edit-table th { background: #f7f9fc; font-size: 0.8125rem; color: #6a8cad; font-weight: 600; }
    .badge { padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.8125rem; font-weight: 600; }
    .badge-pp, .badge-po { background: #d1fae5; color: #059669; }
    .badge-absent { background: #fee2e2; color: #dc2626; }
    .badge-sl, .badge-fl { background: #ede9fe; color: #7c3aed; }
    .badge-pending { background: #fef3c7; color: #d97706; }
    .badge-approved { background: #d1fae5; color: #059669; }
    .badge-rejected { background: #fee2e2; color: #dc2626; }
    .btn-sm { padding: 0.4rem 0.75rem; font-size: 0.8125rem; border-radius: 8px; border: 2px solid; cursor: pointer; }
    .btn-edit { background: #fff; border-color: #1e3a5f; color: #1e3a5f; }
    .btn-edit:hover:not(:disabled) { background: #1e3a5f; color: #fff; }
    .btn-edit:disabled { opacity: 0.6; cursor: not-allowed; }
    .reason-cell { max-width: 180px; }
    .requested-changes {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      align-items: center;
    }
    .change-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.3rem 0.6rem;
      font-size: 0.8125rem;
      background: linear-gradient(135deg, #f0f7ff 0%, #e8f4fd 100%);
      color: #1e3a5f;
      border: 1px solid #c5d9ed;
      border-radius: 8px;
      font-weight: 500;
    }
    .change-chip i { opacity: 0.8; font-size: 0.75rem; }
    .change-chip.remarks-chip { max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .change-empty { color: #9ca3af; font-size: 0.9375rem; }
    .empty-state { text-align: center; padding: 2rem; color: #9ca3af; }
    .empty-state i { font-size: 2.5rem; margin-bottom: 0.5rem; display: block; }
    .pagination-bar { display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; }
    .page-btn { padding: 0.4rem 0.75rem; border: 2px solid #e2e8f0; background: #fff; border-radius: 8px; cursor: pointer; }
    .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000; }
    .modal { background: #fff; border-radius: 16px; padding: 1.5rem 2rem; min-width: 400px; max-width: 95%; }
    .modal h3 { margin: 0 0 1rem 0; }
    .modal-actions { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1rem; }
    .btn-primary { background: #1e3a5f; color: #fff; padding: 0.6rem 1.25rem; border: none; border-radius: 8px; cursor: pointer; }
    .btn-secondary { background: #e2e8f0; color: #374151; padding: 0.6rem 1.25rem; border: none; border-radius: 8px; cursor: pointer; }
    .required { color: #dc2626; }
  `]
})
export class AttendanceEditComponent implements OnInit {
  formatTime12h = formatTime12h;
  student: Student | null = null;
  attendanceList: Attendance[] = [];
  corrections: AttendanceCorrection[] = [];
  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();
  monthOptions: { value: number; label: string }[] = [];
  yearOptions: number[] = [];
  loading = false;
  saving = false;
  pageSize = 10;
  currentPage = 1;
  showRequestModal = false;
  editingAttendance: Attendance | null = null;
  requestReason = '';
  requestStatus: number | null = null;
  requestTimeIn = '';
  requestTimeOut = '';
  requestRemarks = '';

  constructor(
    private auth: AuthService,
    private studentService: StudentService,
    private attendanceService: AttendanceService,
    private notify: NotificationService
  ) {}

  get totalPages(): number {
    return Math.ceil(this.attendanceList.length / this.pageSize) || 1;
  }

  get paginatedAttendance(): Attendance[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.attendanceList.slice(start, start + this.pageSize);
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.attendanceList.length);
  }

  ngOnInit(): void {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    this.monthOptions = months.map((l, i) => ({ value: i + 1, label: l }));
    const y = new Date().getFullYear();
    this.yearOptions = [y, y - 1, y - 2];
    this.loadStudent();
  }

  private loadStudent(): void {
    const userId = this.auth.getUserId();
    if (!userId) return;
    this.studentService.getStudentById(userId).subscribe({
      next: (s) => {
        this.student = s;
        this.loadAttendance();
        this.loadCorrections();
      },
      error: () => this.notify.error('Could not load profile')
    });
  }

  loadAttendance(): void {
    if (!this.student) return;
    this.loading = true;
    const studentId = (this.student as any).studentId ?? this.student.userId ?? 0;
    this.attendanceService.getAttendanceReport(studentId, this.selectedMonth, this.selectedYear).subscribe({
      next: (list) => {
        this.attendanceList = list;
        this.currentPage = 1;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  loadCorrections(): void {
    if (!this.student) return;
    const studentId = (this.student as any).studentId ?? this.student.userId ?? 0;
    this.attendanceService.getMyCorrections(studentId).subscribe({
      next: (list) => { this.corrections = list; },
      error: () => {}
    });
  }

  hasPendingCorrection(attendanceId: number): boolean {
    return this.corrections.some(c => c.attendanceId === attendanceId && c.status === 'pending');
  }

  formatDate(d: string | Date): string {
    const dt = typeof d === 'string' ? new Date(d) : d;
    return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  formatTime(t?: string | null): string {
    if (!t) return '';
    const s = String(t);
    return s.length >= 5 ? s.substring(0, 5) : s;
  }

  getStatusLabel(s: number): string {
    return STATUS_LABELS[s] ?? '?';
  }

  getStatusKey(s: number): string {
    if (s === 1 || s === 2 || s === 7) return 'pp';
    if (s === 3) return 'absent';
    if (s === 4 || s === 5) return 'sl';
    return 'absent';
  }

  openRequestEdit(a: Attendance): void {
    this.editingAttendance = a;
    this.requestReason = '';
    this.requestStatus = a.status;
    this.requestTimeIn = !a.timeIn ? '' : this.formatTime(a.timeIn);
    this.requestTimeOut = !a.timeOut ? '' : this.formatTime(a.timeOut);
    this.requestRemarks = a.remarks ?? '';
    this.showRequestModal = true;
  }

  closeRequestModal(): void {
    this.showRequestModal = false;
    this.editingAttendance = null;
  }

  submitCorrection(): void {
    if (!this.editingAttendance || !this.student || !this.requestReason.trim()) return;
    this.saving = true;
    const studentId = (this.student as any).studentId ?? this.student.userId ?? 0;
    const dto: CreateCorrectionRequest = {
      attendanceId: this.editingAttendance.attendanceId,
      studentId,
      reason: this.requestReason.trim(),
      requestedStatus: this.requestStatus ?? undefined,
      requestedTimeIn: this.requestTimeIn || undefined,
      requestedTimeOut: this.requestTimeOut || undefined,
      requestedRemarks: this.requestRemarks.trim() || undefined
    };
    this.attendanceService.createCorrection(dto).subscribe({
      next: () => {
        this.saving = false;
        this.closeRequestModal();
        this.loadCorrections();
        this.notify.success('Correction request sent to admin for approval');
      },
      error: (err) => {
        this.saving = false;
        this.notify.error(err?.error?.message ?? 'Failed to submit request');
      }
    });
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
  }
}
