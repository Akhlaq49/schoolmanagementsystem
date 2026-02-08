import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubjectService } from '../../../core/services/subject.service';
import { ClassService } from '../../../core/services/class.service';
import { Subject } from '../../../core/models/subject.model';
import { Class } from '../../../core/models/student.model';

@Component({
  selector: 'app-subjects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="subjects-container">
      <div class="page-header">
        <h2>Subject Management</h2>
        <button class="btn btn-primary" (click)="showAddForm = true">
          <i class="fa fa-plus"></i> Add New Subject
        </button>
      </div>

      <div *ngIf="showAddForm || editingSubject" class="form-card">
        <h3>{{ editingSubject ? 'Edit Subject' : 'Add New Subject' }}</h3>
        <form (ngSubmit)="saveSubject()">
          <div class="form-row">
            <div class="form-group">
              <label>Subject Name *</label>
              <input type="text" [(ngModel)]="subjectForm.name" name="name" required class="form-control">
            </div>
            <div class="form-group">
              <label>Class *</label>
              <select [(ngModel)]="subjectForm.classId" name="classId" required class="form-control">
                <option value="">Select Class</option>
                <option *ngFor="let cls of classes" [value]="cls.classId">{{ cls.name }}</option>
              </select>
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Save</button>
            <button type="button" class="btn btn-secondary" (click)="cancelForm()">Cancel</button>
          </div>
        </form>
      </div>

      <div class="table-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Subject Name</th>
              <th>Class</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let subject of subjects">
              <td>{{ subject.subjectId }}</td>
              <td>{{ subject.name }}</td>
              <td>{{ subject.class?.name || '-' }}</td>
              <td>
                <button class="btn btn-sm btn-edit" (click)="editSubject(subject)">
                  <i class="fa fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-delete" (click)="subject.subjectId && deleteSubject(subject.subjectId)">
                  <i class="fa fa-trash"></i>
                </button>
              </td>
            </tr>
            <tr *ngIf="subjects.length === 0">
              <td colspan="4" class="text-center">No subjects found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .subjects-container {
      padding: 2rem;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      transition: all 0.3s;
    }
    .btn-primary {
      background: #667eea;
      color: white;
    }
    .btn-primary:hover {
      background: #5568d3;
    }
    .btn-secondary {
      background: #6c757d;
      color: white;
    }
    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }
    .btn-edit {
      background: #3498db;
      color: white;
      margin-right: 0.5rem;
    }
    .btn-delete {
      background: #e74c3c;
      color: white;
    }
    .form-card {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .form-row {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .form-group {
      display: flex;
      flex-direction: column;
    }
    .form-group label {
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #333;
    }
    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }
    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
    }
    .table-card {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
    }
    .data-table thead {
      background: #667eea;
      color: white;
    }
    .data-table th,
    .data-table td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    .data-table tbody tr:hover {
      background: #f8f9fa;
    }
    .text-center {
      text-align: center;
    }
  `]
})
export class SubjectsComponent implements OnInit {
  subjects: Subject[] = [];
  classes: Class[] = [];
  showAddForm: boolean = false;
  editingSubject: Subject | null = null;
  
  subjectForm: Partial<Subject> = {
    name: '',
    classId: undefined
  };

  constructor(
    private subjectService: SubjectService,
    private classService: ClassService
  ) {}

  ngOnInit() {
    this.loadSubjects();
    this.loadClasses();
  }

  loadSubjects() {
    this.subjectService.getAllSubjects().subscribe(subjects => {
      this.subjects = subjects;
    });
  }

  loadClasses() {
    this.classService.getAllClasses().subscribe(classes => {
      this.classes = classes;
    });
  }

  saveSubject() {
    if (this.editingSubject && this.editingSubject.subjectId) {
      this.subjectService.updateSubject(this.editingSubject.subjectId, this.subjectForm as Subject)
        .subscribe(() => {
          this.loadSubjects();
          this.cancelForm();
        });
    } else {
      this.subjectService.createSubject(this.subjectForm as Subject)
        .subscribe(() => {
          this.loadSubjects();
          this.cancelForm();
        });
    }
  }

  editSubject(subject: Subject) {
    this.editingSubject = subject;
    this.subjectForm = { ...subject };
    this.showAddForm = true;
  }

  deleteSubject(id: number) {
    if (confirm('Are you sure you want to delete this subject?')) {
      this.subjectService.deleteSubject(id).subscribe(() => {
        this.loadSubjects();
      });
    }
  }

  cancelForm() {
    this.showAddForm = false;
    this.editingSubject = null;
    this.subjectForm = {
      name: '',
      classId: undefined
    };
  }
}

