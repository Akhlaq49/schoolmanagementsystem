import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../../../core/services/student.service';
import { AttendanceService } from '../../../../core/services/attendance.service';
import { Student } from '../../../../core/models/student.model';
import { Attendance } from '../../../../core/models/attendance.model';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { formatTime12h } from '../../../../shared/utils/time.utils';

@Component({
  selector: 'app-admin-attendance-student',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LoadingComponent],
  template: `
    <div class="page-container">
      <app-loading [show]="loading" [message]="'Loading...'"></app-loading>
      <div class="page-header-card">
        <div class="header-content">
          <div>
            <a routerLink="/admin/attendance/class" class="back-link">
              <i class="fa fa-arrow-left"></i> Back to Class Attendance
            </a>
            <h2><i class="fa fa-user"></i> Student Attendance History</h2>
            <p class="page-subtitle" *ngIf="student">{{ student.name }} — {{ student.roll }} — {{ className }}</p>
          </div>
        </div>
      </div>
      <div class="content-card" *ngIf="student">
        <div class="summary-row">
          <div class="s-item"><span class="val">{{ totalDays }}</span><span class="lbl">Total</span></div>
          <div class="s-item present"><span class="val">{{ presentCount }}</span><span class="lbl">Present</span></div>
          <div class="s-item absent"><span class="val">{{ absentCount }}</span><span class="lbl">Absent</span></div>
          <div class="s-item leave"><span class="val">{{ leaveCount }}</span><span class="lbl">Leave</span></div>
          <div class="s-item"><span class="val">{{ attendancePercent }}%</span><span class="lbl">Attendance</span></div>
        </div>
        <div class="filter-row">
          <select [(ngModel)]="selectedMonth" (ngModelChange)="loadReport()" class="form-select">
            <option *ngFor="let m of monthOptions" [value]="m.value">{{ m.label }}</option>
          </select>
          <select [(ngModel)]="selectedYear" (ngModelChange)="loadReport()" class="form-select">
            <option *ngFor="let y of yearOptions" [value]="y">{{ y }}</option>
          </select>
        </div>
        <div class="monthly-calendar" *ngIf="reportData.length > 0">
          <h4>Monthly calendar — {{ getMonthName(selectedMonth) }} {{ selectedYear }}</h4>
          <div class="calendar-weekdays">
            <span *ngFor="let d of weekdayLabels">{{ d }}</span>
          </div>
          <div class="calendar-grid">
            <div *ngFor="let cell of calendarCells" class="cal-cell"
              [class.empty]="!cell.date"
              [class.present]="cell.status === 1 || cell.status === 2 || cell.status === 7"
              [class.absent]="cell.status === 3"
              [class.leave]="cell.status === 4 || cell.status === 5"
              [class.holiday]="cell.status === 6">
              <span class="day-num">{{ cell.day }}</span>
              <span class="day-status" *ngIf="cell.status !== undefined && cell.status !== 6">{{ getStatusLabel(cell.status) }}</span>
            </div>
          </div>
          <div class="calendar-legend">
            <span class="leg"><span class="dot present"></span> PP/PO</span>
            <span class="leg"><span class="dot absent"></span> Absent</span>
            <span class="leg"><span class="dot leave"></span> Leave</span>
            <span class="leg"><span class="dot holiday"></span> Holiday</span>
          </div>
        </div>
        <h4 class="history-title">History</h4>
        <table class="data-table" *ngIf="reportData.length > 0">
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
              <td><span class="badge" [ngClass]="'badge-' + getStatusKey(r.status)">{{ getStatusLabel(r.status) }}</span></td>
              <td>{{ formatTime12h(r.timeIn) }}</td>
              <td>{{ formatTime12h(r.timeOut) }}</td>
              <td>{{ r.remarks || '—' }}</td>
            </tr>
          </tbody>
        </table>
        <div class="pagination-bar" *ngIf="totalPages > 1">
          <span class="pagination-info">Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ endIndex }} of {{ reportData.length }}</span>
          <div class="pagination-controls">
            <button type="button" class="page-btn" (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 1">
              <i class="fa fa-chevron-left"></i>
            </button>
            <button type="button" class="page-btn" (click)="goToPage(currentPage + 1)" [disabled]="currentPage === totalPages">
              <i class="fa fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
      <div class="empty-state" *ngIf="!loading && student && reportData.length === 0">
        <i class="fa fa-inbox"></i>
        <p>No attendance data for {{ selectedMonth }}/{{ selectedYear }}</p>
      </div>
      <div class="empty-state" *ngIf="!loading && !student">
        <i class="fa fa-user-times"></i>
        <p>Student not found</p>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 1.5rem; max-width: 900px; margin: 0 auto; }
    .page-header-card { background: #fff; border-radius: 16px; padding: 1.75rem 2rem; margin-bottom: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .back-link { display: inline-flex; align-items: center; gap: 0.35rem; color: #6a8cad; font-size: 0.875rem; margin-bottom: 0.5rem; text-decoration: none; }
    .back-link:hover { color: #1e3a5f; }
    .page-header-card h2 { margin: 0 0 0.25rem 0; font-size: 1.5rem; font-weight: 700; color: #0f2744; }
    .page-subtitle { margin: 0; color: #6a8cad; font-size: 0.9375rem; }
    .content-card { background: #fff; border-radius: 16px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .summary-row { display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap; }
    .s-item { flex: 1; min-width: 80px; padding: 1rem; background: #f7f9fc; border-radius: 12px; text-align: center; }
    .s-item .val { display: block; font-size: 1.25rem; font-weight: 700; color: #0f2744; }
    .s-item.present .val { color: #059669; }
    .s-item.absent .val { color: #dc2626; }
    .s-item.leave .val { color: #2563eb; }
    .s-item .lbl { font-size: 0.75rem; color: #6a8cad; }
    .filter-row { display: flex; gap: 0.75rem; margin-bottom: 1rem; }
    .form-select { padding: 0.5rem 0.75rem; border: 2px solid #d9e2ec; border-radius: 8px; }
    .monthly-calendar { margin-bottom: 1.5rem; padding: 1rem; background: #fafbfc; border-radius: 12px; border: 1px solid #e2e8f0; }
    .monthly-calendar h4 { margin: 0 0 0.75rem 0; font-size: 0.9375rem; color: #0f2744; }
    .calendar-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; margin-bottom: 0.5rem; text-align: center; font-size: 0.7rem; color: #6a8cad; font-weight: 600; }
    .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
    .cal-cell {
      aspect-ratio: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
      font-size: 0.75rem; border-radius: 6px; min-height: 32px;
    }
    .cal-cell.empty { background: transparent; }
    .cal-cell:not(.empty) { background: #e2e8f0; color: #6b7280; }
    .cal-cell.present { background: #d1fae5; color: #059669; }
    .cal-cell.absent { background: #fee2e2; color: #dc2626; }
    .cal-cell.leave { background: #dbeafe; color: #2563eb; }
    .cal-cell.holiday { background: #e5e7eb; color: #9ca3af; }
    .day-num { font-weight: 600; }
    .day-status { font-size: 0.6rem; }
    .calendar-legend { display: flex; gap: 1rem; margin-top: 0.75rem; font-size: 0.75rem; color: #6a8cad; flex-wrap: wrap; }
    .leg { display: flex; align-items: center; gap: 0.35rem; }
    .dot { width: 10px; height: 10px; border-radius: 3px; }
    .dot.present { background: #059669; }
    .dot.absent { background: #dc2626; }
    .dot.leave { background: #2563eb; }
    .dot.holiday { background: #9ca3af; }
    .history-title { margin: 1rem 0 0.75rem 0; font-size: 0.9375rem; color: #0f2744; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th, .data-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
    .data-table th { background: #f7f9fc; font-size: 0.8125rem; color: #6a8cad; font-weight: 600; }
    .badge { padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.8125rem; font-weight: 600; }
    .badge-pp { background: #d1fae5; color: #059669; }
    .badge-po { background: #dbeafe; color: #2563eb; }
    .badge-absent { background: #fee2e2; color: #dc2626; }
    .badge-sl { background: #fef3c7; color: #d97706; }
    .badge-fl { background: #ede9fe; color: #7c3aed; }
    .empty-state { text-align: center; padding: 3rem; color: #9ca3af; }
    .empty-state i { font-size: 3rem; margin-bottom: 0.5rem; display: block; }
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
  `]
})
export class AdminAttendanceStudentComponent implements OnInit {
  formatTime12h = formatTime12h;
  student: Student | null = null;
  reportData: Attendance[] = [];
  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();
  loading = false;
  monthOptions: { value: number; label: string }[] = [];
  yearOptions: number[] = [];
  pageSize = 15;
  currentPage = 1;

