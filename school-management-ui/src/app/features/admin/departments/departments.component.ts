import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DepartmentService } from '../../../core/services/department.service';
import { Department } from '../../../core/models/teacher.model';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="departments-container">
      <div class="page-header">
        <h2>Department Management</h2>
        <button class="btn btn-primary" (click)="showAddForm = true">
          <i class="fa fa-plus"></i> Add Department
        </button>
      </div>

      <div *ngIf="showAddForm || editingDepartment" class="form-card">
        <h3>{{ editingDepartment ? 'Edit Department' : 'Add Department' }}</h3>
        <form (ngSubmit)="saveDepartment()">
          <div class="form-group">
            <label>Department Name *</label>
            <input type="text" [(ngModel)]="departmentForm.name" name="name" required class="form-control">
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
              <th>Department Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let dept of departments">
              <td>{{ dept.departmentId }}</td>
              <td>{{ dept.name }}</td>
              <td>
                <button class="btn btn-sm btn-edit" (click)="editDepartment(dept)">
                  <i class="fa fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-delete" (click)="dept.departmentId && deleteDepartment(dept.departmentId)">
                  <i class="fa fa-trash"></i>
                </button>
              </td>
            </tr>
            <tr *ngIf="departments.length === 0">
              <td colspan="3" class="text-center">No departments found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .departments-container {
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
export class DepartmentsComponent implements OnInit {
  departments: Department[] = [];
  showAddForm: boolean = false;
  editingDepartment: Department | null = null;
  
  departmentForm: Partial<Department> = {
    name: ''
  };

  constructor(private departmentService: DepartmentService) {}

  ngOnInit() {
    this.loadDepartments();
  }

  loadDepartments() {
    this.departmentService.getAllDepartments().subscribe(departments => {
      this.departments = departments;
    });
  }

  saveDepartment() {
    if (this.editingDepartment && this.editingDepartment.departmentId) {
      this.departmentService.updateDepartment(this.editingDepartment.departmentId, this.departmentForm as Department)
        .subscribe(() => {
          this.loadDepartments();
          this.cancelForm();
        });
    } else {
      this.departmentService.createDepartment(this.departmentForm as Department)
        .subscribe(() => {
          this.loadDepartments();
          this.cancelForm();
        });
    }
  }

  editDepartment(department: Department) {
    this.editingDepartment = department;
    this.departmentForm = { ...department };
    this.showAddForm = true;
  }

  deleteDepartment(id: number) {
    if (confirm('Are you sure you want to delete this department?')) {
      this.departmentService.deleteDepartment(id).subscribe(() => {
        this.loadDepartments();
      });
    }
  }

  cancelForm() {
    this.showAddForm = false;
    this.editingDepartment = null;
    this.departmentForm = {
      name: ''
    };
  }
}





