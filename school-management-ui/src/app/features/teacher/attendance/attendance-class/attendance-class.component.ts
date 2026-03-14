import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClassService } from '../../../../core/services/class.service';
import { SectionService } from '../../../../core/services/section.service';
import { StudentService } from '../../../../core/services/student.service';
import { AttendanceService } from '../../../../core/services/attendance.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { Class } from '../../../../core/models/student.model';
import { Section } from '../../../../core/models/section.model';
import { Student } from '../../../../core/models/student.model';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { DropdownComponent, DropdownOption } from '../../../../shared/components/dropdown/dropdown.component';

type StatusCode = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface RowData {
  student: Student;
  status: StatusCode;
  timeIn: string;
  timeOut: string;
  remarks: string;
  leaveReason?: string;
}

@Component({
  selector: 'app-attendance-class',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LoadingComponent, DropdownComponent],
  template: `
    <div class="page-container">
      <app-loading [show]="loading" [message]="'Loading...'"></app-loading>

      <div class="page-header-card">
        <div class="header-content">
          <div>
            <h2><i class="fa fa-users"></i> Class Attendance</h2>
            <p class="page-subtitle">Mark attendance for your class</p>
          </div>
        </div>
        <!-- <div class="quick-nav">
          <a routerLink="/teacher/attendance/self" class="nav-link"><i class="fa fa-user-circle"></i> My Attendance</a>
          <a routerLink="/teacher/attendance/month" class="nav-link"><i class="fa fa-calendar"></i> This Month</a>
          <a routerLink="/teacher/attendance/class" routerLinkActive="active" class="nav-link"><i class="fa fa-users"></i> Class Attendance</a>
          <a routerLink="/teacher/attendance/leave" class="nav-link"><i class="fa fa-calendar-plus-o"></i> Leave</a>
        </div> -->
      </div>

      <div class="filters-card">
        <h3>Select Date & Class</h3>
        <div class="filter-row">
          <div class="filter-group">
            <label>Date</label>
            <input type="date" [(ngModel)]="selectedDate" class="form-control">
          </div>
          <div class="filter-group">
            <label>Class</label>
            <app-dropdown
              [(ngModel)]="selectedClassId"
              [options]="classOptions"
              placeholder="Select Class"
              [searchable]="true"
              (changed)="onClassChange()">
            </app-dropdown>
          </div>
          <div class="filter-group">
            <label>Section</label>
            <app-dropdown
              [(ngModel)]="selectedSectionId"
              [options]="sectionOptions"
              placeholder="Select Section"
              [searchable]="false">
            </app-dropdown>
          </div>
          <div class="filter-group filter-actions">
            <button class="btn btn-primary" (click)="loadStudents()" [disabled]="loading || !selectedClassId">
              <i class="fa fa-refresh"></i> Load
            </button>
          </div>
        </div>
        <div class="locked-badge" *ngIf="isLocked">
          <i class="fa fa-lock"></i> Locked — Admin only can edit
        </div>
      </div>

      <div class="table-card" *ngIf="rows.length > 0">
        <div class="table-header">
          <h3>Students ({{ rows.length }})</h3>
          <div class="bulk-actions">
            <button class="btn btn-sm btn-success" (click)="markAllPresent()" [disabled]="isLocked">
              <i class="fa fa-check"></i> Mark All Present
            </button>
            <button class="btn btn-sm btn-danger" (click)="markAllAbsent()" [disabled]="isLocked">
              <i class="fa fa-times"></i> Mark All Absent
            </button>
            <button class="btn btn-primary" (click)="saveAttendance()" [disabled]="saving || isLocked">
              <i class="fa fa-save"></i> Save Attendance
            </button>
          </div>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Roll</th>
                <th>Name</th>
                <th>Status</th>
                <th>Time In</th>
                <th>Time Out</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let r of paginatedRows; let i = index">
                <td>{{ (currentPage - 1) * pageSize + i + 1 }}</td>
                <td>{{ r.student.roll || '—' }}</td>
                <td>
                  <div class="student-cell">
                    <span class="avatar">{{ getInitials(r.student.name) }}</span>
                    <a [routerLink]="['/teacher/attendance/student', r.student.studentId]" class="student-link">{{ r.student.name }}</a>
                  </div>
                </td>
                <td>
                  <div class="status-btns">
                    <button class="status-btn pp" [class.active]="r.status === 1" (click)="setStatus(r, 1)" [disabled]="isLocked" title="PP">PP</button>
                    <button class="status-btn po" [class.active]="r.status === 2" (click)="setStatus(r, 2)" [disabled]="isLocked" title="PO">PO</button>
                    <button class="status-btn a" [class.active]="r.status === 3" (click)="setStatus(r, 3)" [disabled]="isLocked" title="Absent">A</button>
                    <button class="status-btn sl" [class.active]="r.status === 4" (click)="setStatus(r, 4)" [disabled]="isLocked" title="Short Leave">SL</button>
                    <button class="status-btn fl" [class.active]="r.status === 5" (click)="setStatus(r, 5)" [disabled]="isLocked" title="Full Leave">FL</button>
                  </div>
                </td>
                <td>
                  <input type="time" [(ngModel)]="r.timeIn" class="time-input" [disabled]="isLocked || (r.status !== 1 && r.status !== 2)" *ngIf="r.status === 1 || r.status === 2 || r.timeIn">
                </td>
                <td>
                  <input type="time" [(ngModel)]="r.timeOut" class="time-input" [disabled]="isLocked" *ngIf="r.status === 1 || r.status === 2 || r.timeOut">
                </td>
                <td>
                  <input type="text" [(ngModel)]="r.remarks" class="remarks-input" placeholder="Remarks" [disabled]="isLocked">
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pagination-bar" *ngIf="totalPages > 1">
          <span class="pagination-info">Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ endIndex }} of {{ rows.length }}</span>
          <div class="pagination-controls">
            <button class="page-btn" (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 1">
              <i class="fa fa-chevron-left"></i>
            </button>
            <button class="page-btn" (click)="goToPage(currentPage + 1)" [disabled]="currentPage === totalPages">
              <i class="fa fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="empty-state" *ngIf="!loading && selectedClassId && rows.length === 0">
        <i class="fa fa-users"></i>
        <p>No students in this class. Load a class to continue.</p>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 1.5rem; max-width: 1200px; margin: 0 auto; }
    .page-header-card {
      background: #fff;
      border-radius: 16px;
      padding: 1.75rem 2rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    .page-header-card h2 {
      margin: 0 0 0.25rem 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: #0f2744;
    }
    .page-header-card h2 i { color: #1e3a5f; }
    .page-subtitle { margin: 0; color: #6a8cad; font-size: 0.9375rem; }
    .quick-nav { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; }
    .nav-link { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: #f7f9fc; border: 2px solid #e2e8f0; border-radius: 10px; color: #1e3a5f; font-weight: 500; font-size: 0.875rem; text-decoration: none; }
    .nav-link:hover { border-color: #1e3a5f; background: #f0f7ff; }
    .nav-link.active { background: #1e3a5f; color: #fff; border-color: #1e3a5f; }
    .filters-card {
      background: #fff;
      border-radius: 16px;
      padding: 1.5rem 2rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    .filters-card h3 { margin: 0 0 1rem 0; font-size: 1rem; color: #0f2744; }
    .filter-row { display: flex; flex-wrap: wrap; gap: 1rem; align-items: flex-end; }
    .filter-group { display: flex; flex-direction: column; }
    .filter-group label { font-size: 0.8125rem; margin-bottom: 0.35rem; color: #6a8cad; font-weight: 500; }
    .form-control {
      padding: 0.5rem 0.75rem;
      border: 2px solid #d9e2ec;
      border-radius: 8px;
      font-size: 0.9375rem;
      min-width: 140px;
    }
    .filter-actions { margin-left: auto; }
    .locked-badge {
      margin-top: 1rem;
      padding: 0.75rem;
      background: #fef3c7;
      color: #92400e;
      border-radius: 10px;
      font-size: 0.875rem;
      font-weight: 500;
    }
    .table-card {
      background: #fff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      padding: 1.25rem 1.5rem;
      background: #f7f9fc;
      border-bottom: 1px solid #e2e8f0;
    }
    .table-header h3 { margin: 0; font-size: 1.125rem; color: #0f2744; }
    .bulk-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
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
    }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-primary { background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); color: #fff; }
    .btn-sm { padding: 0.5rem 0.75rem; font-size: 0.8125rem; }
    .btn-success { background: #059669; color: #fff; }
    .btn-danger { background: #dc2626; color: #fff; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th, .data-table td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
    .data-table th { background: #f7f9fc; font-size: 0.8125rem; color: #6a8cad; font-weight: 600; }
    .student-cell { display: flex; align-items: center; gap: 0.5rem; }
    .student-link { color: #1e3a5f; font-weight: 500; text-decoration: none; }
    .student-link:hover { text-decoration: underline; }
    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: #e2e8f0;
      color: #1e3a5f;
      font-size: 0.75rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .status-btns { display: flex; gap: 0.25rem; flex-wrap: wrap; }
    .status-btn {
      padding: 0.3rem 0.5rem;
      font-size: 0.75rem;
      font-weight: 600;
      border: 2px solid #e2e8f0;
      background: #fff;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .status-btn:hover:not(:disabled) { border-color: #1e3a5f; }
    .status-btn.pp.active { background: #d1fae5; border-color: #059669; color: #059669; }
    .status-btn.po.active { background: #dbeafe; border-color: #2563eb; color: #2563eb; }
    .status-btn.a.active { background: #fee2e2; border-color: #dc2626; color: #dc2626; }
    .status-btn.sl.active { background: #fed7aa; border-color: #ea580c; color: #ea580c; }
    .status-btn.fl.active { background: #ede9fe; border-color: #7c3aed; color: #7c3aed; }
    .time-input, .remarks-input {
      padding: 0.4rem 0.5rem;
      border: 2px solid #d9e2ec;
      border-radius: 6px;
      font-size: 0.875rem;
      width: 90px;
    }
    .remarks-input { width: 120px; }
    .pagination-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
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
    .empty-state { text-align: center; padding: 3rem; color: #9ca3af; }
    .empty-state i { font-size: 3rem; margin-bottom: 0.5rem; display: block; }
  `]
})
export class AttendanceClassComponent implements OnInit {
  classes: Class[] = [];
  sections: Section[] = [];
  rows: RowData[] = [];
  selectedDate = '';
  selectedClassId: number | null = null;
  selectedSectionId: number | null = null;
  loading = false;
  saving = false;
  isLocked = false;
  pageSize = 15;
  currentPage = 1;

