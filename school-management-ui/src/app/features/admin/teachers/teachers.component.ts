import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TeacherService } from '../../../core/services/teacher.service';
import { DepartmentService } from '../../../core/services/department.service';
import { Teacher, Department } from '../../../core/models/teacher.model';
import { NotificationService } from '../../../shared/services/notification.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-teachers',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent, ConfirmDialogComponent],
  template: `
    <div class="teachers-container">
      <app-loading [show]="loading" [message]="'Loading teachers...'"></app-loading>
      
      <div class="page-header">
        <div class="header-content">
          <h2><i class="fa fa-chalkboard-teacher"></i> Teacher Management</h2>
          <button class="btn btn-primary" (click)="showAddForm = true" [disabled]="loading">
            <i class="fa fa-plus"></i> Add New Teacher
          </button>
        </div>
      </div>

      <div *ngIf="showAddForm || editingTeacher" class="modern-form-card">
        <h3>
          <i class="fa" [class.fa-user-plus]="!editingTeacher" [class.fa-user-edit]="editingTeacher"></i>
          {{ editingTeacher ? 'Edit Teacher' : 'Add New Teacher' }}
        </h3>
        <form (ngSubmit)="saveTeacher()">
          <div class="modern-form-row">
            <div class="modern-form-group">
              <label>
                <i class="fa fa-user"></i>
                Name
                <span class="required-indicator">*</span>
              </label>
              <div class="modern-input-wrapper">
                <i class="fa fa-user modern-input-icon"></i>
                <input 
                  type="text" 
                  [(ngModel)]="teacherForm.name" 
                  name="name" 
                  required 
                  class="modern-form-control"
                  placeholder="Enter teacher name"
                  [class.is-invalid]="submitted && !teacherForm.name">
              </div>
              <div *ngIf="submitted && !teacherForm.name" class="modern-invalid-feedback">
                <i class="fa fa-exclamation-circle"></i>
                Name is required
              </div>
            </div>
            <div class="modern-form-group">
              <label>
                <i class="fa fa-envelope"></i>
                Email
              </label>
              <div class="modern-input-wrapper">
                <i class="fa fa-envelope modern-input-icon"></i>
                <input 
                  type="email" 
                  [(ngModel)]="teacherForm.email" 
                  name="email" 
                  class="modern-form-control"
                  placeholder="teacher@example.com">
              </div>
            </div>
          </div>
          <div class="modern-form-row">
            <div class="modern-form-group">
              <label>
                <i class="fa fa-phone"></i>
                Phone
              </label>
              <div class="modern-input-wrapper">
                <i class="fa fa-phone modern-input-icon"></i>
                <input 
                  type="text" 
                  [(ngModel)]="teacherForm.phone" 
                  name="phone" 
                  class="modern-form-control"
                  placeholder="+1234567890">
              </div>
            </div>
            <div class="modern-form-group">
              <label>
                <i class="fa fa-building"></i>
                Department
              </label>
              <div class="modern-select-wrapper">
                <select 
                  [(ngModel)]="teacherForm.departmentId" 
                  name="departmentId" 
                  class="modern-form-control">
                  <option value="">Select Department</option>
                  <option *ngFor="let dept of departments" [value]="dept.departmentId">{{ dept.name }}</option>
                </select>
              </div>
            </div>
          </div>
          <div class="modern-form-group">
            <label>
              <i class="fa fa-map-marker-alt"></i>
              Address
            </label>
            <div class="modern-input-wrapper">
              <i class="fa fa-map-marker-alt modern-input-icon"></i>
              <textarea 
                [(ngModel)]="teacherForm.address" 
                name="address" 
                class="modern-form-control modern-textarea"
                placeholder="Enter address"
                rows="3"></textarea>
            </div>
          </div>
          <div class="modern-form-group" *ngIf="!editingTeacher">
            <label>
              <i class="fa fa-lock"></i>
              Password
              <span class="required-indicator">*</span>
            </label>
            <div class="modern-input-wrapper">
              <i class="fa fa-lock modern-input-icon"></i>
              <input 
                type="password" 
                [(ngModel)]="teacherForm.password" 
                name="password" 
                required 
                class="modern-form-control"
                placeholder="Enter password"
                [class.is-invalid]="submitted && !teacherForm.password">
            </div>
            <div *ngIf="submitted && !teacherForm.password" class="modern-invalid-feedback">
              <i class="fa fa-exclamation-circle"></i>
              Password is required
            </div>
          </div>
          <div class="modern-form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="saving">
              <i class="fa" [class.fa-spinner]="saving" [class.fa-spin]="saving" [class.fa-save]="!saving"></i>
              <span *ngIf="saving">Saving...</span>
              <span *ngIf="!saving">Save Teacher</span>
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
            Teachers List
          </div>
          <div class="modern-table-count">
            <i class="fa fa-chalkboard-teacher"></i>
            <span>Total: {{ teachers.length }} teacher(s)</span>
          </div>
        </div>
        <div class="modern-table-responsive">
          <table class="modern-table">
            <thead>
              <tr>
                <th><i class="fa fa-hashtag"></i> ID</th>
                <th><i class="fa fa-user"></i> Name</th>
                <th><i class="fa fa-envelope"></i> Email</th>
                <th><i class="fa fa-phone"></i> Phone</th>
                <th><i class="fa fa-building"></i> Department</th>
                <th><i class="fa fa-cog"></i> Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let teacher of teachers">
                <td>
                  <span class="id-badge">{{ teacher.teacherId || teacher.userId }}</span>
                </td>
                <td>
                  <strong>{{ teacher.name }}</strong>
                </td>
                <td>
                  <span *ngIf="teacher.email" class="email-text">{{ teacher.email }}</span>
                  <span *ngIf="!teacher.email" class="text-muted">-</span>
                </td>
                <td>
                  <span *ngIf="teacher.phone" class="phone-text">{{ teacher.phone }}</span>
                  <span *ngIf="!teacher.phone" class="text-muted">-</span>
                </td>
                <td>
                  <span *ngIf="teacher.department?.name" class="modern-badge modern-badge-info">
                    <i class="fa fa-building"></i>
                    {{ teacher.department?.name }}
                  </span>
                  <span *ngIf="!teacher.department?.name" class="text-muted">-</span>
                </td>
                <td>
                  <div class="modern-table-actions">
                    <button class="modern-btn-icon modern-btn-edit" (click)="editTeacher(teacher)" title="Edit Teacher">
                      <i class="fa fa-edit"></i>
                    </button>
                    <button class="modern-btn-icon modern-btn-delete" (click)="confirmDelete(teacher)" title="Delete Teacher">
                      <i class="fa fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="teachers.length === 0 && !loading">
                <td colspan="6" class="modern-table-empty">
                  <i class="fa fa-inbox"></i>
                  <p>No teachers found</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <app-confirm-dialog
        [show]="showDeleteConfirm"
        title="Delete Teacher"
        message="Are you sure you want to delete this teacher? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        (confirmed)="deleteTeacher()"
        (cancelled)="showDeleteConfirm = false; teacherToDelete = null">
      </app-confirm-dialog>
    </div>
  `,
  styles: [`
    .teachers-container {
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
    
    .email-text {
      color: var(--text-secondary);
      font-size: 0.9375rem;
    }
    
    .phone-text {
      color: var(--text-secondary);
      font-size: 0.9375rem;
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
      .teachers-container {
        padding: 1rem;
      }
      
      .header-content {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `]
})
export class TeachersComponent implements OnInit {
  teachers: Teacher[] = [];
  departments: Department[] = [];
  showAddForm: boolean = false;
  editingTeacher: Teacher | null = null;
  loading: boolean = false;
  saving: boolean = false;
  submitted: boolean = false;
  showDeleteConfirm: boolean = false;
  teacherToDelete: number | null = null;
  
