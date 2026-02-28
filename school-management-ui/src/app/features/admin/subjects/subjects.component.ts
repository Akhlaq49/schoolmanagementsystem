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

      <div *ngIf="showAddForm || editingSubjectName" class="form-card">
        <h3>{{ editingSubjectName ? 'Edit Subject' : 'Add New Subject' }}</h3>
        <form (ngSubmit)="saveSubject()">
          <div class="form-row">
            <div class="form-group">
              <label>Subject Name *</label>
              <input type="text" [(ngModel)]="subjectForm.name" name="name" required class="form-control">
            </div>
            <div class="form-group">
              <label>Classes *</label>
              <div class="class-checkboxes">
                <label *ngFor="let cls of classes" class="checkbox-item">
                  <input
                    type="checkbox"
                    [value]="cls.classId"
                    (change)="onClassCheckboxChange($event, cls.classId)"
                    [checked]="selectedClassIds.includes(cls.classId)"
                  />
                  <span>{{ cls.nameNumeric || cls.name }}</span>
                </label>
              </div>
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
              <th>#</th>
              <th>Subject Name</th>
              <th>Classes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let group of groupedSubjects; let i = index">
              <td>{{ i + 1 }}</td>
              <td>{{ group.name }}</td>
              <td>{{ group.classLabels }}</td>
              <td>
                <button class="btn btn-sm btn-edit" (click)="editByName(group.name)">
                  <i class="fa fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-delete" (click)="deleteByName(group.name)">
                  <i class="fa fa-trash"></i>
                </button>
              </td>
            </tr>
            <tr *ngIf="groupedSubjects.length === 0">
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
    .class-checkboxes {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem 1rem;
      margin-top: 0.25rem;
    }
    .checkbox-item {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.35rem 0.75rem;
      border-radius: 999px;
      border: 1px solid #d4c4a8;
      background: #fffdf8;
      font-size: 0.9rem;
      cursor: pointer;
    }
    .checkbox-item input {
      margin: 0;
    }
    .checkbox-item span {
      white-space: nowrap;
    }
  `]
})
export class SubjectsComponent implements OnInit {
  subjects: Subject[] = [];
  groupedSubjects: { name: string; classLabels: string; classIds: number[] }[] = [];
  classes: Class[] = [];
  showAddForm: boolean = false;
  editingSubjectName: string | null = null;
  
  subjectForm: Partial<Subject> = {
    name: '',
    classId: undefined
  };

  selectedClassIds: number[] = [];

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

      const map = new Map<string, { name: string; classIds: number[]; classLabels: string[] }>();

      for (const s of subjects) {
        const key = s.name.toLowerCase();
        const entry = map.get(key) || { name: s.name, classIds: [], classLabels: [] };

        const label = s.class?.nameNumeric || s.class?.name || '';
        if (s.classId && !entry.classIds.includes(s.classId)) {
          entry.classIds.push(s.classId);
        }
        if (label && !entry.classLabels.includes(label)) {
          entry.classLabels.push(label);
        }

        map.set(key, entry);
      }

      this.groupedSubjects = Array.from(map.values()).map(e => ({
        name: e.name,
        classIds: e.classIds,
        classLabels: e.classLabels.join(', ')
      }));
    });
  }

  loadClasses() {
    this.classService.getAllClasses().subscribe(classes => {
      this.classes = classes;
    });
  }

  saveSubject() {
    const name = (this.subjectForm.name || '').trim();
    if (!name || this.selectedClassIds.length === 0) {
      alert('Please enter a subject name and select at least one class.');
      return;
    }

    if (this.editingSubjectName) {
      this.subjectService.updateSubjectsByName({
        originalName: this.editingSubjectName,
        newName: name,
        classIds: this.selectedClassIds
      }).subscribe(() => {
        this.loadSubjects();
        this.cancelForm();
      });
    } else {
      this.subjectService.createSubjectForClasses({
        name,
        classIds: this.selectedClassIds
      }).subscribe(() => {
        this.loadSubjects();
        this.cancelForm();
      });
    }
  }

  editByName(name: string) {
    this.editingSubjectName = name;
    this.subjectForm = { name };
    const related = this.subjects.filter(s => s.name === name);
    this.selectedClassIds = related
      .map(s => s.classId!)
      .filter((id, idx, arr) => id && arr.indexOf(id) === idx);
    this.showAddForm = true;
  }

  deleteByName(name: string) {
    if (!confirm('Are you sure you want to delete this subject from all classes?')) {
      return;
    }
    const related = this.subjects.filter(s => s.name === name);
    if (related.length === 0) {
      return;
    }
    let pending = related.length;
    related.forEach(s => {
      this.subjectService.deleteSubject(s.subjectId).subscribe({
        next: () => {
          pending--;
          if (pending === 0) {
            this.loadSubjects();
          }
        },
        error: () => {
          pending--;
          if (pending === 0) {
            this.loadSubjects();
          }
        }
      });
    });
  }

  cancelForm() {
    this.showAddForm = false;
    this.editingSubjectName = null;
    this.subjectForm = {
      name: '',
      classId: undefined
    };
    this.selectedClassIds = [];
  }

  onClassCheckboxChange(event: Event, classId: number) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      if (!this.selectedClassIds.includes(classId)) {
        this.selectedClassIds.push(classId);
      }
    } else {
      this.selectedClassIds = this.selectedClassIds.filter(id => id !== classId);
    }
  }
}

