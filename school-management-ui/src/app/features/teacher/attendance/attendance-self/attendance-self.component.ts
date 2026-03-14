import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { TeacherService } from '../../../../core/services/teacher.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { Teacher } from '../../../../core/models/teacher.model';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { formatTime12h } from '../../../../shared/utils/time.utils';

@Component({
  selector: 'app-attendance-self',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LoadingComponent],
  template: `
    <div class="page-container">
      <app-loading [show]="loading" [message]="'Loading...'"></app-loading>

      <div class="page-header-card">
        <div class="header-content">
          <div>
            <h2><i class="fa fa-user-circle"></i> My Attendance</h2>
            <p class="page-subtitle">Mark your daily check-in and check-out</p>
          </div>
        </div>
      </div>

      <div class="content-card">
        <div class="date-time-row">
          <div class="info-box">
            <span class="label">Today's Date</span>
            <span class="value">{{ todayDate }}</span>
          </div>
          <div class="info-box">
            <span class="label">Current Time</span>
            <span class="value live-clock">{{ currentTimeDisplay }}</span>
          </div>
        </div>

        <div class="teacher-info" *ngIf="teacher">
          <span class="name">{{ teacher.name }}</span>
          <span class="dept">{{ departmentName }}</span>
        </div>

        <div class="status-section" *ngIf="!loading && teacher">
          <span class="status-label">Today's Status</span>
          <span class="status-badge" [ngClass]="getStatusClass()">{{ getStatusLabel() }}</span>
        </div>

        <div class="actions-row" *ngIf="!loading && teacher && !onLeave">
          <button class="btn btn-pp" *ngIf="canCheckIn()" (click)="checkIn('PP')" [disabled]="saving">
            <i class="fa fa-user"></i> Mark PP
          </button>
          <button class="btn btn-po" *ngIf="canCheckIn()" (click)="checkIn('PO')" [disabled]="saving">
            <i class="fa fa-video-camera"></i> Mark PO
          </button>
          <button class="btn btn-out" *ngIf="canCheckOut()" (click)="checkOut()" [disabled]="saving">
            <i class="fa fa-sign-out"></i> Check Out
          </button>
        </div>

        <div class="on-leave-badge" *ngIf="onLeave">
          <i class="fa fa-umbrella"></i> On Approved Leave
        </div>

        <div class="view-month-link">
          <a routerLink="/teacher/attendance/month" class="link-btn">
            <i class="fa fa-calendar"></i> View This Month
          </a>
        </div>

        <!-- <div class="quick-nav">
          <h4>Quick Navigation</h4>
          <div class="nav-links">
            <a routerLink="/teacher/attendance/self" routerLinkActive="active" class="nav-link">
              <i class="fa fa-user-circle"></i> My Attendance
            </a>
            <a routerLink="/teacher/attendance/month" class="nav-link">
              <i class="fa fa-calendar"></i> This Month
            </a>
            <a routerLink="/teacher/attendance/class" class="nav-link">
              <i class="fa fa-users"></i> Class Attendance
            </a>
            <a routerLink="/teacher/attendance/leave" class="nav-link">
              <i class="fa fa-calendar-plus-o"></i> Leave
            </a>
          </div>
        </div> -->
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 1.5rem; max-width: 560px; margin: 0 auto; }
    .page-header-card {
      background: #fff;
      border-radius: 16px;
      padding: 1.75rem 2rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    .page-header-card h2 {
      margin: 0 0 0.25rem 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: #0f2744;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .page-header-card h2 i { color: #1e3a5f; }
    .page-subtitle { margin: 0; color: #6a8cad; font-size: 0.9375rem; }
    .content-card {
      background: #fff;
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    .date-time-row { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
    .info-box {
      flex: 1;
      background: #f7f9fc;
      padding: 1rem;
      border-radius: 12px;
      text-align: center;
      border: 1px solid #e2e8f0;
    }
    .info-box .label { display: block; font-size: 0.75rem; color: #6a8cad; margin-bottom: 0.25rem; }
    .info-box .value { font-size: 1.125rem; font-weight: 600; color: #0f2744; }
    .live-clock { font-family: 'Consolas', monospace; letter-spacing: 0.05em; }
    .teacher-info {
      padding: 1rem;
      background: linear-gradient(135deg, #f0f7ff 0%, #e8f4fd 100%);
      border-radius: 12px;
      margin-bottom: 1.5rem;
      border-left: 4px solid #1e3a5f;
    }
    .teacher-info .name { font-size: 1.125rem; font-weight: 600; color: #0f2744; display: block; }
    .teacher-info .dept { font-size: 0.875rem; color: #6a8cad; }
    .status-section { margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem; }
    .status-label { font-size: 0.9375rem; color: #6a8cad; }
    .status-badge { padding: 0.4rem 1rem; border-radius: 999px; font-size: 0.875rem; font-weight: 600; }
    .badge-pp { background: #d1fae5; color: #059669; }
    .badge-po { background: #dbeafe; color: #2563eb; }
    .badge-not-marked { background: #fef3c7; color: #d97706; }
    .badge-leave { background: #ede9fe; color: #7c3aed; }
    .actions-row { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1rem; }
    .btn {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.875rem 1.25rem; border: none; border-radius: 12px;
      font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
    }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-pp { background: #059669; color: #fff; }
    .btn-pp:hover:not(:disabled) { background: #047857; transform: translateY(-1px); }
    .btn-po { background: #2563eb; color: #fff; }
    .btn-po:hover:not(:disabled) { background: #1d4ed8; transform: translateY(-1px); }
    .btn-out { background: #6b7280; color: #fff; }
    .btn-out:hover:not(:disabled) { background: #4b5563; transform: translateY(-1px); }
    .on-leave-badge {
      padding: 1rem;
      background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
      color: #7c3aed;
      font-weight: 600;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    .view-month-link { margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; }
    .link-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: #1e3a5f;
      font-weight: 600;
      font-size: 0.9375rem;
      text-decoration: none;
    }
    .link-btn:hover { color: #2c5282; text-decoration: underline; }
    .quick-nav {
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e2e8f0;
    }
    .quick-nav h4 { margin: 0 0 1rem 0; font-size: 0.9375rem; color: #6a8cad; font-weight: 600; }
    .nav-links { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .nav-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: #f7f9fc;
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      color: #1e3a5f;
      font-weight: 500;
      font-size: 0.9375rem;
      text-decoration: none;
      transition: all 0.2s;
    }
    .nav-link:hover { border-color: #1e3a5f; background: #f0f7ff; }
    .nav-link.active { background: #1e3a5f; color: #fff; border-color: #1e3a5f; }
  `]
})
export class AttendanceSelfComponent implements OnInit, OnDestroy {
  teacher: Teacher | null = null;
  todayDate = '';
  currentTime = '--:--:--';
  todayStatus = 0;
  todayTimeIn = '';
  loading = true;
  saving = false;
  onLeave = false;
  private clockInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private auth: AuthService,
    private teacherService: TeacherService,
    private notify: NotificationService
  ) {}

  get departmentName(): string {
    return this.teacher?.department?.name ?? '—';
  }

  ngOnInit(): void {
    this.updateDateAndTime();
    this.clockInterval = setInterval(() => this.updateTime(), 1000);
    this.loadTeacher();
  }

  ngOnDestroy(): void {
    if (this.clockInterval) clearInterval(this.clockInterval);
  }

  get currentTimeDisplay(): string {
    return formatTime12h(this.currentTime, '--:--');
  }

  private updateDateAndTime(): void {
    const now = new Date();
    this.todayDate = now.toISOString().split('T')[0];
    this.currentTime = now.toTimeString().split(' ')[0];
  }

  private updateTime(): void {
    this.currentTime = new Date().toTimeString().split(' ')[0];
  }

  /** UI demo: use mock data when API fails or not logged in */
  readonly uiDemoMode = true;

  private loadTeacher(): void {
    const userId = this.auth.getUserId();
    if (this.uiDemoMode && !userId) {
      this.teacher = {
        teacherId: 1,
        name: 'John Smith',
        email: 'john.smith@school.com',
        password: '',
        loginStatus: 'active',
        department: { departmentId: 1, name: 'Mathematics' }
      } as Teacher;
      this.loading = false;
      return;
    }
    if (!userId) {
      this.loading = false;
      return;
    }
    this.teacherService.getTeacherById(userId).subscribe({
      next: (t) => {
        this.teacher = t;
        this.loading = false;
      },
      error: () => {
        if (this.uiDemoMode) {
          this.teacher = {
            teacherId: 1,
            name: 'Demo Teacher',
            email: 'teacher@school.com',
            password: '',
            loginStatus: 'active',
            department: { departmentId: 1, name: 'Mathematics' }
          } as Teacher;
        }
        this.loading = false;
      }
    });
  }

  canCheckIn(): boolean {
    return this.todayStatus === 0;
  }

  canCheckOut(): boolean {
    return this.todayStatus === 1 || this.todayStatus === 2;
  }

  getStatusLabel(): string {
    if (this.onLeave) return 'On Leave';
    const m: Record<number, string> = {
      0: 'Not Marked', 1: 'PP', 2: 'PO', 3: 'Absent', 4: 'SL', 5: 'FL', 6: 'Holiday'
    };
    return m[this.todayStatus] ?? 'Not Marked';
  }

  getStatusClass(): string {
    if (this.onLeave) return 'badge-leave';
    if (this.todayStatus === 0) return 'badge-not-marked';
    if (this.todayStatus === 1) return 'badge-pp';
    if (this.todayStatus === 2) return 'badge-po';
    return 'badge-leave';
  }

  checkIn(mode: 'PP' | 'PO'): void {
    this.saving = true;
    this.todayStatus = mode === 'PP' ? 1 : 2;
    this.todayTimeIn = this.currentTime;
    this.saving = false;
    this.notify.success(`Check-in (${mode}) recorded`);
  }

  checkOut(): void {
    this.saving = true;
    this.saving = false;
    this.notify.success('Check-out recorded');
  }
}
