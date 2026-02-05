import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NoticeboardService } from '../../../core/services/noticeboard.service';
import { Noticeboard } from '../../../core/models/noticeboard.model';

@Component({
  selector: 'app-noticeboards',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="noticeboards-container">
      <div class="page-header">
        <h2>Notice Management</h2>
        <button class="btn btn-primary" (click)="showAddForm = true">
          <i class="fa fa-plus"></i> Add Notice
        </button>
      </div>

      <div *ngIf="showAddForm || editingNotice" class="form-card">
        <h3>{{ editingNotice ? 'Edit Notice' : 'Add Notice' }}</h3>
        <form (ngSubmit)="saveNotice()">
          <div class="form-group">
            <label>Notice Title *</label>
            <input type="text" [(ngModel)]="noticeForm.noticeTitle" name="title" required class="form-control">
          </div>
          <div class="form-group">
            <label>Notice Content</label>
            <textarea [(ngModel)]="noticeForm.notice" name="notice" class="form-control" rows="6"></textarea>
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
              <th>Content</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let notice of notices">
              <td>{{ notice.noticeId }}</td>
              <td>{{ notice.noticeTitle }}</td>
              <td>{{ notice.notice?.substring(0, 50) || '-' }}...</td>
              <td>{{ notice.createTimestamp | date:'short' }}</td>
              <td>
                <button class="btn btn-sm btn-edit" (click)="editNotice(notice)">
                  <i class="fa fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-delete" (click)="deleteNotice(notice.noticeId)">
                  <i class="fa fa-trash"></i>
                </button>
              </td>
            </tr>
            <tr *ngIf="notices.length === 0">
              <td colspan="5" class="text-center">No notices found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .noticeboards-container {
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
export class NoticeboardsComponent implements OnInit {
  notices: Noticeboard[] = [];
  showAddForm: boolean = false;
  editingNotice: Noticeboard | null = null;
  
  noticeForm: Partial<Noticeboard> = {
    noticeTitle: '',
    notice: ''
  };

  constructor(private noticeboardService: NoticeboardService) {}

  ngOnInit() {
    this.loadNotices();
  }

  loadNotices() {
    this.noticeboardService.getAllNotices().subscribe(notices => {
      this.notices = notices;
    });
  }

  saveNotice() {
    if (this.editingNotice) {
      this.noticeboardService.updateNotice(this.editingNotice.noticeId, this.noticeForm as Noticeboard)
        .subscribe(() => {
          this.loadNotices();
          this.cancelForm();
        });
    } else {
      this.noticeboardService.createNotice(this.noticeForm as Noticeboard)
        .subscribe(() => {
          this.loadNotices();
          this.cancelForm();
        });
    }
  }

  editNotice(notice: Noticeboard) {
    this.editingNotice = notice;
    this.noticeForm = { ...notice };
    this.showAddForm = true;
  }

  deleteNotice(id: number) {
    if (confirm('Are you sure you want to delete this notice?')) {
      this.noticeboardService.deleteNotice(id).subscribe(() => {
        this.loadNotices();
      });
    }
  }

  cancelForm() {
    this.showAddForm = false;
    this.editingNotice = null;
    this.noticeForm = {
      noticeTitle: '',
      notice: ''
    };
  }
}

