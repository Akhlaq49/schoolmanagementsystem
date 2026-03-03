import { Component, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, TitleCasePipe],
  template: `
    <div class="min-h-screen flex flex-col bg-academy-50">
      <header class="bg-academy-gradient text-white py-3.5 px-7 shadow-academy sticky top-0 z-[1000] backdrop-blur-sm">
        <div class="flex justify-between items-center max-w-full">
          <div class="flex items-center">
            <div class="flex items-center gap-3">
              <i class="fa fa-graduation-cap text-3xl text-gold-400 drop-shadow-sm"></i>
              <h1 class="font-display font-bold text-2xl text-white tracking-tight m-0">EduManage</h1>
            </div>
          </div>
          <div class="flex items-center">
            <div class="flex items-center gap-4 py-2 px-4 bg-white/10 rounded-xl backdrop-blur border border-white/20">
              <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg border-2 border-white/30">
                <i class="fa fa-user"></i>
              </div>
              <div class="hidden md:flex flex-col gap-1">
                <span class="font-semibold text-sm text-white">{{ userName }}</span>
                <div class="flex gap-2 flex-wrap" *ngIf="userRoles.length > 0">
                  <span class="role-badge" *ngFor="let role of userRoles" [class]="'role-' + role">
                    <i [class]="getRoleIcon(role)"></i>
                    {{ getRoleDisplayName(role) }}
                  </span>
                </div>
              </div>
              <button (click)="logout()" class="flex items-center gap-2 py-2 px-4 bg-white/20 border border-white/30 text-white rounded-lg text-sm font-medium hover:bg-white/30 transition-all hover:-translate-y-0.5" title="Logout">
                <i class="fa fa-sign-out"></i>
                <span class="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <div class="flex flex-1 overflow-hidden">
        <nav class="w-72 min-w-[280px] bg-white shadow-academy flex flex-col border-r border-academy-200 overflow-y-auto" *ngIf="userRoles.length > 0">
          <ul class="nav-menu">
            <li *ngFor="let item of menuItems">
              <!-- Group item with children (e.g. Family) -->
              <div *ngIf="item.children?.length; else singleLink" class="nav-group">
                <button 
                  type="button" 
                  class="nav-group-header" 
                  (click)="toggleGroup(item)">
                  <span class="nav-icon">
                    <i [class]="item.icon"></i>
                  </span>
                  <span class="nav-label">{{ item.label }}</span>
                  <span class="nav-group-caret" [class.expanded]="item.expanded">
                    <i class="fa fa-chevron-down"></i>
                  </span>
                </button>
                <ul class="nav-submenu" [class.expanded]="item.expanded">
                  <li *ngFor="let child of item.children">
                    <a 
                      [routerLink]="child.route" 
                      routerLinkActive="active" 
                      [routerLinkActiveOptions]="{exact: child.exact}"
                      class="nav-link nav-sublink">
                      <span class="nav-label">{{ child.label }}</span>
                    </a>
                  </li>
                </ul>
              </div>
              <!-- Single flat link -->
              <ng-template #singleLink>
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
              </ng-template>
            </li>
            <li *ngIf="menuItems.length === 0 && userRoles.length > 0" class="nav-empty">
              <span class="nav-label text-muted">No menu items available</span>
            </li>
          </ul>
        </nav>
        
        <main class="flex-1 overflow-y-auto bg-academy-50 relative">
          <div class="p-7 max-w-[1400px] mx-auto min-h-full">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .role-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.7rem;
      font-weight: 600;
      background: rgba(255,255,255,0.25);
      border: 1px solid rgba(255,255,255,0.3);
      transition: all 0.2s;
    }
    .role-admin { background: rgba(212,168,75,0.4); border-color: rgba(212,168,75,0.6); }
    .role-teacher { background: rgba(5,150,105,0.4); border-color: rgba(5,150,105,0.6); }
    .role-student { background: rgba(43,108,176,0.4); border-color: rgba(43,108,176,0.6); }
    .role-parent { background: rgba(139,92,246,0.4); border-color: rgba(139,92,246,0.6); }
    .nav-menu { list-style: none; padding: 0.75rem 0.5rem; margin: 0; flex: 1; }
    .nav-menu li { margin-bottom: 0.2rem; }
    .nav-group { display: flex; flex-direction: column; }
    .nav-group-header {
      display: flex; align-items: center; width: 100%;
      padding: 0.75rem 1rem; background: transparent; border: none;
      color: #435d7a; border-radius: 0.625rem; cursor: pointer;
      transition: all 0.2s; text-align: left; font-size: 0.9375rem; font-weight: 500;
    }
    .nav-group-header:hover { background: #eef2f7; color: #1e3a5f; }
    .nav-group-header:hover .nav-icon { color: #1e3a5f; }
    .nav-group-caret { display: flex; align-items: center; margin-left: auto; transition: transform 0.2s; font-size: 0.7rem; color: #8aa8c4; }
    .nav-group-caret.expanded { transform: rotate(180deg); color: #1e3a5f; }
    .nav-submenu {
      list-style: none; margin: 0; padding: 0.25rem 0 0.25rem 2.75rem;
      max-height: 0; overflow: hidden; transition: max-height 0.3s;
      border-left: 2px solid #eef2f7; margin-left: 1rem;
    }
    .nav-submenu.expanded { max-height: 500px; }
    .nav-link {
      display: flex; align-items: center; padding: 0.7rem 1rem;
      color: #6a8cad; text-decoration: none; border-radius: 0.625rem;
      transition: all 0.2s; position: relative; font-size: 0.9375rem; font-weight: 500;
    }
    .nav-link::before {
      content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%);
      width: 3px; height: 0; background: #1e3a5f; border-radius: 0 2px 2px 0; transition: height 0.2s;
    }
    .nav-link:hover { background: #eef2f7; color: #1e3a5f; }
    .nav-link:hover .nav-icon { color: #1e3a5f; }
    .nav-link.active { background: rgba(30,58,95,0.08); color: #1e3a5f; font-weight: 600; }
    .nav-link.active .nav-icon { color: #1e3a5f; }
    .nav-link.active::before { height: 24px; }
    .nav-icon {
      width: 22px; min-width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;
      margin-right: 0.75rem; font-size: 1rem; color: #8aa8c4; transition: color 0.2s;
    }
    .nav-group-header .nav-icon { color: #6a8cad; }
    .nav-label { flex: 1; font-size: 0.9375rem; }
    .nav-sublink { padding: 0.6rem 1rem 0.6rem 0.75rem; margin-left: -0.5rem; font-size: 0.875rem; color: #6a8cad; }
    .nav-sublink:hover, .nav-sublink.active { color: #1e3a5f; }
    .nav-sublink.active { background: rgba(30,58,95,0.06); font-weight: 600; }
    .nav-indicator { width: 6px; height: 6px; border-radius: 50%; background: #1e3a5f; opacity: 0; transition: opacity 0.2s; }
    .nav-link.active .nav-indicator { opacity: 1; }
    .nav-empty .nav-label.text-muted { color: #8aa8c4; }
    @media (max-width: 768px) {
      nav { width: 70px !important; min-width: 70px !important; }
      .sidebar-header h3 { display: none; }
      .nav-label { display: none; }
      .nav-link { justify-content: center; padding: 1rem; }
      .nav-icon { margin-right: 0; }
    }
    @media print {
      header, nav, .nav-menu { display: none !important; }
      main { margin-left: 0 !important; width: 100% !important; height: auto !important; overflow: visible !important; }
      main > div { padding: 0 !important; max-width: 100% !important; }
      .flex.overflow-hidden { display: block !important; height: auto !important; overflow: visible !important; }
      .min-h-screen { height: auto !important; overflow: visible !important; }
      body { height: auto !important; overflow: visible !important; }
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
        {
          label: 'Family',
          icon: 'fa fa-graduation-cap',
          role: 'admin',
          expanded: false,
          children: [
            { route: '/admin/family/add', label: 'Add New Family', role: 'admin' },
            { route: '/admin/family/list', label: 'Family List', role: 'admin' },
            { route: '/admin/family/fee-add-on', label: 'Fees Addons', role: 'admin' },
            { route: '/admin/family/defaulter-families', label: 'Defaulter families', role: 'admin' }
          ]
        },
        {
          label: 'Students',
          icon: 'fa fa-users',
          role: 'admin',
          expanded: false,
          children: [
            { route: '/admin/students/add', label: 'Add New Student', role: 'admin' },
            { route: '/admin/students/active', label: 'Active Students', role: 'admin' },
            { route: '/admin/students/drop', label: 'Drop Students', role: 'admin' },
            { route: '/admin/students/promote', label: 'Promote Student', role: 'admin' }
          ]
        },
        { route: '/admin/teachers', label: 'Teachers', icon: 'fa fa-chalkboard-teacher', role: 'admin' },
        {
          label: 'Classes',
          icon: 'fa fa-book',
          role: 'admin',
          expanded: false,
          children: [
            { route: '/admin/classes', label: 'Classes', role: 'admin' },
            { route: '/admin/sections', label: 'Section', role: 'admin' },
            { route: '/admin/subjects', label: 'Subjects', role: 'admin' },
            { route: '/admin/sessions', label: 'Session', role: 'admin' }
          ]
        },
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
        // Group items (with children) are keyed by label+role
        if (item.children?.length) {
          const key = `group:${role}:${item.label}`;
          if (!menuItemsMap.has(key)) {
            menuItemsMap.set(key, item);
          }
        } else if (item.route) {
          // Flat items are keyed by route
          const key = `route:${item.route}`;
          if (!menuItemsMap.has(key)) {
            menuItemsMap.set(key, item);
          }
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

  toggleGroup(item: any) {
    item.expanded = !item.expanded;
  }
}
