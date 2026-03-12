import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { StudentService } from '../../../../core/services/student.service';
import { ClassService } from '../../../../core/services/class.service';
import { Student } from '../../../../core/models/student.model';
import { Class } from '../../../../core/models/student.model';
import { NotificationService } from '../../../../shared/services/notification.service';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { DropdownComponent, DropdownOption } from '../../../../shared/components/dropdown/dropdown.component';

@Component({
  selector: 'app-drop-students',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LoadingComponent, DropdownComponent],
  template: `
    <div class="page-container">
      <div class="page-header-card">
        <div class="header-content">
          <div class="header-left">
            <h2><i class="fa fa-user-times"></i> Drop Students</h2>
            <p class="page-subtitle">Students who have been marked as dropped from the school</p>
          </div>
          <a routerLink="/admin/students" class="btn-back">
            <i class="fa fa-arrow-left"></i> Back to Active Students
          </a>
        </div>
      </div>
      <div class="filters-card" *ngIf="!loading">
        <div class="search-box">
          <i class="fa fa-search"></i>
          <input 
            type="text" 
            [(ngModel)]="searchTerm" 
            (input)="filterStudents()"
            placeholder="Search by name, email, or roll number..."
            class="modern-form-control search-input">
        </div>
        <div class="class-filter-box">
          <button type="button" class="class-filter-trigger" (click)="toggleClassFilter($event)" [class.open]="classFilterOpen">
            <i class="fa fa-book"></i>
            <span>{{ getSelectedClassName() }}</span>
            <i class="fa fa-chevron-down trigger-chevron"></i>
          </button>
          <div class="class-filter-dropdown" *ngIf="classFilterOpen" (click)="$event.stopPropagation()">
            <button type="button" class="class-filter-option" [class.selected]="selectedClassId === null" (click)="selectClass(null)">
              All Classes
            </button>
            <button type="button" class="class-filter-option" *ngFor="let cls of classes" [class.selected]="selectedClassId === cls.classId" (click)="selectClass(cls.classId)">
              {{ cls.name }}
            </button>
          </div>
        </div>
      </div>

      <app-loading [show]="loading" [message]="'Loading dropped students...'"></app-loading>
      <div class="content-card" *ngIf="!loading">
        <div class="table-header-row" *ngIf="filteredStudents.length > 0">
          <div class="show-entries">
            <span>Show</span>
            <app-dropdown
              [(ngModel)]="pageSize"
              [options]="pageSizeOpts"
              [searchable]="false"
              [showPlaceholderOption]="false"
              size="sm"
              (changed)="pageSizeChange()">
            </app-dropdown>
            <span>entries</span>
          </div>
          <div class="table-count">
            <i class="fa fa-users"></i>
            <span>Total: {{ filteredStudents.length }} student(s)</span>
          </div>
        </div>
        <div class="table-scroll-wrapper">
        <table class="data-table" *ngIf="filteredStudents.length > 0">
          <thead>
            <tr>
              <th>Roll No.</th>
              <th>Student Name</th>
              <th>Father Name</th>
              <th>Contact No</th>
              <th>Gender</th>
              <th>Free/Paid</th>
              <th>Class</th>
              <th>Section</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let s of paginatedStudents">
              <td>
                <span *ngIf="s.roll" class="roll-badge">{{ s.roll }}</span>
                <span *ngIf="!s.roll" class="text-muted">-</span>
              </td>
              <td>
                <div class="student-name"><strong>{{ s.name }}</strong></div>
              </td>
              <td>
                <span *ngIf="s.fatherName || s.smsNumber" class="text-value">{{ s.fatherName || '-' }}</span>
                <span *ngIf="!s.fatherName && !s.smsNumber" class="text-muted">-</span>
              </td>
              <td>
                <span *ngIf="s.phone || s.smsNumber" class="phone-text">{{ s.phone || s.smsNumber }}</span>
                <span *ngIf="!s.phone && !s.smsNumber" class="text-muted">-</span>
              </td>
              <td>
                <span *ngIf="s.sex" class="text-value">{{ s.sex }}</span>
                <span *ngIf="!s.sex" class="text-muted">-</span>
              </td>
              <td>
                <span class="fee-type-badge" [class.fee-paid]="s.feeType === 'Paid'" [class.fee-unpaid]="s.feeType === 'Unpaid'">{{ s.feeType || 'Unpaid' }}</span>
              </td>
              <td>
                <span *ngIf="s.class?.name" class="modern-badge modern-badge-primary">{{ s.class?.name }}</span>
                <span *ngIf="!s.class?.name" class="text-muted">-</span>
              </td>
              <td>
                <span *ngIf="s.section?.name" class="text-value">{{ s.section?.name }}</span>
                <span *ngIf="!s.section?.name" class="text-muted">-</span>
              </td>
              <td>
                <a [routerLink]="['/admin/students/view', s.userId ?? s.studentId]" class="btn-view">
                  <i class="fa fa-eye"></i> View
                </a>
                <button class="btn-reactivate" (click)="reactivate(s)">
                  <i class="fa fa-undo"></i> Reactivate
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        </div>
        <div class="pagination-bar" *ngIf="filteredStudents.length > 0">
          <div class="pagination-info">
            Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ getPageEndIndex() }} of {{ filteredStudents.length }} entries
          </div>
          <div class="pagination-controls">
            <button class="page-btn" [disabled]="currentPage <= 1" (click)="goToPage(1)" title="First">
              <i class="fa fa-angle-double-left"></i>
            </button>
            <button class="page-btn" [disabled]="currentPage <= 1" (click)="goToPage(currentPage - 1)" title="Previous">
              <i class="fa fa-angle-left"></i>
            </button>
            <span class="page-numbers">
              <button *ngFor="let p of getPageNumbers()" class="page-num" [class.active]="p === currentPage" (click)="goToPage(p)">{{ p }}</button>
            </span>
            <button class="page-btn" [disabled]="currentPage >= totalPages" (click)="goToPage(currentPage + 1)" title="Next">
              <i class="fa fa-angle-right"></i>
            </button>
            <button class="page-btn" [disabled]="currentPage >= totalPages" (click)="goToPage(totalPages)" title="Last">
              <i class="fa fa-angle-double-right"></i>
            </button>
          </div>
        </div>
        <div class="empty-state" *ngIf="filteredStudents.length === 0">
          <i class="fa fa-inbox"></i>
          <p>No dropped students.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 0; }
    .filters-card {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      padding: 1.25rem 1.5rem;
      background: #fff;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .search-box {
      position: relative;
      flex: 1;
      min-width: 300px;
    }
    .search-box i {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-tertiary);
      z-index: 1;
    }
    .search-input {
      padding-left: 3rem;
    }
    .class-filter-box {
      position: relative;
      min-width: 220px;
    }
    .class-filter-trigger {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      width: 100%;
      min-height: 44px;
      padding: 0.6rem 1rem;
      font-size: 0.9375rem;
      font-weight: 500;
      color: var(--text-primary);
      background: var(--bg-primary, #fff);
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      cursor: pointer;
      text-align: left;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }
    .class-filter-trigger:hover { border-color: #cbd5e1; }
    .class-filter-trigger.open {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
    }
    .class-filter-trigger i.fa-book { color: var(--text-tertiary); font-size: 0.95rem; }
    .class-filter-trigger span { flex: 1; }
    .trigger-chevron { color: var(--text-tertiary); font-size: 0.75rem; transition: transform 0.2s ease; }
    .class-filter-trigger.open .trigger-chevron { transform: rotate(180deg); }
    .class-filter-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      margin-top: 4px;
      padding: 6px;
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.12);
      z-index: 1000;
    }
    .class-filter-option {
      display: block;
      width: 100%;
      padding: 10px 14px;
      font-size: 0.9375rem;
      font-weight: 500;
      color: var(--text-primary);
      background: transparent;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      text-align: left;
      transition: background 0.15s ease, color 0.15s ease;
    }
    .class-filter-option:hover { background: #f1f5f9; color: var(--primary); }
    .class-filter-option.selected {
      background: rgba(99, 102, 241, 0.1);
      color: var(--primary);
    }
    .table-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      flex-wrap: wrap;
      padding-bottom: 1rem;
    }
    .show-entries {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      color: var(--text-secondary);
    }
    .entries-select {
      padding: 0.35rem 0.6rem;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      font-size: 0.9rem;
      background: white;
      min-width: 60px;
    }
    .table-count {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      color: var(--text-secondary);
    }
    .pagination-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
      margin-top: 1rem;
      border-top: 1px solid #e2e8f0;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .pagination-info { font-size: 0.9rem; color: #64748b; font-weight: 500; }
    .pagination-controls { display: flex; align-items: center; gap: 0.35rem; }
    .page-btn, .page-num {
      padding: 0.5rem 0.75rem;
      border: 1px solid #e2e8f0;
      background: #fff;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      min-width: 38px;
      color: #334155;
      transition: all 0.2s ease;
    }
    .page-btn:hover:not(:disabled), .page-num:hover:not(.active) {
      background: #f1f5f9;
      border-color: #cbd5e1;
      color: #0f172a;
    }
    .page-btn:disabled { opacity: 0.4; cursor: not-allowed; background: #f8fafc; }
    .page-num.active {
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark, #1e3a5f) 100%);
      color: white;
      border-color: transparent;
    }
    .page-numbers { display: flex; gap: 0.35rem; }
    .page-header-card {
      background: #fff; border-radius: 16px; padding: 1.75rem 2rem; margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;
    }
    .header-content { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
    .header-left h2 { margin: 0; display: flex; align-items: center; gap: 0.75rem; font-size: 1.5rem; font-weight: 700; color: var(--text-primary); }
    .page-subtitle { margin: 0.25rem 0 0 0; font-size: 0.9375rem; color: var(--text-tertiary); }
    .btn-back {
      display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; border-radius: 10px;
      font-size: 0.9375rem; font-weight: 600; color: var(--primary); background: transparent;
      border: 2px solid var(--primary); text-decoration: none; cursor: pointer; transition: all 0.2s;
    }
    .btn-back:hover { background: rgba(30,58,95,0.08); }
    .content-card { background: white; border-radius: 16px; padding: 2rem; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .table-scroll-wrapper { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th, .data-table td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
    .data-table th { background: #f7f9fc; font-weight: 600; font-size: 0.8125rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .data-table td { vertical-align: middle; }
    .roll-badge { display: inline-block; padding: 0.2rem 0.5rem; background: #e2e8f0; border-radius: 6px; font-size: 0.875rem; font-weight: 500; }
    .student-name strong { font-weight: 600; }
    .text-value { font-size: 0.9375rem; }
    .text-muted { color: var(--text-tertiary); font-size: 0.9375rem; }
    .phone-text { font-size: 0.9375rem; }
    .fee-type-badge { display: inline-block; padding: 0.2rem 0.5rem; border-radius: 6px; font-size: 0.8125rem; font-weight: 600; }
    .fee-paid { background: #d1fae5; color: #065f46; }
    .fee-unpaid { background: #fef3c7; color: #92400e; }
    .modern-badge { display: inline-block; padding: 0.2rem 0.5rem; border-radius: 6px; font-size: 0.8125rem; font-weight: 600; }
    .modern-badge-primary { background: rgba(30,58,95,0.12); color: var(--primary); }
    .btn-view, .btn-reactivate {
      display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.75rem;
      border-radius: 8px; font-size: 0.875rem; font-weight: 500; margin-right: 0.5rem; text-decoration: none; cursor: pointer; border: none;
    }
    .btn-view { background: var(--primary); color: white; }
    .btn-view:hover { background: var(--primary-dark); opacity: 0.9; }
    .btn-reactivate { background: #059669; color: white; }
    .btn-reactivate:hover { background: #047857; }
    .empty-state { text-align: center; padding: 3rem; color: var(--text-tertiary); }
    .empty-state i { font-size: 3rem; margin-bottom: 1rem; opacity: 0.5; }
  `]
})
export class DropStudentsComponent implements OnInit {
  students: Student[] = [];
  filteredStudents: Student[] = [];
  classes: Class[] = [];
  searchTerm = '';
  selectedClassId: number | null = null;
  classFilterOpen = false;
  loading = false;
  pageSizeOptions = [10, 25, 50, 100];
  pageSize = 10;
  currentPage = 1;

