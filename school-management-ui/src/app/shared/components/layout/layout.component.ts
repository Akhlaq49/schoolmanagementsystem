import { Component, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, TitleCasePipe],
  template: `
    <div class="layout-container">
      <header class="header">
        <div class="header-content">
          <div class="header-left">
            <div class="logo-container">
              <i class="fa fa-graduation-cap logo-icon"></i>
              <h1 class="logo-text">EduManage</h1>
            </div>
          </div>
          <div class="header-right">
            <div class="user-info">
              <div class="user-avatar">
                <i class="fa fa-user"></i>
              </div>
              <div class="user-details">
                <span class="user-name">{{ userName }}</span>
                <div class="user-roles" *ngIf="userRoles.length > 0">
                  <span class="role-badge" *ngFor="let role of userRoles" [class]="'role-' + role">
                    <i [class]="getRoleIcon(role)"></i>
                    {{ getRoleDisplayName(role) }}
                  </span>
                </div>
              </div>
              <button (click)="logout()" class="btn-logout" title="Logout">
                <i class="fa fa-sign-out"></i>
                <span class="logout-text">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <div class="main-container">
        <nav class="sidebar" *ngIf="userRoles.length > 0">
          <div class="sidebar-header">
            <h3 class="sidebar-title">Navigation</h3>
          </div>
          <ul class="nav-menu">
            <li *ngFor="let item of menuItems">
              <a 
                [routerLink]="item.route" 
                routerLinkActive="active" 
                [routerLinkActiveOptions]="{exact: item.exact}"
                class="nav-link">
                <span class="nav-icon">
                  <i [class]="item.icon"></i>
                </span>
                <span class="nav-label">{{ item.label }}</span>
                <span class="nav-indicator"></span>
              </a>
            </li>
            <li *ngIf="menuItems.length === 0 && userRoles.length > 0" class="nav-empty">
              <span class="nav-label text-muted">No menu items available</span>
            </li>
          </ul>
        </nav>
        
        <main class="content">
          <div class="content-wrapper">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .layout-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: var(--bg-secondary);
    }
    
    /* Header Styles */
    .header {
      background: var(--primary-gradient);
      color: var(--text-inverse);
      padding: 0;
      box-shadow: var(--shadow-lg);
      position: sticky;
      top: 0;
      z-index: var(--z-sticky);
      backdrop-filter: blur(10px);
    }
    
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      max-width: 100%;
    }
    
    .header-left {
      display: flex;
      align-items: center;
    }
    
    .logo-container {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .logo-icon {
      font-size: 2rem;
      color: var(--text-inverse);
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
    }
    
    .logo-text {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-inverse);
      letter-spacing: -0.5px;
    }
    
    .header-right {
      display: flex;
      align-items: center;
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.5rem 1rem;
      background: rgba(255, 255, 255, 0.1);
      border-radius: var(--radius-xl);
      backdrop-filter: blur(10px);
    }
    
    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-full);
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      border: 2px solid rgba(255, 255, 255, 0.3);
    }
    
    .user-details {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    
    .user-name {
      font-weight: 600;
      font-size: 0.95rem;
      color: var(--text-inverse);
    }
    
    .user-roles {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    
    .role-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem 0.75rem;
      border-radius: var(--radius-full);
      font-size: 0.7rem;
      font-weight: 600;
      background: rgba(255, 255, 255, 0.25);
      border: 1px solid rgba(255, 255, 255, 0.3);
      backdrop-filter: blur(5px);
      transition: all var(--transition-fast);
    }
    
    .role-badge:hover {
      background: rgba(255, 255, 255, 0.35);
      transform: translateY(-1px);
    }
    
    .role-badge i {
      font-size: 0.7rem;
    }
    
    .role-admin {
      background: rgba(251, 191, 36, 0.3);
      border-color: rgba(251, 191, 36, 0.5);
    }
    
    .role-teacher {
      background: rgba(34, 197, 94, 0.3);
      border-color: rgba(34, 197, 94, 0.5);
    }
    
    .role-student {
      background: rgba(59, 130, 246, 0.3);
      border-color: rgba(59, 130, 246, 0.5);
    }
    
    .role-parent {
      background: rgba(139, 92, 246, 0.3);
      border-color: rgba(139, 92, 246, 0.5);
    }
    
    .btn-logout {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: var(--text-inverse);
      border-radius: var(--radius-md);
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all var(--transition-fast);
      backdrop-filter: blur(5px);
    }
    
    .btn-logout:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }
    
    .logout-text {
      display: none;
    }
    
    @media (min-width: 768px) {
      .logout-text {
        display: inline;
      }
    }
    
    /* Main Container */
    .main-container {
      display: flex;
      flex: 1;
      overflow: hidden;
    }
    
    /* Sidebar Styles */
    .sidebar {
      width: 280px;
      min-width: 280px;
      background: var(--bg-primary);
      color: var(--text-primary);
      padding: 0;
      box-shadow: var(--shadow-md);
      display: flex !important;
      flex-direction: column;
      border-right: 1px solid var(--border-light);
      overflow-y: auto;
      overflow-x: hidden;
      visibility: visible;
      opacity: 1;
    }
    
    .sidebar-header {
      padding: 1.5rem;
      border-bottom: 1px solid var(--border-light);
      background: var(--bg-secondary);
    }
    
    .sidebar-title {
      margin: 0;
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-tertiary);
    }
    
    .nav-menu {
      list-style: none;
      padding: 0.5rem;
      margin: 0;
      flex: 1;
    }
    
    .nav-menu li {
      margin-bottom: 0.25rem;
    }
    
    .nav-link {
      display: flex;
      align-items: center;
      padding: 0.875rem 1rem;
      color: var(--text-secondary);
      text-decoration: none;
      border-radius: var(--radius-lg);
      transition: all var(--transition-fast);
      position: relative;
      overflow: hidden;
    }
    
    .nav-link::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: var(--primary);
      transform: scaleY(0);
      transition: transform var(--transition-fast);
    }
    
    .nav-link:hover {
      background: var(--bg-secondary);
      color: var(--primary);
      transform: translateX(4px);
    }
    
    .nav-link.active {
      background: linear-gradient(90deg, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%);
      color: var(--primary);
      font-weight: 600;
    }
    
    .nav-link.active::before {
      transform: scaleY(1);
    }
    
    .nav-icon {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 0.75rem;
      font-size: 1.125rem;
      transition: transform var(--transition-fast);
    }
    
    .nav-link:hover .nav-icon {
      transform: scale(1.1);
    }
    
    .nav-label {
      flex: 1;
      font-size: 0.9375rem;
    }
    
    .nav-indicator {
      width: 6px;
      height: 6px;
      border-radius: var(--radius-full);
      background: var(--primary);
      opacity: 0;
      transition: opacity var(--transition-fast);
    }
    
    .nav-link.active .nav-indicator {
      opacity: 1;
    }
    
    /* Content Area */
    .content {
      flex: 1;
      overflow-y: auto;
      background: var(--bg-secondary);
      position: relative;
    }
    
    .content-wrapper {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
      min-height: 100%;
    }
    
    /* Responsive Design */
    @media (max-width: 1024px) {
      .sidebar {
        width: 240px;
      }
      
      .content-wrapper {
        padding: 1.5rem;
      }
    }
    
    @media (max-width: 768px) {
      .header-content {
        padding: 1rem;
      }
      
      .logo-text {
        font-size: 1.25rem;
      }
      
      .user-info {
        padding: 0.5rem;
      }
      
      .user-details {
        display: none;
      }
      
      .sidebar {
        width: 70px;
      }
      
      .sidebar-header {
        padding: 1rem;
      }
      
      .sidebar-title {
        display: none;
      }
      
      .nav-label {
        display: none;
      }
      
      .nav-link {
        justify-content: center;
        padding: 1rem;
      }
      
      .nav-icon {
        margin-right: 0;
      }
      
      .content-wrapper {
        padding: 1rem;
      }
    }
    
    @media (max-width: 480px) {
      .header-content {
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
      }
      
      .user-info {
        width: 100%;
        justify-content: space-between;
      }
    }

    @media print {
      /* Hide header, sidebar, and navigation when printing */
      .header,
      .sidebar,
      .nav-menu {
        display: none !important;
      }

      /* Make content full width when printing */
      .content {
        margin-left: 0 !important;
        width: 100% !important;
        height: auto !important;
        overflow: visible !important;
      }

      .content-wrapper {
        padding: 0 !important;
        max-width: 100% !important;
        height: auto !important;
        overflow: visible !important;
      }

      /* Hide main container flex layout */
      .main-container {
        display: block !important;
        height: auto !important;
        overflow: visible !important;
      }

      /* Ensure layout container allows content flow */
      .layout-container {
        height: auto !important;
        overflow: visible !important;
      }

      /* Allow body to flow across pages */
      body {
        height: auto !important;
        overflow: visible !important;
      }
    }
  `]
})
export class LayoutComponent implements OnInit {
  userName: string | null = null;
  userRoles: string[] = [];
  menuItems: any[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.userName = this.authService.getUserName();
    this.userRoles = this.authService.getUserRoles();
    
    // Get menu items based on all user roles
    this.menuItems = this.getMenuItemsForRoles(this.userRoles);
    
    // Debug: Log menu items to console
    console.log('User Roles:', this.userRoles);
    console.log('Menu Items:', this.menuItems);
    
    // If no menu items, try to reload after a short delay
    if (this.menuItems.length === 0 && this.userRoles.length > 0) {
      setTimeout(() => {
        this.userRoles = this.authService.getUserRoles();
        this.menuItems = this.getMenuItemsForRoles(this.userRoles);
        console.log('Retried - Menu Items:', this.menuItems);
      }, 100);
    }
  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }

  getRoleDisplayName(role: string): string {
    return role.charAt(0).toUpperCase() + role.slice(1);
  }

  getRoleIcon(role: string): string {
    const icons: { [key: string]: string } = {
      admin: 'fa fa-shield',
      teacher: 'fa fa-chalkboard-teacher',
      student: 'fa fa-user-graduate',
      parent: 'fa fa-users'
    };
    return icons[role.toLowerCase()] || 'fa fa-user';
  }

  private getMenuItemsForRoles(roles: string[]): any[] {
    const allMenuItems: { [key: string]: any[] } = {
      admin: [
        { route: '/admin/dashboard', label: 'Dashboard', icon: 'fa fa-home', exact: true, role: 'admin' },
        { route: '/admin/students', label: 'Students', icon: 'fa fa-users', role: 'admin' },
        { route: '/admin/teachers', label: 'Teachers', icon: 'fa fa-chalkboard-teacher', role: 'admin' },
        { route: '/admin/classes', label: 'Classes', icon: 'fa fa-book', role: 'admin' },
        { route: '/admin/sections', label: 'Sections', icon: 'fa fa-list', role: 'admin' },
        { route: '/admin/subjects', label: 'Subjects', icon: 'fa fa-bookmark', role: 'admin' },
        { route: '/admin/attendance', label: 'Attendance', icon: 'fa fa-check-square', role: 'admin' },
        { route: '/admin/exams', label: 'Exams', icon: 'fa fa-file-text', role: 'admin' },
        { route: '/admin/marks', label: 'Marks', icon: 'fa fa-star', role: 'admin' },
        { route: '/admin/assignments', label: 'Assignments', icon: 'fa fa-tasks', role: 'admin' },
        { route: '/admin/study-materials', label: 'Study Materials', icon: 'fa fa-file', role: 'admin' },
        { route: '/admin/invoices', label: 'Invoices', icon: 'fa fa-money', role: 'admin' },
        { route: '/admin/expenses', label: 'Expenses', icon: 'fa fa-credit-card', role: 'admin' },
        { route: '/admin/noticeboards', label: 'Notices', icon: 'fa fa-bullhorn', role: 'admin' },
        { route: '/admin/clubs', label: 'Clubs', icon: 'fa fa-users', role: 'admin' },
        { route: '/admin/circulars', label: 'Circulars', icon: 'fa fa-newspaper-o', role: 'admin' },
        { route: '/admin/departments', label: 'Departments', icon: 'fa fa-building', role: 'admin' },
        { route: '/admin/dormitories', label: 'Dormitories', icon: 'fa fa-home', role: 'admin' },
        { route: '/admin/transports', label: 'Transport', icon: 'fa fa-bus', role: 'admin' },
        { route: '/admin/whatsapp-notifications', label: 'WhatsApp Notifications', icon: 'fa fa-whatsapp', role: 'admin' },
        { route: '/admin/profile', label: 'Profile', icon: 'fa fa-user', role: 'admin' }
      ],
      teacher: [
        { route: '/teacher/dashboard', label: 'Dashboard', icon: 'fa fa-home', exact: true, role: 'teacher' },
        { route: '/teacher/attendance', label: 'Attendance', icon: 'fa fa-check-square', role: 'teacher' },
        { route: '/teacher/marks', label: 'Marks', icon: 'fa fa-star', role: 'teacher' },
        { route: '/teacher/assignments', label: 'Assignments', icon: 'fa fa-tasks', role: 'teacher' },
        { route: '/teacher/study-materials', label: 'Study Materials', icon: 'fa fa-file', role: 'teacher' },
        { route: '/teacher/question-bank', label: 'Question Bank', icon: 'fa fa-question-circle', role: 'teacher' },
        { route: '/teacher/exams', label: 'Exams', icon: 'fa fa-file-text', role: 'teacher' },
        { route: '/teacher/whatsapp-notifications', label: 'WhatsApp Notifications', icon: 'fa fa-whatsapp', role: 'teacher' },
        { route: '/teacher/profile', label: 'Profile', icon: 'fa fa-user', role: 'teacher' }
      ],
      student: [
        { route: '/student/dashboard', label: 'Dashboard', icon: 'fa fa-home', exact: true, role: 'student' },
        { route: '/student/subjects', label: 'Subjects', icon: 'fa fa-bookmark', role: 'student' },
        { route: '/student/assignments', label: 'Assignments', icon: 'fa fa-tasks', role: 'student' },
        { route: '/student/study-materials', label: 'Study Materials', icon: 'fa fa-file', role: 'student' },
        { route: '/student/marks', label: 'Marks', icon: 'fa fa-star', role: 'student' },
        { route: '/student/invoices', label: 'Invoices', icon: 'fa fa-money', role: 'student' },
        { route: '/student/profile', label: 'Profile', icon: 'fa fa-user', role: 'student' }
      ],
      parent: [
        { route: '/parent/dashboard', label: 'Dashboard', icon: 'fa fa-home', exact: true, role: 'parent' },
        { route: '/parent/invoices', label: 'Invoices', icon: 'fa fa-money', role: 'parent' },
        { route: '/parent/profile', label: 'Profile', icon: 'fa fa-user', role: 'parent' }
      ]
    };

    // Collect all menu items for user's roles, avoiding duplicates
    const menuItemsMap = new Map<string, any>();
    
    roles.forEach(role => {
      const roleMenus = allMenuItems[role.toLowerCase()] || [];
      roleMenus.forEach(item => {
        // Use route as key to avoid duplicates
        if (!menuItemsMap.has(item.route)) {
          menuItemsMap.set(item.route, item);
        }
      });
    });

    // Convert map to array and sort by role priority (admin > teacher > student > parent)
    const rolePriority: { [key: string]: number } = {
      admin: 1,
      teacher: 2,
      student: 3,
      parent: 4
    };

    return Array.from(menuItemsMap.values()).sort((a, b) => {
      const priorityA = rolePriority[a.role] || 99;
      const priorityB = rolePriority[b.role] || 99;
      return priorityA - priorityB;
    });
  }
}
