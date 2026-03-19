import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-teacher-attendance-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  template: `
    <div class="attendance-layout">
      <div class="sub-nav">
        <a routerLink="/teacher/attendance/self" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="nav-tab">
          <i class="fa fa-user-circle"></i> My Attendance
        </a>
        <a routerLink="/teacher/attendance/month" routerLinkActive="active" class="nav-tab">
          <i class="fa fa-calendar"></i> This Month
        </a>
        <a routerLink="/teacher/attendance/class" routerLinkActive="active" class="nav-tab">
          <i class="fa fa-users"></i> Class Attendance
        </a>
        <a routerLink="/teacher/attendance/leave" routerLinkActive="active" class="nav-tab">
          <i class="fa fa-calendar-plus-o"></i> Leave
        </a>
        <a routerLink="/teacher/attendance/edit" routerLinkActive="active" class="nav-tab">
          <i class="fa fa-pencil-square-o"></i> Edit Attendance
        </a>
        <a routerLink="/teacher/attendance/report" routerLinkActive="active" class="nav-tab">
          <i class="fa fa-bar-chart"></i> Attendance Report
        </a>
        <a routerLink="/teacher/attendance/calendar" routerLinkActive="active" class="nav-tab">
          <i class="fa fa-calendar"></i> Calendar
        </a>
      </div>
      <div class="outlet-wrap">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .attendance-layout { padding: 0 1.5rem 1.5rem; }
    .sub-nav {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      padding: 1rem 1.25rem;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    .nav-tab {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 1.25rem;
      border-radius: 10px;
      font-weight: 500;
      font-size: 0.9375rem;
      color: #6a8cad;
      text-decoration: none;
      transition: all 0.2s;
    }
    .nav-tab:hover { color: #1e3a5f; background: #f7f9fc; }
    .nav-tab.active { background: #1e3a5f; color: #fff; }
    .outlet-wrap { min-height: 200px; }
  `]
})
export class TeacherAttendanceLayoutComponent {}
