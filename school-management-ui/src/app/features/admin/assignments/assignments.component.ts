import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssignmentService } from '../../../core/services/assignment.service';
import { ClassService } from '../../../core/services/class.service';
import { SubjectService } from '../../../core/services/subject.service';
import { Assignment } from '../../../core/models/assignment.model';

@Component({
  selector: 'app-assignments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="assignments-container">
      <div class="page-header">
        <h2>Assignment Management</h2>
        <button class="btn btn-primary" (click)="showAddForm = true">
          <i class="fa fa-plus"></i> Add New Assignment
        </button>
      </div>

      <div *ngIf="showAddForm || editingAssignment" class="form-card">
        <h3>{{ editingAssignment ? 'Edit Assignment' : 'Add New Assignment' }}</h3>
        <form (ngSubmit)="saveAssignment()">
          <div class="form-group">
            <label>Assignment Name *</label>
            <input type="text" [(ngModel)]="assignmentForm.name" name="name" required class="form-control">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Class *</label>
              <select [(ngModel)]="assignmentForm.classId" name="classId" required class="form-control">
                <option value="">Select Class</option>
                <option *ngFor="let cls of classes" [value]="cls.classId">{{ cls.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Subject *</label>
              <select [(ngModel)]="assignmentForm.subjectId" name="subjectId" required class="form-control">
                <option value="">Select Subject</option>
                <option *ngFor="let subject of subjects" [value]="subject.subjectId">{{ subject.name }}</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea [(ngModel)]="assignmentForm.description" name="description" class="form-control" rows="4"></textarea>
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
              <th>Name</th>
              <th>Class</th>
              <th>Subject</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let assignment of assignments">
              <td>{{ assignment.assignmentId }}</td>
              <td>{{ assignment.name }}</td>
              <td>{{ assignment.class?.name || '-' }}</td>
              <td>{{ assignment.subject?.name || '-' }}</td>
              <td>{{ assignment.timestamp | date:'short' }}</td>
              <td>
                <button class="btn btn-sm btn-edit" (click)="editAssignment(assignment)">
                  <i class="fa fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-delete" (click)="assignment.assignmentId && deleteAssignment(assignment.assignmentId)">
                  <i class="fa fa-trash"></i>
                </button>
              </td>
            </tr>
            <tr *ngIf="assignments.length === 0">
              <td colspan="6" class="text-center">No assignments found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .assignments-container {
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
    }
    .btn-primary {
      background: #667eea;
      color: white;
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
      margin-bottom: 1rem;
    }
    .form-group label {
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
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
export class AssignmentsComponent implements OnInit {
  assignments: Assignment[] = [];
  classes: any[] = [];
  subjects: any[] = [];
  showAddForm: boolean = false;
  editingAssignment: Assignment | null = null;
  
  assignmentForm: Partial<Assignment> = {
    name: '',
    classId: undefined,
    subjectId: undefined,
    description: '',
    teacherId: 1,
    timestamp: new Date()
  };

  constructor(
    private assignmentService: AssignmentService,
    private classService: ClassService,
    private subjectService: SubjectService
  ) {}

  ngOnInit() {
    this.loadAssignments();
    this.loadClasses();
  }

  loadAssignments() {
    this.assignmentService.getAllAssignments().subscribe(assignments => {
      this.assignments = assignments;
    });
  }

  loadClasses() {
    this.classService.getAllClasses().subscribe(classes => {
      this.classes = classes;
    });
  }

  loadSubjects() {
    if (this.assignmentForm.classId) {
      this.subjectService.getSubjectsByClass(this.assignmentForm.classId).subscribe(subjects => {
        this.subjects = subjects;
      });
    }
  }

  saveAssignment() {
    if (this.editingAssignment && this.editingAssignment.assignmentId) {
      this.assignmentService.updateAssignment(this.editingAssignment.assignmentId, this.assignmentForm as Assignment)
        .subscribe(() => {
          this.loadAssignments();
          this.cancelForm();
        });
    } else {
      this.assignmentService.createAssignment(this.assignmentForm as Assignment)
        .subscribe(() => {
          this.loadAssignments();
          this.cancelForm();
        });
    }
  }

  editAssignment(assignment: Assignment) {
    this.editingAssignment = assignment;
    this.assignmentForm = { ...assignment };
    this.loadSubjects();
    this.showAddForm = true;
  }

  deleteAssignment(id: number) {
    if (confirm('Are you sure you want to delete this assignment?')) {
      this.assignmentService.deleteAssignment(id).subscribe(() => {
        this.loadAssignments();
      });
    }
  }

  cancelForm() {
    this.showAddForm = false;
    this.editingAssignment = null;
    this.assignmentForm = {
      name: '',
      classId: undefined,
      subjectId: undefined,
      description: '',
      teacherId: 1,
      timestamp: new Date()
    };
  }
}

