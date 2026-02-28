import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AcademicSessionService } from '../../../core/services/academic-session.service';
import { AcademicSession } from '../../../core/models/academic-session.model';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-sessions',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="sessions-container">
      <!-- New / Edit Session form -->
      <div *ngIf="showForm" class="form-card">
        <h2 class="form-title">{{ editingSession ? 'NEW SESSION' : 'NEW SESSION' }}</h2>

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
      <div class="list-card" *ngIf="!showForm">
        <div class="list-header">
          <h2 class="list-title">SESSIONS</h2>
          <button type="button" class="btn-add" (click)="openAddForm()">
            <i class="fa fa-plus"></i> Add New
          </button>
        </div>

        <div class="toolbar">
          <span class="show-entries">
            Show
            <select class="entries-select" [ngModel]="pageSize" (ngModelChange)="onPageSizeChange($event)">
              <option *ngFor="let opt of pageSizeOptions" [ngValue]="opt">{{ opt }}</option>
            </select>
            entries
          </span>
          <div class="search-box">
            <label for="search">Search:</label>
            <input
              id="search"
              type="text"
              class="search-input"
              [(ngModel)]="searchTerm"
              (ngModelChange)="applyFilter()"
              (input)="applyFilter()"
            />
          </div>
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
                <td colspan="3">Loading...</td>
              </tr>
              <tr *ngIf="!loading && paginatedSessions.length === 0">
                <td colspan="3">No entries found</td>
              </tr>
              <tr *ngFor="let s of paginatedSessions; let i = index">
                <td>{{ (currentPage - 1) * pageSize + i + 1 }}</td>
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

        <div class="pagination-bar">
          <span class="pagination-info">
            Showing {{ startEntry }} to {{ endEntry }} of {{ filteredSessions.length }} entries
          </span>
          <div class="pagination-buttons">
            <button
              type="button"
              class="btn-pagination"
              [disabled]="currentPage <= 1"
              (click)="goToPage(currentPage - 1)"
            >
              Previous
            </button>
            <span class="page-numbers">
              <button
                *ngFor="let p of pageNumbers"
                type="button"
                class="btn-page-num"
                [class.active]="p === currentPage"
                [class.ellipsis]="p === -1"
                [disabled]="p === -1"
                (click)="p !== -1 && goToPage(p)"
              >
                {{ p === -1 ? '...' : p }}
              </button>
            </span>
            <button
              type="button"
              class="btn-pagination"
              [disabled]="currentPage >= totalPages"
              (click)="goToPage(currentPage + 1)"
            >
              Next
            </button>
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
    .sessions-container {
      padding: 1.5rem 2rem;
      background-color: #f5ebe0;
      min-height: calc(100vh - 120px);
    }

    .form-card {
      background: #fdf1dc;
      border-radius: 4px;
      padding: 1.5rem 2rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      max-width: 700px;
    }

    .form-title {
      margin: 0 0 1.25rem;
      font-size: 1rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #333;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      font-size: 0.9rem;
      font-weight: 500;
      margin-bottom: 0.35rem;
      color: #333;
    }

    .form-input {
      width: 100%;
      padding: 0.5rem 0.75rem;
      border: 1px solid #d2b892;
      border-radius: 4px;
      background: #fffdf8;
      font-size: 0.95rem;
    }

    .form-input.is-invalid {
      border-color: #dc3545;
    }

    .form-row {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .form-row .form-group {
      flex: 1;
      min-width: 200px;
    }

    .toggles-row {
      margin-top: 0.5rem;
    }

    .toggle {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.9rem;
      color: #444;
    }

    .form-actions {
      margin-top: 1.25rem;
      display: flex;
      gap: 0.75rem;
    }

    .btn-save,
    .btn-cancel {
      padding: 0.45rem 1.25rem;
      border-radius: 4px;
      border: none;
      font-size: 0.9rem;
      cursor: pointer;
    }

    .btn-save {
      background: #28a745;
      color: #fff;
    }

    .btn-save:hover {
      background: #218838;
    }

    .btn-cancel {
      background: #6c757d;
      color: #fff;
    }

    .btn-cancel:hover {
      background: #5a6268;
    }

    .list-card {
      background: #fdf1dc;
      border-radius: 4px;
      padding: 1.5rem 2rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }

    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .list-title {
      margin: 0 0 0.75rem;
      font-size: 1rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #333;
    }

    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 0.75rem;
    }

    .show-entries {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      color: #555;
    }

    .entries-select {
      padding: 0.35rem 1.75rem 0.35rem 0.5rem;
      border: 1px solid #d4c4a8;
      border-radius: 4px;
      font-size: 0.9rem;
      background: #fff;
      cursor: pointer;
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
    }

    .search-input {
      padding: 0.4rem 0.75rem;
      border: 1px solid #d4c4a8;
      border-radius: 4px;
      font-size: 0.9rem;
      min-width: 200px;
    }

    .btn-add {
      margin-left: auto;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: #28a745;
      color: #fff;
      border: none;
      border-radius: 4px;
      font-size: 0.9rem;
      cursor: pointer;
    }

    .btn-add:hover {
      background: #218838;
    }

    .table-wrapper {
      background: #fff;
      border-radius: 4px;
      overflow-x: auto;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }

    .data-table th,
    .data-table td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #eee;
      text-align: left;
    }

    .data-table th {
      background: #f9f6f1;
      font-weight: 600;
      color: #444;
    }

    .col-action {
      width: 120px;
    }

    .btn-edit,
    .btn-delete {
      padding: 0.35rem 0.6rem;
      border-radius: 4px;
      border: none;
      cursor: pointer;
      margin-right: 0.35rem;
      font-size: 0.9rem;
      color: #fff;
    }

    .btn-edit {
      background: #fd7e14;
    }

    .btn-edit:hover {
      background: #e96b00;
    }

    .btn-delete {
      background: #dc3545;
    }

    .btn-delete:hover {
      background: #c82333;
    }

    .badge-current {
      margin-left: 0.5rem;
      padding: 0.15rem 0.5rem;
      border-radius: 999px;
      background: #28a745;
      color: #fff;
      font-size: 0.7rem;
      text-transform: uppercase;
    }

    .badge-inactive {
      margin-left: 0.5rem;
      padding: 0.15rem 0.5rem;
      border-radius: 999px;
      background: #6c757d;
      color: #fff;
      font-size: 0.7rem;
      text-transform: uppercase;
    }

    .pagination-bar {
      margin-top: 0.75rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.75rem;
      font-size: 0.9rem;
    }

    .pagination-buttons {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-pagination {
      padding: 0.4rem 1rem;
      border: 1px solid #d4c4a8;
      border-radius: 4px;
      background: #fff;
      cursor: pointer;
    }

    .btn-pagination:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .page-numbers {
      display: flex;
      gap: 0.25rem;
    }

    .btn-page-num {
      min-width: 2rem;
      padding: 0.4rem 0.6rem;
      border: 1px solid #d4c4a8;
      border-radius: 4px;
      background: #fff;
      cursor: pointer;
    }

    .btn-page-num.active {
      background: #28a745;
      border-color: #28a745;
      color: #fff;
    }

    .btn-page-num.ellipsis {
      border: none;
      background: transparent;
      cursor: default;
    }

    .confirm-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .confirm-box {
      background: #fff;
      padding: 1.5rem;
      border-radius: 8px;
      min-width: 320px;
    }

    .confirm-actions {
      display: flex;
      gap: 0.75rem;
      margin-top: 1rem;
    }

    @media (max-width: 768px) {
      .sessions-container {
        padding: 1rem;
      }

      .form-card,
      .list-card {
        padding: 1rem 1.25rem;
      }
    }
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

  get pageNumbers(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const pages: number[] = [];
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push(-1);
      pages.push(total);
    } else if (current >= total - 3) {
      pages.push(1);
      pages.push(-1);
      for (let i = total - 4; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push(-1);
      pages.push(current - 1, current, current + 1);
      pages.push(-1);
      pages.push(total);
    }
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