  get pageSizeOpts(): DropdownOption[] {
    return this.pageSizeOptions.map(s => ({ value: s, label: '' + s }));
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredStudents.length / this.pageSize));
  }

  get paginatedStudents(): Student[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredStudents.slice(start, start + this.pageSize);
  }

  constructor(
    private studentService: StudentService,
    private classService: ClassService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadClasses();
    this.loadDropped();
  }

  loadClasses() {
    this.classService.getAllClasses().subscribe({
      next: (list) => { this.classes = list; },
      error: () => this.notificationService.error('Failed to load classes')
    });
  }

  loadDropped() {
    this.loading = true;
    this.studentService.getDroppedStudents().subscribe({
      next: (list: Student[]) => {
        this.students = list;
        this.filterStudents();
        this.loading = false;
      },
      error: () => { this.loading = false; this.notificationService.error('Failed to load dropped students'); }
    });
  }

  filterStudents() {
    let list = this.students;
    if (this.selectedClassId != null) {
      list = list.filter(s => s.classId === this.selectedClassId);
    }
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      list = list.filter(s =>
        s.name?.toLowerCase().includes(term) ||
        s.email?.toLowerCase().includes(term) ||
        s.roll?.toLowerCase().includes(term)
      );
    }
    this.filteredStudents = list;
    this.currentPage = 1;
  }

  toggleClassFilter(event: MouseEvent) {
    event.stopPropagation();
    this.classFilterOpen = !this.classFilterOpen;
  }

  selectClass(classId: number | null) {
    this.selectedClassId = classId;
    this.classFilterOpen = false;
    this.filterStudents();
    this.cdr.detectChanges();
  }

  getSelectedClassName(): string {
    if (!this.selectedClassId) return 'All Classes';
    const cls = this.classes.find(c => c.classId === this.selectedClassId);
    return cls?.name ?? 'All Classes';
  }

  pageSizeChange() { this.currentPage = 1; }
  goToPage(page: number) { this.currentPage = Math.max(1, Math.min(page, this.totalPages)); }
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const total = this.totalPages;
    let start = Math.max(1, this.currentPage - 2);
    let end = Math.min(total, this.currentPage + 2);
    if (end - start < 4) {
      if (start === 1) end = Math.min(total, 5);
      else if (end === total) start = Math.max(1, total - 4);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }
  getPageEndIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredStudents.length);
  }

  @HostListener('document:mousedown', ['$event'])
  onDocumentMouseDown(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target?.closest('.class-filter-box')) this.classFilterOpen = false;
  }

  reactivate(student: Student) {
    const id = (student as any).userId ?? student.studentId;
    this.studentService.updateStudent(id, { status: 'Active' }).subscribe({
      next: () => {
        this.notificationService.success('Student reactivated');
        this.loadDropped();
      },
      error: () => this.notificationService.error('Failed to reactivate')
    });
  }
}
