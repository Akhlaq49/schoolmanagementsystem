import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { StudentService } from '../../../core/services/student.service';
import { PdfService } from '../../../core/services/pdf.service';
import { ClassService } from '../../../core/services/class.service';
import { Student, Class } from '../../../core/models/student.model';
import { NotificationService } from '../../../shared/services/notification.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LoadingComponent, ConfirmDialogComponent],
  template: `
    <div class="students-container">
      <app-loading [show]="loading" [message]="'Loading students...'"></app-loading>
      
      <div class="page-header">
        <div class="header-content">
          <h2><i class="fa fa-users"></i> Student Management</h2>
          <button class="btn btn-primary" (click)="showAddForm = true" [disabled]="loading">
            <i class="fa fa-plus"></i> Add New Student
          </button>
        </div>
      </div>

      <div class="filters-section">
        <div class="search-box">
          <i class="fa fa-search"></i>
          <input 
            type="text" 
            [(ngModel)]="searchTerm" 
            (input)="filterStudents()"
            placeholder="Search by name, email, or roll number..."
            class="modern-form-control search-input">
        </div>
        <div class="modern-select-wrapper">
          <select [(ngModel)]="selectedClassId" (change)="loadStudentsByClass()" class="modern-form-control filter-select">
            <option [value]="null">All Classes</option>
            <option *ngFor="let cls of classes" [value]="cls.classId">{{ cls.name }}</option>
          </select>
        </div>
      </div>

      <!-- Add/Edit Form -->
      <div *ngIf="showAddForm || editingStudent" class="modern-form-card">
        <h3>
          <i class="fa" [class.fa-user-plus]="!editingStudent" [class.fa-user-edit]="editingStudent"></i>
          {{ editingStudent ? 'Edit Student' : 'Add New Student' }}
        </h3>
        <form (ngSubmit)="saveStudent()">
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
                  [(ngModel)]="studentForm.name" 
                  name="name" 
                  required 
                  class="modern-form-control"
                  placeholder="Enter student name"
                  [class.is-invalid]="submitted && !studentForm.name">
              </div>
              <div *ngIf="submitted && !studentForm.name" class="modern-invalid-feedback">
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
                  [(ngModel)]="studentForm.email" 
                  name="email" 
                  class="modern-form-control"
                  placeholder="student@example.com"
                  [class.is-invalid]="submitted && studentForm.email && !isValidEmail(studentForm.email)">
              </div>
              <div *ngIf="submitted && studentForm.email && !isValidEmail(studentForm.email)" class="modern-invalid-feedback">
                <i class="fa fa-exclamation-circle"></i>
                Invalid email format
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
                  [(ngModel)]="studentForm.phone" 
                  name="phone" 
                  class="modern-form-control"
                  placeholder="+1234567890">
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
                  [(ngModel)]="studentForm.classId" 
                  name="classId" 
                  required 
                  class="modern-form-control"
                  [class.is-invalid]="submitted && !studentForm.classId">
                  <option value="">Select Class</option>
                  <option *ngFor="let cls of classes" [value]="cls.classId">{{ cls.name }}</option>
                </select>
              </div>
              <div *ngIf="submitted && !studentForm.classId" class="modern-invalid-feedback">
                <i class="fa fa-exclamation-circle"></i>
                Class is required
              </div>
            </div>
          </div>
          <div class="modern-form-row">
            <div class="modern-form-group">
              <label>
                <i class="fa fa-id-card"></i>
                Roll Number
              </label>
              <div class="modern-input-wrapper">
                <i class="fa fa-id-card modern-input-icon"></i>
                <input 
                  type="text" 
                  [(ngModel)]="studentForm.roll" 
                  name="roll" 
                  class="modern-form-control"
                  placeholder="Roll number">
              </div>
            </div>
            <div class="modern-form-group">
              <label>
                <i class="fa fa-lock"></i>
                Password
                <span *ngIf="!editingStudent" class="required-indicator">*</span>
              </label>
              <div class="modern-input-wrapper">
                <i class="fa fa-lock modern-input-icon"></i>
                <input 
                  type="password" 
                  [(ngModel)]="studentForm.password" 
                  name="password" 
                  [required]="!editingStudent" 
                  class="modern-form-control"
                  placeholder="Enter password"
                  [class.is-invalid]="submitted && !editingStudent && !studentForm.password">
              </div>
              <div *ngIf="submitted && !editingStudent && !studentForm.password" class="modern-invalid-feedback">
                <i class="fa fa-exclamation-circle"></i>
                Password is required
              </div>
            </div>
          </div>
          <div class="modern-form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="saving">
              <i class="fa" [class.fa-spinner]="saving" [class.fa-spin]="saving" [class.fa-save]="!saving"></i>
              <span *ngIf="saving">Saving...</span>
              <span *ngIf="!saving">Save Student</span>
            </button>
            <button type="button" class="btn btn-secondary" (click)="cancelForm()" [disabled]="saving">
              <i class="fa fa-times"></i>
              Cancel
            </button>
          </div>
        </form>
      </div>

      <!-- Students Table -->
      <div class="modern-table-card">
        <div class="modern-table-header">
          <div class="modern-table-title">
            <i class="fa fa-table"></i>
            Students List
          </div>
          <div class="modern-table-count">
            <i class="fa fa-users"></i>
            <span>Total: {{ filteredStudents.length }} student(s)</span>
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
                <th><i class="fa fa-book"></i> Class</th>
                <th><i class="fa fa-id-card"></i> Roll</th>
                <th><i class="fa fa-cog"></i> Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let student of filteredStudents; let i = index">
                <td>
                  <span class="id-badge">{{ student.studentId || student.userId }}</span>
                </td>
                <td>
                  <div class="student-name">
                    <strong>{{ student.name }}</strong>
                  </div>
                </td>
                <td>
                  <span *ngIf="student.email" class="email-text">{{ student.email }}</span>
                  <span *ngIf="!student.email" class="text-muted">-</span>
                </td>
                <td>
                  <span *ngIf="student.phone" class="phone-text">{{ student.phone }}</span>
                  <span *ngIf="!student.phone" class="text-muted">-</span>
                </td>
                <td>
                  <span *ngIf="student.class?.name" class="modern-badge modern-badge-primary">
                    <i class="fa fa-book"></i>
                    {{ student.class?.name }}
                  </span>
                  <span *ngIf="!student.class?.name" class="text-muted">-</span>
                </td>
                <td>
                  <span *ngIf="student.roll" class="roll-badge">{{ student.roll }}</span>
                  <span *ngIf="!student.roll" class="text-muted">-</span>
                </td>
                <td>
                  <div class="modern-table-actions">
                    <button class="modern-btn-icon modern-btn-pdf" (click)="downloadIdCard(student)" title="Download ID Card">
                      <i class="fa fa-id-card"></i>
                    </button>
                    <button class="modern-btn-icon modern-btn-edit" (click)="editStudent(student)" title="Edit Student">
                      <i class="fa fa-edit"></i>
                    </button>
                    <button class="modern-btn-icon modern-btn-delete" (click)="confirmDelete(student)" title="Delete Student">
                      <i class="fa fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="filteredStudents.length === 0 && !loading">
                <td colspan="7" class="modern-table-empty">
                  <i class="fa fa-inbox"></i>
                  <p>No students found</p>
                  <span *ngIf="searchTerm">Try adjusting your search criteria</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <app-confirm-dialog
        [show]="showDeleteConfirm"
        title="Delete Student"
        message="Are you sure you want to delete this student? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        (confirmed)="deleteStudent()"
        (cancelled)="showDeleteConfirm = false; studentToDelete = null">
      </app-confirm-dialog>
    </div>
  `,
  styles: [`
    .students-container {
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
    
    .filters-section {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
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
    
    .filter-select {
      min-width: 200px;
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
    
    .student-name strong {
      color: var(--text-primary);
      font-weight: 600;
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
    
    .roll-badge {
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

    .modern-btn-pdf {
      background: #e74c3c;
      color: #fff;
    }
    
    @media (max-width: 768px) {
      .students-container {
        padding: 1rem;
      }
      
      .header-content {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .filters-section {
        flex-direction: column;
      }
      
      .search-box,
      .filter-select {
        width: 100%;
        min-width: auto;
      }
    }
  `]
})
export class StudentsComponent implements OnInit {
  students: Student[] = [];
  filteredStudents: Student[] = [];
  classes: Class[] = [];
  selectedClassId: number | null = null;
  searchTerm: string = '';
  showAddForm: boolean = false;
  editingStudent: Student | null = null;
  loading: boolean = false;
  saving: boolean = false;
  submitted: boolean = false;
  showDeleteConfirm: boolean = false;
  studentToDelete: number | null = null;
  
