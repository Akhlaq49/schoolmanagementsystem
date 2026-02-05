import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClubService } from '../../../core/services/club.service';
import { Club } from '../../../core/models/club.model';

@Component({
  selector: 'app-clubs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="clubs-container">
      <div class="page-header">
        <h2>Club Management</h2>
        <button class="btn btn-primary" (click)="showAddForm = true">
          <i class="fa fa-plus"></i> Add Club
        </button>
      </div>

      <div *ngIf="showAddForm || editingClub" class="form-card">
        <h3>{{ editingClub ? 'Edit Club' : 'Add Club' }}</h3>
        <form (ngSubmit)="saveClub()">
          <div class="form-group">
            <label>Club Name *</label>
            <input type="text" [(ngModel)]="clubForm.clubName" name="clubName" required class="form-control">
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea [(ngModel)]="clubForm.description" name="description" class="form-control" rows="4"></textarea>
          </div>
          <div class="form-group">
            <label>Date</label>
            <input type="date" [(ngModel)]="clubForm.date" name="date" class="form-control">
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
              <th>Club Name</th>
              <th>Description</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let club of clubs">
              <td>{{ club.clubId }}</td>
              <td>{{ club.clubName }}</td>
              <td>{{ club.description?.substring(0, 50) || '-' }}...</td>
              <td>{{ club.date | date:'short' }}</td>
              <td>
                <button class="btn btn-sm btn-edit" (click)="editClub(club)">
                  <i class="fa fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-delete" (click)="deleteClub(club.clubId)">
                  <i class="fa fa-trash"></i>
                </button>
              </td>
            </tr>
            <tr *ngIf="clubs.length === 0">
              <td colspan="5" class="text-center">No clubs found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .clubs-container {
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
export class ClubsComponent implements OnInit {
  clubs: Club[] = [];
  showAddForm: boolean = false;
  editingClub: Club | null = null;
  
  clubForm: Partial<Club> = {
    clubName: '',
    description: '',
    date: undefined
  };

  constructor(private clubService: ClubService) {}

  ngOnInit() {
    this.loadClubs();
  }

  loadClubs() {
    this.clubService.getAllClubs().subscribe(clubs => {
      this.clubs = clubs;
    });
  }

  saveClub() {
    if (this.editingClub) {
      this.clubService.updateClub(this.editingClub.clubId, this.clubForm as Club)
        .subscribe(() => {
          this.loadClubs();
          this.cancelForm();
        });
    } else {
      this.clubService.createClub(this.clubForm as Club)
        .subscribe(() => {
          this.loadClubs();
          this.cancelForm();
        });
    }
  }

  editClub(club: Club) {
    this.editingClub = club;
    this.clubForm = { ...club };
    this.showAddForm = true;
  }

  deleteClub(id: number) {
    if (confirm('Are you sure you want to delete this club?')) {
      this.clubService.deleteClub(id).subscribe(() => {
        this.loadClubs();
      });
    }
  }

  cancelForm() {
    this.showAddForm = false;
    this.editingClub = null;
    this.clubForm = {
      clubName: '',
      description: '',
      date: undefined
    };
  }
}





