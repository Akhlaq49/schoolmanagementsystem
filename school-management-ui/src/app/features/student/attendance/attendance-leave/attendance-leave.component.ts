import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { StudentService } from '../../../../core/services/student.service';
import { AttendanceService } from '../../../../core/services/attendance.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { Student } from '../../../../core/models/student.model';
import { LeaveApplication } from '../../../../core/models/attendance.model';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-attendance-leave',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent, ConfirmDialogComponent],
  template: `
    <div class="leave-container">
      <app-loading [show]="loading" [message]="'Loading...'"></app-loading>

      <div class="page-header">
        <div class="header-content">
          <div>
            <h2><i class="fa fa-calendar-plus-o"></i> Leave</h2>
            <p class="subtitle">Manage your leave applications</p>
          </div>
          <button class="btn btn-primary" *ngIf="student" (click)="openAddLeave()" [disabled]="submitting">
            <i class="fa fa-plus"></i> Add Leave
          </button>
        </div>
      </div>

      <div class="listing-card" *ngIf="student">
        <h3>Leave Applications</h3>
        <div class="history-empty" *ngIf="leaves.length === 0">
          <i class="fa fa-inbox"></i>
          <p>No leave applications yet</p>
          <button class="btn btn-secondary" (click)="openAddLeave()">
            <i class="fa fa-plus"></i> Add Leave
          </button>
        </div>
        <div class="leaves-table-wrap" *ngIf="leaves.length > 0">
          <table class="leaves-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let l of paginatedLeaves" [class.pending]="l.status === 'pending'" [class.approved]="l.status === 'approved'" [class.rejected]="l.status === 'rejected'">
                <td>{{ l.leaveType === 'short' ? 'Short' : 'Full' }}</td>
                <td>{{ formatDate(l.leaveFrom) }}</td>
                <td>{{ formatDate(l.leaveTo) }}</td>
                <td class="reason-cell">{{ l.reason }}</td>
                <td><span class="leave-status" [ngClass]="'status-' + l.status">{{ l.status | titlecase }}</span></td>
                <td>
                  <button class="btn-action btn-edit" *ngIf="l.status === 'pending'" (click)="editLeave(l)" title="Edit">
                    <i class="fa fa-pencil"></i> Edit
                  </button>
                  <button class="btn-action btn-cancel" *ngIf="l.status === 'pending'" (click)="cancelLeave(l)" title="Cancel">
                    <i class="fa fa-times"></i> Cancel
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pagination-bar" *ngIf="leaves.length > 0 && totalPages > 1">
          <span class="pagination-info">
            Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ endIndex }} of {{ leaves.length }}
          </span>
          <div class="pagination-controls">
            <button class="page-btn" (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 1">
              <i class="fa fa-chevron-left"></i>
            </button>
            <div class="page-numbers">
              <button *ngFor="let p of pageNumbers" class="page-num" [class.active]="p === currentPage" (click)="goToPage(p)">
                {{ p }}
              </button>
            </div>
            <button class="page-btn" (click)="goToPage(currentPage + 1)" [disabled]="currentPage === totalPages">
              <i class="fa fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="apply-card" *ngIf="student && showForm">
        <h3>{{ editingLeave ? 'Edit Leave' : 'Add Leave' }}</h3>
        <div class="leave-type-tabs">
          <button class="tab" [class.active]="leaveType === 'short'" (click)="leaveType = 'short'">
            Short Leave (Same Day)
          </button>
          <button class="tab" [class.active]="leaveType === 'full'" (click)="leaveType = 'full'">
            Full Leave (Single / Multiple Days)
          </button>
        </div>

        <form (ngSubmit)="applyLeave()" class="leave-form">
          <div class="form-row" *ngIf="leaveType === 'short'">
            <div class="form-group">
              <label>Date <span class="required">*</span></label>
              <input type="date" [(ngModel)]="form.date" name="date" required class="form-control" [min]="minDate" [max]="maxDate">
            </div>
            <div class="form-group">
              <label>From Time <span class="required">*</span></label>
              <input type="time" [(ngModel)]="form.leaveFrom" name="leaveFrom" required class="form-control">
            </div>
            <div class="form-group">
              <label>To Time <span class="required">*</span></label>
              <input type="time" [(ngModel)]="form.leaveTo" name="leaveTo" required class="form-control">
            </div>
          </div>

          <div class="form-row" *ngIf="leaveType === 'full'">
            <div class="form-group">
              <label>From Date <span class="required">*</span></label>
              <input type="date" [(ngModel)]="form.leaveFrom" name="leaveFromFull" required class="form-control" [min]="minDate" [max]="maxDate">
            </div>
            <div class="form-group">
              <label>To Date <span class="required">*</span></label>
              <input type="date" [(ngModel)]="form.leaveTo" name="leaveToFull" required class="form-control" [min]="form.leaveFrom || minDate" [max]="maxDate">
            </div>
          </div>

          <div class="form-group">
            <label>Reason <span class="required">*</span></label>
            <textarea [(ngModel)]="form.reason" name="reason" rows="3" required
                      placeholder="Enter reason for leave"
                      class="form-control"></textarea>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="submitting">
              <i class="fa fa-paper-plane"></i> {{ editingLeave ? 'Update' : 'Submit' }}
            </button>
            <button type="button" class="btn btn-secondary" (click)="closeForm()">
              Cancel
            </button>
          </div>
        </form>
      </div>
      <app-confirm-dialog *ngIf="confirmVisible" [show]="true"
        [title]="'Cancel Leave'"
        [message]="'Are you sure you want to cancel this leave application?'"
        (confirmed)="doCancelLeave()"
        (cancelled)="confirmVisible = false">
      </app-confirm-dialog>
    </div>
  `,
  styles: [`
    .leave-container { padding: 2rem; max-width: 1200px; margin: 0 auto; width: 100%; }
    .page-header h2 {
      margin: 0 0 0.25rem 0;
      font-size: 1.5rem;
      color: #0f2744;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .page-header h2 i { color: #1e3a5f; }
    .header-content { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
    .subtitle { margin: 0; color: #6a8cad; font-size: 0.9375rem; }
    .listing-card {
      background: #fff;
      border-radius: 16px;
      padding: 2rem 2.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08);
      border: 1px solid #e2e8f0;
    }
    .listing-card h3 { margin: 0 0 1rem 0; font-size: 1.125rem; color: #0f2744; }
    .leaves-table-wrap { overflow-x: auto; }
    .leaves-table { width: 100%; border-collapse: collapse; }
    .leaves-table th, .leaves-table td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
    .leaves-table th { background: #f7f9fc; font-size: 0.8125rem; color: #6a8cad; font-weight: 600; }
    .reason-cell { max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .btn-action {
      padding: 0.35rem 0.75rem;
      font-size: 0.8125rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      margin-right: 0.5rem;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }
    .btn-edit { background: #dbeafe; color: #1d4ed8; }
    .btn-edit:hover { background: #bfdbfe; }
    .btn-cancel { background: #fee2e2; color: #dc2626; }
    .btn-cancel:hover { background: #fecaca; }
    .form-actions { display: flex; gap: 0.75rem; margin-top: 1rem; }
    .apply-card, .history-card {
      background: #fff;
      border-radius: 16px;
      padding: 2rem 2.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08);
      border: 1px solid #e2e8f0;
    }
    .apply-card h3, .history-card h3 {
      margin: 0 0 1rem 0;
      font-size: 1.125rem;
      color: #0f2744;
    }
    .leave-type-tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.25rem;
    }
    .tab {
      padding: 0.5rem 1rem;
      border: 2px solid #e2e8f0;
      background: #fff;
      border-radius: 8px;
      font-size: 0.9375rem;
      font-weight: 500;
      cursor: pointer;
      color: #6a8cad;
      transition: all 0.2s;
    }
    .tab:hover { border-color: #1e3a5f; color: #1e3a5f; }
    .tab.active { border-color: #1e3a5f; background: #1e3a5f; color: #fff; }
    .form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1.25rem; margin-bottom: 1.25rem; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.35rem; color: #374151; }
    .required { color: #dc2626; }
    .form-control {
      width: 100%;
      padding: 0.65rem 1rem;
      border: 2px solid #d9e2ec;
      border-radius: 8px;
      font-size: 0.9375rem;
      box-sizing: border-box;
    }
    .form-control:focus { outline: none; border-color: #1e3a5f; }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      border: none;
      border-radius: 12px;
      font-size: 0.9375rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-primary { background: #1e3a5f; color: #fff; }
    .btn-primary:hover:not(:disabled) { background: #2c5282; transform: translateY(-1px); }
    .btn-secondary { background: #e2e8f0; color: #374151; }
    .btn-secondary:hover:not(:disabled) { background: #cbd5e1; }
    .history-empty {
      text-align: center;
      padding: 2rem;
      color: #9ca3af;
    }
    .history-empty i { font-size: 2.5rem; margin-bottom: 0.5rem; display: block; }
    .leave-status { font-size: 0.8125rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: 6px; display: inline-block; }
    .status-pending { background: #fef3c7; color: #d97706; }
    .status-approved { background: #d1fae5; color: #059669; }
    .status-rejected { background: #fee2e2; color: #dc2626; }
    .pagination-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      padding: 1rem 0 0;
      margin-top: 1rem;
      border-top: 1px solid #e2e8f0;
    }
    .pagination-info { font-size: 0.875rem; color: #6a8cad; }
    .pagination-controls { display: flex; align-items: center; gap: 0.5rem; }
    .page-btn {
      padding: 0.4rem 0.75rem;
      border: 2px solid #e2e8f0;
      background: #fff;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.9375rem;
      color: #374151;
    }
    .page-btn:hover:not(:disabled) { border-color: #1e3a5f; color: #1e3a5f; }
    .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .page-num {
      padding: 0.4rem 0.75rem;
      border: 2px solid #e2e8f0;
      background: #fff;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 600;
      color: #374151;
    }
    .page-num.active { background: #1e3a5f; border-color: #1e3a5f; color: #fff; }
    .page-num:hover:not(.active) { border-color: #1e3a5f; color: #1e3a5f; }
  `]
})
export class AttendanceLeaveComponent implements OnInit {
  student: Student | null = null;
  leaves: LeaveApplication[] = [];
  showForm = false;
  editingLeave: LeaveApplication | null = null;
  leaveType: 'short' | 'full' = 'short';
  form = {
    date: '',
    leaveFrom: '',
    leaveTo: '',
    reason: ''
  };
  loading = true;
  submitting = false;
  confirmVisible = false;
  pageSize = 10;
  currentPage = 1;
  private leaveToCancel: LeaveApplication | null = null;
  private studentId = 0;

