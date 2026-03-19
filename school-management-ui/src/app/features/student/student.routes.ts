import { Routes } from '@angular/router';
import { LayoutComponent } from '../../shared/components/layout/layout.component';

export const STUDENT_ROUTES: Routes = [
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
        path: 'subjects',
        loadComponent: () => import('../admin/subjects/subjects.component').then(m => m.SubjectsComponent)
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
        path: 'marks',
        loadComponent: () => import('../admin/marks/marks.component').then(m => m.MarksComponent)
      },
      {
        path: 'invoices',
        loadComponent: () => import('../admin/invoices/invoices.component').then(m => m.InvoicesComponent)
      },
      {
        path: 'attendance',
        children: [
          { path: '', redirectTo: 'checkin', pathMatch: 'full' },
          {
            path: 'checkin',
            loadComponent: () => import('./attendance/attendance-checkin/attendance-checkin.component').then(m => m.AttendanceCheckinComponent)
          },
          {
            path: 'edit',
            loadComponent: () => import('./attendance/attendance-edit/attendance-edit.component').then(m => m.AttendanceEditComponent)
          },
          {
            path: 'report',
            loadComponent: () => import('./attendance/attendance-report/attendance-report.component').then(m => m.AttendanceReportComponent)
          },
          {
            path: 'calendar',
            loadComponent: () => import('../admin/attendance/attendance-calendar/attendance-calendar.component').then(m => m.AdminAttendanceCalendarComponent)
          }
        ]
      },
      {
        path: 'leave',
        loadComponent: () => import('./attendance/attendance-leave/attendance-leave.component').then(m => m.AttendanceLeaveComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('../admin/profile/profile.component').then(m => m.ProfileComponent)
      }
    ]
  }
];
