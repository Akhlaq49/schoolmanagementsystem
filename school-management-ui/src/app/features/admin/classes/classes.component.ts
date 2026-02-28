import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClassService } from '../../../core/services/class.service';
import { Class } from '../../../core/models/student.model';
import { NotificationService } from '../../../shared/services/notification.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-classes',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent, ConfirmDialogComponent],
  template: `
    <div class="classes-container">
      <app-loading [show]="loading" [message]="'Loading classes...'"></app-loading>
      
      <div class="page-header">
        <div class="header-content">
          <h2><i class="fa fa-book"></i> Class Management</h2>
          <button class="btn btn-primary" (click)="showAddForm = true" [disabled]="loading">
            <i class="fa fa-plus"></i> Add New Class
          </button>
        </div>
      </div>

      <div *ngIf="showAddForm || editingClass" class="modern-form-card">
        <h3>
          <i class="fa" [class.fa-book-medical]="!editingClass" [class.fa-book-open]="editingClass"></i>
          {{ editingClass ? 'Edit Class' : 'Add New Class' }}
        </h3>
        <form (ngSubmit)="saveClass()">
          <div class="modern-form-row">
            <div class="modern-form-group">
              <label>
                <i class="fa fa-book"></i>
                Class Name
                <span class="required-indicator">*</span>
              </label>
              <div class="modern-input-wrapper">
                <i class="fa fa-book modern-input-icon"></i>
                <input 
                  type="text" 
                  [(ngModel)]="classForm.name" 
                  name="name" 
                  required 
                  class="modern-form-control"
                  placeholder="e.g., Grade 1, Class A"
                  [class.is-invalid]="submitted && !classForm.name">
              </div>
              <div *ngIf="submitted && !classForm.name" class="modern-invalid-feedback">
                <i class="fa fa-exclamation-circle"></i>
                Class name is required
              </div>
            </div>
            <div class="modern-form-group">
              <label>
                <i class="fa fa-hashtag"></i>
                Numeric Name
              </label>
              <div class="modern-input-wrapper">
                <i class="fa fa-hashtag modern-input-icon"></i>
                <input 
                  type="text" 
                  [(ngModel)]="classForm.nameNumeric" 
                  name="nameNumeric" 
                  class="modern-form-control"
                  placeholder="e.g., 1, 2, 3">
              </div>
            </div>
            <div class="modern-form-group">
              <label>
                <i class="fa fa-money"></i>
                Fee
              </label>
              <div class="modern-input-wrapper">
                <i class="fa fa-money modern-input-icon"></i>
                <input
                  type="number"
                  [(ngModel)]="classForm.fee"
                  name="fee"
                  class="modern-form-control"
                  placeholder="e.g., 1500"
                  min="0"
                  step="0.01">
              </div>
            </div>
          </div>
          <div class="modern-form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="saving">
              <i class="fa" [class.fa-spinner]="saving" [class.fa-spin]="saving" [class.fa-save]="!saving"></i>
              <span *ngIf="saving">Saving...</span>
              <span *ngIf="!saving">Save Class</span>
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
            Classes List
          </div>
          <div class="modern-table-count">
            <i class="fa fa-book"></i>
            <span>Total: {{ classes.length }} class(es)</span>
          </div>
        </div>
        <div class="modern-table-responsive">
          <table class="modern-table">
            <thead>
              <tr>
                <th><i class="fa fa-hashtag"></i> ID</th>
                <th><i class="fa fa-book"></i> Class Name</th>
                <th><i class="fa fa-hashtag"></i> Numeric Name</th>
                <th><i class="fa fa-money"></i> Fee</th>
                <th><i class="fa fa-cog"></i> Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let classItem of classes">
                <td>
                  <span class="id-badge">{{ classItem.classId }}</span>
                </td>
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
              <tr *ngIf="classes.length === 0 && !loading">
                <td colspan="4" class="modern-table-empty">
                  <i class="fa fa-inbox"></i>
                  <p>No classes found</p>
                </td>
              </tr>
            </tbody>
          </table>
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
    .classes-container {
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
    
    .numeric-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.375rem 0.75rem;
      background: var(--bg-secondary);
      border-radius: var(--radius-full);
      font-weight: 600;
      color: var(--text-primary);
      font-size: 0.875rem;
    }
    
    .text-muted {
      color: var(--text-tertiary);
      font-style: italic;
    }
    
    @media (max-width: 768px) {
      .classes-container {
        padding: 1rem;
      }
      
      .header-content {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `]
})
export class ClassesComponent implements OnInit {
  classes: Class[] = [];
  showAddForm: boolean = false;
  editingClass: Class | null = null;
  loading: boolean = false;
  saving: boolean = false;
  submitted: boolean = false;
  showDeleteConfirm: boolean = false;
  classToDelete: number | null = null;
  
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

  loadClasses() {
    this.loading = true;
    this.classService.getAllClasses().subscribe({
      next: (classes) => {
        this.classes = classes;
        this.loading = false;
      },
      error: (error) => {
        this.notificationService.error('Failed to load classes');
        console.error('Error loading classes:', error);
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
