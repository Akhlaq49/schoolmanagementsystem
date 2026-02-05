import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudyMaterialService } from '../../../core/services/study-material.service';
import { ClassService } from '../../../core/services/class.service';
import { SubjectService } from '../../../core/services/subject.service';
import { StudyMaterial } from '../../../core/models/study-material.model';

@Component({
  selector: 'app-study-materials',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="study-materials-container">
      <div class="page-header">
        <h2>Study Material Management</h2>
        <button class="btn btn-primary" (click)="showAddForm = true">
          <i class="fa fa-plus"></i> Add Study Material
        </button>
      </div>

      <div *ngIf="showAddForm || editingMaterial" class="form-card">
        <h3>{{ editingMaterial ? 'Edit Study Material' : 'Add Study Material' }}</h3>
        <form (ngSubmit)="saveMaterial()">
          <div class="form-group">
            <label>Title *</label>
            <input type="text" [(ngModel)]="materialForm.title" name="title" required class="form-control">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Class</label>
              <select [(ngModel)]="materialForm.classId" name="classId" (change)="loadSubjects()" class="form-control">
                <option value="">Select Class</option>
                <option *ngFor="let cls of classes" [value]="cls.classId">{{ cls.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Subject</label>
              <select [(ngModel)]="materialForm.subjectId" name="subjectId" class="form-control">
                <option value="">Select Subject</option>
                <option *ngFor="let subject of subjects" [value]="subject.subjectId">{{ subject.name }}</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea [(ngModel)]="materialForm.description" name="description" class="form-control" rows="4"></textarea>
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
              <th>Title</th>
              <th>Class</th>
              <th>Subject</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let material of materials">
              <td>{{ material.studyMaterialId }}</td>
              <td>{{ material.title }}</td>
              <td>{{ material.class?.name || '-' }}</td>
              <td>{{ material.subject?.name || '-' }}</td>
              <td>{{ material.timestamp | date:'short' }}</td>
              <td>
                <button class="btn btn-sm btn-edit" (click)="editMaterial(material)">
                  <i class="fa fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-delete" (click)="deleteMaterial(material.studyMaterialId)">
                  <i class="fa fa-trash"></i>
                </button>
              </td>
            </tr>
            <tr *ngIf="materials.length === 0">
              <td colspan="6" class="text-center">No study materials found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .study-materials-container {
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
export class StudyMaterialsComponent implements OnInit {
  materials: StudyMaterial[] = [];
  classes: any[] = [];
  subjects: any[] = [];
  showAddForm: boolean = false;
  editingMaterial: StudyMaterial | null = null;
  
  materialForm: Partial<StudyMaterial> = {
    title: '',
    description: '',
    classId: undefined,
    subjectId: undefined,
    timestamp: new Date()
  };

  constructor(
    private studyMaterialService: StudyMaterialService,
    private classService: ClassService,
    private subjectService: SubjectService
  ) {}

  ngOnInit() {
    this.loadMaterials();
    this.loadClasses();
  }

  loadMaterials() {
    this.studyMaterialService.getAllStudyMaterials().subscribe(materials => {
      this.materials = materials;
    });
  }

  loadClasses() {
    this.classService.getAllClasses().subscribe(classes => {
      this.classes = classes;
    });
  }

  loadSubjects() {
    if (this.materialForm.classId) {
      this.subjectService.getSubjectsByClass(this.materialForm.classId).subscribe(subjects => {
        this.subjects = subjects;
      });
    }
  }

  saveMaterial() {
    if (this.editingMaterial) {
      this.studyMaterialService.updateStudyMaterial(this.editingMaterial.studyMaterialId, this.materialForm as StudyMaterial)
        .subscribe(() => {
          this.loadMaterials();
          this.cancelForm();
        });
    } else {
      this.studyMaterialService.createStudyMaterial(this.materialForm as StudyMaterial)
        .subscribe(() => {
          this.loadMaterials();
          this.cancelForm();
        });
    }
  }

  editMaterial(material: StudyMaterial) {
    this.editingMaterial = material;
    this.materialForm = { ...material };
    this.loadSubjects();
    this.showAddForm = true;
  }

  deleteMaterial(id: number) {
    if (confirm('Are you sure you want to delete this study material?')) {
      this.studyMaterialService.deleteStudyMaterial(id).subscribe(() => {
        this.loadMaterials();
      });
    }
  }

  cancelForm() {
    this.showAddForm = false;
    this.editingMaterial = null;
    this.materialForm = {
      title: '',
      description: '',
      classId: undefined,
      subjectId: undefined,
      timestamp: new Date()
    };
  }
}

