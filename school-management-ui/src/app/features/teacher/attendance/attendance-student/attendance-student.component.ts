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
  selector: 'app-attendance-student',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LoadingComponent],
  template: `
    <div class="page-container">
      <app-loading [show]="loading" [message]="'Loading...'"></app-loading>

      <div class="page-header-card">
        <div class="header-content">
          <div>
            <a routerLink="/teacher/attendance/class" class="back-link">
              <i class="fa fa-arrow-left"></i> Back to Class
            </a>
            <h2><i class="fa fa-user"></i> Student Attendance</h2>
            <p class="page-subtitle" *ngIf="student">{{ student.name }} — {{ className }}</p>
          </div>
        </div>
        <!-- <div class="quick-nav">
          <a routerLink="/teacher/attendance/self" class="nav-link"><i class="fa fa-user-circle"></i> My Attendance</a>
          <a routerLink="/teacher/attendance/month" class="nav-link"><i class="fa fa-calendar"></i> This Month</a>
          <a routerLink="/teacher/attendance/class" class="nav-link"><i class="fa fa-users"></i> Class Attendance</a>
          <a routerLink="/teacher/attendance/leave" class="nav-link"><i class="fa fa-calendar-plus-o"></i> Leave</a>
        </div> -->
      </div>

      <div class="summary-cards" *ngIf="student && reportData.length > 0">
        <div class="summary-card">
          <span class="value">{{ totalDays }}</span>
          <span class="label">Total Days</span>
        </div>
        <div class="summary-card present">
          <span class="value">{{ presentCount }}</span>
          <span class="label">Present</span>
        </div>
        <div class="summary-card absent">
          <span class="value">{{ absentCount }}</span>
          <span class="label">Absent</span>
        </div>
        <div class="summary-card leave">
          <span class="value">{{ leaveCount }}</span>
          <span class="label">Leave</span>
        </div>
        <div class="summary-card percent">
          <span class="value">{{ attendancePercent }}%</span>
          <span class="label">Attendance</span>
        </div>
      </div>

      <div class="filters-card">
        <div class="filter-row">
          <div class="filter-group">
            <label>Month</label>
            <select [(ngModel)]="selectedMonth" (ngModelChange)="loadReport()" class="form-select">
              <option *ngFor="let m of monthOptions" [value]="m.value">{{ m.label }}</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Year</label>
            <select [(ngModel)]="selectedYear" (ngModelChange)="loadReport()" class="form-select">
              <option *ngFor="let y of yearOptions" [value]="y">{{ y }}</option>
            </select>
          </div>
        </div>
      </div>

      <div class="content-card">
        <h3>Attendance History</h3>
        <div class="calendar-legend">
          <span class="leg pp">PP</span>
          <span class="leg po">PO</span>
          <span class="leg a">A</span>
          <span class="leg sl">SL</span>
          <span class="leg fl">FL</span>
          <span class="leg h">H</span>
        </div>
        <div class="table-wrap" *ngIf="reportData.length > 0">
          <table class="data-table">
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
              <tr *ngFor="let r of paginatedData">
                <td>{{ r.date | date:'mediumDate' }}</td>
                <td><span class="status-badge" [ngClass]="'badge-' + getStatusKey(r.status)">{{ getStatusLabel(r.status) }}</span></td>
                <td>{{ formatTime12h(r.timeIn) }}</td>
                <td>{{ formatTime12h(r.timeOut) }}</td>
                <td>{{ r.remarks || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pagination-bar" *ngIf="reportData.length > 0 && totalPages > 1">
          <span class="pagination-info">Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ endIndex }} of {{ reportData.length }}</span>
          <div class="pagination-controls">
            <button class="page-btn" (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 1">
              <i class="fa fa-chevron-left"></i>
            </button>
            <button class="page-btn" (click)="goToPage(currentPage + 1)" [disabled]="currentPage === totalPages">
              <i class="fa fa-chevron-right"></i>
            </button>
          </div>
        </div>
        <div class="empty-state" *ngIf="reportData.length === 0 && !loading">
          <i class="fa fa-inbox"></i>
          <p>No attendance data for this period</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 1.5rem; max-width: 900px; margin: 0 auto; }
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
    .quick-nav { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; }
    .nav-link { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: #f7f9fc; border: 2px solid #e2e8f0; border-radius: 10px; color: #1e3a5f; font-weight: 500; font-size: 0.875rem; text-decoration: none; }
    .nav-link:hover { border-color: #1e3a5f; background: #f0f7ff; }
    .page-header-card h2 {
      margin: 0 0 0.25rem 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: #0f2744;
    }
    .page-header-card h2 i { color: #1e3a5f; }
    .page-subtitle { margin: 0; color: #6a8cad; font-size: 0.9375rem; }
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .summary-card {
      background: #fff;
      border-radius: 14px;
      padding: 1.25rem;
      text-align: center;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }
    .summary-card .value { font-size: 1.5rem; font-weight: 700; color: #0f2744; display: block; }
    .summary-card .label { font-size: 0.8125rem; color: #6a8cad; }
    .summary-card.present .value { color: #059669; }
    .summary-card.absent .value { color: #dc2626; }
    .summary-card.leave .value { color: #7c3aed; }
    .summary-card.percent .value { color: #1e3a5f; }
    .filters-card {
      background: #fff;
      border-radius: 16px;
      padding: 1.25rem 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    .filter-row { display: flex; gap: 1rem; flex-wrap: wrap; }
    .filter-group label { display: block; font-size: 0.8125rem; margin-bottom: 0.35rem; color: #6a8cad; }
    .form-select {
      padding: 0.5rem 0.75rem;
      border: 2px solid #d9e2ec;
      border-radius: 8px;
      font-size: 0.9375rem;
      min-width: 120px;
    }
    .content-card {
      background: #fff;
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    .content-card h3 { margin: 0 0 1rem 0; font-size: 1.125rem; color: #0f2744; }
    .calendar-legend {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 1rem;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .leg { padding: 0.25rem 0.6rem; border-radius: 6px; }
    .leg.pp { background: #d1fae5; color: #059669; }
    .leg.po { background: #dbeafe; color: #2563eb; }
    .leg.a { background: #fee2e2; color: #dc2626; }
    .leg.sl { background: #fed7aa; color: #ea580c; }
    .leg.fl { background: #ede9fe; color: #7c3aed; }
    .leg.h { background: #f3f4f6; color: #6b7280; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th, .data-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
    .data-table th { background: #f7f9fc; font-size: 0.8125rem; color: #6a8cad; font-weight: 600; }
    .status-badge { padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.8125rem; font-weight: 600; }
    .badge-pp { background: #d1fae5; color: #059669; }
    .badge-po { background: #dbeafe; color: #2563eb; }
    .badge-absent { background: #fee2e2; color: #dc2626; }
    .badge-sl, .badge-fl { background: #ede9fe; color: #7c3aed; }
    .badge-holiday { background: #f3f4f6; color: #6b7280; }
    .pagination-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0 0;
      margin-top: 1rem;
      border-top: 1px solid #e2e8f0;
    }
    .pagination-info { font-size: 0.875rem; color: #6a8cad; }
    .page-btn {
      padding: 0.4rem 0.75rem;
      border: 2px solid #e2e8f0;
      background: #fff;
      border-radius: 8px;
      cursor: pointer;
    }
    .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .empty-state { text-align: center; padding: 2rem; color: #9ca3af; }
    .empty-state i { font-size: 2.5rem; margin-bottom: 0.5rem; display: block; }
  `]
})
export class AttendanceStudentComponent implements OnInit {
  formatTime12h = formatTime12h;
  student: Student | null = null;
  reportData: Attendance[] = [];
  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();
  loading = false;
  pageSize = 15;
  currentPage = 1;
  monthOptions: { value: number; label: string }[] = [];
  yearOptions: number[] = [];

