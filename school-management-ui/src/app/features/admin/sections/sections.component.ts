import { Component, OnInit } from '@angular/core';
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
      
      <div class="page-header">
        <div class="header-content">
          <h2><i class="fa fa-list"></i> Section Management</h2>
          <button class="btn btn-primary" (click)="showAddForm = true" [disabled]="loading">
            <i class="fa fa-plus"></i> Add New Section
          </button>
        </div>
      </div>

      <div *ngIf="showAddForm || editingSection" class="modern-form-card">
        <h3>
          <i class="fa" [class.fa-list-plus]="!editingSection" [class.fa-list-ul]="editingSection"></i>
          {{ editingSection ? 'Edit Section' : 'Add New Section' }}
        </h3>
        <form (ngSubmit)="saveSection()">
          <div class="modern-form-row">
            <div class="modern-form-group">
              <label>
                <i class="fa fa-list"></i>
                Section Name
                <span class="required-indicator">*</span>
              </label>
              <div class="modern-input-wrapper">
                <i class="fa fa-list modern-input-icon"></i>
                <input 
                  type="text" 
                  [(ngModel)]="sectionForm.name" 
                  name="name" 
                  required 
                  class="modern-form-control"
                  placeholder="e.g., Section A, Section B"
                  [class.is-invalid]="submitted && !sectionForm.name">
              </div>
              <div *ngIf="submitted && !sectionForm.name" class="modern-invalid-feedback">
                <i class="fa fa-exclamation-circle"></i>
                Section name is required
              </div>
            </div>
            <div class="modern-form-group">
              <label>
                <i class="fa fa-book"></i>
                Class
                <span class="required-indicator">*</span>
              </label>
              <div class="modern-select-wrapper">
                <select 
                  [(ngModel)]="sectionForm.classId" 
                  name="classId" 
                  required 
                  class="modern-form-control"
                  [class.is-invalid]="submitted && !sectionForm.classId">
                  <option value="">Select Class</option>
                  <option *ngFor="let cls of classes" [value]="cls.classId">{{ cls.name }}</option>
                </select>
              </div>
              <div *ngIf="submitted && !sectionForm.classId" class="modern-invalid-feedback">
                <i class="fa fa-exclamation-circle"></i>
                Class is required
              </div>
            </div>
          </div>
          <div class="modern-form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="saving">
              <i class="fa" [class.fa-spinner]="saving" [class.fa-spin]="saving" [class.fa-save]="!saving"></i>
              <span *ngIf="saving">Saving...</span>
              <span *ngIf="!saving">Save Section</span>
            </button>
            <button type="button" class="btn btn-secondary" (click)="cancelForm()" [disabled]="saving">
              <i class="fa fa-times"></i>
              Cancel
            </button>
          </div>
        </form>
      </div>

      <div class="modern-table-card">
        <div class="modern-table-header">
          <div class="modern-table-title">
            <i class="fa fa-table"></i>
            Sections List
          </div>
          <div class="modern-table-count">
            <i class="fa fa-list"></i>
            <span>Total: {{ sections.length }} section(s)</span>
          </div>
        </div>
        <div class="modern-table-responsive">
          <table class="modern-table">
            <thead>
              <tr>
                <th><i class="fa fa-hashtag"></i> ID</th>
                <th><i class="fa fa-list"></i> Section Name</th>
                <th><i class="fa fa-book"></i> Class</th>
                <th><i class="fa fa-cog"></i> Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let section of sections">
                <td>
                  <span class="id-badge">{{ section.sectionId }}</span>
                </td>
                <td>
                  <strong>{{ section.name }}</strong>
                </td>
                <td>
                  <span *ngIf="section.class?.name" class="modern-badge modern-badge-primary">
                    <i class="fa fa-book"></i>
                    {{ section.class?.name }}
                  </span>
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
              <tr *ngIf="sections.length === 0 && !loading">
                <td colspan="4" class="modern-table-empty">
                  <i class="fa fa-inbox"></i>
                  <p>No sections found</p>
                </td>
              </tr>
            </tbody>
          </table>
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
    .sections-container {
      padding: 2rem;
      position: relative;
    }
    
    .page-header {
      margin-bottom: 2rem;
    }
    
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }
    
    .page-header h2 {
      margin: 0;
      color: var(--text-primary);
      font-size: 1.75rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .page-header h2 i {
      color: var(--primary);
    }
    
    .btn {
      padding: 0.875rem 1.75rem;
      border: none;
      border-radius: var(--radius-lg);
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      transition: all var(--transition-fast);
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      box-shadow: var(--shadow-md);
    }
    
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
    }
    
    .btn-primary {
      background: var(--primary-gradient);
      color: var(--text-inverse);
    }
    
    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }
    
    .btn-secondary {
      background: var(--gray-600);
      color: var(--text-inverse);
    }
    
    .btn-secondary:hover:not(:disabled) {
      background: var(--gray-700);
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }
    
    .id-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: var(--bg-secondary);
      border-radius: var(--radius-md);
      font-weight: 600;
      color: var(--text-secondary);
      font-size: 0.875rem;
    }
    
    .text-muted {
      color: var(--text-tertiary);
      font-style: italic;
    }
    
    @media (max-width: 768px) {
      .sections-container {
        padding: 1rem;
      }
      
      .header-content {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `]
})
export class SectionsComponent implements OnInit {
  sections: Section[] = [];
  classes: Class[] = [];
  showAddForm: boolean = false;
  editingSection: Section | null = null;
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
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadSections();
    this.loadClasses();
  }

  loadSections() {
    this.loading = true;
    this.sectionService.getAllSections().subscribe({
      next: (sections) => {
        this.sections = sections;
        this.loading = false;
      },
      error: (error) => {
        this.notificationService.error('Failed to load sections');
        console.error('Error loading sections:', error);
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