  teacherForm: Partial<Teacher> = {
    name: '',
    email: '',
    phone: '',
    address: '',
    departmentId: undefined,
    password: ''
  };

  constructor(
    private teacherService: TeacherService,
    private departmentService: DepartmentService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadTeachers();
    this.loadDepartments();
  }

  loadTeachers() {
    this.loading = true;
    this.teacherService.getAllTeachers().subscribe({
      next: (teachers) => {
        this.teachers = teachers;
        this.loading = false;
      },
      error: (error) => {
        this.notificationService.error('Failed to load teachers');
        console.error('Error loading teachers:', error);
        this.loading = false;
      }
    });
  }

  loadDepartments() {
    this.departmentService.getAllDepartments().subscribe({
      next: (departments) => {
        this.departments = departments;
      },
      error: (error) => {
        this.notificationService.error('Failed to load departments');
        console.error('Error loading departments:', error);
      }
    });
  }

  saveTeacher() {
    this.submitted = true;
    
    if (!this.teacherForm.name || (!this.editingTeacher && !this.teacherForm.password)) {
      this.notificationService.warning('Please fill in all required fields');
      return;
    }

    this.saving = true;
    const teacherId = this.editingTeacher?.teacherId || this.editingTeacher?.userId;
    const operation = this.editingTeacher && teacherId
      ? this.teacherService.updateTeacher(teacherId, this.teacherForm as Teacher)
      : this.teacherService.createTeacher(this.teacherForm as Teacher);

    operation.subscribe({
      next: () => {
        this.notificationService.success(
          this.editingTeacher ? 'Teacher updated successfully' : 'Teacher created successfully'
        );
        this.loadTeachers();
        this.cancelForm();
        this.saving = false;
      },
      error: (error) => {
        const errorMsg = error.error?.message || 'Failed to save teacher';
        this.notificationService.error(errorMsg);
        console.error('Error saving teacher:', error);
        this.saving = false;
      }
    });
  }

  editTeacher(teacher: Teacher) {
    this.editingTeacher = teacher;
    this.teacherForm = { ...teacher };
    // Ensure we have the ID in the right property for the update
    if (teacher.userId && !teacher.teacherId) {
      this.editingTeacher.teacherId = teacher.userId;
    }
    this.showAddForm = true;
    this.submitted = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  confirmDelete(teacher: Teacher) {
    this.teacherToDelete = (teacher.teacherId || teacher.userId) ?? null;
    this.showDeleteConfirm = true;
  }

  deleteTeacher() {
    if (!this.teacherToDelete) return;

    this.loading = true;
    this.teacherService.deleteTeacher(this.teacherToDelete).subscribe({
      next: () => {
        this.notificationService.success('Teacher deleted successfully');
        this.loadTeachers();
        this.showDeleteConfirm = false;
        this.teacherToDelete = null;
        this.loading = false;
      },
      error: (error) => {
        const errorMsg = error.error?.message || 'Failed to delete teacher';
        this.notificationService.error(errorMsg);
        console.error('Error deleting teacher:', error);
        this.showDeleteConfirm = false;
        this.teacherToDelete = null;
        this.loading = false;
      }
    });
  }

  cancelForm() {
    this.showAddForm = false;
    this.editingTeacher = null;
    this.submitted = false;
    this.teacherForm = {
      name: '',
      email: '',
      phone: '',
      address: '',
      departmentId: undefined,
      password: ''
    };
  }
}
