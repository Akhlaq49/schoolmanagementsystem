import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../../shared/services/notification.service';
import { AttendanceService } from '../../../../core/services/attendance.service';
import { ClassService } from '../../../../core/services/class.service';
import { SectionService } from '../../../../core/services/section.service';
import { MonthlyGridStudent, MonthlyGridCell } from '../../../../core/models/attendance.model';
import { Class } from '../../../../core/models/student.model';
import { Section } from '../../../../core/models/section.model';
import { formatTime12h } from '../../../../shared/utils/time.utils';

@Component({
  selector: 'app-admin-attendance-monthly',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div *ngIf="loading" class="loading-overlay">
      <i class="fa fa-spinner fa-spin fa-2x"></i>
    </div>
    <div class="page-container">
      <div class="page-header-card">
        <div class="header-content">
          <div>
            <a routerLink="/admin/dashboard" class="back-link">
              <i class="fa fa-arrow-left"></i> Back to Dashboard
            </a>
            <h2><i class="fa fa-th"></i> Monthly Grid</h2>
            <p class="page-subtitle">Attendance grid by month, class, and section</p>
          </div>
          <button type="button" class="btn btn-primary" (click)="exportData()">
            <i class="fa fa-download"></i> Export
          </button>
        </div>
      </div>

      <div class="filters-card">
        <h3>Filters</h3>
        <div class="filter-row">
          <div class="filter-group">
            <label>Month</label>
            <select [(ngModel)]="selectedMonth" (ngModelChange)="loadGrid()" class="form-control">
              <option *ngFor="let m of monthOptions" [ngValue]="m.value">{{ m.label }}</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Year</label>
            <select [(ngModel)]="selectedYear" (ngModelChange)="loadGrid()" class="form-control">
              <option *ngFor="let y of yearOptions" [ngValue]="y">{{ y }}</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Class</label>
            <select [(ngModel)]="selectedClassId" (ngModelChange)="onClassChange()" class="form-control">
              <option [ngValue]="null">All Classes</option>
              <option *ngFor="let c of classOptions" [ngValue]="c.value">{{ c.label }}</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Section</label>
            <select [(ngModel)]="selectedSectionId" (ngModelChange)="loadGrid()" class="form-control"
                    [disabled]="!selectedClassId">
              <option [ngValue]="null">All Sections</option>
              <option *ngFor="let s of sectionOptions" [ngValue]="s.value">{{ s.label }}</option>
            </select>
          </div>
          <div class="filter-group">
            <button type="button" class="btn btn-secondary" (click)="loadGrid()" [disabled]="loading">
              <i class="fa fa-refresh" [class.fa-spin]="loading"></i> Load
            </button>
          </div>
        </div>
      </div>

      <div class="legend-row">
        <span class="leg"><span class="dot p"></span> P – Present</span>
        <span class="leg"><span class="dot a"></span> A – Absent</span>
        <span class="leg"><span class="dot l"></span> L – Leave</span>
        <span class="leg"><span class="dot h"></span> H – Holiday</span>
        <span class="leg"><i>Click a cell for details</i></span>
      </div>

      <div class="empty-state" *ngIf="!loading && students.length === 0">
        <i class="fa fa-th"></i>
        <p>No students found for the selected filters.</p>
      </div>

      <div class="grid-card" *ngIf="students.length > 0">
        <div class="grid-wrap">
          <table class="grid-table">
            <thead>
              <tr>
                <th class="col-fixed">#</th>
                <th class="col-fixed">Roll</th>
                <th class="col-fixed">Name</th>
                <th *ngFor="let d of dayHeaders" class="day-col">{{ d }}</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of paginatedStudents; let i = index">
                <td class="col-fixed">{{ (currentPage - 1) * pageSize + i + 1 }}</td>
                <td class="col-fixed">{{ s.roll }}</td>
                <td class="col-fixed name-cell">{{ s.name }}</td>
                <td *ngFor="let d of dayNumbers" class="day-cell"
                  [class.p]="getCellStatus(s.studentId, d) === 'P'"
                  [class.a]="getCellStatus(s.studentId, d) === 'A'"
                  [class.l]="getCellStatus(s.studentId, d) === 'L'"
                  [class.h]="getCellStatus(s.studentId, d) === 'H'"
                  (click)="openCellPopup(s, d)"
                >
                  {{ getCellStatus(s.studentId, d) || '—' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pagination-bar" *ngIf="totalPages > 1">
          <span class="pagination-info">Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ endIndex }} of {{ students.length }}</span>
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

      <div *ngIf="popupData" class="popup-overlay" (click)="closePopup()">
        <div class="popup" (click)="$event.stopPropagation()">
          <div class="popup-header">
            <h3>Cell Details</h3>
            <button type="button" class="popup-close" (click)="closePopup()">
              <i class="fa fa-times"></i>
            </button>
          </div>
          <div class="popup-body">
            <div class="popup-row"><strong>Student:</strong> {{ popupData.studentName }}</div>
            <div class="popup-row"><strong>Roll:</strong> {{ popupData.roll }}</div>
            <div class="popup-row"><strong>Date:</strong> {{ popupData.date }}</div>
            <div class="popup-row"><strong>Status:</strong> <span class="badge" [ngClass]="'badge-' + (popupData.status || 'na')">{{ popupData.status || 'Not marked' }}</span></div>
            <div class="popup-row" *ngIf="popupData.timeIn"><strong>Time In:</strong> {{ formatTime12h(popupData.timeIn) }}</div>
            <div class="popup-row" *ngIf="popupData.timeOut"><strong>Time Out:</strong> {{ formatTime12h(popupData.timeOut) }}</div>
            <div class="popup-row" *ngIf="popupData.remarks"><strong>Remarks:</strong> {{ popupData.remarks }}</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .loading-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(255,255,255,0.7);
      display: flex; align-items: center; justify-content: center;
      z-index: 9000; color: #1e3a5f;
    }
    .empty-state { text-align: center; padding: 3rem; color: #9ca3af; }
    .empty-state i { font-size: 3rem; margin-bottom: 0.5rem; display: block; }
    .page-container { max-width: 100%; overflow: hidden; }
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
      margin-bottom: 1rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    .filters-card h3 { margin: 0 0 0.75rem 0; font-size: 0.9375rem; color: #0f2744; }
    .filter-row { display: flex; gap: 1rem; flex-wrap: wrap; align-items: flex-end; }
    .filter-group { display: flex; flex-direction: column; }
    .filter-group label { font-size: 0.75rem; color: #6a8cad; margin-bottom: 0.25rem; }
    .form-control { padding: 0.5rem 0.75rem; border: 2px solid #d9e2ec; border-radius: 8px; font-size: 0.9rem; min-width: 120px; }

    .legend-row { display: flex; gap: 1.5rem; flex-wrap: wrap; margin-bottom: 1rem; font-size: 0.8125rem; color: #6a8cad; align-items: center; }
    .leg { display: flex; align-items: center; gap: 0.35rem; }
    .dot { width: 14px; height: 14px; border-radius: 4px; }
    .dot.p { background: #059669; }
    .dot.a { background: #dc2626; }
    .dot.l { background: #2563eb; }
    .dot.h { background: #9ca3af; }

    .grid-card {
      background: #fff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    .grid-wrap { overflow-x: auto; }
    .grid-table { width: max-content; min-width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    .grid-table th, .grid-table td { padding: 0.5rem 0.4rem; text-align: center; border: 1px solid #e2e8f0; }
    .grid-table th { background: #f7f9fc; color: #6a8cad; font-weight: 600; }
    .col-fixed { background: #fafbfc !important; position: sticky; left: 0; z-index: 1; min-width: 40px; }
    .col-fixed.name-cell { min-width: 120px; text-align: left; padding-left: 0.75rem; }
    .day-col { min-width: 28px; }
    .day-cell {
      min-width: 28px; cursor: pointer; transition: background 0.2s;
    }
    .day-cell:hover { background: #f0f4f8; }
    .day-cell.p { background: #d1fae5; color: #059669; font-weight: 600; }
    .day-cell.a { background: #fee2e2; color: #dc2626; font-weight: 600; }
    .day-cell.l { background: #dbeafe; color: #2563eb; font-weight: 600; }
    .day-cell.h { background: #e5e7eb; color: #6b7280; }

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

    .popup-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex; align-items: center; justify-content: center;
      z-index: 10000;
    }
    .popup {
      background: #fff;
      border-radius: 16px;
      min-width: 320px;
      max-width: 95vw;
      box-shadow: 0 4px 24px rgba(0,0,0,0.2);
      overflow: hidden;
    }
    .popup-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 1rem 1.25rem; background: #f7f9fc; border-bottom: 1px solid #e2e8f0;
    }
    .popup-header h3 { margin: 0; font-size: 1rem; color: #0f2744; }
    .popup-close { padding: 0.35rem; border: none; background: transparent; cursor: pointer; color: #6a8cad; font-size: 1.1rem; }
    .popup-close:hover { color: #dc2626; }
    .popup-body { padding: 1.25rem; }
    .popup-row { margin-bottom: 0.75rem; font-size: 0.9375rem; }
    .popup-row:last-child { margin-bottom: 0; }
    .badge { padding: 0.2rem 0.5rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600; }
    .badge-P { background: #d1fae5; color: #059669; }
    .badge-A { background: #fee2e2; color: #dc2626; }
    .badge-L { background: #dbeafe; color: #2563eb; }
    .badge-H { background: #e5e7eb; color: #6b7280; }
    .badge-na { background: #f3f4f6; color: #9ca3af; }
  `]
})
export class AdminAttendanceMonthlyComponent implements OnInit {
  formatTime12h = formatTime12h;

  selectedMonth = new Date().getMonth() + 1;
  selectedYear  = new Date().getFullYear();
  selectedClassId:   number | null = null;
  selectedSectionId: number | null = null;

  monthOptions: { value: number; label: string }[] = [];
  yearOptions:  number[] = [];

  classes:  Class[]   = [];
  sections: Section[] = [];

  get classOptions(): { value: number; label: string }[] {
    return this.classes.map(c => ({ value: c.classId, label: c.name }));
  }

  get sectionOptions(): { value: number; label: string }[] {
    return this.sections.map(s => ({ value: s.sectionId, label: s.name }));
  }

  students:  MonthlyGridStudent[] = [];
  /** Key: `studentId-day` → cell data */
  cellMap: Map<string, MonthlyGridCell> = new Map();
  dayNumbers: number[] = [];
  dayHeaders: string[] = [];
  loading = false;
  pageSize    = 15;
  currentPage =  1;

  popupData: {
    studentName: string; roll: string; date: string;
    status?: string; timeIn?: string; timeOut?: string; remarks?: string;
  } | null = null;

  get totalPages(): number {
    return Math.ceil(this.students.length / this.pageSize) || 1;
  }

  get paginatedStudents(): MonthlyGridStudent[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.students.slice(start, start + this.pageSize);
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.students.length);
  }

  constructor(
    private notify: NotificationService,
    private attendanceService: AttendanceService,
    private classService: ClassService,
    private sectionService: SectionService
  ) {}

  ngOnInit(): void {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    this.monthOptions = months.map((l, i) => ({ value: i + 1, label: l }));
    const y = new Date().getFullYear();
    this.yearOptions  = [y - 1, y, y + 1];
    this.selectedYear = y;

    this.classService.getAllClasses().subscribe({
      next: (c) => { this.classes = c; },
      error: () => this.notify.error('Failed to load classes')
    });

    this.buildDayHeaders();
    this.loadGrid();
  }

  buildDayHeaders(): void {
    const days = new Date(this.selectedYear, this.selectedMonth, 0).getDate();
    this.dayNumbers = Array.from({ length: days }, (_, i) => i + 1);
    this.dayHeaders = this.dayNumbers.map(String);
  }

  onClassChange(): void {
    this.sections         = [];
    this.selectedSectionId = null;
    if (this.selectedClassId) {
      this.sectionService.getSectionsByClass(this.selectedClassId).subscribe({
        next: (s) => { this.sections = s; },
        error: () => this.notify.error('Failed to load sections')
      });
    }
    this.loadGrid();
  }

  loadGrid(): void {
    this.buildDayHeaders();
    this.loading = true;
    this.attendanceService.getAdminMonthlyGrid(
      this.selectedMonth,
      this.selectedYear,
      this.selectedClassId,
      this.selectedSectionId
    ).subscribe({
      next: (res) => {
        this.students = res.students;
        this.cellMap  = new Map(
          res.gridCells.map(c => [`${c.studentId}-${c.day}`, c])
        );
        this.currentPage = 1;
        this.loading     = false;
      },
      error: (err) => {
        this.loading = false;
        this.notify.error(err?.error?.message ?? 'Failed to load monthly grid');
      }
    });
  }

  getCellStatus(studentId: number, day: number): string {
    return this.cellMap.get(`${studentId}-${day}`)?.status ?? '';
  }

  openCellPopup(s: MonthlyGridStudent, day: number): void {
    const cell = this.cellMap.get(`${s.studentId}-${day}`);
    const dateStr = `${this.selectedYear}-${String(this.selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    this.popupData = {
      studentName: s.name,
      roll:        s.roll,
      date:        dateStr,
      status:      cell?.status  || undefined,
      timeIn:      cell?.timeIn  || undefined,
      timeOut:     cell?.timeOut || undefined,
      remarks:     cell?.remarks || undefined
    };
  }

  closePopup(): void {
    this.popupData = null;
  }

  exportData(): void {
    this.attendanceService.exportAdminMonthlyGridCsv(
      this.selectedMonth,
      this.selectedYear,
      this.selectedClassId,
      this.selectedSectionId
    ).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a   = document.createElement('a');
        a.href     = url;
        a.download = `attendance_monthly_${this.selectedYear}_${String(this.selectedMonth).padStart(2, '0')}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.notify.success('Export downloaded');
      },
      error: (err: any) => {
        this.notify.error(err?.error?.message ?? 'Export failed');
      }
    });
  }

  goToPrevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }
}
