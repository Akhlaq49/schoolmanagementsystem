import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransportService } from '../../../core/services/transport.service';
import { Transport } from '../../../core/models/transport.model';

@Component({
  selector: 'app-transports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="transports-container">
      <div class="page-header">
        <h2>Transport Management</h2>
        <button class="btn btn-primary" (click)="showAddForm = true">
          <i class="fa fa-plus"></i> Add Transport Route
        </button>
      </div>

      <div *ngIf="showAddForm || editingTransport" class="form-card">
        <h3>{{ editingTransport ? 'Edit Transport' : 'Add Transport' }}</h3>
        <form (ngSubmit)="saveTransport()">
          <div class="form-group">
            <label>Route Name *</label>
            <input type="text" [(ngModel)]="transportForm.routeName" name="routeName" required class="form-control">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Number of Vehicles</label>
              <input type="number" [(ngModel)]="transportForm.numberOfVehicle" name="vehicles" class="form-control">
            </div>
            <div class="form-group">
              <label>Route Fare</label>
              <input type="number" [(ngModel)]="transportForm.routeFare" name="fare" class="form-control" step="0.01">
            </div>
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea [(ngModel)]="transportForm.description" name="description" class="form-control" rows="4"></textarea>
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
              <th>Route Name</th>
              <th>Vehicles</th>
              <th>Fare</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let transport of transports">
              <td>{{ transport.transportId }}</td>
              <td>{{ transport.routeName }}</td>
              <td>{{ transport.numberOfVehicle || '-' }}</td>
              <td>{{ transport.routeFare | currency }}</td>
              <td>{{ transport.description?.substring(0, 50) || '-' }}...</td>
              <td>
                <button class="btn btn-sm btn-edit" (click)="editTransport(transport)">
                  <i class="fa fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-delete" (click)="deleteTransport(transport.transportId)">
                  <i class="fa fa-trash"></i>
                </button>
              </td>
            </tr>
            <tr *ngIf="transports.length === 0">
              <td colspan="6" class="text-center">No transport routes found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .transports-container {
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
export class TransportsComponent implements OnInit {
  transports: Transport[] = [];
  showAddForm: boolean = false;
  editingTransport: Transport | null = null;
  
  transportForm: Partial<Transport> = {
    routeName: '',
    numberOfVehicle: undefined,
    routeFare: undefined,
    description: ''
  };

  constructor(private transportService: TransportService) {}

  ngOnInit() {
    this.loadTransports();
  }

  loadTransports() {
    this.transportService.getAllTransports().subscribe(transports => {
      this.transports = transports;
    });
  }

  saveTransport() {
    if (this.editingTransport) {
      this.transportService.updateTransport(this.editingTransport.transportId, this.transportForm as Transport)
        .subscribe(() => {
          this.loadTransports();
          this.cancelForm();
        });
    } else {
      this.transportService.createTransport(this.transportForm as Transport)
        .subscribe(() => {
          this.loadTransports();
          this.cancelForm();
        });
    }
  }

  editTransport(transport: Transport) {
    this.editingTransport = transport;
    this.transportForm = { ...transport };
    this.showAddForm = true;
  }

  deleteTransport(id: number) {
    if (confirm('Are you sure you want to delete this transport route?')) {
      this.transportService.deleteTransport(id).subscribe(() => {
        this.loadTransports();
      });
    }
  }

  cancelForm() {
    this.showAddForm = false;
    this.editingTransport = null;
    this.transportForm = {
      routeName: '',
      numberOfVehicle: undefined,
      routeFare: undefined,
      description: ''
    };
  }
}





