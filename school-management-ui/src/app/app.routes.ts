import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  {
    path: 'teacher',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['teacher'] },
    loadChildren: () => import('./features/teacher/teacher.routes').then(m => m.TEACHER_ROUTES)
  },
  {
    path: 'student',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['student'] },
    loadChildren: () => import('./features/student/student.routes').then(m => m.STUDENT_ROUTES)
  },
  {
    path: 'parent',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['parent'] },
    loadChildren: () => import('./features/parent/parent.routes').then(m => m.PARENT_ROUTES)
  }
];

