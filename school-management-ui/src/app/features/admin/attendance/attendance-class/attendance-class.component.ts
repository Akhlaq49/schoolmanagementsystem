import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClassService } from '../../../../core/services/class.service';
import { SectionService } from '../../../../core/services/section.service';
import { AttendanceService } from '../../../../core/services/attendance.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { Class } from '../../../../core/models/student.model';
import { Section } from '../../../../core/models/section.model';
import { Student } from '../../../../core/models/student.model';
import { ClassAttendanceSheetItem } from '../../../../core/models/attendance.model';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { DropdownComponent, DropdownOption } from '../../../../shared/components/dropdown/dropdown.component';

type StatusCode = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface RowData {
  student: Student;
  status: StatusCode;
  timeIn: string | null;
  timeOut: string | null;
  remarks: string;
  leaveReason?: string;
  attendanceId?: number;
}

@Component({
  selector: 'app-admin-attendance-class',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LoadingComponent, DropdownComponent],
  template: `
    <div class="page-container">
      <app-loading [show]="loading" [message]="'Loading...'"></app-loading>

      <div class="page-header-card">
        <div class="header-content">
          <div>
            <a routerLink="/admin/dashboard" class="back-link">
              <i class="fa fa-arrow-left"></i> Back to Dashboard
            </a>
            <h2><i class="fa fa-users"></i> Class Attendance</h2>
            <p class="page-subtitle">Mark student attendance for a class</p>
          </div>
        </div>
      </div>

      <div class="filters-card">
        <h3>Select Date & Class</h3>
        <div class="filter-row">
          <div class="filter-group">
            <label>Date</label>
              <input
                type="date"
                [(ngModel)]="selectedDate"
                [max]="todayDate"
                (ngModelChange)="onSelectedDateChange()"
                class="form-control"
              >
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
              [searchable]="false"
              (changed)="onSectionChange()">
            </app-dropdown>
          </div>
          <div class="filter-group filter-actions">
            <button class="btn btn-primary" (click)="loadStudents()" [disabled]="loading || !selectedClassId">
              <i class="fa fa-refresh"></i> Load
            </button>
          </div>
        </div>
        <div class="locked-badge" *ngIf="isLocked">
          <i class="fa fa-lock"></i> Locked — Cannot edit
        </div>
      </div>

      <div class="table-card" *ngIf="rows.length > 0">
        <div class="table-header">
          <h3>Students ({{ filteredRows.length }})</h3>
          <div class="bulk-actions">
            <input
              type="text"
              [(ngModel)]="nameSearch"
              (ngModelChange)="currentPage = 1"
              placeholder="Search by name"
              class="form-control name-search"
            >
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
                <th>Marked</th>
                <th>Time In</th>
                <th>Time Out</th>
                <th>Remarks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let r of paginatedRows; let i = index">
                <td>{{ (currentPage - 1) * pageSize + i + 1 }}</td>
                <td>{{ r.student.roll || '—' }}</td>
                <td>
                  <div class="student-cell">
                    <span class="avatar">{{ getInitials(r.student.name) }}</span>
                    <a [routerLink]="['/admin/attendance/student', r.student.studentId]" class="student-link">{{ r.student.name }}</a>
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
                  <span class="marked-badge" [ngClass]="r.status === 0 ? 'marked-badge--not' : 'marked-badge--yes'">
                    <i class="fa" [ngClass]="r.status === 0 ? 'fa fa-times-circle-o' : 'fa fa-check-circle'"></i>
                    {{ r.status === 0 ? 'Not Marked' : 'Marked' }}
                  </span>
                </td>
                <td>
                  <input type="time" [(ngModel)]="r.timeIn" class="time-input" [disabled]="isLocked || (r.status !== 1 && r.status !== 2)" *ngIf="r.status === 1 || r.status === 2 || r.timeIn">
                  <span *ngIf="(r.status !== 1 && r.status !== 2) && !r.timeIn" class="time-empty">—</span>
                </td>
                <td>
                  <input type="time" [(ngModel)]="r.timeOut" class="time-input" [disabled]="isLocked" *ngIf="r.status === 1 || r.status === 2 || r.timeOut">
                  <span *ngIf="(r.status !== 1 && r.status !== 2) && !r.timeOut" class="time-empty">—</span>
                </td>
                <td>
                  <input type="text" [(ngModel)]="r.remarks" class="remarks-input" placeholder="Remarks" [disabled]="isLocked">
                </td>
                <td>
                  <div class="row-actions">
                    <button type="button" class="btn-icon" (click)="openEdit(r)" [disabled]="isLocked" title="Edit">
                      <i class="fa fa-pencil"></i>
                    </button>
                    <a [routerLink]="['/admin/attendance/student', r.student.studentId]" class="btn-icon" title="View History">
                      <i class="fa fa-history"></i>
                    </a>
                    <button type="button" class="btn-icon btn-clear" (click)="clearRow(r)" [disabled]="isLocked" title="Clear row">
                      <i class="fa fa-eraser"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pagination-bar" *ngIf="totalPages > 1">
          <span class="pagination-info">Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ endIndex }} of {{ filteredRows.length }}</span>
          <div class="pagination-controls">
            <button type="button" class="page-btn" (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 1">
              <i class="fa fa-chevron-left"></i>
            </button>
            <button type="button" class="page-btn" (click)="goToPage(currentPage + 1)" [disabled]="currentPage === totalPages">
              <i class="fa fa-chevron-right"></i>
            </button>
          </div>
        </div>
        <div class="legend-row">
          <span class="leg pp">PP</span>
          <span class="leg po">PO</span>
          <span class="leg a">A</span>
          <span class="leg sl">SL</span>
          <span class="leg fl">FL</span>
        </div>
      </div>

      <div class="empty-state" *ngIf="!loading && selectedClassId && rows.length === 0">
        <i class="fa fa-users"></i>
        <p>No students in this class. Load a class to continue.</p>
      </div>

      <div *ngIf="editRowData" class="edit-overlay" (click)="closeEdit()">
        <div class="edit-modal" (click)="$event.stopPropagation()">
          <h3>Edit Attendance — {{ editRowData.student.name }}</h3>
          <div class="edit-form">
            <div class="edit-field">
              <label>Status</label>
              <div class="status-btns">
                <button type="button" class="status-btn pp" [class.active]="editRowData.status === 1" (click)="editRowData.status = 1">PP</button>
                <button type="button" class="status-btn po" [class.active]="editRowData.status === 2" (click)="editRowData.status = 2">PO</button>
                <button type="button" class="status-btn a" [class.active]="editRowData.status === 3" (click)="editRowData.status = 3">A</button>
                <button type="button" class="status-btn sl" [class.active]="editRowData.status === 4" (click)="editRowData.status = 4">SL</button>
                <button type="button" class="status-btn fl" [class.active]="editRowData.status === 5" (click)="editRowData.status = 5">FL</button>
              </div>
            </div>
            <div class="edit-row">
              <div class="edit-field">
                <label>Time In</label>
                <input type="time" [(ngModel)]="editRowData.timeIn" class="form-control">
              </div>
              <div class="edit-field">
                <label>Time Out</label>
                <input type="time" [(ngModel)]="editRowData.timeOut" class="form-control">
              </div>
            </div>
            <div class="edit-field">
              <label>Remarks</label>
              <input type="text" [(ngModel)]="editRowData.remarks" class="form-control" placeholder="Remarks">
            </div>
          </div>
          <div class="edit-actions">
            <button type="button" class="btn btn-secondary" (click)="closeEdit()">Cancel</button>
            <button type="button" class="btn btn-primary" (click)="saveEdit()">
              <i class="fa fa-check"></i> Save
            </button>
          </div>
        </div>
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
    .page-header-card h2 {
      margin: 0 0 0.25rem 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: #0f2744;
    }
    .page-header-card h2 i { color: #1e3a5f; }
    .page-subtitle { margin: 0; color: #6a8cad; font-size: 0.9375rem; }
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
    .marked-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.35rem 0.75rem;
      border-radius: 999px;
      font-size: 0.8125rem;
      font-weight: 800;
      border: 1px solid transparent;
      line-height: 1;
      white-space: nowrap;
    }
    .marked-badge--yes {
      background: linear-gradient(135deg, #d1fae5 0%, #ecfdf5 100%);
      color: #059669;
      border-color: #a7f3d0;
    }
    .marked-badge--not {
      background: linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%);
      color: #92400e;
      border-color: #fcd34d;
    }
    .time-input, .remarks-input {
      padding: 0.4rem 0.5rem;
      border: 2px solid #d9e2ec;
      border-radius: 6px;
      font-size: 0.875rem;
      width: 90px;
    }
    .time-empty { color: #9ca3af; font-size: 0.875rem; }
    .remarks-input { width: 120px; }
    .pagination-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-top: 1px solid #e2e8f0;
    }
    .pagination-info { font-size: 0.875rem; color: #6a8cad; }
    .pagination-controls { display: flex; gap: 0.5rem; }
    .page-btn {
      padding: 0.4rem 0.75rem;
      border: 2px solid #e2e8f0;
      background: #fff;
      border-radius: 8px;
      cursor: pointer;
    }
    .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .row-actions { display: flex; gap: 0.5rem; }
    .btn-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      padding: 0;
      border: none;
      border-radius: 8px;
      background: #f0f4f8;
      color: #1e3a5f;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s;
    }
    .btn-icon:hover { background: #e2e8f0; }
    .btn-icon.btn-clear:hover { background: #fee2e2; color: #dc2626; }
    .legend-row {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      padding: 1rem 1.5rem;
      border-top: 1px solid #e2e8f0;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .leg { padding: 0.25rem 0.6rem; border-radius: 6px; }
    .leg.pp { background: #d1fae5; color: #059669; }
    .leg.po { background: #dbeafe; color: #2563eb; }
    .leg.a { background: #fee2e2; color: #dc2626; }
    .leg.sl { background: #fed7aa; color: #ea580c; }
    .leg.fl { background: #ede9fe; color: #7c3aed; }
    .name-search { 
      min-width: 240px; 
      color: #0f2744 !important;
      -webkit-text-fill-color: #0f2744;
    }
    .name-search::placeholder { color: #6a8cad !important; opacity: 1; }
    .empty-state { text-align: center; padding: 3rem; color: #9ca3af; }
    .empty-state i { font-size: 3rem; margin-bottom: 0.5rem; display: block; }
    .edit-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000; }
    .edit-modal { background: #fff; border-radius: 16px; padding: 1.5rem 2rem; min-width: 360px; max-width: 95%; box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
    .edit-modal h3 { margin: 0 0 1rem 0; font-size: 1.125rem; color: #0f2744; }
    .edit-form { margin-bottom: 1.5rem; }
    .edit-field { margin-bottom: 1rem; }
    .edit-field label { display: block; font-size: 0.8125rem; color: #6a8cad; margin-bottom: 0.35rem; font-weight: 500; }
    .edit-row { display: flex; gap: 1rem; }
    .edit-actions { display: flex; justify-content: flex-end; gap: 0.75rem; }
    .btn-secondary { background: #e2e8f0; color: #374151; }
  `]
})
export class AdminAttendanceClassComponent implements OnInit {
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
  nameSearch = '';
  readonly todayDate = new Date().toISOString().split('T')[0];

