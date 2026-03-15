import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { TeacherService } from '../../../../core/services/teacher.service';
import { AttendanceService } from '../../../../core/services/attendance.service';
import { Teacher } from '../../../../core/models/teacher.model';
import { Attendance } from '../../../../core/models/attendance.model';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { formatTime12h } from '../../../../shared/utils/time.utils';
import { forkJoin } from 'rxjs';

export type ReportFilter = 'day' | 'weekly' | 'monthly' | 'yearly';

@Component({
  selector: 'app-teacher-attendance-report',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LoadingComponent],
  template: `
    <div class="report-container">
      <app-loading [show]="loading" [message]="'Loading...'"></app-loading>

      <div class="page-header">
        <h2><i class="fa fa-bar-chart"></i> Attendance Report</h2>
        <p class="subtitle">View your attendance by specific day, week, month or year</p>
      </div>

      <div class="filters-card">
        <h3>Filters</h3>
        <div class="filter-row">
          <div class="filter-group">
            <label>Report Type</label>
            <select [(ngModel)]="filterType" (ngModelChange)="onFilterChange()" class="form-select">
              <option value="day">Specific Day</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div class="filter-group" *ngIf="filterType === 'day'">
            <label>Date</label>
            <input type="date" [(ngModel)]="selectedDate" class="form-control">
          </div>
          <div class="filter-group" *ngIf="filterType === 'weekly'">
            <label>Week Start</label>
            <input type="date" [(ngModel)]="weekStart" class="form-control">
          </div>
          <div class="filter-group" *ngIf="filterType === 'monthly'">
            <label>Month</label>
            <select [(ngModel)]="selectedMonth" class="form-select">
              <option *ngFor="let m of monthOptions" [value]="m.value">{{ m.label }}</option>
            </select>
          </div>
          <div class="filter-group" *ngIf="filterType === 'monthly' || filterType === 'yearly'">
            <label>Year</label>
            <select [(ngModel)]="selectedYear" class="form-select">
              <option *ngFor="let y of yearOptions" [value]="y">{{ y }}</option>
            </select>
          </div>
          <div class="filter-group filter-actions">
            <button class="btn btn-primary" (click)="loadReport()" [disabled]="loading">
              <i class="fa fa-refresh"></i> Load Report
            </button>
          </div>
        </div>
      </div>

      <div class="report-card" *ngIf="teacher">
        <div class="teacher-info">
          <span class="name">{{ teacher.name }}</span>
          <span class="dept">{{ departmentName }}</span>
        </div>
        <div class="summary-row" *ngIf="reportData.length > 0">
          <div class="summary-item">
            <span class="value">{{ presentCount }}</span>
            <span class="label">Present (PP+PO)</span>
          </div>
          <div class="summary-item">
            <span class="value">{{ absentCount }}</span>
            <span class="label">Absent</span>
          </div>
          <div class="summary-item">
            <span class="value">{{ leaveCount }}</span>
            <span class="label">Leave</span>
          </div>
          <div class="summary-item">
            <span class="value">{{ attendancePercent }}%</span>
            <span class="label">Attendance %</span>
          </div>
        </div>
        <div class="table-wrap" *ngIf="reportData.length > 0">
          <table class="report-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Time In</th>
                <th>Time Out</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let r of paginatedReportData">
                <td>{{ r.date | date:'mediumDate' }}</td>
                <td><span class="status-badge" [ngClass]="'badge-' + getStatusKey(r.status)">{{ getStatusLabel(r.status) }}</span></td>
                <td>{{ formatTime12h(r.timeIn) }}</td>
                <td>{{ formatTime12h(r.timeOut) }}</td>
                <td>{{ r.remarks || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pagination-bar" *ngIf="reportData.length > 0 && reportTotalPages > 1">
          <span class="pagination-info">
            Showing {{ (reportPage - 1) * reportPageSize + 1 }} to {{ reportEndIndex }} of {{ reportData.length }}
          </span>
          <div class="pagination-controls">
            <button class="page-btn" (click)="goToReportPage(reportPage - 1)" [disabled]="reportPage === 1">
              <i class="fa fa-chevron-left"></i>
            </button>
            <div class="page-numbers">
              <button *ngFor="let p of reportPageNumbers" class="page-num" [class.active]="p === reportPage" (click)="goToReportPage(p)">
                {{ p }}
              </button>
            </div>
            <button class="page-btn" (click)="goToReportPage(reportPage + 1)" [disabled]="reportPage === reportTotalPages">
              <i class="fa fa-chevron-right"></i>
            </button>
          </div>
        </div>
        <div class="empty-state" *ngIf="reportData.length === 0 && !loading">
          <i class="fa fa-inbox"></i>
          <p>No attendance data for selected period</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .report-container { padding: 1.5rem; max-width: 900px; margin: 0 auto; }
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
    .filters-card {
      background: #fff;
      border-radius: 16px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      border: 1px solid #e2e8f0;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
    }
    .filters-card h3 { margin: 0 0 1rem 0; font-size: 1rem; color: #0f2744; }
    .filter-row { display: flex; flex-wrap: wrap; gap: 1rem; align-items: flex-end; }
    .filter-group { display: flex; flex-direction: column; }
    .filter-group label { font-size: 0.8125rem; margin-bottom: 0.35rem; color: #6a8cad; font-weight: 500; }
    .form-control, .form-select {
      padding: 0.5rem 0.75rem;
      border: 2px solid #d9e2ec;
      border-radius: 8px;
      font-size: 0.9375rem;
      min-width: 140px;
    }
    .filter-actions { margin-left: auto; }
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
      background: #1e3a5f;
      color: #fff;
    }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .report-card {
      background: #fff;
      border-radius: 16px;
      padding: 1.5rem;
      border: 1px solid #e2e8f0;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
    }
    .teacher-info {
      padding: 1rem;
      background: #f0f7ff;
      border-radius: 12px;
      margin-bottom: 1rem;
      border-left: 4px solid #1e3a5f;
    }
    .teacher-info .name { font-size: 1.125rem; font-weight: 600; color: #0f2744; display: block; }
    .teacher-info .dept { font-size: 0.875rem; color: #6a8cad; }
    .summary-row { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
    .summary-item {
      flex: 1;
      min-width: 100px;
      padding: 1rem;
      background: #f7f9fc;
      border-radius: 12px;
      text-align: center;
    }
    .summary-item .value { font-size: 1.5rem; font-weight: 700; color: #1e3a5f; display: block; }
    .summary-item .label { font-size: 0.8125rem; color: #6a8cad; }
    .report-table { width: 100%; border-collapse: collapse; }
    .report-table th, .report-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
    .report-table th { background: #f7f9fc; font-size: 0.8125rem; color: #6a8cad; font-weight: 600; }
    .status-badge { padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.8125rem; font-weight: 600; }
    .badge-pp { background: #d1fae5; color: #059669; }
    .badge-po { background: #dbeafe; color: #2563eb; }
    .badge-absent { background: #fee2e2; color: #dc2626; }
    .badge-sl, .badge-fl { background: #ede9fe; color: #7c3aed; }
    .badge-holiday { background: #f3f4f6; color: #6b7280; }
    .empty-state { text-align: center; padding: 2rem; color: #9ca3af; }
    .empty-state i { font-size: 2.5rem; margin-bottom: 0.5rem; display: block; }
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
export class TeacherAttendanceReportComponent implements OnInit {
  formatTime12h = formatTime12h;
  teacher: Teacher | null = null;
  reportData: Attendance[] = [];
  filterType: ReportFilter = 'monthly';
  selectedDate = '';
  weekStart = '';
  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();
  loading = false;
  monthOptions: { value: number; label: string }[] = [];
  yearOptions: number[] = [];
  reportPageSize = 10;
  reportPage = 1;

  get departmentName(): string {
    return this.teacher?.department?.name ?? '—';
  }

  get reportTotalPages(): number {
    return Math.ceil(this.reportData.length / this.reportPageSize) || 1;
  }

  get reportPageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.reportPage - 2);
    const end = Math.min(this.reportTotalPages, this.reportPage + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  get paginatedReportData(): Attendance[] {
    const start = (this.reportPage - 1) * this.reportPageSize;
    return this.reportData.slice(start, start + this.reportPageSize);
  }

  get reportEndIndex(): number {
    return Math.min(this.reportPage * this.reportPageSize, this.reportData.length);
  }

  goToReportPage(p: number): void {
    if (p < 1 || p > this.reportTotalPages) return;
    this.reportPage = p;
  }

  constructor(
    private auth: AuthService,
    private teacherService: TeacherService,
    private attendanceService: AttendanceService
  ) {}

  get presentCount(): number {
    return this.reportData.filter(r => r.status === 1 || r.status === 2 || r.status === 7).length;
  }

  get absentCount(): number {
    return this.reportData.filter(r => r.status === 3).length;
  }

  get leaveCount(): number {
    return this.reportData.filter(r => r.status === 4 || r.status === 5).length;
  }

  get attendancePercent(): number {
    const working = this.reportData.filter(r => r.status !== 6).length;
    const present = this.presentCount + this.leaveCount;
    return working > 0 ? Math.round((present / working) * 100) : 0;
  }

  ngOnInit(): void {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    this.monthOptions = months.map((l, i) => ({ value: i + 1, label: l }));
    const y = new Date().getFullYear();
    this.yearOptions = [y, y - 1, y - 2];
    const today = new Date();
    this.selectedDate = today.toISOString().split('T')[0];
    const d = new Date(today);
    d.setDate(d.getDate() - d.getDay());
    this.weekStart = d.toISOString().split('T')[0];
    this.loadTeacher();
  }

  private loadTeacher(): void {
    this.teacherService.getCurrentTeacher().subscribe({
      next: (t) => {
        this.teacher = t;
        this.loadReport();
      },
      error: () => {}
    });
  }

  onFilterChange(): void {}

  loadReport(): void {
    if (!this.teacher) return;
    this.loading = true;

    if (this.filterType === 'day') {
      const month = new Date(this.selectedDate).getMonth() + 1;
      const year = new Date(this.selectedDate).getFullYear();
      this.attendanceService.getTeacherThisMonthAttendance(month, year).subscribe({
        next: (list) => {
          this.reportData = list.filter(a => {
            const d = typeof a.date === 'string' ? a.date.split('T')[0] : (a.date as Date).toISOString().split('T')[0];
            return d === this.selectedDate;
          });
          this.reportPage = 1;
          this.loading = false;
        },
        error: () => { this.reportData = []; this.loading = false; }
      });
      return;
    }

    if (this.filterType === 'monthly') {
      this.attendanceService.getTeacherThisMonthAttendance(this.selectedMonth, this.selectedYear).subscribe({
        next: (list) => {
          this.reportData = list;
          this.reportPage = 1;
          this.loading = false;
        },
        error: () => { this.reportData = []; this.loading = false; }
      });
      return;
    }

    if (this.filterType === 'yearly') {
      const year = this.selectedYear;
      const calls = Array.from({ length: 12 }, (_, i) =>
        this.attendanceService.getTeacherThisMonthAttendance(i + 1, year)
      );
      forkJoin(calls).subscribe({
        next: (monthLists) => {
          this.reportData = monthLists.flat().sort((a, b) => {
            const da = typeof a.date === 'string' ? new Date(a.date).getTime() : (a.date as Date).getTime();
            const db = typeof b.date === 'string' ? new Date(b.date).getTime() : (b.date as Date).getTime();
            return da - db;
          });
          this.reportPage = 1;
          this.loading = false;
        },
        error: () => { this.reportData = []; this.loading = false; }
      });
      return;
    }

    if (this.filterType === 'weekly') {
      const month = new Date(this.weekStart).getMonth() + 1;
      const year = new Date(this.weekStart).getFullYear();
      const endDate = new Date(this.weekStart);
      endDate.setDate(endDate.getDate() + 6);
      this.attendanceService.getTeacherThisMonthAttendance(month, year).subscribe({
        next: (list) => {
          this.reportData = list.filter(a => {
            const d = typeof a.date === 'string' ? new Date(a.date) : (a.date as Date);
            return d >= new Date(this.weekStart) && d <= endDate;
          });
          this.reportPage = 1;
          this.loading = false;
        },
        error: () => { this.reportData = []; this.loading = false; }
      });
      return;
    }

    this.loading = false;
  }

  getStatusLabel(s: number): string {
    const m: Record<number, string> = { 0: 'Not Marked', 1: 'PP', 2: 'PO', 3: 'Absent', 4: 'SL', 5: 'FL', 6: 'H', 7: 'Late' };
    return m[s] ?? '?';
  }

  getStatusKey(s: number): string {
    const m: Record<number, string> = { 1: 'pp', 2: 'po', 3: 'absent', 4: 'sl', 5: 'fl', 6: 'holiday', 7: 'pp' };
    return m[s] ?? 'absent';
  }
}
