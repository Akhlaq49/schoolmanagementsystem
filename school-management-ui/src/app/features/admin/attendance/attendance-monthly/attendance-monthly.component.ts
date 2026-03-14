import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../../shared/services/notification.service';
import { formatTime12h } from '../../../../shared/utils/time.utils';

interface GridStudent {
  studentId: number;
  roll: string;
  name: string;
}

type StatusCode = '' | 'P' | 'A' | 'L' | 'H'; // P=Present, A=Absent, L=Leave, H=Holiday

interface CellData {
  date: string;
  status: StatusCode;
  timeIn?: string;
  timeOut?: string;
  remarks?: string;
}

@Component({
  selector: 'app-admin-attendance-monthly',
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
              <option *ngFor="let m of monthOptions" [value]="m.value">{{ m.label }}</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Year</label>
            <select [(ngModel)]="selectedYear" (ngModelChange)="loadGrid()" class="form-control">
              <option *ngFor="let y of yearOptions" [value]="y">{{ y }}</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Class</label>
            <select [(ngModel)]="selectedClassId" (ngModelChange)="onClassChange()" class="form-control">
              <option [value]="null">All</option>
              <option *ngFor="let c of classOptions" [value]="c.value">{{ c.label }}</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Section</label>
            <select [(ngModel)]="selectedSectionId" (ngModelChange)="loadGrid()" class="form-control">
              <option [value]="null">All</option>
              <option *ngFor="let s of sectionOptions" [value]="s.value">{{ s.label }}</option>
            </select>
          </div>
          <div class="filter-group">
            <button type="button" class="btn btn-secondary" (click)="loadGrid()">
              <i class="fa fa-refresh"></i> Load
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

      <div class="grid-card">
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
  selectedYear = new Date().getFullYear();
  selectedClassId: number | null = 1;
  selectedSectionId: number | null = 1;
  monthOptions: { value: number; label: string }[] = [];
  yearOptions: number[] = [];
  classOptions: { value: number; label: string }[] = [
    { value: 1, label: 'Grade 10' },
    { value: 2, label: 'Grade 9' },
    { value: 3, label: 'Grade 8' }
  ];
  sectionOptions: { value: number; label: string }[] = [
    { value: 1, label: 'A' },
    { value: 2, label: 'B' }
  ];
  students: GridStudent[] = [];
  gridData: Record<string, CellData> = {}; // 'studentId-day' -> CellData
  dayNumbers: number[] = [];
  dayHeaders: string[] = [];
  pageSize = 5;
  currentPage = 1;
  popupData: { studentName: string; roll: string; date: string; status?: string; timeIn?: string; timeOut?: string; remarks?: string } | null = null;

  get totalPages(): number {
    return Math.ceil(this.students.length / this.pageSize) || 1;
  }

  get paginatedStudents(): GridStudent[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.students.slice(start, start + this.pageSize);
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.students.length);
  }

  constructor(private notify: NotificationService) {}

  ngOnInit(): void {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    this.monthOptions = months.map((l, i) => ({ value: i + 1, label: l }));
    const y = new Date().getFullYear();
    this.yearOptions = [y - 1, y, y + 1];
    this.selectedYear = y;
    this.buildDayHeaders();
    this.loadMockData();
  }

  buildDayHeaders(): void {
    const daysInMonth = new Date(this.selectedYear, this.selectedMonth, 0).getDate();
    this.dayNumbers = [];
    this.dayHeaders = [];
    for (let d = 1; d <= daysInMonth; d++) {
      this.dayNumbers.push(d);
      this.dayHeaders.push(String(d));
    }
  }

  onClassChange(): void {
    this.selectedSectionId = null;
    this.loadGrid();
  }

  loadGrid(): void {
    this.buildDayHeaders();
    this.loadMockData();
  }

  getCellStatus(studentId: number, day: number): string {
    const key = `${studentId}-${day}`;
    const cell = this.gridData[key];
    return cell?.status || '';
  }

  openCellPopup(s: GridStudent, day: number): void {
    const key = `${s.studentId}-${day}`;
    const cell = this.gridData[key];
    const dateStr = `${this.selectedYear}-${String(this.selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    this.popupData = {
      studentName: s.name,
      roll: s.roll,
      date: dateStr,
      status: cell?.status || undefined,
      timeIn: cell?.timeIn,
      timeOut: cell?.timeOut,
      remarks: cell?.remarks
    };
  }

  closePopup(): void {
    this.popupData = null;
  }

  exportData(): void {
    this.notify.success('Export started. File will download shortly.');
  }

  goToPrevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  private loadMockData(): void {
    this.students = [
      { studentId: 1, roll: 'R101', name: 'Ali Khan' },
      { studentId: 2, roll: 'R102', name: 'Sara Ahmed' },
      { studentId: 3, roll: 'R103', name: 'Hamza Shah' },
      { studentId: 4, roll: 'R104', name: 'Fatima Hassan' },
      { studentId: 5, roll: 'R105', name: 'Omar Riaz' }
    ];
    this.gridData = {};
    const daysInMonth = this.dayNumbers.length;
    this.students.forEach(s => {
      for (let d = 1; d <= daysInMonth; d++) {
        const r = (s.studentId + d) % 5;
        let status: StatusCode = '';
        if (d <= 5) {
          status = r === 0 ? 'P' : r === 1 ? 'A' : r === 2 ? 'L' : r === 3 ? 'H' : 'P';
        } else if (d <= 10) {
          status = ['P', 'P', 'A', 'P', 'L'][d % 5] as StatusCode;
        } else {
          status = d % 7 === 0 ? 'H' : d % 5 === 0 ? 'A' : 'P';
        }
        if (status) {
          this.gridData[`${s.studentId}-${d}`] = {
            date: `${this.selectedYear}-${String(this.selectedMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
            status,
            timeIn: status === 'P' ? '08:15' : undefined,
            timeOut: status === 'P' ? '14:00' : undefined,
            remarks: status === 'A' ? 'Sick' : undefined
          };
        }
      }
    });
    this.currentPage = 1;
  }
}
