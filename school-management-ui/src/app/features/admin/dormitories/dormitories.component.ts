import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DormitoryService } from '../../../core/services/dormitory.service';
import { Dormitory } from '../../../core/models/dormitory.model';

@Component({
  selector: 'app-dormitories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dormitories-container">
      <div class="page-header">
        <h2>Dormitory Management</h2>
        <button class="btn btn-primary" (click)="showAddForm = true">
          <i class="fa fa-plus"></i> Add Dormitory
        </button>
      </div>

      <div *ngIf="showAddForm || editingDormitory" class="form-card">
        <h3>{{ editingDormitory ? 'Edit Dormitory' : 'Add Dormitory' }}</h3>
        <form (ngSubmit)="saveDormitory()">
          <div class="form-group">
            <label>Dormitory Name *</label>
            <input type="text" [(ngModel)]="dormitoryForm.name" name="name" required class="form-control">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Number of Rooms</label>
              <input type="number" [(ngModel)]="dormitoryForm.numberOfRoom" name="rooms" class="form-control">
            </div>
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea [(ngModel)]="dormitoryForm.description" name="description" class="form-control" rows="4"></textarea>
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
              <th>Rooms</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let dormitory of dormitories">
              <td>{{ dormitory.dormitoryId }}</td>
              <td>{{ dormitory.name }}</td>
              <td>{{ dormitory.numberOfRoom || '-' }}</td>
              <td>{{ dormitory.description?.substring(0, 50) || '-' }}...</td>
              <td>
                <button class="btn btn-sm btn-edit" (click)="editDormitory(dormitory)">
                  <i class="fa fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-delete" (click)="deleteDormitory(dormitory.dormitoryId)">
                  <i class="fa fa-trash"></i>
                </button>
              </td>
            </tr>
            <tr *ngIf="dormitories.length === 0">
              <td colspan="5" class="text-center">No dormitories found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .dormitories-container {
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
export class DormitoriesComponent implements OnInit {
  dormitories: Dormitory[] = [];
  showAddForm: boolean = false;
  editingDormitory: Dormitory | null = null;
  
  dormitoryForm: Partial<Dormitory> = {
    name: '',
    numberOfRoom: undefined,
    description: ''
  };

  constructor(private dormitoryService: DormitoryService) {}

  ngOnInit() {
    this.loadDormitories();
  }

  loadDormitories() {
    this.dormitoryService.getAllDormitories().subscribe(dormitories => {
      this.dormitories = dormitories;
    });
  }

  saveDormitory() {
    if (this.editingDormitory) {
      this.dormitoryService.updateDormitory(this.editingDormitory.dormitoryId, this.dormitoryForm as Dormitory)
        .subscribe(() => {
          this.loadDormitories();
          this.cancelForm();
        });
    } else {
      this.dormitoryService.createDormitory(this.dormitoryForm as Dormitory)
        .subscribe(() => {
          this.loadDormitories();
          this.cancelForm();
        });
    }
  }

  editDormitory(dormitory: Dormitory) {
    this.editingDormitory = dormitory;
    this.dormitoryForm = { ...dormitory };
    this.showAddForm = true;
  }

  deleteDormitory(id: number) {
    if (confirm('Are you sure you want to delete this dormitory?')) {
      this.dormitoryService.deleteDormitory(id).subscribe(() => {
        this.loadDormitories();
      });
    }
  }

  cancelForm() {
    this.showAddForm = false;
    this.editingDormitory = null;
    this.dormitoryForm = {
      name: '',
      numberOfRoom: undefined,
      description: ''
    };
  }
}





