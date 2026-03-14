import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { TeacherService } from '../../../../core/services/teacher.service';
import { Teacher } from '../../../../core/models/teacher.model';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-attendance-month',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LoadingComponent],
  template: `
    <div class="page-container">
      <app-loading [show]="loading" [message]="'Loading...'"></app-loading>

      <div class="page-header-card">
        <div class="header-content">
          <div>
            <a routerLink="/teacher/attendance/self" class="back-link">
              <i class="fa fa-arrow-left"></i> Back to Self
            </a>
            <h2><i class="fa fa-calendar"></i> This Month</h2>
            <p class="page-subtitle">Your attendance for {{ monthLabel }} {{ selectedYear }}</p>
          </div>
          <div class="month-nav">
            <button class="btn btn-sm" (click)="prevMonth()"><i class="fa fa-chevron-left"></i></button>
            <span class="month-label">{{ monthLabel }} {{ selectedYear }}</span>
            <button class="btn btn-sm" (click)="nextMonth()"><i class="fa fa-chevron-right"></i></button>
          </div>
        </div>
      </div>

      <div class="content-card" *ngIf="teacher">
        <div class="summary-row">
          <div class="summary-item">
            <span class="value">{{ presentCount }}</span>
            <span class="label">Present</span>
          </div>
          <div class="summary-item">
            <span class="value">{{ absentCount }}</span>
            <span class="label">Absent</span>
          </div>
          <div class="summary-item">
            <span class="value">{{ leaveCount }}</span>
            <span class="label">Leave</span>
          </div>
        </div>
        <div class="calendar-grid">
          <div class="cal-header">
            <span *ngFor="let d of dayHeaders">{{ d }}</span>
          </div>
          <div class="cal-body">
            <div *ngFor="let cell of calendarCells" class="cal-cell" [class.empty]="!cell.day" [ngClass]="cell.statusClass">
              {{ cell.day || '' }}
            </div>
          </div>
        </div>
        <div class="legend">
          <span class="leg pp">PP</span>
          <span class="leg po">PO</span>
          <span class="leg a">A</span>
          <span class="leg leave">SL/FL</span>
          <span class="leg h">H</span>
        </div>
        <!-- <div class="quick-nav">
          <h4>Quick Navigation</h4>
          <div class="nav-links">
            <a routerLink="/teacher/attendance/self" class="nav-link"><i class="fa fa-user-circle"></i> My Attendance</a>
            <a routerLink="/teacher/attendance/month" routerLinkActive="active" class="nav-link"><i class="fa fa-calendar"></i> This Month</a>
            <a routerLink="/teacher/attendance/class" class="nav-link"><i class="fa fa-users"></i> Class Attendance</a>
            <a routerLink="/teacher/attendance/leave" class="nav-link"><i class="fa fa-calendar-plus-o"></i> Leave</a>
          </div>
        </div> -->
      </div>
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
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      color: #6a8cad;
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
      text-decoration: none;
    }
    .back-link:hover { color: #1e3a5f; }
    .header-content { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
    .page-header-card h2 {
      margin: 0 0 0.25rem 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: #0f2744;
    }
    .page-subtitle { margin: 0; color: #6a8cad; font-size: 0.9375rem; }
    .month-nav { display: flex; align-items: center; gap: 0.75rem; }
    .month-label { font-weight: 600; color: #0f2744; min-width: 140px; text-align: center; }
    .btn { padding: 0.5rem; border: 2px solid #e2e8f0; background: #fff; border-radius: 8px; cursor: pointer; }
    .btn:hover { border-color: #1e3a5f; color: #1e3a5f; }
    .content-card {
      background: #fff;
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    .summary-row { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
    .summary-item {
      flex: 1;
      padding: 1rem;
      background: #f7f9fc;
      border-radius: 12px;
      text-align: center;
    }
    .summary-item .value { font-size: 1.5rem; font-weight: 700; color: #1e3a5f; display: block; }
    .summary-item .label { font-size: 0.8125rem; color: #6a8cad; }
    .calendar-grid { margin-bottom: 1rem; }
    .cal-header {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 0.25rem;
      margin-bottom: 0.5rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: #6a8cad;
      text-align: center;
    }
    .cal-body {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 0.25rem;
    }
    .cal-cell {
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      font-weight: 500;
      border-radius: 8px;
      min-height: 36px;
    }
    .cal-cell.empty { background: transparent; }
    .cal-cell.pp { background: #d1fae5; color: #059669; }
    .cal-cell.po { background: #dbeafe; color: #2563eb; }
    .cal-cell.a { background: #fee2e2; color: #dc2626; }
    .cal-cell.leave { background: #ede9fe; color: #7c3aed; }
    .cal-cell.h { background: #f3f4f6; color: #6b7280; }
    .cal-cell:not(.empty):not(.pp):not(.po):not(.a):not(.leave):not(.h) { background: #f7f9fc; color: #6a8cad; }
    .legend { display: flex; gap: 1rem; flex-wrap: wrap; font-size: 0.75rem; font-weight: 600; }
    .leg { padding: 0.25rem 0.6rem; border-radius: 6px; }
    .leg.pp { background: #d1fae5; color: #059669; }
    .leg.po { background: #dbeafe; color: #2563eb; }
    .leg.a { background: #fee2e2; color: #dc2626; }
    .leg.leave { background: #ede9fe; color: #7c3aed; }
    .leg.h { background: #f3f4f6; color: #6b7280; }
    .quick-nav { margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #e2e8f0; }
    .quick-nav h4 { margin: 0 0 1rem 0; font-size: 0.9375rem; color: #6a8cad; font-weight: 600; }
    .nav-links { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .nav-link { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: #f7f9fc; border: 2px solid #e2e8f0; border-radius: 10px; color: #1e3a5f; font-weight: 500; font-size: 0.9375rem; text-decoration: none; transition: all 0.2s; }
    .nav-link:hover { border-color: #1e3a5f; background: #f0f7ff; }
    .nav-link.active { background: #1e3a5f; color: #fff; border-color: #1e3a5f; }
  `]
})
export class AttendanceMonthComponent implements OnInit {
  teacher: Teacher | null = null;
  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();
  loading = false;
  monthData: { [day: number]: number } = {};
  dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  get monthLabel(): string {
    const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return m[this.selectedMonth - 1] ?? '';
  }

