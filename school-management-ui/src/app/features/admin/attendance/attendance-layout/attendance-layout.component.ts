import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-attendance-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  template: `
    <div class="attendance-layout">
      <div class="sub-nav">
        <a routerLink="/admin/attendance/class" routerLinkActive="active" class="nav-tab">
          <i class="fa fa-users"></i> Class Attendance
        </a>
        <a routerLink="/admin/attendance/staff" routerLinkActive="active" class="nav-tab">
          <i class="fa fa-chalkboard-teacher"></i> Staff Attendance
        </a>
        <a routerLink="/admin/attendance/calendar" routerLinkActive="active" class="nav-tab">
          <i class="fa fa-calendar"></i> Calendar
        </a>
        <a routerLink="/admin/attendance/daily" routerLinkActive="active" class="nav-tab">
          <i class="fa fa-bar-chart"></i> Daily Summary
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
export class AttendanceLayoutComponent {}
