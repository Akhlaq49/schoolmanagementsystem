import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { TeacherService } from '../../../../core/services/teacher.service';
import { AttendanceService } from '../../../../core/services/attendance.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { Teacher } from '../../../../core/models/teacher.model';
import { LeaveApplication } from '../../../../core/models/attendance.model';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-teacher-attendance-leave',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LoadingComponent, ConfirmDialogComponent],
  template: `
    <div class="page-container">
      <app-loading [show]="loading" [message]="'Loading...'"></app-loading>

      <div class="page-header-card">
        <div class="header-content">
          <div>
            <h2><i class="fa fa-calendar-plus-o"></i> Leave</h2>
            <p class="page-subtitle">Manage your leave applications</p>
          </div>
          <button class="btn btn-primary" *ngIf="teacher" (click)="openAddLeave()" [disabled]="submitting">
            <i class="fa fa-plus"></i> Add Leave
          </button>
        </div>
        <!-- <div class="quick-nav">
          <a routerLink="/teacher/attendance/self" class="nav-link"><i class="fa fa-user-circle"></i> My Attendance</a>
          <a routerLink="/teacher/attendance/month" class="nav-link"><i class="fa fa-calendar"></i> This Month</a>
          <a routerLink="/teacher/attendance/class" class="nav-link"><i class="fa fa-users"></i> Class Attendance</a>
          <a routerLink="/teacher/attendance/leave" routerLinkActive="active" class="nav-link"><i class="fa fa-calendar-plus-o"></i> Leave</a>
        </div> -->
      </div>

      <div class="listing-card" *ngIf="teacher">
        <h3>Leave Applications</h3>
        <div class="empty-state" *ngIf="leaves.length === 0">
          <i class="fa fa-inbox"></i>
          <p>No leave applications yet</p>
          <button class="btn btn-secondary" (click)="openAddLeave()">
            <i class="fa fa-plus"></i> Add Leave
          </button>
        </div>
        <div class="table-wrap" *ngIf="leaves.length > 0">
          <table class="data-table">
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
                <td><span class="status-badge" [ngClass]="'status-' + l.status">{{ l.status | titlecase }}</span></td>
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
          <span class="pagination-info">Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ endIndex }} of {{ leaves.length }}</span>
          <div class="pagination-controls">
            <button class="page-btn" (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 1">
              <i class="fa fa-chevron-left"></i>
            </button>
            <button *ngFor="let p of pageNumbers" class="page-num" [class.active]="p === currentPage" (click)="goToPage(p)">
              {{ p }}
            </button>
            <button class="page-btn" (click)="goToPage(currentPage + 1)" [disabled]="currentPage === totalPages">
              <i class="fa fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="form-card" *ngIf="teacher && showForm">
        <h3>{{ editingLeave ? 'Edit Leave' : 'Add Leave' }}</h3>
        <div class="leave-tabs">
          <button class="tab" [class.active]="leaveType === 'short'" (click)="leaveType = 'short'">Short Leave</button>
          <button class="tab" [class.active]="leaveType === 'full'" (click)="leaveType = 'full'">Full Leave</button>
        </div>
        <form (ngSubmit)="submitLeave()">
          <div class="form-row" *ngIf="leaveType === 'short'">
            <div class="form-group">
              <label>Date <span class="req">*</span></label>
              <input type="date" [(ngModel)]="form.date" name="date" class="form-control" [min]="minDate" [max]="maxDate">
            </div>
            <div class="form-group">
              <label>From Time <span class="req">*</span></label>
              <input type="time" [(ngModel)]="form.leaveFrom" name="leaveFrom" class="form-control">
            </div>
            <div class="form-group">
              <label>To Time <span class="req">*</span></label>
              <input type="time" [(ngModel)]="form.leaveTo" name="leaveTo" class="form-control">
            </div>
          </div>
          <div class="form-row" *ngIf="leaveType === 'full'">
            <div class="form-group">
              <label>From Date <span class="req">*</span></label>
              <input type="date" [(ngModel)]="form.leaveFrom" name="leaveFromFull" class="form-control" [min]="minDate" [max]="maxDate">
            </div>
            <div class="form-group">
              <label>To Date <span class="req">*</span></label>
              <input type="date" [(ngModel)]="form.leaveTo" name="leaveToFull" class="form-control" [min]="form.leaveFrom || minDate" [max]="maxDate">
            </div>
          </div>
          <div class="form-group">
            <label>Reason <span class="req">*</span></label>
            <textarea [(ngModel)]="form.reason" name="reason" rows="3" class="form-control" placeholder="Reason for leave"></textarea>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="submitting">
              <i class="fa fa-paper-plane"></i> {{ editingLeave ? 'Update' : 'Submit' }}
            </button>
            <button type="button" class="btn btn-secondary" (click)="closeForm()">Cancel</button>
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
    .page-container { padding: 1.5rem; max-width: 800px; margin: 0 auto; }
    .page-header-card {
      background: #fff;
      border-radius: 16px;
      padding: 1.75rem 2rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    .header-content { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
    .page-header-card h2 {
      margin: 0 0 0.25rem 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: #0f2744;
    }
    .page-header-card h2 i { color: #1e3a5f; }
    .page-subtitle { margin: 0; color: #6a8cad; font-size: 0.9375rem; }
    .quick-nav { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; }
    .nav-link { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: #f7f9fc; border: 2px solid #e2e8f0; border-radius: 10px; color: #1e3a5f; font-weight: 500; font-size: 0.875rem; text-decoration: none; }
    .nav-link:hover { border-color: #1e3a5f; background: #f0f7ff; }
    .nav-link.active { background: #1e3a5f; color: #fff; border-color: #1e3a5f; }
    .listing-card, .form-card {
      background: #fff;
      border-radius: 16px;
      padding: 1.5rem 2rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    .listing-card h3, .form-card h3 { margin: 0 0 1rem 0; font-size: 1.125rem; color: #0f2744; }
    .empty-state { text-align: center; padding: 2rem; color: #9ca3af; }
    .empty-state i { font-size: 2.5rem; margin-bottom: 0.5rem; display: block; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th, .data-table td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
    .data-table th { background: #f7f9fc; font-size: 0.8125rem; color: #6a8cad; font-weight: 600; }
    .reason-cell { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .status-badge { font-size: 0.8125rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: 6px; }
    .status-pending { background: #fef3c7; color: #d97706; }
    .status-approved { background: #d1fae5; color: #059669; }
    .status-rejected { background: #fee2e2; color: #dc2626; }
    .btn-action {
      padding: 0.35rem 0.75rem;
      font-size: 0.8125rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      margin-right: 0.5rem;
    }
    .btn-edit { background: #dbeafe; color: #1d4ed8; }
    .btn-cancel { background: #fee2e2; color: #dc2626; }
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
    .pagination-controls { display: flex; align-items: center; gap: 0.5rem; }
    .page-btn, .page-num {
      padding: 0.4rem 0.75rem;
      border: 2px solid #e2e8f0;
      background: #fff;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.875rem;
    }
    .page-num.active { background: #1e3a5f; border-color: #1e3a5f; color: #fff; }
    .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .leave-tabs { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
    .tab {
      padding: 0.5rem 1rem;
      border: 2px solid #e2e8f0;
      background: #fff;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
    }
    .tab.active { border-color: #1e3a5f; background: #1e3a5f; color: #fff; }
    .form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem; margin-bottom: 1rem; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; font-size: 0.875rem; margin-bottom: 0.35rem; color: #374151; }
    .req { color: #dc2626; }
    .form-control {
      width: 100%;
      padding: 0.65rem 1rem;
      border: 2px solid #d9e2ec;
      border-radius: 8px;
      font-size: 0.9375rem;
      box-sizing: border-box;
    }
    .form-actions { display: flex; gap: 0.75rem; margin-top: 1rem; }
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
    }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-primary { background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); color: #fff; }
    .btn-secondary { background: #e2e8f0; color: #374151; }
  `]
})
export class TeacherAttendanceLeaveComponent implements OnInit {
  teacher: Teacher | null = null;
  leaves: LeaveApplication[] = [];
  showForm = false;
  editingLeave: LeaveApplication | null = null;
  leaveType: 'short' | 'full' = 'short';
  form = { date: '', leaveFrom: '', leaveTo: '', reason: '' };
  loading = true;
  submitting = false;
  confirmVisible = false;
  pageSize = 10;
  currentPage = 1;
  private leaveToCancel: LeaveApplication | null = null;
  private teacherId = 0;