  get calendarCells(): { day: number | null; statusClass: string }[] {
    const cells: { day: number | null; statusClass: string }[] = [];
    const first = new Date(this.selectedYear, this.selectedMonth - 1, 1);
    const last = new Date(this.selectedYear, this.selectedMonth, 0);
    const startPad = first.getDay();
    for (let i = 0; i < startPad; i++) cells.push({ day: null, statusClass: '' });
    for (let d = 1; d <= last.getDate(); d++) {
      const status = this.monthData[d] ?? 0;
      let cls = '';
      if (status === 1 || status === 7) cls = 'pp';
      else if (status === 2) cls = 'po';
      else if (status === 3) cls = 'a';
      else if (status === 4 || status === 5) cls = 'leave';
      else if (status === 6) cls = 'h';
      cells.push({ day: d, statusClass: cls });
    }
    return cells;
  }

  get presentCount(): number {
    return Object.values(this.monthData).filter(s => s === 1 || s === 2 || s === 7).length;
  }

  get absentCount(): number {
    return Object.values(this.monthData).filter(s => s === 3).length;
  }

  get leaveCount(): number {
    return Object.values(this.monthData).filter(s => s === 4 || s === 5).length;
  }

  constructor(
    private auth: AuthService,
    private teacherService: TeacherService
  ) {}

  readonly uiDemoMode = true;

  ngOnInit(): void {
    const userId = this.auth.getUserId();
    if (this.uiDemoMode && !userId) {
      this.teacher = { teacherId: 1, name: 'Demo Teacher', department: { departmentId: 1, name: 'Mathematics' } } as Teacher;
      this.applyMockMonthData();
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
        // TODO: Load month data from API
        if (this.uiDemoMode && Object.keys(this.monthData).length === 0) {
          this.applyMockMonthData();
        }
        this.loading = false;
      },
      error: () => {
        if (this.uiDemoMode) {
          this.teacher = { teacherId: 1, name: 'Demo Teacher', department: { departmentId: 1, name: 'Mathematics' } } as Teacher;
          this.applyMockMonthData();
        }
        this.loading = false;
      }
    });
  }

  /** Mock 5 sample days: PP(1), PO(2), Not Marked(0), Leave(4), Absent(3) */
  private applyMockMonthData(): void {
    const today = new Date().getDate();
    const days = [1, 5, 10, 15, 20];
    const statuses = [1, 2, 0, 4, 3]; // PP, PO, Not Marked, SL, Absent
    for (let i = 0; i < 5; i++) {
      const d = days[i] <= 31 ? days[i] : days[i] % 28;
      this.monthData[d] = statuses[i];
    }
  }

  prevMonth(): void {
    if (this.selectedMonth === 1) {
      this.selectedMonth = 12;
      this.selectedYear--;
    } else {
      this.selectedMonth--;
    }
  }

  nextMonth(): void {
    if (this.selectedMonth === 12) {
      this.selectedMonth = 1;
      this.selectedYear++;
    } else {
      this.selectedMonth++;
    }
  }
}