  constructor(
    private route: ActivatedRoute,
    private studentService: StudentService,
    private attendanceService: AttendanceService
  ) {}

  get className(): string {
    if (!this.student) return '';
    const c = this.student.class?.name ?? '';
    const s = this.student.section?.name ?? '';
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
    const working = this.totalDays;
    const present = this.presentCount + this.leaveCount;
    return working > 0 ? Math.round((present / working) * 100) : 0;
  }

  get totalPages(): number {
    return Math.ceil(this.reportData.length / this.pageSize) || 1;
  }

  get paginatedData(): Attendance[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.reportData.slice(start, start + this.pageSize);
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.reportData.length);
  }

  readonly uiDemoMode = true;

  ngOnInit(): void {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    this.monthOptions = months.map((l, i) => ({ value: i + 1, label: l }));
    const y = new Date().getFullYear();
    this.yearOptions = [y, y - 1, y - 2];
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.studentService.getStudentById(+id).subscribe({
        next: (s) => {
          this.student = s;
          this.loadReport();
        },
        error: () => {
          if (this.uiDemoMode) {
            this.student = this.mockStudent(+id);
            this.applyMockReport();
          }
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
    }
  }

  private mockStudent(id: number): Student {
    const names: Record<number, string> = { 1: 'Ali Khan', 2: 'Sara Ahmed', 3: 'Hamza Shah', 4: 'Fatima Hassan', 5: 'Omar Riaz' };
    return {
      studentId: id,
      name: names[id] ?? `Student ${id}`,
      roll: `R${100 + id}`,
      classId: 1,
      sectionId: 1,
      password: '',
      loginStatus: 'active',
      class: { classId: 1, name: 'Grade 10', session: '2024-25' } as any,
      section: { sectionId: 1, name: 'A', classId: 1 } as any
    } as Student;
  }

  loadReport(): void {
    if (!this.student) return;
    const studentId = (this.student as any).studentId ?? this.student.userId ?? 0;
    this.loading = true;
    this.attendanceService.getAttendanceReport(studentId, this.selectedMonth, this.selectedYear).subscribe({
      next: (list) => {
        this.reportData = list.length > 0 ? list : (this.uiDemoMode ? this.getMockReport() : []);
        this.currentPage = 1;
        this.loading = false;
      },
      error: () => {
        if (this.uiDemoMode) this.reportData = this.getMockReport();
        this.loading = false;
      }
    });
  }

  private applyMockReport(): void {
    this.reportData = this.getMockReport();
    this.currentPage = 1;
  }

  private getMockReport(): Attendance[] {
    const base = new Date(this.selectedYear, this.selectedMonth - 1, 1);
    const statuses = [1, 2, 3, 4, 1]; // PP, PO, Absent, SL, PP
    return [1, 3, 5, 7, 10].map((d, i) => ({
      attendanceId: i + 1,
      studentId: this.student?.studentId ?? 0,
      date: new Date(base.getFullYear(), base.getMonth(), d).toISOString(),
      status: statuses[i],
      timeIn: statuses[i] <= 2 ? '08:15' : undefined,
      timeOut: statuses[i] === 1 ? '14:00' : undefined
    })) as Attendance[];
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
  }

  getStatusLabel(s: number): string {
    const m: Record<number, string> = { 0: '—', 1: 'PP', 2: 'PO', 3: 'A', 4: 'SL', 5: 'FL', 6: 'H', 7: 'Late' };
    return m[s] ?? '?';
  }

  getStatusKey(s: number): string {
    const m: Record<number, string> = { 1: 'pp', 2: 'po', 3: 'absent', 4: 'sl', 5: 'fl', 6: 'holiday', 7: 'pp' };
    return m[s] ?? 'absent';
  }
}
