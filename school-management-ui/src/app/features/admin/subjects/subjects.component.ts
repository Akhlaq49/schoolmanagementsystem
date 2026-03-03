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
      <div class="page-header-card">
        <div class="header-content">
          <div>
            <h2>Subject Management</h2>
            <p class="page-subtitle">Manage subjects and assign to classes</p>
          </div>
          <button class="btn btn-primary" (click)="showAddForm = true">
            <i class="fa fa-plus"></i> Add New Subject
          </button>
        </div>
      </div>

      <div *ngIf="showAddForm || editingSubjectName" class="academy-form-card">
        <h3>{{ editingSubjectName ? 'Edit Subject' : 'Add New Subject' }}</h3>
        <form (ngSubmit)="saveSubject()">
          <div class="academy-form-row">
            <div class="academy-form-group">
              <label>Subject Name <span class="required">*</span></label>
              <input type="text" [(ngModel)]="subjectForm.name" name="name" required class="academy-input" placeholder="e.g., Mathematics">
            </div>
            <div class="academy-form-group academy-form-group-full">
              <label>Classes <span class="required">*</span></label>
              <div class="class-checkboxes">
                <label *ngFor="let cls of classes" class="checkbox-item">
                  <input type="checkbox" [value]="cls.classId" (change)="onClassCheckboxChange($event, cls.classId)" [checked]="selectedClassIds.includes(cls.classId)" />
                  <span>{{ cls.nameNumeric || cls.name }}</span>
                </label>
              </div>
            </div>
          </div>
          <div class="academy-form-actions">
            <button type="submit" class="btn btn-primary">Save Subject</button>
            <button type="button" class="btn btn-secondary" (click)="cancelForm()">Cancel</button>
          </div>
        </form>
      </div>

      <div class="academy-table-card">
        <div class="academy-table-header">
          <div class="academy-table-title">Subjects List</div>
          <div class="academy-table-count">Total: {{ groupedSubjects.length }} subject(s)</div>
        </div>
        <div class="academy-table-responsive">
          <table class="academy-table">
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
                <div class="table-actions">
                  <button class="btn-icon btn-edit" (click)="editByName(group.name)" title="Edit"><i class="fa fa-edit"></i></button>
                  <button class="btn-icon btn-delete" (click)="deleteByName(group.name)" title="Delete"><i class="fa fa-trash"></i></button>
                </div>
              </td>
            </tr>
            <tr *ngIf="groupedSubjects.length === 0">
              <td colspan="4" class="academy-table-empty"><p>No subjects found</p></td>
            </tr>
          </tbody>
        </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .subjects-container { padding: 0; }
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
    .academy-form-row { display: grid; grid-template-columns: 1fr 2fr; gap: 1.5rem; margin-bottom: 1.5rem; }
    .academy-form-group label { margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 600; color: #1e3a5f; }
    .academy-form-group .required { color: #dc2626; }
    .academy-form-group-full { grid-column: 1 / -1; }
    .academy-input {
      padding: 0.75rem 1rem; border: 2px solid #d9e2ec; border-radius: 0.75rem;
      font-size: 0.9375rem; font-weight: 500; color: #0f2744; background: #fff;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .academy-input:focus { outline: none; border-color: #1e3a5f; box-shadow: 0 0 0 4px rgba(30,58,95,0.12); }
    .academy-form-actions { display: flex; gap: 0.75rem; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #eef2f7; }
    .btn { padding: 0.65rem 1.25rem; border: none; border-radius: 0.75rem; cursor: pointer; font-size: 0.9375rem; font-weight: 600;
      display: inline-flex; align-items: center; gap: 0.5rem; transition: all 0.2s; }
    .btn-primary { background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); color: #fff; box-shadow: 0 4px 14px rgba(30,58,95,0.35); }
    .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(30,58,95,0.4); }
    .btn-secondary { background: #6b7280; color: #fff; }
    .btn-secondary:hover { background: #4b5563; }
    .class-checkboxes { display: flex; flex-wrap: wrap; gap: 0.5rem 1rem; margin-top: 0.25rem; }
    .checkbox-item {
      display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.4rem 0.85rem;
      border-radius: 999px; border: 2px solid #d9e2ec; background: #fff; font-size: 0.9rem;
      cursor: pointer; font-weight: 500; color: #435d7a; transition: all 0.2s;
    }
    .checkbox-item:hover { border-color: #b5c9da; background: #f7f9fc; }
    .checkbox-item input { margin: 0; }
    .checkbox-item input:checked + span { color: #1e3a5f; font-weight: 600; }
    .checkbox-item:has(input:checked) { border-color: #1e3a5f; background: rgba(30,58,95,0.08); }
    .academy-table-card { background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .academy-table-header { padding: 1.25rem 1.5rem; background: #f7f9fc; border-bottom: 1px solid #e2e8f0;
      display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
    .academy-table-title { font-size: 1.0625rem; font-weight: 700; color: #0f2744; }
    .academy-table-count { font-size: 0.9rem; font-weight: 500; color: #6a8cad; }
    .academy-table-responsive { overflow-x: auto; }
    .academy-table { width: 100%; border-collapse: collapse; }
    .academy-table thead { background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); }
    .academy-table th { padding: 0.875rem 1rem; text-align: left; font-size: 0.8125rem; font-weight: 600; color: #fff; text-transform: uppercase; letter-spacing: 0.05em; }
    .academy-table td { padding: 1rem; border-bottom: 1px solid #eef2f7; font-size: 0.9375rem; color: #435d7a; }
    .academy-table tbody tr:hover { background: #f7f9fc; }
    .table-actions { display: flex; gap: 0.5rem; }
    .btn-icon { width: 34px; height: 34px; border-radius: 8px; border: none; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s; }
    .btn-edit { background: #2563eb; color: #fff; }
    .btn-edit:hover { background: #1d4ed8; }
    .btn-delete { background: #dc2626; color: #fff; }
    .btn-delete:hover { background: #b91c1c; }
    .academy-table-empty { padding: 3rem; text-align: center; color: #6a8cad; }
    .academy-table-empty p { margin: 0; font-size: 1rem; }
    @media (max-width: 768px) { .academy-form-row { grid-template-columns: 1fr; } .header-content { flex-direction: column; align-items: flex-start; } }
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

