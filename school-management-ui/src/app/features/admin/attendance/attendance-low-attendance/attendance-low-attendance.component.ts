import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  LowAttendancePeriod,
  LowAttendanceResponse,
  LowAttendanceStudent
} from '../../../../core/models/attendance.model';
import { AttendanceService } from '../../../../core/services/attendance.service';

type LowAttendanceStudentWithLevel = LowAttendanceStudent & { level: 'warning' | 'critical' };

@Component({
  selector: 'app-admin-attendance-low-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page-container">
      <div class="page-header-card">
        <div class="header-content">
          <div>
            <a routerLink="/admin/dashboard" class="back-link">
              <i class="fa fa-arrow-left"></i> Back to Dashboard
            </a>
            <h2><i class="fa fa-exclamation-triangle"></i> Low-attendance Students</h2>
            <p class="page-subtitle">List by threshold, warnings, and alerts</p>
          </div>
        </div>
      </div>

      <div *ngIf="loading" class="loading-overlay">
        <div class="spinner"></div>
        <span>Loading...</span>
      </div>
      <div *ngIf="error" class="error-banner">{{ error }}</div>
      <div class="filters-card">
        <h3>Threshold & Filters</h3>
        <div class="filter-row">
          <div class="filter-group">
            <label>Period</label>
            <select [(ngModel)]="selectedPeriod" (ngModelChange)="loadData()" class="form-control">
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Class</label>
            <select [(ngModel)]="filterClassId" (ngModelChange)="loadData()" class="form-control">
              <option [ngValue]="null">All</option>
              <option *ngFor="let c of classOptions" [ngValue]="c.classId">{{ c.className }}</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Show students below</label>
            <div class="threshold-input">
              <input type="range" min="50" max="95" [(ngModel)]="threshold" (ngModelChange)="applyThreshold()" class="slider">
              <span class="threshold-val">{{ threshold }}%</span>
            </div>
          </div>
        </div>
      </div>

      <div class="alerts-row">
        <div class="alert-card critical" *ngIf="criticalCount > 0">
          <i class="fa fa-times-circle"></i>
          <div>
            <strong>{{ criticalCount }} Critical</strong>
            <span>Below 75% — immediate attention</span>
          </div>
        </div>
        <div class="alert-card warning" *ngIf="warningCount > 0">
          <i class="fa fa-exclamation-triangle"></i>
          <div>
            <strong>{{ warningCount }} Warning</strong>
            <span>75–{{ threshold }}% — monitor</span>
          </div>
        </div>
      </div>

      <div class="table-card">
        <div class="table-header">
          <h3>Students Below {{ threshold }}% ({{ filteredList.length }})</h3>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Roll</th>
              <th>Name</th>
              <th>Class</th>
              <th>Present</th>
              <th>Absent</th>
              <th>Attendance %</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let s of paginatedList; let i = index" [class.critical-row]="s.level === 'critical'" [class.warning-row]="s.level === 'warning'">
              <td>{{ (currentPage - 1) * pageSize + i + 1 }}</td>
              <td>{{ s.roll }}</td>
              <td>
                <a [routerLink]="['/admin/attendance/student', s.studentId]" class="student-link">{{ s.name }}</a>
              </td>
              <td>{{ s.className }} {{ s.section }}</td>
              <td class="col-present">{{ s.present }}</td>
              <td class="col-absent">{{ s.absent }}</td>
              <td><strong [class.critical]="s.percent < 75" [class.warn]="s.percent >= 75 && s.percent < threshold">{{ s.percent }}%</strong></td>
              <td>
                <span class="badge" [class.badge-critical]="s.level === 'critical'" [class.badge-warning]="s.level === 'warning'">
                  {{ s.level === 'critical' ? 'Critical' : 'Warning' }}
                </span>
              </td>
              <td>
                <a [routerLink]="['/admin/attendance/student', s.studentId]" class="btn-icon" title="View History">
                  <i class="fa fa-history"></i>
                </a>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="empty-state" *ngIf="filteredList.length === 0">
          <i class="fa fa-check-circle"></i>
          <p>No students below {{ threshold }}%</p>
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
    .page-container { max-width: 1000px; position: relative; }
    .loading-overlay { position: absolute; inset: 0; background: rgba(255,255,255,0.85); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.75rem; z-index: 10; border-radius: 16px; }
    .loading-overlay .spinner { width: 36px; height: 36px; border: 3px solid #e2e8f0; border-top-color: #1e3a5f; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .error-banner { background: #fee2e2; color: #dc2626; padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.9rem; }
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
    .page-header-card h2 i { color: #dc2626; }
    .page-subtitle { margin: 0; color: #6a8cad; font-size: 0.9375rem; }

    .filters-card {
      background: #fff;
      border-radius: 16px;
      padding: 1.25rem 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    .filters-card h3 { margin: 0 0 0.75rem 0; font-size: 0.9375rem; color: #0f2744; }
    .filter-row { display: flex; gap: 1.5rem; flex-wrap: wrap; align-items: flex-end; }
    .filter-group label { display: block; font-size: 0.75rem; color: #6a8cad; margin-bottom: 0.35rem; }
    .threshold-input { display: flex; align-items: center; gap: 1rem; }
    .slider { width: 180px; accent-color: #1e3a5f; }
    .threshold-val { font-weight: 600; color: #0f2744; min-width: 45px; }
    .form-control { padding: 0.5rem 0.75rem; border: 2px solid #d9e2ec; border-radius: 8px; font-size: 0.9rem; min-width: 120px; }

    .alerts-row { display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
    .alert-card {
      display: flex; align-items: center; gap: 1rem;
      padding: 1rem 1.25rem; border-radius: 12px;
      flex: 1; min-width: 200px;
    }
    .alert-card i { font-size: 1.5rem; }
    .alert-card strong { display: block; font-size: 1rem; }
    .alert-card span { font-size: 0.8125rem; opacity: 0.9; }
    .alert-card.critical { background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; }
    .alert-card.warning { background: #fffbeb; border: 1px solid #fde68a; color: #b45309; }

    .table-card {
      background: #fff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    .table-header { padding: 1.25rem 1.5rem; background: #f7f9fc; border-bottom: 1px solid #e2e8f0; }
    .table-header h3 { margin: 0; font-size: 1.125rem; color: #0f2744; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
    .data-table th, .data-table td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
    .data-table th { background: #f7f9fc; font-size: 0.8125rem; color: #6a8cad; font-weight: 600; }
    .critical-row { background: #fef2f2; }
    .warning-row { background: #fffbeb; }
    .student-link { color: #1e3a5f; font-weight: 500; text-decoration: none; }
    .student-link:hover { text-decoration: underline; }
    .col-present { color: #059669; }
    .col-absent { color: #dc2626; }
    .critical { color: #dc2626 !important; }
    .warn { color: #d97706 !important; }
    .badge { padding: 0.25rem 0.5rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600; }
    .badge-critical { background: #fecaca; color: #b91c1c; }
    .badge-warning { background: #fde68a; color: #b45309; }
    .btn-icon {
      display: inline-flex; align-items: center; justify-content: center;
      width: 32px; height: 32px; padding: 0; border: 2px solid #e2e8f0; background: #fff;
      border-radius: 8px; color: #1e3a5f; text-decoration: none;
    }
    .btn-icon:hover { border-color: #1e3a5f; background: #f7f9fc; }

    .empty-state { padding: 2rem; text-align: center; color: #6a8cad; }
    .empty-state i { font-size: 2.5rem; display: block; margin-bottom: 0.5rem; color: #059669; }

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
export class AdminAttendanceLowAttendanceComponent implements OnInit {
  selectedPeriod: LowAttendancePeriod = 'today';
  filterClassId: number | null = null;
  classOptions: { classId: number; className: string }[] = [];
  threshold = 85;
  students: LowAttendanceStudentWithLevel[] = [];
  filteredList: LowAttendanceStudentWithLevel[] = [];
  pageSize = 10;
  currentPage = 1;
  loading = false;
  error: string | null = null;

  constructor(private attendanceService: AttendanceService) {}

  get criticalCount(): number {
    return this.filteredList.filter(s => s.level === 'critical').length;
  }

  get warningCount(): number {
    return this.filteredList.filter(s => s.level === 'warning').length;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredList.length / this.pageSize) || 1;
  }

  get paginatedList(): LowAttendanceStudentWithLevel[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredList.slice(start, start + this.pageSize);
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredList.length);
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = null;
    this.attendanceService.getLowAttendanceStudents(this.selectedPeriod, this.filterClassId).subscribe({
      next: (res: LowAttendanceResponse) => {
        this.classOptions = res.classOptions;
        this.students = res.students.map(s => ({
          ...s,
          level: (s.percent < 75 ? 'critical' : 'warning') as 'critical' | 'warning'
        }));
        this.applyThreshold();
        this.loading = false;
      },
      error: (err: { error?: { message?: string }; message?: string }) => {
        this.error = err?.error?.message || err?.message || 'Failed to load low-attendance students';
        this.students = [];
        this.filteredList = [];
        this.classOptions = [];
        this.loading = false;
      }
    });
  }

  applyThreshold(): void {
    this.filteredList = this.students
      .filter(s => s.percent < this.threshold)
      .map(s => ({
        ...s,
        level: (s.percent < 75 ? 'critical' : 'warning') as 'critical' | 'warning'
      }));
    this.currentPage = 1;
  }

  goToPrevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }
}
