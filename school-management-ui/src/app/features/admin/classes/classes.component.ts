import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClassService } from '../../../core/services/class.service';
import { Class } from '../../../core/models/student.model';
import { NotificationService } from '../../../shared/services/notification.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { DropdownComponent, DropdownOption } from '../../../shared/components/dropdown/dropdown.component';

@Component({
  selector: 'app-classes',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent, ConfirmDialogComponent, DropdownComponent],
  template: `
    <div class="classes-container">
      <app-loading [show]="loading" [message]="'Loading classes...'"></app-loading>
      
      <div class="page-header-card">
        <div class="header-content">
          <div>
            <h2>Class Management</h2>
            <p class="page-subtitle">Manage classes, fees and academic levels</p>
          </div>
          <button class="btn btn-primary" (click)="showAddForm = true" [disabled]="loading">
            <i class="fa fa-plus"></i> Add New Class
          </button>
        </div>
      </div>

      <div *ngIf="showAddForm || editingClass" class="academy-form-card">
        <h3>{{ editingClass ? 'Edit Class' : 'Add New Class' }}</h3>
        <form (ngSubmit)="saveClass()">
          <div class="academy-form-row">
            <div class="academy-form-group">
              <label>Class Name <span class="required">*</span></label>
                <input 
                  type="text" 
                  [(ngModel)]="classForm.name" 
                  name="name" 
                  required 
                class="academy-input"
                  placeholder="e.g., Grade 1, Class A"
                  [class.is-invalid]="submitted && !classForm.name">
              <div *ngIf="submitted && !classForm.name" class="academy-invalid">Class name is required</div>
            </div>
            <div class="academy-form-group">
              <label>Numeric Name</label>
                <input 
                  type="text" 
                  [(ngModel)]="classForm.nameNumeric" 
                  name="nameNumeric" 
                class="academy-input"
                  placeholder="e.g., 1, 2, 3">
              </div>
            <div class="academy-form-group">
              <label>Fee</label>
              <input
                type="number"
                [(ngModel)]="classForm.fee"
                name="fee"
                class="academy-input"
                placeholder="e.g., 1500"
                min="0"
                step="0.01">
            </div>
          </div>
          <div class="academy-form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="saving">
              <i class="fa fa-spinner fa-spin" *ngIf="saving"></i>
              <span *ngIf="saving">Saving...</span>
              <span *ngIf="!saving">Save Class</span>
            </button>
            <button type="button" class="btn btn-secondary" (click)="cancelForm()" [disabled]="saving">Cancel</button>
          </div>
        </form>
      </div>

      <div class="filters-card" *ngIf="!loading">
        <div class="search-box">
          <i class="fa fa-search"></i>
          <input 
            type="text" 
            [(ngModel)]="searchTerm" 
            (input)="filterClasses()"
            placeholder="Search by class name or numeric name..."
            class="modern-form-control search-input">
        </div>
      </div>

      <div class="academy-table-card" *ngIf="!loading">
        <div class="academy-table-header">
          <div class="academy-table-title">Classes List</div>
          <div class="academy-table-toolbar">
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
            <div class="academy-table-count">Total: {{ filteredClasses.length }} class(es)</div>
          </div>
        </div>
        <div class="academy-table-responsive">
          <table class="academy-table">
            <thead>
              <tr>
                <th>Class Name</th>
                <th>Numeric Name</th>
                <th>Fee</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let classItem of paginatedClasses">
                <td>
                  <strong>{{ classItem.name }}</strong>
                </td>
                <td>
                  <span *ngIf="classItem.nameNumeric" class="numeric-badge">{{ classItem.nameNumeric }}</span>
                  <span *ngIf="!classItem.nameNumeric" class="text-muted">-</span>
                </td>
                <td>
                  <span *ngIf="classItem.fee != null; else noFee">
                    {{ classItem.fee | number:'1.2-2' }}
                  </span>
                  <ng-template #noFee>
                    <span class="text-muted">-</span>
                  </ng-template>
                </td>
                <td>
                  <div class="modern-table-actions">
                    <button class="modern-btn-icon modern-btn-edit" (click)="editClass(classItem)" title="Edit Class">
                      <i class="fa fa-edit"></i>
                    </button>
                    <button class="modern-btn-icon modern-btn-delete" (click)="confirmDelete(classItem)" title="Delete Class">
                      <i class="fa fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="filteredClasses.length === 0 && !loading">
                <td colspan="4" class="academy-table-empty">
                  <p>No classes found</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pagination-bar" *ngIf="filteredClasses.length > 0">
          <div class="pagination-info">
            Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ getPageEndIndex() }} of {{ filteredClasses.length }} entries
          </div>
          <div class="pagination-controls">
            <button class="page-btn" [disabled]="currentPage <= 1" (click)="goToPage(1)" title="First"><i class="fa fa-angle-double-left"></i></button>
            <button class="page-btn" [disabled]="currentPage <= 1" (click)="goToPage(currentPage - 1)" title="Previous"><i class="fa fa-angle-left"></i></button>
            <span class="page-numbers">
              <button *ngFor="let p of getPageNumbers()" class="page-num" [class.active]="p === currentPage" (click)="goToPage(p)">{{ p }}</button>
            </span>
            <button class="page-btn" [disabled]="currentPage >= totalPages" (click)="goToPage(currentPage + 1)" title="Next"><i class="fa fa-angle-right"></i></button>
            <button class="page-btn" [disabled]="currentPage >= totalPages" (click)="goToPage(totalPages)" title="Last"><i class="fa fa-angle-double-right"></i></button>
          </div>
        </div>
      </div>

      <app-confirm-dialog
        [show]="showDeleteConfirm"
        title="Delete Class"
        message="Are you sure you want to delete this class? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        (confirmed)="deleteClass()"
        (cancelled)="showDeleteConfirm = false; classToDelete = null">
      </app-confirm-dialog>
    </div>
  `,
  styles: [`
    .classes-container { padding: 0; position: relative; }
    .page-header-card {
      background: #fff; border-radius: 16px; padding: 1.75rem 2rem; margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;
    }
    .header-content { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
    .page-header-card h2 { margin: 0; font-size: 1.5rem; font-weight: 700; color: #0f2744; }
    .page-subtitle { margin: 0.25rem 0 0 0; font-size: 0.9375rem; color: #6a8cad; }
    .academy-form-card {
      background: #fff; border-radius: 16px; padding: 2rem; margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;
    }
    .academy-form-card h3 { margin: 0 0 1.5rem 0; font-size: 1.25rem; font-weight: 700; color: #0f2744; }
    .academy-form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem; }
    .academy-form-group { display: flex; flex-direction: column; }
    .academy-form-group label { margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 600; color: #1e3a5f; }
    .academy-form-group .required { color: #dc2626; }
    .academy-input {
      padding: 0.75rem 1rem; border: 2px solid #d9e2ec; border-radius: 0.75rem;
      font-size: 0.9375rem; font-weight: 500; color: #0f2744; background: #fff;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .academy-input:focus { outline: none; border-color: #1e3a5f; box-shadow: 0 0 0 4px rgba(30,58,95,0.12); }
    .academy-input.is-invalid { border-color: #dc2626; }
    .academy-invalid { margin-top: 0.5rem; font-size: 0.8125rem; color: #dc2626; font-weight: 500; }
    .academy-form-actions { display: flex; gap: 0.75rem; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #eef2f7; }
    .btn { padding: 0.65rem 1.25rem; border: none; border-radius: 0.75rem; cursor: pointer; font-size: 0.9375rem; font-weight: 600;
      display: inline-flex; align-items: center; gap: 0.5rem; transition: all 0.2s; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none !important; }
    .btn-primary { background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); color: #fff;
      box-shadow: 0 4px 14px rgba(30,58,95,0.35); }
    .btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(30,58,95,0.4); }
    .btn-secondary { background: #6b7280; color: #fff; }
    .btn-secondary:hover:not(:disabled) { background: #4b5563; }
    .academy-table-card { background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .filters-card {
      display: flex; gap: 1rem; margin-bottom: 1.5rem; padding: 1.25rem 1.5rem;
      background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .search-box { position: relative; flex: 1; min-width: 300px; }
    .search-box i { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #8aa8c4; z-index: 1; }
    .search-input { padding-left: 3rem; }
    .academy-table-header { padding: 1.25rem 1.5rem; background: #f7f9fc; border-bottom: 1px solid #e2e8f0;
      display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
    .academy-table-title { font-size: 1.0625rem; font-weight: 700; color: #0f2744; }
    .academy-table-toolbar { display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap; }
    .show-entries { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; color: #6a8cad; }
    .entries-select { padding: 0.35rem 0.6rem; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 0.9rem; background: white; min-width: 60px; }
    .academy-table-count { font-size: 0.9rem; font-weight: 500; color: #6a8cad; }
    .pagination-bar { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; border-top: 1px solid #e2e8f0; background: #fafbfc; flex-wrap: wrap; gap: 1rem; }
    .pagination-info { font-size: 0.9rem; color: #64748b; font-weight: 500; }
    .pagination-controls { display: flex; align-items: center; gap: 0.35rem; }
    .page-btn, .page-num { padding: 0.5rem 0.75rem; border: 1px solid #e2e8f0; background: #fff; border-radius: 8px; cursor: pointer; font-size: 0.9rem; font-weight: 500; min-width: 38px; color: #334155; transition: all 0.2s ease; }
    .page-btn:hover:not(:disabled), .page-num:hover:not(.active) { background: #f1f5f9; border-color: #cbd5e1; color: #0f172a; }
    .page-btn:disabled { opacity: 0.4; cursor: not-allowed; background: #f8fafc; }
    .page-num.active { background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); color: white; border-color: transparent; }
    .page-numbers { display: flex; gap: 0.35rem; }
    .academy-table-responsive { overflow-x: auto; }
    .academy-table { width: 100%; border-collapse: collapse; }
    .academy-table thead { background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); }
    .academy-table th { padding: 0.875rem 1rem; text-align: left; font-size: 0.8125rem; font-weight: 600; color: #fff; text-transform: uppercase; letter-spacing: 0.05em; }
    .academy-table td { padding: 1rem; border-bottom: 1px solid #eef2f7; font-size: 0.9375rem; color: #435d7a; }
    .academy-table tbody tr:hover { background: #f7f9fc; }
    .academy-table .modern-table-actions { display: flex; gap: 0.5rem; }
    .academy-table .modern-btn-icon { width: 34px; height: 34px; border-radius: 8px; border: none; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s; }
    .academy-table .modern-btn-edit { background: #2563eb; color: #fff; }
    .academy-table .modern-btn-edit:hover { background: #1d4ed8; }
    .academy-table .modern-btn-delete { background: #dc2626; color: #fff; }
    .academy-table .modern-btn-delete:hover { background: #b91c1c; }
    .id-badge { display: inline-flex; align-items: center; justify-content: center; min-width: 32px; height: 28px; padding: 0 0.5rem; background: #eef2f7; border-radius: 8px; font-weight: 600; color: #435d7a; font-size: 0.875rem; }
    .numeric-badge { display: inline-flex; padding: 0.25rem 0.6rem; background: rgba(30,58,95,0.1); border-radius: 8px; font-weight: 600; color: #1e3a5f; font-size: 0.875rem; }
    .text-muted { color: #8aa8c4; font-style: italic; }
    .academy-table-empty { padding: 3rem; text-align: center; color: #6a8cad; }
    .academy-table-empty p { margin: 0; font-size: 1rem; }
    @media (max-width: 768px) { .header-content { flex-direction: column; align-items: flex-start; } }
  `]
})
export class ClassesComponent implements OnInit {
  classes: Class[] = [];
  filteredClasses: Class[] = [];
  searchTerm = '';
  pageSizeOptions = [10, 25, 50, 100];
  pageSize = 10;
  currentPage = 1;
  showAddForm: boolean = false;
  editingClass: Class | null = null;
  loading: boolean = false;
  saving: boolean = false;
  submitted: boolean = false;
  showDeleteConfirm: boolean = false;
  classToDelete: number | null = null;