  studentForm: Partial<Student> = {
    name: '',
    email: '',
    phone: '',
    classId: undefined,
    roll: '',
    password: ''
  };

  constructor(
    private studentService: StudentService,
    private classService: ClassService,
    private notificationService: NotificationService,
    private pdfService: PdfService
  ) {}

  downloadIdCard(student: Student) {
    const studentId = student.studentId || student.userId;
    if (!studentId || studentId <= 0) {
      this.notificationService.error('Invalid student ID');
      return;
    }
    this.pdfService.getStudentIdCard(studentId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `student-id-card-${studentId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        this.notificationService.error('Failed to download ID card');
        console.error('Error downloading ID card:', error);
      }
    });
  }

  ngOnInit() {
    this.loadClasses();
    this.loadStudents();
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

  loadStudents() {
    this.loading = true;
    this.studentService.getAllStudents().subscribe({
      next: (students) => {
        this.students = students;
        this.filteredStudents = students;
        this.loading = false;
      },
      error: (error) => {
        this.notificationService.error('Failed to load students');
        console.error('Error loading students:', error);
        this.loading = false;
      }
    });
  }

  loadStudentsByClass() {
    if (this.selectedClassId) {
      this.loading = true;
      this.studentService.getStudentsByClass(this.selectedClassId).subscribe({
        next: (students) => {
          this.students = students;
          this.filterStudents();
          this.loading = false;
        },
        error: (error) => {
          this.notificationService.error('Failed to load students');
          console.error('Error loading students by class:', error);
          this.loading = false;
        }
      });
    } else {
      this.loadStudents();
    }
  }

  filterStudents() {
    if (!this.searchTerm.trim()) {
      this.filteredStudents = this.students;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredStudents = this.students.filter(student =>
      student.name?.toLowerCase().includes(term) ||
      student.email?.toLowerCase().includes(term) ||
      student.roll?.toLowerCase().includes(term)
    );
  }

  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  saveStudent() {
    this.submitted = true;
    
    if (!this.studentForm.name || !this.studentForm.classId || (!this.editingStudent && !this.studentForm.password)) {
      this.notificationService.warning('Please fill in all required fields');
      return;
    }

    if (this.studentForm.email && !this.isValidEmail(this.studentForm.email)) {
      this.notificationService.warning('Please enter a valid email address');
      return;
    }

    this.saving = true;
    const studentId = this.editingStudent?.studentId || this.editingStudent?.userId;
    const operation = this.editingStudent && studentId
      ? this.studentService.updateStudent(studentId, this.studentForm as Student)
      : this.studentService.createStudent(this.studentForm as Student);

    operation.subscribe({
      next: () => {
        this.notificationService.success(
          this.editingStudent ? 'Student updated successfully' : 'Student created successfully'
        );
        this.loadStudents();
        this.cancelForm();
        this.saving = false;
      },
      error: (error) => {
        const errorMsg = error.error?.message || 'Failed to save student';
        this.notificationService.error(errorMsg);
        console.error('Error saving student:', error);
        this.saving = false;
      }
    });
  }

  editStudent(student: Student) {
    this.editingStudent = student;
    this.studentForm = { ...student };
    // Ensure we have the ID in the right property for the update
    if (student.userId && !student.studentId) {
      this.editingStudent.studentId = student.userId;
    }
    this.showAddForm = true;
    this.submitted = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  confirmDelete(student: Student) {
    this.studentToDelete = (student.studentId || student.userId) ?? null;
    this.showDeleteConfirm = true;
  }

  deleteStudent() {
    if (!this.studentToDelete) return;

    this.loading = true;
    this.studentService.deleteStudent(this.studentToDelete).subscribe({
      next: () => {
        this.notificationService.success('Student deleted successfully');
        this.loadStudents();
        this.showDeleteConfirm = false;
        this.studentToDelete = null;
        this.loading = false;
      },
      error: (error) => {
        const errorMsg = error.error?.message || 'Failed to delete student';
        this.notificationService.error(errorMsg);
        console.error('Error deleting student:', error);
        this.showDeleteConfirm = false;
        this.studentToDelete = null;
        this.loading = false;
      }
    });
  }

  cancelForm() {
    this.showAddForm = false;
    this.editingStudent = null;
    this.submitted = false;
    this.studentForm = {
      name: '',
      email: '',
      phone: '',
      classId: undefined,
      roll: '',
      password: ''
    };
  }
}