  get totalPages(): number {
    return Math.ceil(this.reportData.length / this.pageSize) || 1;
  }

  get paginatedReportData(): Attendance[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.reportData.slice(start, start + this.pageSize);
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.reportData.length);
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
  }

  readonly weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  get calendarCells(): { day?: number; date?: Date; status?: number }[] {
    const first = new Date(this.selectedYear, this.selectedMonth - 1, 1);
    const last = new Date(this.selectedYear, this.selectedMonth, 0);
    const startPad = first.getDay();
    const daysInMonth = last.getDate();
    const dateMap = new Map<number, number>();
    this.reportData.forEach(r => {
      const d = new Date(r.date);
      if (d.getMonth() === this.selectedMonth - 1 && d.getFullYear() === this.selectedYear) {
        dateMap.set(d.getDate(), r.status);
      }
    });
    const cells: { day?: number; date?: Date; status?: number }[] = [];
    for (let i = 0; i < startPad; i++) cells.push({});
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, date: new Date(this.selectedYear, this.selectedMonth - 1, d), status: dateMap.get(d) });
    }
    return cells;
  }

  getMonthName(m: number): string {
    return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m - 1] || '';
  }

  constructor(
    private route: ActivatedRoute,
    private studentService: StudentService,
    private attendanceService: AttendanceService
  ) {}

  get className(): string {
    const c = this.student?.class?.name ?? '';
    const s = this.student?.section?.name ?? '';
    return s ? `${c} - ${s}` : c || '—';
  }

  get totalDays(): number {
    return this.reportData.filter(r => r.status !== 6).length;
  }

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
    const w = this.totalDays;
    const p = this.presentCount + this.reportData.filter(r => r.status === 4 || r.status === 5).length;
    return w > 0 ? Math.round((p / w) * 100) : 0;
  }

  ngOnInit(): void {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    this.monthOptions = months.map((l, i) => ({ value: i + 1, label: l }));
    this.yearOptions = [new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2];
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loading = true;
      this.studentService.getStudentByStudentId(+id).subscribe({
        next: (s) => { this.student = s; this.loadReport(); },
        error: () => { this.loading = false; }
      });
    }
  }

  loadReport(): void {
    if (!this.student) return;
    this.currentPage = 1;
    const studentId = (this.student as any).studentId ?? 0;
    this.loading = true;
    this.attendanceService.getAttendanceReport(studentId, this.selectedMonth, this.selectedYear).subscribe({
      next: (list) => {
        this.reportData = list;
        this.loading = false;
      },
      error: () => { this.reportData = []; this.loading = false; }
    });
  }

  getStatusLabel(s: number): string {
    const m: Record<number, string> = { 0: '—', 1: 'PP', 2: 'PO', 3: 'A', 4: 'SL', 5: 'FL', 6: 'H', 7: 'Late' };
    return m[s] ?? '?';
  }

  getStatusKey(s: number): string {
    if (s === 1 || s === 7) return 'pp';
    if (s === 2) return 'po';
    if (s === 3) return 'absent';
    if (s === 4) return 'sl';
    if (s === 5) return 'fl';
    if (s === 6) return 'holiday';
    return 'absent';
  }
}