  constructor(
    private classService: ClassService,
    private sectionService: SectionService,
    private studentService: StudentService,
    private attendanceService: AttendanceService,
    private notify: NotificationService
  ) {}

  get classOptions(): DropdownOption[] {
    return this.classes.map(c => ({ value: c.classId, label: c.name }));
  }

  get sectionOptions(): DropdownOption[] {
    return this.sections.map(s => ({ value: s.sectionId, label: s.name }));
  }

  get totalPages(): number {
    return Math.ceil(this.rows.length / this.pageSize) || 1;
  }

  get paginatedRows(): RowData[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.rows.slice(start, start + this.pageSize);
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.rows.length);
  }

  ngOnInit(): void {
    this.selectedDate = new Date().toISOString().split('T')[0];
    this.classService.getAllClasses().subscribe({
      next: (c) => {
        this.classes = c.length > 0 ? c : [];
        if (c.length > 0 && !this.selectedClassId) {
          this.selectedClassId = c[0].classId;
          this.sectionService.getSectionsByClass(c[0].classId).subscribe(s => {
            this.sections = s;
            if (s.length > 0) this.selectedSectionId = s[0].sectionId;
          });
        }
      },
      error: () => {}
    });
  }

  onClassChange(): void {
    this.sections = [];
    this.selectedSectionId = null;
    if (this.selectedClassId) {
      this.sectionService.getSectionsByClass(this.selectedClassId).subscribe(s => (this.sections = s));
    }
  }

  loadStudents(): void {
    if (!this.selectedClassId || !this.selectedDate) return;
    this.loading = true;
    this.studentService.getStudentsByClass(this.selectedClassId).subscribe({
      next: (students) => {
        let list = students;
        if (this.selectedSectionId) {
          list = students.filter(s => (s.sectionId ?? s.section?.sectionId) === this.selectedSectionId);
        }
        const rowsMap = new Map<number, RowData>();
        list.forEach(s => {
          rowsMap.set(s.studentId, {
            student: s,
            status: 0 as StatusCode,
            timeIn: '',
            timeOut: '',
            remarks: ''
          });
        });
        this.attendanceService.getAttendance(
          this.selectedDate,
          this.selectedClassId ?? undefined,
          this.selectedSectionId ?? undefined
        ).subscribe({
          next: (attList) => {
            attList.forEach(a => {
              const row = rowsMap.get(a.studentId);
              if (row) {
                row.status = a.status as StatusCode;
                row.timeIn = (a.timeIn ?? '').toString().substring(0, 5) || '';
                row.timeOut = (a.timeOut ?? '').toString().substring(0, 5) || '';
                row.remarks = a.remarks ?? '';
              }
            });
            this.rows = Array.from(rowsMap.values());
            this.currentPage = 1;
            this.loading = false;
          },
          error: () => {
            this.rows = Array.from(rowsMap.values());
            this.currentPage = 1;
            this.loading = false;
          }
        });
      },
      error: () => { this.loading = false; }
    });
  }

  setStatus(r: RowData, status: StatusCode): void {
    r.status = status;
  }

  markAllPresent(): void {
    this.rows.forEach(r => { r.status = 1; r.timeIn = '08:00'; });
    this.notify.success('All marked Present');
  }

  markAllAbsent(): void {
    this.rows.forEach(r => { r.status = 3; r.timeIn = ''; r.timeOut = ''; });
    this.notify.success('All marked Absent');
  }

  saveAttendance(): void {
    if (!this.selectedDate || !this.selectedClassId || this.rows.length === 0) return;
    this.saving = true;
    this.attendanceService.bulkSaveAttendance({
      date: this.selectedDate,
      classId: this.selectedClassId,
      sectionId: this.selectedSectionId ?? undefined,
      records: this.rows.map(r => ({
        studentId: r.student.studentId,
        status: r.status,
        timeIn: r.timeIn || undefined,
        timeOut: r.timeOut || undefined,
        remarks: r.remarks || undefined
      }))
    }).subscribe({
      next: () => { this.saving = false; this.notify.success('Attendance saved'); },
      error: () => { this.saving = false; this.notify.error('Failed to save'); }
    });
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }
}
