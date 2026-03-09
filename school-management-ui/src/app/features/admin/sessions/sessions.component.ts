import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AcademicSessionService } from '../../../core/services/academic-session.service';
import { AcademicSession } from '../../../core/models/academic-session.model';
import { NotificationService } from '../../../shared/services/notification.service';
import { DropdownComponent, DropdownOption } from '../../../shared/components/dropdown/dropdown.component';

@Component({
  selector: 'app-sessions',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DropdownComponent],
  template: `
    <div class="sessions-container">
      <!-- New / Edit Session form -->
      <div *ngIf="showForm" class="academy-form-card">
        <h2 class="form-title">{{ editingSession ? 'Edit Session' : 'Add New Session' }}</h2>

        <form (ngSubmit)="saveSession()">
          <div class="form-group">
            <label for="sessionName">Session Name</label>
            <input
              id="sessionName"
              type="text"
              class="form-input"
              [(ngModel)]="form.name"
              name="name"
              placeholder="e.g 2022-2023"
              [class.is-invalid]="submitted && !form.name.trim()"
              required
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="startDate">Start Date</label>
              <input
                #startDateInput
                id="startDate"
                type="date"
                class="form-input"
                [(ngModel)]="form.startDate"
                name="startDate"
                (click)="openDatePicker(startDateInput)"
              />
            </div>
            <div class="form-group">
              <label for="endDate">End Date</label>
              <input
                #endDateInput
                id="endDate"
                type="date"
                class="form-input"
                [(ngModel)]="form.endDate"
                name="endDate"
                (click)="openDatePicker(endDateInput)"
              />
            </div>
          </div>

          <div class="form-row toggles-row">
            <label class="toggle">
              <input
                type="checkbox"
                [(ngModel)]="form.isCurrent"
                name="isCurrent"
              />
              <span>Current Session</span>
            </label>
            <label class="toggle">
              <input
                type="checkbox"
                [(ngModel)]="form.isActive"
                name="isActive"
              />
              <span>Is Active</span>
            </label>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-save">Save</button>
            <button type="button" class="btn-cancel" (click)="cancelForm()">Cancel</button>
          </div>
        </form>
      </div>

      <!-- Sessions list -->
      <div class="academy-list-card" *ngIf="!showForm">
        <div class="list-header">
          <div>
            <h2 class="list-title">Academic Sessions</h2>
            <p class="page-subtitle">Manage academic years and semesters</p>
          </div>
          <button type="button" class="btn-add" (click)="openAddForm()">
            <i class="fa fa-plus"></i> Add New Session
          </button>
        </div>

        <div class="filters-card">
          <div class="search-box">
            <i class="fa fa-search"></i>
            <input 
              type="text" 
              [(ngModel)]="searchTerm" 
              (input)="applyFilter()"
              placeholder="Search by session name..."
              class="modern-form-control search-input">
          </div>
        </div>

        <div class="table-header-row" *ngIf="filteredSessions.length > 0">
          <div class="show-entries">
            <span>Show</span>
            <app-dropdown
              [(ngModel)]="pageSize"
              [options]="pageSizeOpts"
              [searchable]="false"
              [showPlaceholderOption]="false"
              size="sm"
              (changed)="onPageSizeChange($event)">
            </app-dropdown>
            <span>entries</span>
          </div>
          <div class="table-count">Total: {{ filteredSessions.length }} session(s)</div>
        </div>

        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Session Name</th>
                <th>Current</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="loading">
                <td colspan="5">Loading...</td>
              </tr>
              <tr *ngIf="!loading && paginatedSessions.length === 0">
                <td colspan="5">No entries found</td>
              </tr>
              <tr *ngFor="let s of paginatedSessions">
                <td>{{ s.name }}</td>
                <td>
                  <span *ngIf="s.isCurrent" class="badge-current">Yes</span>
                  <span *ngIf="!s.isCurrent" class="text-muted">No</span>
                  <span *ngIf="!s.isActive" class="badge-inactive">Inactive</span>
                </td>
                <td>{{ s.startDate ? (s.startDate | date:'yyyy-MM-dd') : '-' }}</td>
                <td>{{ s.endDate ? (s.endDate | date:'yyyy-MM-dd') : '-' }}</td>
                <td class="col-action">
                  <button type="button" class="btn-edit" (click)="openEditForm(s)" title="Edit">
                    <i class="fa fa-pencil"></i>
                  </button>
                  <button type="button" class="btn-delete" (click)="confirmDelete(s)" title="Delete">
                    <i class="fa fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination-bar" *ngIf="filteredSessions.length > 0">
          <div class="pagination-info">
            Showing {{ startEntry }} to {{ endEntry }} of {{ filteredSessions.length }} entries
          </div>
          <div class="pagination-controls">
            <button type="button" class="page-btn" [disabled]="currentPage <= 1" (click)="goToPage(1)" title="First"><i class="fa fa-angle-double-left"></i></button>
            <button type="button" class="page-btn" [disabled]="currentPage <= 1" (click)="goToPage(currentPage - 1)" title="Previous"><i class="fa fa-angle-left"></i></button>
            <span class="page-numbers">
              <button *ngFor="let p of getPageNumbers()" type="button" class="page-num" [class.active]="p === currentPage" (click)="goToPage(p)">{{ p }}</button>
            </span>
            <button type="button" class="page-btn" [disabled]="currentPage >= totalPages" (click)="goToPage(currentPage + 1)" title="Next"><i class="fa fa-angle-right"></i></button>
            <button type="button" class="page-btn" [disabled]="currentPage >= totalPages" (click)="goToPage(totalPages)" title="Last"><i class="fa fa-angle-double-right"></i></button>
          </div>
        </div>
      </div>

      <!-- Delete confirm (simple) -->
      <div *ngIf="showDeleteConfirm" class="confirm-overlay" (click)="closeConfirm()">
        <div class="confirm-box" (click)="$event.stopPropagation()">
          <p>Are you sure you want to delete session "{{ sessionToDelete?.name }}"?</p>
          <div class="confirm-actions">
            <button type="button" class="btn-save" (click)="deleteSession()">Yes, delete</button>
            <button type="button" class="btn-cancel" (click)="closeConfirm()">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sessions-container { padding: 0; min-height: 100%; }
    .academy-form-card {
      background: #fff; border-radius: 16px; padding: 2rem; margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; max-width: 700px;
    }
    .form-title { margin: 0 0 1.5rem; font-size: 1.25rem; font-weight: 700; color: #0f2744; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem; color: #1e3a5f; }
    .form-input {
      width: 100%; padding: 0.75rem 1rem; border: 2px solid #d9e2ec; border-radius: 0.75rem;
      font-size: 0.9375rem; font-weight: 500; color: #0f2744; background: #fff;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .form-input:focus { outline: none; border-color: #1e3a5f; box-shadow: 0 0 0 4px rgba(30,58,95,0.12); }
    .form-input.is-invalid { border-color: #dc2626; }
    .form-row { display: flex; gap: 1rem; flex-wrap: wrap; }
    .form-row .form-group { flex: 1; min-width: 200px; }
    .toggles-row { margin-top: 0.5rem; }
    .toggle { display: flex; align-items: center; gap: 0.4rem; font-size: 0.9rem; color: #435d7a; font-weight: 500; }
    .form-actions { margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #eef2f7; display: flex; gap: 0.75rem; }
    .btn-save, .btn-cancel { padding: 0.65rem 1.25rem; border-radius: 0.75rem; border: none; font-size: 0.9375rem; font-weight: 600; cursor: pointer; }
    .btn-save { background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); color: #fff; box-shadow: 0 4px 14px rgba(30,58,95,0.35); }
    .btn-save:hover { transform: translateY(-1px); }
    .btn-cancel { background: #6b7280; color: #fff; }
    .btn-cancel:hover { background: #4b5563; }
    .academy-list-card {
      background: #fff; border-radius: 16px; padding: 1.5rem 2rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;
    }
    .list-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.25rem; }
    .list-title { margin: 0; font-size: 1.5rem; font-weight: 700; color: #0f2744; }
    .page-subtitle { margin: 0.25rem 0 0 0; font-size: 0.9375rem; color: #6a8cad; }
    .filters-card {
      display: flex; gap: 1rem; margin-bottom: 1.5rem; padding: 1.25rem 1.5rem;
      background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .search-box { position: relative; flex: 1; min-width: 300px; }
    .search-box i { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #8aa8c4; z-index: 1; }
    .search-input { padding-left: 3rem; }
    .table-header-row { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem; }
    .show-entries { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; color: #6a8cad; }
    .entries-select { padding: 0.35rem 0.6rem; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 0.9rem; background: white; min-width: 60px; cursor: pointer; }
    .table-count { font-size: 0.9rem; font-weight: 500; color: #6a8cad; }
    .btn-add { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.65rem 1.25rem;
      background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); color: #fff; border: none;
      border-radius: 0.75rem; font-size: 0.9375rem; font-weight: 600; cursor: pointer; box-shadow: 0 4px 14px rgba(30,58,95,0.35); }
    .btn-add:hover { transform: translateY(-1px); }
    .table-wrapper { background: #fff; border-radius: 12px; overflow-x: auto; border: 1px solid #eef2f7; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.9375rem; }
    .data-table th, .data-table td { padding: 0.875rem 1rem; border-bottom: 1px solid #eef2f7; text-align: left; }
    .data-table th { background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); font-weight: 600; font-size: 0.8125rem; color: #fff; text-transform: uppercase; letter-spacing: 0.05em; }
    .data-table td { color: #435d7a; }
    .data-table tbody tr:hover { background: #f7f9fc; }
    .col-action { width: 120px; }
    .btn-edit, .btn-delete { padding: 0.4rem 0.75rem; border-radius: 8px; border: none; cursor: pointer; margin-right: 0.5rem; font-size: 0.875rem; color: #fff; }
    .btn-edit { background: #2563eb; }
    .btn-edit:hover { background: #1d4ed8; }
    .btn-delete { background: #dc2626; }
    .btn-delete:hover { background: #b91c1c; }
    .badge-current { padding: 0.2rem 0.5rem; border-radius: 8px; background: #059669; color: #fff; font-size: 0.75rem; font-weight: 600; }
    .badge-inactive { margin-left: 0.35rem; padding: 0.2rem 0.5rem; border-radius: 8px; background: #6b7280; color: #fff; font-size: 0.75rem; font-weight: 600; }
    .text-muted { color: #8aa8c4; }
    .pagination-bar { margin-top: 1rem; padding: 1rem 1.5rem; border-top: 1px solid #e2e8f0; background: #fafbfc; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
    .pagination-info { font-size: 0.9rem; color: #64748b; font-weight: 500; }
    .pagination-controls { display: flex; align-items: center; gap: 0.35rem; }
    .page-btn, .page-num { padding: 0.5rem 0.75rem; border: 1px solid #e2e8f0; background: #fff; border-radius: 8px; cursor: pointer; font-size: 0.9rem; font-weight: 500; min-width: 38px; color: #334155; transition: all 0.2s ease; }
    .page-btn:hover:not(:disabled), .page-num:hover:not(.active) { background: #f1f5f9; border-color: #cbd5e1; color: #0f172a; }
    .page-btn:disabled { opacity: 0.4; cursor: not-allowed; background: #f8fafc; }
    .page-num.active { background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); color: white; border-color: transparent; }
    .page-numbers { display: flex; gap: 0.35rem; }
    .confirm-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .confirm-box { background: #fff; padding: 1.5rem; border-radius: 12px; min-width: 320px; box-shadow: 0 10px 40px rgba(0,0,0,0.15); }
    .confirm-actions { display: flex; gap: 0.75rem; margin-top: 1rem; }
    @media (max-width: 768px) { .academy-form-card, .academy-list-card { padding: 1.25rem; } .list-header { flex-direction: column; align-items: flex-start; } }
  `]
})
export class SessionsComponent implements OnInit {
  sessions: AcademicSession[] = [];
  filteredSessions: AcademicSession[] = [];
  paginatedSessions: AcademicSession[] = [];

