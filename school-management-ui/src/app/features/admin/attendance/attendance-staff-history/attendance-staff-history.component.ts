import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { formatTime12h } from '../../../../shared/utils/time.utils';
import { AttendanceService } from '../../../../core/services/attendance.service';

@Component({
  selector: 'app-admin-attendance-staff-history',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header-card">
        <a routerLink="/admin/attendance/staff" class="back-link">
          <i class="fa fa-arrow-left"></i> Back to Staff Attendance
        </a>
        <h2><i class="fa fa-history"></i> Staff Attendance History</h2>
        <p class="page-subtitle" *ngIf="staffName">{{ staffName }} — Punctuality record</p>
      </div>
      <div class="content-card" *ngIf="rows.length > 0">
        <div class="filter-row">
          <select [(ngModel)]="selectedMonth" (ngModelChange)="onMonthYearChange()" class="form-select">
            <option *ngFor="let m of monthOptions" [value]="m.value">{{ m.label }}</option>
          </select>
          <select [(ngModel)]="selectedYear" (ngModelChange)="onMonthYearChange()" class="form-select">
            <option *ngFor="let y of yearOptions" [value]="y">{{ y }}</option>
          </select>
        </div>

        <div class="summary-row">
          <div class="s-item total">
            <span class="val">{{ monthlyRows.length }}</span><span class="lbl">Total Days</span>
          </div>
          <div class="s-item present">
            <span class="val">{{ presentCount }}</span><span class="lbl">Present</span>
          </div>
          <div class="s-item absent">
            <span class="val">{{ absentCount }}</span><span class="lbl">Absent</span>
          </div>
          <div class="s-item not-marked">
            <span class="val">{{ notMarkedCount }}</span><span class="lbl">Not Marked</span>
          </div>
        </div>

        <div class="monthly-calendar">
          <h4>Monthly calendar — {{ getMonthName(selectedMonth) }} {{ selectedYear }}</h4>
          <div class="calendar-weekdays">
            <span *ngFor="let d of weekdayLabels">{{ d }}</span>
          </div>
          <div class="calendar-grid">
            <div
              *ngFor="let cell of calendarCells"
              class="cal-cell"
              [class.empty]="!cell.day"
              [class.present]="cell.status === 'PP' || cell.status === 'PO'"
              [class.absent]="cell.status === 'A'"
              [class.not-marked]="cell.status === 'Not Marked'"
            >
              <span class="day-num" *ngIf="cell.day">{{ cell.day }}</span>
              <span class="day-status" *ngIf="cell.status">{{ cell.status === 'Not Marked' ? '' : cell.status }}</span>
            </div>
          </div>
          <div class="calendar-legend">
            <span class="leg"><span class="dot present"></span> PP/PO</span>
            <span class="leg"><span class="dot absent"></span> A</span>
            <span class="leg"><span class="dot not-marked"></span> Not Marked</span>
          </div>
        </div>

        <h4 class="history-title">History</h4>
        <table class="data-table" *ngIf="monthlyRows.length > 0">
          <thead>
            <tr>
              <th>Date</th>
              <th>Status</th>
              <th>Time In</th>
              <th>Time Out</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of paginatedRows">
              <td>{{ r.date | date:'mediumDate' }}</td>
              <td><span class="badge" [ngClass]="getStatusBadgeClass(r.status)">{{ r.status }}</span></td>
              <td>{{ formatTime12h(r.timeIn) }}</td>
              <td>{{ formatTime12h(r.timeOut) }}</td>
            </tr>
          </tbody>
        </table>

        <div class="pagination-bar" *ngIf="monthlyRows.length > 0 && totalPages > 1">
          <span class="pagination-info">Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ endIndex }} of {{ monthlyRows.length }}</span>
          <div class="pagination-controls">
            <button type="button" class="page-btn" (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 1">
              <i class="fa fa-chevron-left"></i>
            </button>
            <button type="button" class="page-btn" (click)="goToPage(currentPage + 1)" [disabled]="currentPage === totalPages">
              <i class="fa fa-chevron-right"></i>
            </button>
          </div>
        </div>

        <div class="empty-state" *ngIf="monthlyRows.length === 0">
          <i class="fa fa-inbox"></i>
          <p>No staff attendance data for {{ getMonthName(selectedMonth) }}/{{ selectedYear }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 1.5rem; max-width: 800px; margin: 0 auto; }
    .page-header-card { background: #fff; border-radius: 16px; padding: 1.75rem 2rem; margin-bottom: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .back-link { display: inline-flex; align-items: center; gap: 0.35rem; color: #6a8cad; font-size: 0.875rem; margin-bottom: 0.5rem; text-decoration: none; }
    .back-link:hover { color: #1e3a5f; }
    .page-header-card h2 { margin: 0 0 0.25rem 0; font-size: 1.5rem; font-weight: 700; color: #0f2744; }
    .page-subtitle { margin: 0; color: #6a8cad; font-size: 0.9375rem; }
    .content-card { background: #fff; border-radius: 16px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th, .data-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
    .data-table th { background: #f7f9fc; font-size: 0.8125rem; color: #6a8cad; font-weight: 600; }
    .badge { padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.8125rem; font-weight: 600; }
    .badge-pp { background: #d1fae5; color: #059669; }
    .badge-po { background: #dbeafe; color: #2563eb; }
    .badge-absent { background: #fee2e2; color: #dc2626; }
    .badge-not-marked { background: #fef3c7; color: #92400e; }
    .filter-row { display: flex; gap: 0.75rem; margin-bottom: 1rem; align-items: center; }
    .form-select { padding: 0.5rem 0.75rem; border: 2px solid #d9e2ec; border-radius: 8px; background: #fff; }
    .summary-row { display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap; }
    .s-item { flex: 1; min-width: 110px; padding: 1rem; background: #f7f9fc; border-radius: 12px; text-align: center; }
    .s-item .val { display: block; font-size: 1.25rem; font-weight: 700; color: #0f2744; }
    .s-item .lbl { font-size: 0.75rem; color: #6a8cad; }
    .s-item.present .val { color: #059669; }
    .s-item.absent .val { color: #dc2626; }
    .s-item.not-marked .val { color: #92400e; }
    .monthly-calendar { margin-bottom: 1.5rem; padding: 1rem; background: #fafbfc; border-radius: 12px; border: 1px solid #e2e8f0; }
    .monthly-calendar h4 { margin: 0 0 0.75rem 0; font-size: 0.9375rem; color: #0f2744; }
    .calendar-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; margin-bottom: 0.5rem; text-align: center; font-size: 0.7rem; color: #6a8cad; font-weight: 600; }
    .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
    .cal-cell {
      aspect-ratio: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      border-radius: 6px;
      min-height: 32px;
      padding: 4px;
    }
    .cal-cell.empty { background: transparent; }
    .cal-cell.present { background: #d1fae5; color: #059669; }
    .cal-cell.absent { background: #fee2e2; color: #dc2626; }
    .cal-cell.not-marked { background: #fef3c7; color: #92400e; }
    .day-num { font-weight: 700; }
    .day-status { font-size: 0.6rem; font-weight: 700; line-height: 1.1; margin-top: 3px; }
    .calendar-legend { display: flex; gap: 1rem; margin-top: 0.75rem; font-size: 0.75rem; color: #6a8cad; flex-wrap: wrap; }
    .leg { display: flex; align-items: center; gap: 0.35rem; }
    .dot { width: 10px; height: 10px; border-radius: 3px; }
    .dot.present { background: #059669; }
    .dot.absent { background: #dc2626; }
    .dot.not-marked { background: #92400e; }
    .history-title { margin: 1rem 0 0.75rem 0; font-size: 0.9375rem; color: #0f2744; }
    .pagination-bar {
      display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem;
      border-top: 1px solid #e2e8f0; background: #fafbfc; flex-wrap: wrap; gap: 1rem;
    }
    .pagination-info { font-size: 0.875rem; color: #6a8cad; }
    .pagination-controls { display: flex; gap: 0.5rem; }
    .page-btn {
      padding: 0.4rem 0.75rem; border: 2px solid #e2e8f0; background: #fff; border-radius: 8px;
      cursor: pointer; font-size: 0.875rem; color: #1e3a5f;
    }
    .page-btn:hover:not(:disabled) { border-color: #1e3a5f; background: #f7f9fc; }
    .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .empty-state { text-align: center; padding: 2.5rem 1rem; color: #9ca3af; }
    .empty-state i { font-size: 3rem; margin-bottom: 0.5rem; display: block; }
  `]
})
export class AdminAttendanceStaffHistoryComponent implements OnInit {
  formatTime12h = formatTime12h;
  staffName = '';
  rows: { date: string; status: string; timeIn: string; timeOut: string }[] = [];
  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();
  monthOptions: { value: number; label: string }[] = [
    { value: 1, label: 'Jan' }, { value: 2, label: 'Feb' }, { value: 3, label: 'Mar' },
    { value: 4, label: 'Apr' }, { value: 5, label: 'May' }, { value: 6, label: 'Jun' },
    { value: 7, label: 'Jul' }, { value: 8, label: 'Aug' }, { value: 9, label: 'Sep' },
    { value: 10, label: 'Oct' }, { value: 11, label: 'Nov' }, { value: 12, label: 'Dec' }
  ];
  yearOptions: number[] = [this.selectedYear, this.selectedYear - 1, this.selectedYear - 2];
  readonly weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  pageSize = 15;
  currentPage = 1;

  private parseYMD(dateStr: string): { year: number; month: number; day: number } {
    const [y, m, d] = dateStr.split('-').map(n => Number(n));
    return { year: y, month: m, day: d };
  }

  onMonthYearChange(): void {
    this.currentPage = 1;
  }

  get monthlyRows(): { date: string; status: string; timeIn: string; timeOut: string }[] {
    const m = this.selectedMonth;
    const y = this.selectedYear;
    return this.rows.filter(r => {
      const parts = this.parseYMD(r.date);
      return parts.year === y && parts.month === m;
    });
  }

  get presentCount(): number {
    return this.monthlyRows.filter(r => r.status === 'PP' || r.status === 'PO').length;
  }

  get absentCount(): number {
    return this.monthlyRows.filter(r => r.status === 'A').length;
  }

  get notMarkedCount(): number {
    return this.monthlyRows.filter(r => r.status === 'Not Marked').length;
  }

  get totalPages(): number {
    return Math.ceil(this.monthlyRows.length / this.pageSize) || 1;
  }

  get paginatedRows(): { date: string; status: string; timeIn: string; timeOut: string }[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.monthlyRows.slice(start, start + this.pageSize);
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.monthlyRows.length);
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
  }

  getMonthName(m: number): string {
    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m - 1] || '';
  }

  get calendarCells(): { day?: number; status?: string }[] {
    const first = new Date(this.selectedYear, this.selectedMonth - 1, 1);
    const last = new Date(this.selectedYear, this.selectedMonth, 0);
    const startPad = first.getDay(); // Sun=0
    const daysInMonth = last.getDate();

    const statusByDay = new Map<number, string>();
    this.monthlyRows.forEach(r => {
      const parts = this.parseYMD(r.date);
      statusByDay.set(parts.day, r.status);
    });

    const cells: { day?: number; status?: string }[] = [];
    for (let i = 0; i < startPad; i++) cells.push({});
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, status: statusByDay.get(d) });
    }
    return cells;
  }

  private names: Record<number, string> = {
    1: 'John Smith', 2: 'Jane Doe', 3: 'Robert Johnson', 4: 'Sarah Williams', 5: 'Michael Brown'
  };

  getStatusBadgeClass(status: string): string {
    // Keep the look consistent with other history UIs.
    if (status === 'PP') return 'badge-pp';
    if (status === 'PO') return 'badge-po';
    if (status === 'A') return 'badge-absent';
    if (status === 'Not Marked') return 'badge-not-marked';
    return 'badge-not-marked';
  }

  constructor(private route: ActivatedRoute, private attendanceService: AttendanceService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.currentPage = 1;
      this.staffName = this.names[+id] ?? `Staff ${id}`;
      const staffId = +id;
      this.attendanceService.getAdminStaffAttendanceHistory(staffId).subscribe({
        next: (data) => { this.rows = data; this.currentPage = 1; },
        error: () => { this.rows = []; this.currentPage = 1; }
      });
    }
  }
}
