import { Routes } from '@angular/router';
import { LayoutComponent } from '../../shared/components/layout/layout.component';

export const TEACHER_ROUTES: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'attendance',
        loadComponent: () => import('../admin/attendance/attendance.component').then(m => m.AttendanceComponent)
      },
      {
        path: 'marks',
        loadComponent: () => import('../admin/marks/marks.component').then(m => m.MarksComponent)
      },
      {
        path: 'assignments',
        loadComponent: () => import('../admin/assignments/assignments.component').then(m => m.AssignmentsComponent)
      },
      {
        path: 'study-materials',
        loadComponent: () => import('../admin/study-materials/study-materials.component').then(m => m.StudyMaterialsComponent)
      },
      {
        path: 'question-bank',
        loadComponent: () => import('./question-bank/question-bank.component').then(m => m.QuestionBankComponent)
      },
      {
        path: 'exams',
        loadComponent: () => import('../admin/exams/exams.component').then(m => m.ExamsComponent)
      },
      {
        path: 'whatsapp-notifications',
        loadComponent: () => import('../admin/whatsapp-notifications/whatsapp-notifications.component').then(m => m.WhatsAppNotificationsComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('../admin/profile/profile.component').then(m => m.ProfileComponent)
      }
    ]
  }
];
