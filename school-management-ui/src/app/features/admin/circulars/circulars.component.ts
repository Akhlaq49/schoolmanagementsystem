import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CircularService } from '../../../core/services/circular.service';
import { Circular } from '../../../core/models/circular.model';

@Component({
  selector: 'app-circulars',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="circulars-container">
      <div class="page-header">
        <h2>Circular Management</h2>
        <button class="btn btn-primary" (click)="showAddForm = true">
          <i class="fa fa-plus"></i> Add Circular
        </button>
      </div>

      <div *ngIf="showAddForm || editingCircular" class="form-card">
        <h3>{{ editingCircular ? 'Edit Circular' : 'Add Circular' }}</h3>
        <form (ngSubmit)="saveCircular()">
          <div class="form-row">
            <div class="form-group">
              <label>Title *</label>
              <input type="text" [(ngModel)]="circularForm.title" name="title" required class="form-control">
            </div>
            <div class="form-group">
              <label>Reference</label>
              <input type="text" [(ngModel)]="circularForm.reference" name="reference" class="form-control">
            </div>
          </div>
          <div class="form-group">
            <label>Content</label>
            <textarea [(ngModel)]="circularForm.content" name="content" class="form-control" rows="6"></textarea>
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
              <th>Reference</th>
              <th>Content</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let circular of circulars">
              <td>{{ circular.circularId }}</td>
              <td>{{ circular.title }}</td>
              <td>{{ circular.reference || '-' }}</td>
              <td>{{ circular.content?.substring(0, 50) || '-' }}...</td>
              <td>{{ circular.date | date:'short' }}</td>
              <td>
                <button class="btn btn-sm btn-edit" (click)="editCircular(circular)">
                  <i class="fa fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-delete" (click)="deleteCircular(circular.circularId)">
                  <i class="fa fa-trash"></i>
                </button>
              </td>
            </tr>
            <tr *ngIf="circulars.length === 0">
              <td colspan="6" class="text-center">No circulars found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .circulars-container {
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
export class CircularsComponent implements OnInit {
  circulars: Circular[] = [];
  showAddForm: boolean = false;
  editingCircular: Circular | null = null;
  
  circularForm: Partial<Circular> = {
    title: '',
    reference: '',
    content: ''
  };

  constructor(private circularService: CircularService) {}

  ngOnInit() {
    this.loadCirculars();
  }

  loadCirculars() {
    this.circularService.getAllCirculars().subscribe(circulars => {
      this.circulars = circulars;
    });
  }

  saveCircular() {
    if (this.editingCircular) {
      this.circularService.updateCircular(this.editingCircular.circularId, this.circularForm as Circular)
        .subscribe(() => {
          this.loadCirculars();
          this.cancelForm();
        });
    } else {
      this.circularService.createCircular(this.circularForm as Circular)
        .subscribe(() => {
          this.loadCirculars();
          this.cancelForm();
        });
    }
  }

  editCircular(circular: Circular) {
    this.editingCircular = circular;
    this.circularForm = { ...circular };
    this.showAddForm = true;
  }

  deleteCircular(id: number) {
    if (confirm('Are you sure you want to delete this circular?')) {
      this.circularService.deleteCircular(id).subscribe(() => {
        this.loadCirculars();
      });
    }
  }

  cancelForm() {
    this.showAddForm = false;
    this.editingCircular = null;
    this.circularForm = {
      title: '',
      reference: '',
      content: ''
    };
  }
}





