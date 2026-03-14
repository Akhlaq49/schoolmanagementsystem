import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AttendanceService } from '../../../../core/services/attendance.service';
import { StudentService } from '../../../../core/services/student.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { LeaveApplication as ApiLeave } from '../../../../core/models/attendance.model';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';

type LeaveStatus = 'pending' | 'approved' | 'rejected';

interface LeaveApplication {
  id: number;
  applicantId: number;
  applicantName: string;
  applicantType: 'student' | 'teacher' | 'staff';
  rollOrDept: string;
  className?: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: LeaveStatus;
  appliedAt: string;
  remarks?: string;
}

@Component({
  selector: 'app-admin-attendance-leave',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LoadingComponent],
  template: `
    <div class="page-container">
      <app-loading [show]="loading" [message]="'Loading...'"></app-loading>
      <div class="page-header-card">
        <div class="header-content">
          <div>
            <a routerLink="/admin/dashboard" class="back-link">
              <i class="fa fa-arrow-left"></i> Back to Dashboard
            </a>
            <h2><i class="fa fa-calendar-plus-o"></i> Leave Management</h2>
            <p class="page-subtitle">Leave applications, approval queue, bulk approve/reject, and history</p>
          </div>
        </div>
      </div>

      <div class="stats-row">
        <div class="stat-card pending">
          <span class="val">{{ pendingCount }}</span>
          <span class="lbl">Pending</span>
        </div>
        <div class="stat-card approved">
          <span class="val">{{ approvedCount }}</span>
          <span class="lbl">Approved</span>
        </div>
        <div class="stat-card rejected">
          <span class="val">{{ rejectedCount }}</span>
          <span class="lbl">Rejected</span>
        </div>
      </div>

      <div class="table-card">
        <div class="table-header">
          <h3>Leave Applications ({{ filteredList.length }})</h3>
          <div class="header-actions">
            <div class="bulk-bar" *ngIf="filterStatus === 'pending' && selectedIds.size > 0">
              <span class="bulk-label">{{ selectedIds.size }} selected</span>
              <input type="text" class="bulk-remarks" [(ngModel)]="bulkRemarks" placeholder="Remarks (optional)">
              <button type="button" class="btn btn-sm btn-success" (click)="bulkApprove()">
                <i class="fa fa-check"></i> Bulk Approve
              </button>
              <button type="button" class="btn btn-sm btn-danger" (click)="bulkReject()">
                <i class="fa fa-times"></i> Bulk Reject
              </button>
              <button type="button" class="btn btn-sm btn-secondary" (click)="clearSelection()">Clear</button>
            </div>
            <div class="filter-tabs">
            <button type="button" class="tab-btn" [class.active]="filterStatus === 'all'" (click)="setFilter('all')">All</button>
            <button type="button" class="tab-btn" [class.active]="filterStatus === 'pending'" (click)="setFilter('pending')">Pending</button>
            <button type="button" class="tab-btn" [class.active]="filterStatus === 'approved'" (click)="setFilter('approved')">Approved</button>
            <button type="button" class="tab-btn" [class.active]="filterStatus === 'rejected'" (click)="setFilter('rejected')">Rejected</button>
            </div>
          </div>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th class="col-check" *ngIf="filterStatus === 'pending'">
                <input type="checkbox" [checked]="allPendingSelected" (change)="toggleSelectAll($event)" title="Select all">
              </th>
              <th>#</th>
              <th>Applicant</th>
              <th>From</th>
              <th>To</th>
              <th>Reason</th>
              <th>Remarks</th>
              <th>Applied</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let a of paginatedList; let i = index" [class.pending-row]="a.status === 'pending'" [class.approved-row]="a.status === 'approved'" [class.rejected-row]="a.status === 'rejected'">
              <td class="col-check" *ngIf="filterStatus === 'pending'">
                <input type="checkbox" [checked]="selectedIds.has(a.id)" (change)="toggleSelect(a.id, $event)" *ngIf="a.status === 'pending'">
              </td>
              <td>{{ (currentPage - 1) * pageSize + i + 1 }}</td>
              <td>
                <a *ngIf="a.applicantType === 'student'" [routerLink]="['/admin/attendance/student', a.applicantId]" class="applicant-link">{{ a.applicantName }}</a>
                <span *ngIf="a.applicantType !== 'student'" class="applicant-name">{{ a.applicantName }}</span>
                <br><small class="meta">{{ a.applicantType }} · {{ a.rollOrDept }}{{ a.className ? ' · ' + a.className : '' }}</small>
              </td>
              <td>{{ a.fromDate }}</td>
              <td>{{ a.toDate }}</td>
              <td class="reason-cell">{{ a.reason }}</td>
              <td>
                <input type="text" class="remarks-input" [(ngModel)]="a.remarks" placeholder="Remarks" *ngIf="a.status === 'pending'">
                <span *ngIf="a.status !== 'pending' && a.remarks">{{ a.remarks }}</span>
                <span class="muted" *ngIf="a.status !== 'pending' && !a.remarks">—</span>
              </td>
              <td>{{ a.appliedAt }}</td>
              <td><span class="badge" [ngClass]="'badge-' + a.status">{{ a.status }}</span></td>
              <td>
                <div class="action-btns" *ngIf="a.status === 'pending'">
                  <button type="button" class="btn-icon btn-approve" (click)="approve(a)" title="Approve">
                    <i class="fa fa-check"></i>
                  </button>
                  <button type="button" class="btn-icon btn-reject" (click)="reject(a)" title="Reject">
                    <i class="fa fa-times"></i>
                  </button>
                </div>
                <span class="muted" *ngIf="a.status !== 'pending'">—</span>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="empty-state" *ngIf="filteredList.length === 0">
          <i class="fa fa-inbox"></i>
          <p>No leave applications</p>
        </div>
        <div class="pagination-bar" *ngIf="totalPages > 1">
          <span class="pagination-info">Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ endIndex }} of {{ filteredList.length }}</span>
          <div class="pagination-controls">
            <button type="button" class="page-btn" (click)="goToPrevPage()" [disabled]="currentPage === 1">
              <i class="fa fa-chevron-left"></i>
            </button>
            <button type="button" class="page-btn" (click)="goToNextPage()" [disabled]="currentPage === totalPages">
              <i class="fa fa-chevron-right"></i>
            </button>
          </div>
        </div>
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
    .back-link {
      display: inline-flex; align-items: center; gap: 0.35rem;
      color: #6a8cad; font-size: 0.875rem; margin-bottom: 0.5rem; text-decoration: none;
    }
    .back-link:hover { color: #1e3a5f; }
    .page-header-card h2 { margin: 0 0 0.25rem 0; font-size: 1.5rem; font-weight: 700; color: #0f2744; }
    .page-header-card h2 i { color: #1e3a5f; }
    .page-subtitle { margin: 0; color: #6a8cad; font-size: 0.9375rem; }

    .stats-row { display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
    .stat-card {
      background: #fff;
      border-radius: 12px;
      padding: 1rem 1.5rem;
      min-width: 100px;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    .stat-card .val { display: block; font-size: 1.5rem; font-weight: 700; }
    .stat-card .lbl { font-size: 0.75rem; color: #6a8cad; }
    .stat-card.pending .val { color: #d97706; }
    .stat-card.approved .val { color: #059669; }
    .stat-card.rejected .val { color: #dc2626; }

    .table-card {
      background: #fff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    .table-header {
      padding: 1.25rem 1.5rem;
      background: #f7f9fc;
      border-bottom: 1px solid #e2e8f0;
      display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;
    }
    .table-header h3 { margin: 0; font-size: 1.125rem; color: #0f2744; }
    .header-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 1rem; }
    .bulk-bar { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; padding: 0.5rem 1rem; background: #fffbeb; border-radius: 8px; border: 1px solid #fde68a; }
    .bulk-label { font-size: 0.875rem; font-weight: 600; color: #92400e; }
    .bulk-remarks { padding: 0.35rem 0.6rem; border: 2px solid #e2e8f0; border-radius: 6px; font-size: 0.875rem; min-width: 150px; }
    .btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; border: none; border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer; }
    .btn-sm { padding: 0.4rem 0.75rem; font-size: 0.8125rem; }
    .btn-success { background: #059669; color: #fff; }
    .btn-danger { background: #dc2626; color: #fff; }
    .btn-secondary { background: #e2e8f0; color: #374151; }
    .filter-tabs { display: flex; gap: 0.5rem; }
    .tab-btn {
      padding: 0.4rem 0.75rem; border: 2px solid #e2e8f0;
      background: #fff; border-radius: 8px;
      font-size: 0.8125rem; font-weight: 500; color: #6a8cad;
      cursor: pointer;
    }
    .tab-btn:hover { border-color: #1e3a5f; color: #1e3a5f; }
    .tab-btn.active { background: #1e3a5f; border-color: #1e3a5f; color: #fff; }

    .data-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
    .data-table th, .data-table td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
    .data-table th { background: #f7f9fc; font-size: 0.8125rem; color: #6a8cad; font-weight: 600; }
    .col-check { width: 40px; text-align: center; }
    .remarks-input { padding: 0.35rem 0.5rem; border: 2px solid #e2e8f0; border-radius: 6px; font-size: 0.8125rem; width: 100%; max-width: 140px; }
    .pending-row { background: #fffbeb; }
    .approved-row { background: #f0fdf4; }
    .rejected-row { background: #fef2f2; }
    .applicant-link { color: #1e3a5f; font-weight: 500; text-decoration: none; }
    .applicant-link:hover { text-decoration: underline; }
    .applicant-name { font-weight: 500; color: #0f2744; }
    .meta { font-size: 0.75rem; color: #6a8cad; }
    .reason-cell { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .badge { padding: 0.25rem 0.5rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize; }
    .badge-pending { background: #fef3c7; color: #d97706; }
    .badge-approved { background: #d1fae5; color: #059669; }
    .badge-rejected { background: #fee2e2; color: #dc2626; }

    .action-btns { display: flex; gap: 0.35rem; }
    .btn-icon {
      display: inline-flex; align-items: center; justify-content: center;
      width: 32px; height: 32px; padding: 0; border: 2px solid #e2e8f0;
      background: #fff; border-radius: 8px; cursor: pointer;
      color: #1e3a5f;
    }
    .btn-icon.btn-approve:hover { border-color: #059669; background: #d1fae5; color: #059669; }
    .btn-icon.btn-reject:hover { border-color: #dc2626; background: #fee2e2; color: #dc2626; }
    .muted { color: #9ca3af; font-size: 0.875rem; }

    .empty-state { padding: 2rem; text-align: center; color: #6a8cad; }
    .empty-state i { font-size: 2.5rem; display: block; margin-bottom: 0.5rem; color: #cbd5e1; }

    .pagination-bar {
      display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem;
      border-top: 1px solid #e2e8f0; background: #fafbfc;
    }
    .pagination-info { font-size: 0.875rem; color: #6a8cad; }
    .pagination-controls { display: flex; gap: 0.5rem; }
    .page-btn {
      padding: 0.4rem 0.75rem; border: 2px solid #e2e8f0; background: #fff; border-radius: 8px;
      cursor: pointer; font-size: 0.875rem; color: #1e3a5f;
    }
    .page-btn:hover:not(:disabled) { border-color: #1e3a5f; background: #f7f9fc; }
    .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class AdminAttendanceLeaveComponent implements OnInit {
  applications: LeaveApplication[] = [];
  filterStatus: 'all' | 'pending' | 'approved' | 'rejected' = 'pending';
  pageSize = 10;
  currentPage = 1;
  selectedIds = new Set<number>();
  bulkRemarks = '';
  loading = true;
  submitting = false;

  get filteredList(): LeaveApplication[] {
    if (this.filterStatus === 'all') return this.applications;
    return this.applications.filter(a => a.status === this.filterStatus);
  }

  get pendingCount(): number {
    return this.applications.filter(a => a.status === 'pending').length;
  }

  get approvedCount(): number {
    return this.applications.filter(a => a.status === 'approved').length;
  }

  get rejectedCount(): number {
    return this.applications.filter(a => a.status === 'rejected').length;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredList.length / this.pageSize) || 1;
  }

  get paginatedList(): LeaveApplication[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredList.slice(start, start + this.pageSize);
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredList.length);
  }

  get allPendingSelected(): boolean {
    const pending = this.filteredList.filter(a => a.status === 'pending');
    if (pending.length === 0) return false;
    return pending.every(a => this.selectedIds.has(a.id));
  }

  constructor(
    private attendanceService: AttendanceService,
    private studentService: StudentService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadLeaves();
  }

  setFilter(s: 'all' | 'pending' | 'approved' | 'rejected'): void {
    this.filterStatus = s;
    this.currentPage = 1;
    this.clearSelection();
  }

  toggleSelect(id: number, ev: Event): void {
    const checked = (ev.target as HTMLInputElement).checked;
    if (checked) this.selectedIds.add(id);
    else this.selectedIds.delete(id);
    this.selectedIds = new Set(this.selectedIds);
  }

  toggleSelectAll(ev: Event): void {
    const checked = (ev.target as HTMLInputElement).checked;
    const pending = this.filteredList.filter(a => a.status === 'pending');
    if (checked) pending.forEach(a => this.selectedIds.add(a.id));
    else pending.forEach(a => this.selectedIds.delete(a.id));
    this.selectedIds = new Set(this.selectedIds);
  }

  clearSelection(): void {
    this.selectedIds.clear();
    this.selectedIds = new Set(this.selectedIds);
    this.bulkRemarks = '';
  }

  bulkApprove(): void {
    if (this.submitting) return;
    const ids = Array.from(this.selectedIds);
    const remarks = this.bulkRemarks?.trim();
    this.submitting = true;
    const calls = ids.map(id => this.attendanceService.reviewLeave(id, 'approved', remarks));
    forkJoin(calls).subscribe({
      next: () => {
        this.submitting = false;
        this.notify.success(`Approved ${ids.length} leave application(s)`);
        this.clearSelection();
        this.loadLeaves();
      },
      error: (err) => {
        this.submitting = false;
        this.notify.error(err?.error?.message ?? 'Failed to approve');
      }
    });
  }

  bulkReject(): void {
    if (this.submitting) return;
    const ids = Array.from(this.selectedIds);
    const remarks = this.bulkRemarks?.trim();
    this.submitting = true;
    const calls = ids.map(id => this.attendanceService.reviewLeave(id, 'rejected', remarks));
    forkJoin(calls).subscribe({
      next: () => {
        this.submitting = false;
        this.notify.info(`Rejected ${ids.length} leave application(s)`);
        this.clearSelection();
        this.loadLeaves();
      },
      error: (err) => {
        this.submitting = false;
        this.notify.error(err?.error?.message ?? 'Failed to reject');
      }
    });
  }

  approve(a: LeaveApplication): void {
    if (this.submitting) return;
    this.submitting = true;
    this.attendanceService.reviewLeave(a.id, 'approved', a.remarks).subscribe({
      next: () => {
        this.submitting = false;
        a.status = 'approved';
        this.notify.success(`Leave approved for ${a.applicantName}`);
      },
      error: (err) => {
        this.submitting = false;
        this.notify.error(err?.error?.message ?? 'Failed to approve');
      }
    });
  }

  reject(a: LeaveApplication): void {
    if (this.submitting) return;
    this.submitting = true;
    this.attendanceService.reviewLeave(a.id, 'rejected', a.remarks).subscribe({
      next: () => {
        this.submitting = false;
        a.status = 'rejected';
        this.notify.info(`Leave rejected for ${a.applicantName}`);
      },
      error: (err) => {
        this.submitting = false;
        this.notify.error(err?.error?.message ?? 'Failed to reject');
      }
    });
  }

  goToPrevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  private formatDateStr(s: string): string {
    if (!s) return '—';
    const d = new Date(s);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  private loadLeaves(): void {
    this.loading = true;
    this.attendanceService.getAllLeaves().subscribe({
      next: (apiLeaves) => {
        const studentIds = [...new Set(
          apiLeaves.filter(l => l.applicantType === 'student').map(l => l.applicantId)
        )];
        if (studentIds.length === 0) {
          this.applications = apiLeaves.map(l => this.mapLeave(l, null));
          this.loading = false;
          return;
        }
        const studentCalls = studentIds.map(id =>
          this.studentService.getStudentByStudentId(id).pipe(
            catchError(() => of(null))
          )
        );
        forkJoin(studentCalls).subscribe({
          next: (students) => {
            const map = new Map<number, { name: string; roll: string; className: string }>();
            studentIds.forEach((id, i) => {
              const s = students[i];
              if (s) {
                const cn = s.class ? `${s.class.name}${s.section ? '-' + s.section.name : ''}` : '';
                map.set(id, { name: s.name, roll: s.roll ?? '—', className: cn });
              } else {
                map.set(id, { name: `Student #${id}`, roll: '—', className: '' });
              }
            });
            this.applications = apiLeaves.map(l => this.mapLeave(l, map.get(l.applicantId) ?? null));
            this.loading = false;
          },
          error: () => {
            this.applications = apiLeaves.map(l => this.mapLeave(l, null));
            this.loading = false;
          }
        });
      },
      error: (err) => {
        this.loading = false;
        this.notify.error(err?.error?.message ?? 'Failed to load leave applications');
      }
    });
  }

  private mapLeave(api: ApiLeave, student: { name: string; roll: string; className: string } | null): LeaveApplication {
    const isStudent = api.applicantType === 'student';
    return {
      id: api.leaveApplicationId,
      applicantId: api.applicantId,
      applicantName: isStudent && student ? student.name : `${api.applicantType} #${api.applicantId}`,
      applicantType: api.applicantType as 'student' | 'teacher' | 'staff',
      rollOrDept: isStudent && student ? student.roll : '—',
      className: isStudent && student ? student.className || undefined : undefined,
      fromDate: this.formatDateStr(api.leaveFrom),
      toDate: this.formatDateStr(api.leaveTo),
      reason: api.reason,
      status: api.status as LeaveStatus,
      appliedAt: this.formatDateStr(api.createdAt),
      remarks: api.reviewerRemarks ?? undefined
    };
  }
}