  get pageSizeOpts(): DropdownOption[] {
    return this.pageSizeOptions.map(s => ({ value: s, label: '' + s }));
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredClasses.length / this.pageSize));
  }

  get paginatedClasses(): Class[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredClasses.slice(start, start + this.pageSize);
  }
  
  classForm: Partial<Class> = {
    name: '',
    nameNumeric: '',
    fee: undefined
  };

  constructor(
    private classService: ClassService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadClasses();
  }

  filterClasses() {
    if (!this.searchTerm.trim()) {
      this.filteredClasses = this.classes;
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredClasses = this.classes.filter(c =>
        c.name?.toLowerCase().includes(term) ||
        (c.nameNumeric || '').toLowerCase().includes(term)
      );
    }
    this.currentPage = 1;
  }

  pageSizeChange() { this.currentPage = 1; }
  goToPage(page: number) { this.currentPage = Math.max(1, Math.min(page, this.totalPages)); }
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
  getPageEndIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredClasses.length);
  }

  loadClasses() {
    this.loading = true;
    this.classService.getAllClasses().subscribe({
      next: (classes) => {
        this.classes = classes;
        this.filterClasses();
        this.loading = false;
      },
      error: (error) => {
        this.notificationService.error('Failed to load classes');
        console.error('Error loading classes:', error);
        this.classes = [];
        this.filteredClasses = [];
        this.loading = false;
      }
    });
  }

  saveClass() {
    this.submitted = true;
    
    if (!this.classForm.name) {
      this.notificationService.warning('Please enter a class name');
      return;
    }

    this.saving = true;
    const operation = this.editingClass
      ? this.classService.updateClass(this.editingClass.classId, this.classForm as Class)
      : this.classService.createClass(this.classForm as Class);

    operation.subscribe({
      next: () => {
        this.notificationService.success(
          this.editingClass ? 'Class updated successfully' : 'Class created successfully'
        );
        this.loadClasses();
        this.cancelForm();
        this.saving = false;
      },
      error: (error) => {
        const errorMsg = error.error?.message || 'Failed to save class';
        this.notificationService.error(errorMsg);
        console.error('Error saving class:', error);
        this.saving = false;
      }
    });
  }

  editClass(classItem: Class) {
    this.editingClass = classItem;
    this.classForm = { ...classItem };
    this.showAddForm = true;
    this.submitted = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  confirmDelete(classItem: Class) {
    this.classToDelete = classItem.classId;
    this.showDeleteConfirm = true;
  }

  deleteClass() {
    if (!this.classToDelete) return;

    this.loading = true;
    this.classService.deleteClass(this.classToDelete).subscribe({
      next: () => {
        this.notificationService.success('Class deleted successfully');
        this.loadClasses();
        this.showDeleteConfirm = false;
        this.classToDelete = null;
        this.loading = false;
      },
      error: (error) => {
        const errorMsg = error.error?.message || 'Failed to delete class';
        this.notificationService.error(errorMsg);
        console.error('Error deleting class:', error);
        this.showDeleteConfirm = false;
        this.classToDelete = null;
        this.loading = false;
      }
    });
  }

  cancelForm() {
    this.showAddForm = false;
    this.editingClass = null;
    this.submitted = false;
    this.classForm = {
      name: '',
      nameNumeric: '',
      fee: undefined
    };
  }
}