  get totalPages(): number {
    return Math.ceil(this.leaves.length / this.pageSize) || 1;
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  get paginatedLeaves(): LeaveApplication[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.leaves.slice(start, start + this.pageSize);
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.leaves.length);
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
  }

  get minDate(): string {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  }

  get maxDate(): string {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  }

  formatDate(s: string): string {
    if (!s) return '—';
    const d = new Date(s);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  openAddLeave(): void {
    this.editingLeave = null;
    this.form = { date: '', leaveFrom: '', leaveTo: '', reason: '' };
    this.leaveType = 'short';
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.editingLeave = null;
    this.form = { date: '', leaveFrom: '', leaveTo: '', reason: '' };
  }

  editLeave(l: LeaveApplication): void {
    this.editingLeave = l;
    this.leaveType = l.leaveType;
    if (l.leaveType === 'short') {
      const from = new Date(l.leaveFrom);
      this.form.date = from.toISOString().split('T')[0];
      this.form.leaveFrom = from.toTimeString().slice(0, 5);
      this.form.leaveTo = new Date(l.leaveTo).toTimeString().slice(0, 5);
    } else {
      this.form.leaveFrom = l.leaveFrom.split('T')[0];
      this.form.leaveTo = l.leaveTo.split('T')[0];
    }
    this.form.reason = l.reason;
    this.showForm = true;
  }

  constructor(
    private auth: AuthService,
    private studentService: StudentService,
    private attendanceService: AttendanceService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    const userId = this.auth.getUserId();
    if (!userId) {
      this.loading = false;
      this.notify.error('Please log in');
      return;
    }

    this.studentService.getStudentById(userId).subscribe({
      next: (s) => {
        this.student = s;
        this.studentId = (s as any).studentId ?? s.userId ?? userId;
        this.loadLeaves();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notify.error('Could not load student profile');
      }
    });
  }

  private loadLeaves(): void {
    this.attendanceService.getMyLeaves('student', this.studentId).subscribe({
      next: (list) => {
        this.leaves = list.sort((a, b) =>
          new Date(b.leaveFrom).getTime() - new Date(a.leaveFrom).getTime()
        );
        this.currentPage = 1;
      },
      error: () => {}
    });
  }

  applyLeave(): void {
    if (!this.form.reason?.trim()) {
      this.notify.warning('Please enter a reason');
      return;
    }

    let leaveFrom: string;
    let leaveTo: string;

    if (this.leaveType === 'short') {
      if (!this.form.date || !this.form.leaveFrom || !this.form.leaveTo) {
        this.notify.warning('Please fill all required fields');
        return;
      }
      leaveFrom = `${this.form.date}T${this.form.leaveFrom}:00`;
      leaveTo = `${this.form.date}T${this.form.leaveTo}:00`;
    } else {
      if (!this.form.leaveFrom || !this.form.leaveTo) {
        this.notify.warning('Please select date range');
        return;
      }
      leaveFrom = this.form.leaveFrom;
      leaveTo = this.form.leaveTo;
    }

    this.submitting = true;
    const payload = {
      applicantType: 'student' as const,
      applicantId: this.studentId,
      leaveType: this.leaveType,
      leaveFrom,
      leaveTo,
      reason: this.form.reason.trim(),
      status: 'pending' as const
    };
    const req = this.editingLeave
      ? this.attendanceService.updateLeave(this.editingLeave.leaveApplicationId, payload)
      : this.attendanceService.applyLeave(payload);
    req.subscribe({
      next: () => {
        this.submitting = false;
        this.closeForm();
        this.loadLeaves();
        this.notify.success(this.editingLeave ? 'Leave updated' : 'Leave application submitted');
      },
      error: (err) => {
        this.submitting = false;
        this.notify.error(err?.error?.message ?? 'Failed to submit leave');
      }
    });
  }

  cancelLeave(l: LeaveApplication): void {
    this.leaveToCancel = l;
    this.confirmVisible = true;
  }

  doCancelLeave(): void {
    if (!this.leaveToCancel) return;
    this.confirmVisible = false;
    this.submitting = true;
    this.attendanceService.cancelLeave(this.leaveToCancel.leaveApplicationId).subscribe({
      next: () => {
        this.submitting = false;
        this.leaveToCancel = null;
        this.loadLeaves();
        this.notify.success('Leave application cancelled');
      },
      error: (err) => {
        this.submitting = false;
        this.leaveToCancel = null;
        this.notify.error(err?.error?.message ?? 'Failed to cancel');
      }
    });
  }
}