  get filteredRows(): RowData[] {
    const q = this.nameSearch.trim().toLowerCase();
    if (!q) return this.rows;
    return this.rows.filter(r => (r.student?.name || '').toLowerCase().includes(q));
  }

  get totalPages(): number {
    return Math.ceil(this.filteredRows.length / this.pageSize) || 1;
  }

  get paginatedRows(): RowData[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredRows.slice(start, start + this.pageSize);
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredRows.length);
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
  }

  constructor(
    private classService: ClassService,
    private sectionService: SectionService,
    private attendanceService: AttendanceService,
    private notify: NotificationService
  ) {}

  onSelectedDateChange(): void {
    // Match existing behavior: fetch only when a class is selected.
    if (this.selectedClassId) this.loadStudents();
  }

  private ensureNotFutureSelectedDate(): boolean {
    // `yyyy-MM-dd` string comparison is safe for dates.
    if (!this.selectedDate) return false;
    if (this.selectedDate > this.todayDate) {
      this.notify.error('Future dates are not allowed.');
      this.selectedDate = this.todayDate;
      return false;
    }
    return true;
  }

  get classOptions(): DropdownOption[] {
    return this.classes.map(c => ({ value: c.classId, label: c.name }));
  }

  get sectionOptions(): DropdownOption[] {
    return this.sections.map(s => ({ value: s.sectionId, label: s.name }));
  }

  ngOnInit(): void {
    this.selectedDate = new Date().toISOString().split('T')[0];
    this.loadClasses();
  }

  loadClasses(): void {
    this.classService.getAllClasses().subscribe({
      next: (c) => {
        this.classes = c;
      },
      error: () => this.notify.error('Failed to load classes')
    });
  }

  onClassChange(): void {
    this.sections = [];
    this.selectedSectionId = null;
    this.rows = [];
    this.currentPage = 1;
    if (this.selectedClassId) {
      this.sectionService.getSectionsByClass(this.selectedClassId).subscribe({
        next: (s) => (this.sections = s),
        error: () => this.notify.error('Failed to load sections')
      });
    }
  }

  onSectionChange(): void {
    this.rows = [];
    this.currentPage = 1;
    if (this.selectedClassId && this.selectedDate) this.loadStudents();
  }

  /** Normalize API time (HH:mm or HH:mm:ss) to HH:mm for input type="time". */
  private normalizeTime(value: string | null | undefined): string {
    if (value == null) return '';
    const s = String(value).trim();
    if (!s) return '';
    const parts = s.split(':');
    if (parts.length >= 2) {
      const h = parts[0].padStart(2, '0');
      const m = parts[1].padStart(2, '0');
      return `${h}:${m}`;
    }
    return s.length >= 5 ? s.substring(0, 5) : '';
  }

  /** Read time from sheet item (API returns camelCase due to JSON settings). */
  private getSheetTimeIn(item: ClassAttendanceSheetItem): string {
    return this.normalizeTime(item.timeIn);
  }

  private getSheetTimeOut(item: ClassAttendanceSheetItem): string {
    return this.normalizeTime(item.timeOut);
  }

  loadStudents(): void {
    if (!this.selectedClassId || !this.selectedDate) return;
    if (!this.ensureNotFutureSelectedDate()) return;
    this.loading = true;
    this.attendanceService.getAdminClassAttendanceSheet(
      this.selectedDate,
      this.selectedClassId,
      this.selectedSectionId ?? undefined
    ).subscribe({
      next: (sheet) => {
        this.rows = sheet.map((item: ClassAttendanceSheetItem) => ({
          student: {
            studentId: item.studentId,
            name: item.studentName,
            roll: item.rollNumber,
            classId: item.classId,
            sectionId: item.sectionId,
            password: ''
          } as Student,
          status: item.status as StatusCode,
          timeIn: this.getSheetTimeIn(item) || null,
          timeOut: this.getSheetTimeOut(item) || null,
          remarks: item.remarks ?? '',
          leaveReason: item.leaveReason,
          attendanceId: item.attendanceId
        }));
        this.currentPage = 1;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.rows = [];
        this.notify.error(err?.error?.message ?? 'Failed to load class attendance');
      }
    });
  }

  setStatus(r: RowData, status: StatusCode): void {
    r.status = status;
  }

  markAllPresent(): void {
    this.filteredRows.forEach(r => { r.status = 1; r.timeIn = '08:00'; r.timeOut = null; });
    this.notify.success('All marked Present');
  }

  markAllAbsent(): void {
    this.filteredRows.forEach(r => { r.status = 3; r.timeIn = null; r.timeOut = null; });
    this.notify.success('All marked Absent');
  }

  saveAttendance(): void {
    if (!this.selectedDate || !this.selectedClassId || this.rows.length === 0) return;
    if (!this.ensureNotFutureSelectedDate()) return;
    this.saving = true;
    this.attendanceService.saveAdminClassAttendance({
      date: this.selectedDate,
      classId: this.selectedClassId,
      sectionId: this.selectedSectionId ?? undefined,
      records: this.rows.map(r => ({
        studentId: r.student.studentId,
        status: r.status,
        timeIn: r.timeIn ?? null,
        timeOut: r.timeOut ?? null,
        remarks: r.remarks || undefined,
        leaveReason: r.leaveReason
      }))
    }).subscribe({
      next: (saved) => {
        const byStudentId = new Map(saved.map(a => [a.studentId ?? 0, a]));
        this.rows.forEach(r => {
          const att = byStudentId.get(r.student.studentId);
          if (att) r.attendanceId = att.attendanceId;
        });
        this.saving = false;
        this.notify.success('Attendance saved');
      },
      error: (err) => {
        this.saving = false;
        this.notify.error(err?.error?.message ?? 'Failed to save attendance');
      }
    });
  }

  editRowData: RowData | null = null;

  openEdit(r: RowData): void {
    if (this.isLocked) return;
    this.editRowData = {
      student: r.student,
      status: r.status,
      timeIn: r.timeIn || '',
      timeOut: r.timeOut || '',
      remarks: r.remarks || '',
      leaveReason: r.leaveReason,
      attendanceId: r.attendanceId
    };
  }

  closeEdit(): void {
    this.editRowData = null;
  }

  saveEdit(): void {
    if (!this.editRowData) return;
    const r = this.rows.find(x => x.student.studentId === this.editRowData!.student.studentId);
    if (!r) { this.closeEdit(); return; }
    r.status = this.editRowData.status;
    r.timeIn = this.editRowData.timeIn || '';
    r.timeOut = this.editRowData.timeOut || '';
    r.remarks = this.editRowData.remarks || '';
    r.leaveReason = this.editRowData.leaveReason;

    if (r.attendanceId) {
      this.attendanceService.editAttendance(r.attendanceId, {
        status: r.status,
        timeIn: r.timeIn || undefined,
        timeOut: r.timeOut || undefined,
        remarks: r.remarks || undefined,
        leaveReason: r.leaveReason
      }).subscribe({
        next: () => this.notify.success('Row updated'),
        error: () => this.notify.error('Failed to update row')
      });
    } else {
      this.notify.success('Row updated (will save with attendance)');
    }
    this.closeEdit();
  }

  clearRow(r: RowData): void {
    r.status = 0;
    r.timeIn = null;
    r.timeOut = null;
    r.remarks = '';
    r.leaveReason = undefined;
    this.notify.info('Row cleared');
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }
}
