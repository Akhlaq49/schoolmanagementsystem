import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../../../core/services/student.service';
import { AttendanceService } from '../../../../core/services/attendance.service';
import { Student } from '../../../../core/models/student.model';
import { Attendance } from '../../../../core/models/attendance.model';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';

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
            <p class="page-subtitle" *ngIf="student">{{ student.name }} — {{ className }}</p>
          </div>
        </div>
      </div>
      <div class="content-card" *ngIf="student && reportData.length > 0">
        <div class="summary-row">
          <div class="s-item"><span class="val">{{ totalDays }}</span><span class="lbl">Total</span></div>
          <div class="s-item present"><span class="val">{{ presentCount }}</span><span class="lbl">Present</span></div>
          <div class="s-item absent"><span class="val">{{ absentCount }}</span><span class="lbl">Absent</span></div>
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
            <tr *ngFor="let r of paginatedReportData">
              <td>{{ r.date | date:'mediumDate' }}</td>
              <td><span class="badge" [ngClass]="'badge-' + getStatusKey(r.status)">{{ getStatusLabel(r.status) }}</span></td>
              <td>{{ r.timeIn || '—' }}</td>
              <td>{{ r.timeOut || '—' }}</td>
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
      <div class="empty-state" *ngIf="!loading && (!student || reportData.length === 0)">
        <i class="fa fa-inbox"></i>
        <p>No attendance data for this student</p>
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
    .s-item .lbl { font-size: 0.75rem; color: #6a8cad; }
    .filter-row { display: flex; gap: 0.75rem; margin-bottom: 1rem; }
    .form-select { padding: 0.5rem 0.75rem; border: 2px solid #d9e2ec; border-radius: 8px; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th, .data-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
    .data-table th { background: #f7f9fc; font-size: 0.8125rem; color: #6a8cad; font-weight: 600; }
    .badge { padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.8125rem; font-weight: 600; }
    .badge-pp { background: #d1fae5; color: #059669; }
    .badge-po { background: #dbeafe; color: #2563eb; }
    .badge-absent { background: #fee2e2; color: #dc2626; }
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
  student: Student | null = null;
  reportData: Attendance[] = [];
  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();
  loading = false;
  monthOptions: { value: number; label: string }[] = [];
  yearOptions: number[] = [];
  readonly uiDemoMode = true;
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
      this.studentService.getStudentById(+id).subscribe({
        next: (s) => { this.student = s; this.loadReport(); },
        error: () => {
          if (this.uiDemoMode) {
            this.student = this.mockStudent(+id);
            this.reportData = this.getMockReport();
          }
          this.loading = false;
        }
      });
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
      class: { classId: 1, name: 'Grade 10' } as any,
      section: { sectionId: 1, name: 'A' } as any
    } as Student;
  }

  loadReport(): void {
    if (!this.student) return;
    this.currentPage = 1;
    const studentId = (this.student as any).studentId ?? 0;
    this.loading = true;
    this.attendanceService.getAttendanceReport(studentId, this.selectedMonth, this.selectedYear).subscribe({
      next: (list) => {
        this.reportData = list.length > 0 ? list : (this.uiDemoMode ? this.getMockReport() : []);
        this.loading = false;
      },
      error: () => {
        if (this.uiDemoMode) this.reportData = this.getMockReport();
        this.loading = false;
      }
    });
  }

  private getMockReport(): Attendance[] {
    const base = new Date(this.selectedYear, this.selectedMonth - 1, 1);
    const statuses = [1, 2, 3, 4, 1];
    return [1, 3, 5, 7, 10].map((d, i) => ({
      attendanceId: i + 1,
      studentId: this.student?.studentId ?? 0,
      date: new Date(base.getFullYear(), base.getMonth(), d).toISOString(),
      status: statuses[i],
      timeIn: statuses[i] <= 2 ? '08:15' : undefined,
      timeOut: statuses[i] === 1 ? '14:00' : undefined
    })) as Attendance[];
  }

  getStatusLabel(s: number): string {
    const m: Record<number, string> = { 0: '—', 1: 'PP', 2: 'PO', 3: 'A', 4: 'SL', 5: 'FL', 6: 'H', 7: 'Late' };
    return m[s] ?? '?';
  }

  getStatusKey(s: number): string {
    if (s === 1 || s === 7) return 'pp';
    if (s === 2) return 'po';
    if (s === 3) return 'absent';
    return 'absent';
  }
}
