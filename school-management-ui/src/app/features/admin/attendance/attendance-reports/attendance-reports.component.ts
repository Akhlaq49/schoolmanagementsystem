import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../../shared/services/notification.service';
import { AttendanceService } from '../../../../core/services/attendance.service';
import { ClassService } from '../../../../core/services/class.service';
import { SectionService } from '../../../../core/services/section.service';
import { AdminAttendanceReportRecord, AdminAttendanceReportType } from '../../../../core/models/attendance.model';
import { Class } from '../../../../core/models/student.model';
import { Section } from '../../../../core/models/section.model';
import { InlineSpinnerComponent } from '../../../../shared/components/inline-spinner/inline-spinner.component';

@Component({
  selector: 'app-admin-attendance-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, InlineSpinnerComponent],
  template: `
    <div class="page-container">
      <div class="page-header-card">
        <div class="header-content">
          <div>
            <a routerLink="/admin/dashboard" class="back-link">
              <i class="fa fa-arrow-left"></i> Back to Dashboard
            </a>
            <h2><i class="fa fa-file-text"></i> Attendance Reports</h2>
            <p class="page-subtitle">Date-range reports, analytics, and export</p>
          </div>
          <button type="button" class="btn btn-primary" (click)="exportReport()" [disabled]="loading || exporting || generating">
            <app-inline-spinner *ngIf="exporting" [size]="13" [thickness]="2"></app-inline-spinner>
            <i *ngIf="!exporting" class="fa fa-download"></i> {{ exporting ? 'Exporting...' : 'Export' }}
          </button>
        </div>
      </div>

      <div class="filters-card">
        <h3>Date Range & Filters</h3>
        <div class="filter-row">
          <div class="filter-group">
            <label>From Date</label>
            <input type="date" class="form-control" [(ngModel)]="dateFrom" (ngModelChange)="applyFilters()">
          </div>
          <div class="filter-group">
            <label>To Date</label>
            <input type="date" class="form-control" [(ngModel)]="dateTo" (ngModelChange)="applyFilters()">
          </div>
          <div class="filter-group">
            <label>Class</label>
            <select [(ngModel)]="filterClassId" (ngModelChange)="onClassChange()" class="form-control">
              <option [ngValue]="null">All</option>
              <option *ngFor="let c of classOptions" [ngValue]="c.classId">{{ c.name }}</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Section</label>
            <select [(ngModel)]="filterSectionId" (ngModelChange)="applyFilters()" class="form-control" [disabled]="!filterClassId">
              <option [ngValue]="null">All</option>
              <option *ngFor="let s of sectionOptions" [ngValue]="s.sectionId">{{ s.name }}</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Report Type</label>
            <select [(ngModel)]="reportType" (ngModelChange)="applyFilters()" class="form-control">
              <option value="summary">Summary</option>
              <option value="detailed">Detailed</option>
              <option value="class-wise">Class-wise</option>
              <option value="student-wise">Student-wise</option>
            </select>
          </div>
          <div class="filter-group filter-actions">
            <button type="button" class="btn btn-secondary" (click)="generateReport()" [disabled]="loading || generating || exporting">
              <app-inline-spinner *ngIf="generating" [size]="13" [thickness]="2"></app-inline-spinner>
              <i *ngIf="!generating" class="fa fa-refresh"></i> {{ generating ? 'Generating...' : 'Generate' }}
            </button>
          </div>
        </div>
      </div>

      <div class="analytics-row">
        <div class="analytics-card">
          <span class="analytics-val">{{ analytics.totalRecords }}</span>
          <span class="analytics-lbl">Total Records</span>
        </div>
        <div class="analytics-card highlight">
          <span class="analytics-val">{{ analytics.avgAttendance }}%</span>
          <span class="analytics-lbl">Avg Attendance</span>
        </div>
        <div class="analytics-card">
          <span class="analytics-val">{{ analytics.presentDays }}</span>
          <span class="analytics-lbl">Working Days</span>
        </div>
        <div class="analytics-card">
          <span class="analytics-val">{{ analytics.studentsCovered }}</span>
          <span class="analytics-lbl">Students Covered</span>
        </div>
        <div class="analytics-card">
          <span class="analytics-val">{{ analytics.absentTrend }}</span>
          <span class="analytics-lbl">Absent Trend (vs prev)</span>
        </div>
      </div>

      <div class="table-card">
        <div class="table-header">
          <h3>Reports ({{ reports.length }})</h3>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Report Name</th>
              <th>Date Range</th>
              <th>Class</th>
              <th>Section</th>
              <th>Records</th>
              <th>Avg %</th>
              <th>Generated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of paginatedReports; let i = index">
              <td>{{ (currentPage - 1) * pageSize + i + 1 }}</td>
              <td>{{ r.reportName }}</td>
              <td>{{ r.dateFrom }} to {{ r.dateTo }}</td>
              <td>{{ r.className || 'All' }}</td>
              <td>{{ r.sectionName || 'All' }}</td>
              <td>{{ r.recordCount }}</td>
              <td><strong>{{ r.avgAttendance }}%</strong></td>
              <td>{{ r.generatedAt }}</td>
              <td>
                <button type="button" class="btn-icon" (click)="exportSingle(r)" title="Export" [disabled]="exportingRowId === r.id || exporting || generating || loading">
                  <app-inline-spinner *ngIf="exportingRowId === r.id" [size]="12" [thickness]="2"></app-inline-spinner>
                  <i *ngIf="exportingRowId !== r.id" class="fa fa-download"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="pagination-bar" *ngIf="totalPages > 1">
          <span class="pagination-info">Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ endIndex }} of {{ reports.length }}</span>
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
    .page-container { max-width: 1200px; }
    .page-header-card {
      background: #fff;
      border-radius: 16px;
      padding: 1.75rem 2rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    .header-content { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
    .back-link {
      display: inline-flex; align-items: center; gap: 0.35rem;
      color: #6a8cad; font-size: 0.875rem; margin-bottom: 0.5rem; text-decoration: none;
    }
    .back-link:hover { color: #1e3a5f; }
    .page-header-card h2 { margin: 0 0 0.25rem 0; font-size: 1.5rem; font-weight: 700; color: #0f2744; }
    .page-header-card h2 i { color: #1e3a5f; }
    .page-subtitle { margin: 0; color: #6a8cad; font-size: 0.9375rem; }

    .btn {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.6rem 1.25rem; border: none; border-radius: 10px;
      font-size: 0.9375rem; font-weight: 600; cursor: pointer;
    }
    .btn-primary { background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); color: #fff; }
    .btn-secondary { background: #e2e8f0; color: #374151; }

    .filters-card {
      background: #fff;
      border-radius: 16px;
      padding: 1.25rem 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    .filters-card h3 { margin: 0 0 0.75rem 0; font-size: 0.9375rem; color: #0f2744; }
    .filter-row { display: flex; gap: 1rem; flex-wrap: wrap; align-items: flex-end; }
    .filter-group { display: flex; flex-direction: column; }
    .filter-group label { font-size: 0.75rem; color: #6a8cad; margin-bottom: 0.25rem; }
    .form-control { padding: 0.5rem 0.75rem; border: 2px solid #d9e2ec; border-radius: 8px; font-size: 0.9rem; min-width: 120px; }
    .filter-actions { margin-left: auto; }

    .analytics-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
    .analytics-card {
      background: #fff;
      border-radius: 12px;
      padding: 1.25rem;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    .analytics-card.highlight { border-color: #1e3a5f; background: linear-gradient(135deg, #f7f9fc 0%, #eef2f7 100%); }
    .analytics-card .analytics-val { display: block; font-size: 1.5rem; font-weight: 700; color: #0f2744; }
    .analytics-card.highlight .analytics-val { color: #1e3a5f; }
    .analytics-card .analytics-lbl { font-size: 0.75rem; color: #6a8cad; }

    .table-card {
      background: #fff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    .table-header { padding: 1.25rem 1.5rem; background: #f7f9fc; border-bottom: 1px solid #e2e8f0; }
    .table-header h3 { margin: 0; font-size: 1.125rem; color: #0f2744; }
    .table-header h3 i { color: #1e3a5f; margin-right: 0.5rem; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
    .data-table th, .data-table td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
    .data-table th { background: #f7f9fc; font-size: 0.8125rem; color: #6a8cad; font-weight: 600; }
    .btn-icon {
      display: inline-flex; align-items: center; justify-content: center;
      width: 32px; height: 32px; padding: 0; border: 2px solid #e2e8f0; background: #fff;
      border-radius: 8px; cursor: pointer; color: #1e3a5f;
    }
    .btn-icon:hover { border-color: #1e3a5f; background: #f7f9fc; }

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
export class AdminAttendanceReportsComponent implements OnInit {
  dateFrom = '';
  dateTo = '';
  filterClassId: number | null = null;
  filterSectionId: number | null = null;
  reportType: AdminAttendanceReportType = 'summary';
  classOptions: Class[] = [];
  sectionOptions: Section[] = [];
  reports: AdminAttendanceReportRecord[] = [];
  loading = false;
  generating = false;
  exporting = false;
  exportingRowId: number | null = null;
  analytics = {
    totalRecords: 0,
    avgAttendance: 0,
    presentDays: 0,
    studentsCovered: 0,
    absentTrend: '—'
  };
  pageSize = 10;
  currentPage = 1;

  get totalPages(): number {
    return Math.ceil(this.reports.length / this.pageSize) || 1;
  }

  get paginatedReports(): AdminAttendanceReportRecord[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.reports.slice(start, start + this.pageSize);
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.reports.length);
  }

  constructor(
    private notify: NotificationService,
    private attendanceService: AttendanceService,
    private classService: ClassService,
    private sectionService: SectionService
  ) {}

  ngOnInit(): void {
    const t = new Date();
    this.dateFrom = new Date(t.getFullYear(), t.getMonth(), 1).toISOString().split('T')[0];
    this.dateTo = t.toISOString().split('T')[0];
    this.classService.getAllClasses().subscribe({
      next: (classes) => { this.classOptions = classes; },
      error: () => this.notify.error('Failed to load classes')
    });
    this.fetchReports();
  }

  applyFilters(): void {
    this.fetchReports();
  }

  onClassChange(): void {
    this.filterSectionId = null;
    this.sectionOptions = [];
    if (this.filterClassId) {
      this.sectionService.getSectionsByClass(this.filterClassId).subscribe({
        next: (sections) => { this.sectionOptions = sections; },
        error: () => this.notify.error('Failed to load sections')
      });
    }
    this.fetchReports();
  }

  generateReport(): void {
    if (!this.dateFrom || !this.dateTo) {
      this.notify.error('Please select date range first');
      return;
    }
    this.loading = true;
    this.generating = true;
    this.attendanceService.generateAdminAttendanceReports({
      dateFrom: this.dateFrom,
      dateTo: this.dateTo,
      classId: this.filterClassId,
      sectionId: this.filterSectionId,
      reportType: this.reportType
    }).subscribe({
      next: (res) => {
        this.reports = res.reports;
        this.analytics = res.analytics;
        this.currentPage = 1;
        this.loading = false;
        this.generating = false;
        this.notify.success('Report generated');
      },
      error: (err: any) => {
        this.loading = false;
        this.generating = false;
        this.notify.error(err?.error?.message ?? 'Failed to generate report');
      }
    });
  }

  exportReport(): void {
    if (!this.dateFrom || !this.dateTo) {
      this.notify.error('Please select date range first');
      return;
    }
    this.exporting = true;
    this.attendanceService.exportAdminAttendanceReportsCsv(
      this.dateFrom,
      this.dateTo,
      this.reportType,
      this.filterClassId,
      this.filterSectionId
    ).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance_reports_${this.dateFrom}_${this.dateTo}_${this.reportType}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.exporting = false;
        this.notify.success('Export downloaded');
      },
      error: (err: any) => {
        this.exporting = false;
        this.notify.error(err?.error?.message ?? 'Export failed');
      }
    });
  }

  exportSingle(r: AdminAttendanceReportRecord): void {
    this.exportingRowId = r.id;
    this.attendanceService.exportAdminAttendanceSingleReportCsv(
      r.id,
      this.dateFrom,
      this.dateTo,
      this.reportType,
      this.filterClassId,
      this.filterSectionId
    ).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance_report_${r.id}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.exportingRowId = null;
        this.notify.success(`Exported: ${r.reportName}`);
      },
      error: (err: any) => {
        this.exportingRowId = null;
        this.notify.error(err?.error?.message ?? 'Failed to export report');
      }
    });
  }

  goToPrevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  private fetchReports(): void {
    if (!this.dateFrom || !this.dateTo) return;
    this.loading = true;
    this.attendanceService.getAdminAttendanceReports(
      this.dateFrom,
      this.dateTo,
      this.reportType,
      this.filterClassId,
      this.filterSectionId
    ).subscribe({
      next: (res) => {
        this.reports = res.reports;
        this.analytics = res.analytics;
        this.currentPage = 1;
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        this.notify.error(err?.error?.message ?? 'Failed to load reports');
      }
    });
  }
}