  form: AcademicSession = {
    name: '',
    startDate: null,
    endDate: null,
    isCurrent: false,
    isActive: true
  };

  showForm = false;
  loading = false;
  submitted = false;
  editingSession: AcademicSession | null = null;

  searchTerm = '';
  pageSize = 25;
  pageSizeOptions = [10, 25, 50, 100];
  currentPage = 1;

  showDeleteConfirm = false;
  sessionToDelete: AcademicSession | null = null;

  get pageSizeOpts(): DropdownOption[] {
    return this.pageSizeOptions.map(s => ({ value: s, label: '' + s }));
  }

  constructor(
    private sessionService: AcademicSessionService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadSessions();
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredSessions.length / this.pageSize));
  }

  get startEntry(): number {
    if (this.filteredSessions.length === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endEntry(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredSessions.length);
  }

  getPageNumbers(): number[] {
    const total = this.totalPages;
    let start = Math.max(1, this.currentPage - 2);
    let end = Math.min(total, this.currentPage + 2);
    if (end - start < 4) {
      if (start === 1) end = Math.min(total, 5);
      else if (end === total) start = Math.max(1, total - 4);
    }
    const pages: number[] = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  loadSessions() {
    this.loading = true;
    this.sessionService.getAll().subscribe({
      next: (sessions) => {
        this.sessions = sessions;
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.sessions = [];
        this.filteredSessions = [];
        this.updatePaginated();
      }
    });
  }

  applyFilter() {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredSessions = term
      ? this.sessions.filter(s =>
          (s.name || '').toLowerCase().includes(term)
        )
      : [...this.sessions];
    this.currentPage = 1;
    this.updatePaginated();
  }

  updatePaginated() {
    const start = (this.currentPage - 1) * this.pageSize;
    this.paginatedSessions = this.filteredSessions.slice(start, start + this.pageSize);
  }

  onPageSizeChange(value: number | string) {
    const n = typeof value === 'string' ? parseInt(value, 10) : value;
    if (!isNaN(n) && n >= 1) {
      this.pageSize = n;
      this.currentPage = 1;
      this.updatePaginated();
    }
  }

  goToPage(page: number) {
    this.currentPage = Math.max(1, Math.min(page, this.totalPages));
    this.updatePaginated();
  }

  openAddForm() {
    this.editingSession = null;
    this.form = {
      name: '',
      startDate: null,
      endDate: null,
      isCurrent: false,
      isActive: true
    };
    this.submitted = false;
    this.showForm = true;
  }

  openEditForm(session: AcademicSession) {
    this.editingSession = session;
    this.form = {
      academicSessionId: session.academicSessionId,
      name: session.name,
      startDate: session.startDate ? this.toDateInputValue(session.startDate) : null,
      endDate: session.endDate ? this.toDateInputValue(session.endDate) : null,
      isCurrent: session.isCurrent,
      isActive: session.isActive
    };
    this.submitted = false;
    this.showForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelForm() {
    this.showForm = false;
    this.editingSession = null;
    this.submitted = false;
  }

  saveSession() {
    this.submitted = true;
    const name = this.form.name?.trim();
    if (!name) {
      this.notificationService.warning('Session name is required');
      return;
    }

    const payload: AcademicSession = {
      name,
      startDate: this.form.startDate || null,
      endDate: this.form.endDate || null,
      isCurrent: !!this.form.isCurrent,
      isActive: !!this.form.isActive
    };

    const request$ = this.editingSession?.academicSessionId
      ? this.sessionService.update(this.editingSession.academicSessionId, payload)
      : this.sessionService.create(payload);

    request$.subscribe({
      next: () => {
        this.notificationService.success(
          this.editingSession ? 'Session updated successfully' : 'Session created successfully'
        );
        this.cancelForm();
        this.loadSessions();
      },
      error: (err) => {
        const msg = err?.error?.message || 'Failed to save session';
        this.notificationService.error(msg);
      }
    });
  }

  confirmDelete(session: AcademicSession) {
    this.sessionToDelete = session;
    this.showDeleteConfirm = true;
  }

  closeConfirm() {
    this.showDeleteConfirm = false;
    this.sessionToDelete = null;
  }

  deleteSession() {
    if (!this.sessionToDelete?.academicSessionId) {
      this.closeConfirm();
      return;
    }

    this.sessionService.delete(this.sessionToDelete.academicSessionId).subscribe({
      next: () => {
        this.notificationService.success('Session deleted successfully');
        this.closeConfirm();
        this.loadSessions();
      },
      error: () => {
        this.notificationService.error('Failed to delete session');
        this.closeConfirm();
      }
    });
  }

  private toDateInputValue(date: string | Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  openDatePicker(input: HTMLInputElement) {
    const anyInput = input as any;
    if (anyInput && typeof anyInput.showPicker === 'function') {
      anyInput.showPicker();
    }
  }
}

