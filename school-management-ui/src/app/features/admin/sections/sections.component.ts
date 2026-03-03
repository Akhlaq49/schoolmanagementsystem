import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SectionService } from '../../../core/services/section.service';
import { ClassService } from '../../../core/services/class.service';
import { Section } from '../../../core/models/section.model';
import { Class } from '../../../core/models/student.model';
import { NotificationService } from '../../../shared/services/notification.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-sections',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent, ConfirmDialogComponent],
  template: `
    <div class="sections-container">
      <app-loading [show]="loading" [message]="'Loading sections...'"></app-loading>
      
      <div class="page-header-card">
        <div class="header-content">
          <div>
            <h2>Section Management</h2>
            <p class="page-subtitle">Manage sections within classes</p>
          </div>
          <button class="btn btn-primary" (click)="showAddForm = true" [disabled]="loading">
            <i class="fa fa-plus"></i> Add New Section
          </button>
        </div>
      </div>

      <div *ngIf="showAddForm || editingSection" class="academy-form-card">
        <h3>{{ editingSection ? 'Edit Section' : 'Add New Section' }}</h3>
        <form (ngSubmit)="saveSection()">
          <div class="academy-form-row">
            <div class="academy-form-group">
              <label>Section Name <span class="required">*</span></label>
              <input 
                type="text" 
                [(ngModel)]="sectionForm.name" 
                name="name" 
                required 
                class="academy-input"
                placeholder="e.g., Section A, Section B"
                [class.is-invalid]="submitted && !sectionForm.name">
              <div *ngIf="submitted && !sectionForm.name" class="academy-invalid">Section name is required</div>
            </div>
            <div class="academy-form-group">
              <label>Class <span class="required">*</span></label>
              <select 
                [(ngModel)]="sectionForm.classId" 
                name="classId" 
                required 
                class="academy-select"
                [class.is-invalid]="submitted && !sectionForm.classId">
                <option value="">Select Class</option>
                <option *ngFor="let cls of classes" [value]="cls.classId">{{ cls.name }}</option>
              </select>
              <div *ngIf="submitted && !sectionForm.classId" class="academy-invalid">Class is required</div>
            </div>
          </div>
          <div class="academy-form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="saving">
              <i class="fa fa-spinner fa-spin" *ngIf="saving"></i>
              <span *ngIf="saving">Saving...</span>
              <span *ngIf="!saving">Save Section</span>
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
            (input)="filterSections()"
            placeholder="Search by section name..."
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

      <div class="academy-table-card" *ngIf="!loading">
        <div class="academy-table-header">
          <div class="academy-table-title">Sections List</div>
          <div class="academy-table-toolbar">
            <div class="show-entries">
              <span>Show</span>
              <select [(ngModel)]="pageSize" (ngModelChange)="pageSizeChange()" class="entries-select">
                <option *ngFor="let size of pageSizeOptions" [ngValue]="size">{{ size }}</option>
              </select>
              <span>entries</span>
            </div>
            <div class="academy-table-count">Total: {{ filteredSections.length }} section(s)</div>
          </div>
        </div>
        <div class="academy-table-responsive">
          <table class="academy-table">
            <thead>
              <tr>
                <th>Section Name</th>
                <th>Class</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let section of paginatedSections">
                <td>
                  <strong>{{ section.name }}</strong>
                </td>
                <td>
                  <span *ngIf="section.class?.name" class="academy-badge">{{ section.class?.name }}</span>
                  <span *ngIf="!section.class?.name" class="text-muted">-</span>
                </td>
                <td>
                  <div class="modern-table-actions">
                    <button class="modern-btn-icon modern-btn-edit" (click)="editSection(section)" title="Edit Section">
                      <i class="fa fa-edit"></i>
                    </button>
                    <button class="modern-btn-icon modern-btn-delete" (click)="confirmDelete(section)" title="Delete Section">
                      <i class="fa fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="filteredSections.length === 0 && !loading">
                <td colspan="3" class="academy-table-empty">
                  <p>No sections found</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pagination-bar" *ngIf="filteredSections.length > 0">
          <div class="pagination-info">
            Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ getPageEndIndex() }} of {{ filteredSections.length }} entries
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
        title="Delete Section"
        message="Are you sure you want to delete this section? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        (confirmed)="deleteSection()"
        (cancelled)="showDeleteConfirm = false; sectionToDelete = null">
      </app-confirm-dialog>
    </div>
  `,
  styles: [`
    .sections-container { padding: 0; position: relative; }
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
    .academy-input, .academy-select {
      padding: 0.75rem 1rem; border: 2px solid #d9e2ec; border-radius: 0.75rem;
      font-size: 0.9375rem; font-weight: 500; color: #0f2744; background: #fff;
      transition: border-color 0.2s, box-shadow 0.2s; cursor: pointer;
    }
    .academy-input:focus, .academy-select:focus { outline: none; border-color: #1e3a5f; box-shadow: 0 0 0 4px rgba(30,58,95,0.12); }
    .academy-input.is-invalid, .academy-select.is-invalid { border-color: #dc2626; }
    .academy-invalid { margin-top: 0.5rem; font-size: 0.8125rem; color: #dc2626; font-weight: 500; }
    .academy-form-actions { display: flex; gap: 0.75rem; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #eef2f7; }
    .btn { padding: 0.65rem 1.25rem; border: none; border-radius: 0.75rem; cursor: pointer; font-size: 0.9375rem; font-weight: 600;
      display: inline-flex; align-items: center; gap: 0.5rem; transition: all 0.2s; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none !important; }
    .btn-primary { background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); color: #fff; box-shadow: 0 4px 14px rgba(30,58,95,0.35); }
    .btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(30,58,95,0.4); }
    .btn-secondary { background: #6b7280; color: #fff; }
    .btn-secondary:hover:not(:disabled) { background: #4b5563; }
    .filters-card {
      display: flex; gap: 1rem; margin-bottom: 1.5rem; padding: 1.25rem 1.5rem;
      background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .search-box { position: relative; flex: 1; min-width: 300px; }
    .search-box i { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #8aa8c4; z-index: 1; }
    .search-input { padding-left: 3rem; }
    .class-filter-box { position: relative; min-width: 220px; }
    .class-filter-trigger {
      display: flex; align-items: center; gap: 0.5rem; width: 100%; min-height: 44px; padding: 0.6rem 1rem;
      font-size: 0.9375rem; font-weight: 500; color: #0f2744; background: #fff; border: 1px solid #e2e8f0;
      border-radius: 10px; cursor: pointer; text-align: left; transition: border-color 0.2s, box-shadow 0.2s;
    }
    .class-filter-trigger:hover { border-color: #cbd5e1; }
    .class-filter-trigger.open { border-color: #1e3a5f; box-shadow: 0 0 0 3px rgba(30,58,95,0.15); }
    .class-filter-trigger i.fa-book { color: #8aa8c4; font-size: 0.95rem; }
    .class-filter-trigger span { flex: 1; }
    .trigger-chevron { color: #8aa8c4; font-size: 0.75rem; transition: transform 0.2s ease; }
    .class-filter-trigger.open .trigger-chevron { transform: rotate(180deg); }
    .class-filter-dropdown {
      position: absolute; top: 100%; left: 0; right: 0; margin-top: 4px; padding: 6px;
      background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; box-shadow: 0 10px 40px rgba(0,0,0,0.12); z-index: 1000;
    }
    .class-filter-option {
      display: block; width: 100%; padding: 10px 14px; font-size: 0.9375rem; font-weight: 500; color: #0f2744;
      background: transparent; border: none; border-radius: 6px; cursor: pointer; text-align: left; transition: background 0.15s, color 0.15s;
    }
    .class-filter-option:hover { background: #f1f5f9; color: #1e3a5f; }
    .class-filter-option.selected { background: rgba(30,58,95,0.1); color: #1e3a5f; }
    .academy-table-card { background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
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
    .academy-badge { display: inline-flex; padding: 0.25rem 0.6rem; background: rgba(30,58,95,0.1); border-radius: 8px; font-weight: 600; color: #1e3a5f; font-size: 0.875rem; }
    .academy-table .modern-table-actions { display: flex; gap: 0.5rem; }
    .academy-table .modern-btn-icon { width: 34px; height: 34px; border-radius: 8px; border: none; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s; }
    .academy-table .modern-btn-edit { background: #2563eb; color: #fff; }
    .academy-table .modern-btn-edit:hover { background: #1d4ed8; }
    .academy-table .modern-btn-delete { background: #dc2626; color: #fff; }
    .academy-table .modern-btn-delete:hover { background: #b91c1c; }
    .id-badge { display: inline-flex; align-items: center; justify-content: center; min-width: 32px; height: 28px; padding: 0 0.5rem; background: #eef2f7; border-radius: 8px; font-weight: 600; color: #435d7a; font-size: 0.875rem; }
    .text-muted { color: #8aa8c4; font-style: italic; }
    .academy-table-empty { padding: 3rem; text-align: center; color: #6a8cad; }
    .academy-table-empty p { margin: 0; font-size: 1rem; }
    @media (max-width: 768px) { .header-content { flex-direction: column; align-items: flex-start; } }
  `]
})
export class SectionsComponent implements OnInit {
  sections: Section[] = [];
  filteredSections: Section[] = [];
  classes: Class[] = [];
  searchTerm = '';
  selectedClassId: number | null = null;
  classFilterOpen = false;
  pageSizeOptions = [10, 25, 50, 100];
  pageSize = 10;
  currentPage = 1;
  showAddForm: boolean = false;
  editingSection: Section | null = null;

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredSections.length / this.pageSize));
  }

  get paginatedSections(): Section[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredSections.slice(start, start + this.pageSize);
  }
  loading: boolean = false;
  saving: boolean = false;
  submitted: boolean = false;
  showDeleteConfirm: boolean = false;
  sectionToDelete: number | null = null;
  
  sectionForm: Partial<Section> = {
    name: '',
    classId: undefined
  };

  constructor(
    private sectionService: SectionService,
    private classService: ClassService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadSections();
    this.loadClasses();
  }

  filterSections() {
    let list = this.sections;
    if (this.selectedClassId != null) {
      list = list.filter(s => s.classId === this.selectedClassId);
    }
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      list = list.filter(s => s.name?.toLowerCase().includes(term));
    }
    this.filteredSections = list;
    this.currentPage = 1;
  }

  toggleClassFilter(event: MouseEvent) {
    event.stopPropagation();
    this.classFilterOpen = !this.classFilterOpen;
  }

  selectClass(classId: number | null) {
    this.selectedClassId = classId;
    this.classFilterOpen = false;
    this.filterSections();
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
    return Math.min(this.currentPage * this.pageSize, this.filteredSections.length);
  }

  @HostListener('document:mousedown', ['$event'])
  onDocumentMouseDown(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target?.closest('.class-filter-box')) this.classFilterOpen = false;
  }

  loadSections() {
    this.loading = true;
    this.sectionService.getAllSections().subscribe({
      next: (sections) => {
        this.sections = sections;
        this.filterSections();
        this.loading = false;
      },
      error: (error) => {
        this.notificationService.error('Failed to load sections');
        console.error('Error loading sections:', error);
        this.sections = [];
        this.filteredSections = [];
        this.loading = false;
      }
    });
  }

  loadClasses() {
    this.classService.getAllClasses().subscribe({
      next: (classes) => {
        this.classes = classes;
      },
      error: (error) => {
        this.notificationService.error('Failed to load classes');
        console.error('Error loading classes:', error);
      }
    });
  }

  saveSection() {
    this.submitted = true;
    
    if (!this.sectionForm.name || !this.sectionForm.classId) {
      this.notificationService.warning('Please fill in all required fields');
      return;
    }

    this.saving = true;
    const operation = this.editingSection
      ? this.sectionService.updateSection(this.editingSection.sectionId, this.sectionForm as Section)
      : this.sectionService.createSection(this.sectionForm as Section);

    operation.subscribe({
      next: () => {
        this.notificationService.success(
          this.editingSection ? 'Section updated successfully' : 'Section created successfully'
        );
        this.loadSections();
        this.cancelForm();
        this.saving = false;
      },
      error: (error) => {
        const errorMsg = error.error?.message || 'Failed to save section';
        this.notificationService.error(errorMsg);
        console.error('Error saving section:', error);
        this.saving = false;
      }
    });
  }

  editSection(section: Section) {
    this.editingSection = section;
    this.sectionForm = { ...section };
    this.showAddForm = true;
    this.submitted = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  confirmDelete(section: Section) {
    this.sectionToDelete = section.sectionId;
    this.showDeleteConfirm = true;
  }

  deleteSection() {
    if (!this.sectionToDelete) return;

    this.loading = true;
    this.sectionService.deleteSection(this.sectionToDelete).subscribe({
      next: () => {
        this.notificationService.success('Section deleted successfully');
        this.loadSections();
        this.showDeleteConfirm = false;
        this.sectionToDelete = null;
        this.loading = false;
      },
      error: (error) => {
        const errorMsg = error.error?.message || 'Failed to delete section';
        this.notificationService.error(errorMsg);
        console.error('Error deleting section:', error);
        this.showDeleteConfirm = false;
        this.sectionToDelete = null;
        this.loading = false;
      }
    });
  }

  cancelForm() {
    this.showAddForm = false;
    this.editingSection = null;
    this.submitted = false;
    this.sectionForm = {
      name: '',
      classId: undefined
    };
  }
}
