import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AttendanceService } from '../../../../core/services/attendance.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { AttendanceCorrection } from '../../../../core/models/attendance.model';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { formatTime12h } from '../../../../shared/utils/time.utils';

const STATUS_LABELS: Record<number, string> = {
  0: 'Not Marked', 1: 'PP', 2: 'PO', 3: 'Absent', 4: 'SL', 5: 'FL', 6: 'Holiday', 7: 'Late'
};

@Component({
  selector: 'app-admin-attendance-corrections',
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
            <h2><i class="fa fa-edit"></i> Attendance Corrections</h2>
            <p class="page-subtitle">Review and approve/reject student correction requests</p>
          </div>
        </div>
      </div>

      <div class="table-card">
        <app-loading [show]="loading" [message]="'Loading...'"></app-loading>
        <div class="table-header">
          <h3>Pending Requests ({{ corrections.length }})</h3>
          <button type="button" class="btn btn-sm btn-secondary" (click)="load()" [disabled]="loading">
            <i class="fa fa-refresh"></i> Refresh
          </button>
        </div>
        <div class="empty-state" *ngIf="!loading && corrections.length === 0">
          <i class="fa fa-check-circle"></i>
          <p>No pending correction requests</p>
        </div>
        <table class="data-table" *ngIf="corrections.length > 0">
          <thead>
            <tr>
              <th>#</th>
              <th>Student</th>
              <th>Date</th>
              <th>Current</th>
              <th>Requested</th>
              <th>Reason</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of corrections; let i = index">
              <td>{{ i + 1 }}</td>
              <td>
                <a [routerLink]="['/admin/attendance/student', c.studentId]" class="student-link">
                  {{ c.attendance?.student?.name ?? 'Student ' + c.studentId }}
                </a>
              </td>
              <td>{{ formatDate(c.attendance?.date) }}</td>
              <td>
                <span class="badge">{{ getCurrentText(c) }}</span>
              </td>
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
              <td>{{ c.reason }}</td>
              <td>
                <div class="action-btns">
                  <button type="button" class="btn-icon btn-approve" (click)="review(c, 'approved')" [disabled]="reviewingId === c.attendanceCorrectionId" title="Approve">
                    <i class="fa fa-check"></i>
                  </button>
                  <button type="button" class="btn-icon btn-reject" (click)="review(c, 'rejected')" [disabled]="reviewingId === c.attendanceCorrectionId" title="Reject">
                    <i class="fa fa-times"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1100px; }
    .page-header-card {
      background: #fff;
      border-radius: 16px;
      padding: 1.75rem 2rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    .back-link { display: inline-flex; align-items: center; gap: 0.35rem; color: #6a8cad; font-size: 0.875rem; margin-bottom: 0.5rem; text-decoration: none; }
    .back-link:hover { color: #1e3a5f; }
    .page-header-card h2 { margin: 0 0 0.25rem 0; font-size: 1.5rem; font-weight: 700; color: #0f2744; }
    .page-subtitle { margin: 0; color: #6a8cad; font-size: 0.9375rem; }
    .table-card { background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .table-header { padding: 1.25rem 1.5rem; background: #f7f9fc; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
    .table-header h3 { margin: 0; font-size: 1.125rem; color: #0f2744; }
    .btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; border: none; border-radius: 8px; font-size: 0.875rem; cursor: pointer; }
    .btn-sm { padding: 0.4rem 0.75rem; }
    .btn-secondary { background: #e2e8f0; color: #374151; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
    .data-table th, .data-table td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
    .data-table th { background: #f7f9fc; font-size: 0.8125rem; color: #6a8cad; font-weight: 600; }
    .student-link { color: #1e3a5f; text-decoration: none; font-weight: 500; }
    .student-link:hover { text-decoration: underline; }
    .badge { padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.8125rem; background: #e2e8f0; color: #374151; }
    .action-btns { display: flex; gap: 0.5rem; }
    .btn-icon { width: 32px; height: 32px; display: inline-flex; align-items: center; justify-content: center; border: 2px solid; border-radius: 8px; cursor: pointer; background: #fff; }
    .btn-approve { border-color: #059669; color: #059669; }
    .btn-approve:hover:not(:disabled) { background: #059669; color: #fff; }
    .btn-reject { border-color: #dc2626; color: #dc2626; }
    .btn-reject:hover:not(:disabled) { background: #dc2626; color: #fff; }
    .btn-icon:disabled { opacity: 0.5; cursor: not-allowed; }
    .empty-state { text-align: center; padding: 3rem; color: #9ca3af; }
    .empty-state i { font-size: 2.5rem; margin-bottom: 0.5rem; display: block; }
    .requested-changes { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; }
    .change-chip {
      display: inline-flex; align-items: center; gap: 0.35rem;
      padding: 0.3rem 0.6rem; font-size: 0.8125rem;
      background: linear-gradient(135deg, #f0f7ff 0%, #e8f4fd 100%);
      color: #1e3a5f; border: 1px solid #c5d9ed; border-radius: 8px; font-weight: 500;
    }
    .change-chip i { opacity: 0.8; font-size: 0.75rem; }
    .change-chip.remarks-chip { max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .change-empty { color: #9ca3af; font-size: 0.9375rem; }
  `]
})
export class AdminAttendanceCorrectionsComponent implements OnInit {
  corrections: AttendanceCorrection[] = [];
  loading = false;
  reviewingId: number | null = null;

  constructor(
    private attendanceService: AttendanceService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.attendanceService.getPendingCorrections().subscribe({
      next: (list) => {
        this.corrections = list;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  formatDate(d?: string | Date | null): string {
    if (!d) return '—';
    const dt = typeof d === 'string' ? new Date(d) : d;
    return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  formatTime12h = formatTime12h;

  formatTime(t?: string | null): string {
    if (!t) return '';
    const s = String(t);
    return s.length >= 5 ? s.substring(0, 5) : s;
  }

  getCurrentText(c: AttendanceCorrection): string {
    const a = c.attendance;
    if (!a) return '—';
    const status = STATUS_LABELS[a.status] ?? a.status;
    const ti = formatTime12h(a.timeIn, '');
    const to = formatTime12h(a.timeOut, '');
    const parts = [status];
    if (ti) parts.push(ti);
    if (to) parts.push(to);
    return parts.join(' | ');
  }

  getStatusLabel(s: number): string {
    return STATUS_LABELS[s] ?? String(s);
  }

  review(c: AttendanceCorrection, status: 'approved' | 'rejected'): void {
    this.reviewingId = c.attendanceCorrectionId;
    this.attendanceService.reviewCorrection(c.attendanceCorrectionId, status).subscribe({
      next: () => {
        this.reviewingId = null;
        this.corrections = this.corrections.filter(x => x.attendanceCorrectionId !== c.attendanceCorrectionId);
        this.notify.success(status === 'approved' ? 'Correction approved' : 'Correction rejected');
      },
      error: () => {
        this.reviewingId = null;
        this.notify.error('Failed to ' + status);
      }
    });
  }
}