  constructor(
    private auth: AuthService,
    private teacherService: TeacherService,
    private attendanceService: AttendanceService,
    private notify: NotificationService
  ) {}

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
    return new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
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

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
  }

  readonly uiDemoMode = true;

  ngOnInit(): void {
    const userId = this.auth.getUserId();
    if (this.uiDemoMode && !userId) {
      this.teacher = { teacherId: 1, name: 'Demo Teacher', department: { departmentId: 1, name: 'Mathematics' } } as Teacher;
      this.teacherId = 1;
      this.applyMockLeaves();
      this.loading = false;
      return;
    }
    if (!userId) {
      this.loading = false;
      return;
    }
    this.teacherService.getTeacherById(userId).subscribe({
      next: (t) => {
        this.teacher = t;
        this.teacherId = t.teacherId;
        this.loadLeaves();
        this.loading = false;
      },
      error: () => {
        if (this.uiDemoMode) {
          this.teacher = { teacherId: 1, name: 'Demo Teacher', department: { departmentId: 1, name: 'Mathematics' } } as Teacher;
          this.teacherId = 1;
          this.applyMockLeaves();
        }
        this.loading = false;
      }
    });
  }

  private applyMockLeaves(): void {
    const base = new Date();
    const fmt = (d: Date) => d.toISOString().split('T')[0];
    this.leaves = [
      { leaveApplicationId: 1, applicantType: 'teacher', applicantId: 1, leaveType: 'short', leaveFrom: `${fmt(base)}T10:00:00`, leaveTo: `${fmt(base)}T12:00:00`, reason: 'Doctor appointment', status: 'approved', createdAt: '' },
      { leaveApplicationId: 2, applicantType: 'teacher', applicantId: 1, leaveType: 'full', leaveFrom: fmt(new Date(base.getTime() - 864e5 * 5)), leaveTo: fmt(new Date(base.getTime() - 864e5 * 3)), reason: 'Family wedding', status: 'approved', createdAt: '' },
      { leaveApplicationId: 3, applicantType: 'teacher', applicantId: 1, leaveType: 'full', leaveFrom: fmt(new Date(base.getTime() + 864e5 * 2)), leaveTo: fmt(new Date(base.getTime() + 864e5 * 3)), reason: 'Personal work', status: 'pending', createdAt: '' },
      { leaveApplicationId: 4, applicantType: 'teacher', applicantId: 1, leaveType: 'short', leaveFrom: `${fmt(new Date(base.getTime() - 864e5))}T09:00:00`, leaveTo: `${fmt(new Date(base.getTime() - 864e5))}T11:00:00`, reason: 'Bank visit', status: 'rejected', createdAt: '' },
      { leaveApplicationId: 5, applicantType: 'teacher', applicantId: 1, leaveType: 'full', leaveFrom: fmt(new Date(base.getTime() - 864e5 * 10)), leaveTo: fmt(new Date(base.getTime() - 864e5 * 8)), reason: 'Sick leave', status: 'approved', createdAt: '' }
    ] as LeaveApplication[];
  }

  private loadLeaves(): void {
    this.attendanceService.getMyLeaves('teacher', this.teacherId).subscribe({
      next: (list) => {
        this.leaves = list.length > 0
          ? list.sort((a, b) => new Date(b.leaveFrom).getTime() - new Date(a.leaveFrom).getTime())
          : (this.uiDemoMode ? this.applyMockLeavesReturn() : []);
        this.currentPage = 1;
      },
      error: () => {
        if (this.uiDemoMode) this.leaves = this.applyMockLeavesReturn();
      }
    });
  }

  private applyMockLeavesReturn(): LeaveApplication[] {
    this.applyMockLeaves();
    return this.leaves;
  }

  submitLeave(): void {
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
      applicantType: 'teacher' as const,
      applicantId: this.teacherId,
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
        this.notify.success(this.editingLeave ? 'Leave updated' : 'Leave submitted');
      },
      error: (err) => {
        this.submitting = false;
        this.notify.error(err?.error?.message ?? 'Failed');
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
        this.notify.success('Leave cancelled');
      },
      error: (err) => {
        this.submitting = false;
        this.leaveToCancel = null;
        this.notify.error(err?.error?.message ?? 'Failed');
      }
    });
  }
}
