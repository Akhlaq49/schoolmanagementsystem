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
        loadComponent: () => import('./attendance/attendance-layout/attendance-layout.component').then(m => m.TeacherAttendanceLayoutComponent),
        children: [
          { path: '', redirectTo: 'self', pathMatch: 'full' },
          {
            path: 'self',
            loadComponent: () => import('./attendance/attendance-self/attendance-self.component').then(m => m.AttendanceSelfComponent)
          },
          {
            path: 'month',
            loadComponent: () => import('./attendance/attendance-month/attendance-month.component').then(m => m.AttendanceMonthComponent)
          },
          {
            path: 'class',
            loadComponent: () => import('./attendance/attendance-class/attendance-class.component').then(m => m.AttendanceClassComponent)
          },
          {
            path: 'student/:id',
            loadComponent: () => import('./attendance/attendance-student/attendance-student.component').then(m => m.AttendanceStudentComponent)
          },
          {
            path: 'leave',
            loadComponent: () => import('./attendance/attendance-leave/attendance-leave.component').then(m => m.TeacherAttendanceLeaveComponent)
          }
        ]
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
