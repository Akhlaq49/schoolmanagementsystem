import { Routes } from '@angular/router';
import { LayoutComponent } from '../../shared/components/layout/layout.component';

export const ADMIN_ROUTES: Routes = [
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
        path: 'students',
        redirectTo: 'students/active',
        pathMatch: 'full'
      },
      {
        path: 'students/add',
        loadComponent: () => import('./students/student-add/student-add.component').then(m => m.StudentAddComponent)
      },
      {
        path: 'students/active',
        loadComponent: () => import('./students/students.component').then(m => m.StudentsComponent)
      },
      {
        path: 'students/view/:id',
        loadComponent: () => import('./students/student-view/student-view.component').then(m => m.StudentViewComponent)
      },
      {
        path: 'students/drop',
        loadComponent: () => import('./students/drop-students/drop-students.component').then(m => m.DropStudentsComponent)
      },
      {
        path: 'students/promote',
        loadComponent: () => import('./students/promote-student/promote-student.component').then(m => m.PromoteStudentComponent)
      },
      {
        path: 'teachers',
        loadComponent: () => import('./teachers/teachers.component').then(m => m.TeachersComponent)
      },
      {
        path: 'classes',
        loadComponent: () => import('./classes/classes.component').then(m => m.ClassesComponent)
      },
      {
        path: 'sections',
        loadComponent: () => import('./sections/sections.component').then(m => m.SectionsComponent)
      },
      {
        path: 'subjects',
        loadComponent: () => import('./subjects/subjects.component').then(m => m.SubjectsComponent)
      },
      {
        path: 'attendance',
        loadComponent: () => import('./attendance/attendance.component').then(m => m.AttendanceComponent)
      },
      {
        path: 'exams',
        loadComponent: () => import('./exams/exams.component').then(m => m.ExamsComponent)
      },
      {
        path: 'marks',
        loadComponent: () => import('./marks/marks.component').then(m => m.MarksComponent)
      },
      {
        path: 'assignments',
        loadComponent: () => import('./assignments/assignments.component').then(m => m.AssignmentsComponent)
      },
      {
        path: 'study-materials',
        loadComponent: () => import('./study-materials/study-materials.component').then(m => m.StudyMaterialsComponent)
      },
      {
        path: 'invoices',
        loadComponent: () => import('./invoices/invoices.component').then(m => m.InvoicesComponent)
      },
      {
        path: 'expenses',
        loadComponent: () => import('./expenses/expenses.component').then(m => m.ExpensesComponent)
      },
      {
        path: 'noticeboards',
        loadComponent: () => import('./noticeboards/noticeboards.component').then(m => m.NoticeboardsComponent)
      },
      {
        path: 'clubs',
        loadComponent: () => import('./clubs/clubs.component').then(m => m.ClubsComponent)
      },
      {
        path: 'circulars',
        loadComponent: () => import('./circulars/circulars.component').then(m => m.CircularsComponent)
      },
      {
        path: 'departments',
        loadComponent: () => import('./departments/departments.component').then(m => m.DepartmentsComponent)
      },
      {
        path: 'sessions',
        loadComponent: () => import('./sessions/sessions.component').then(m => m.SessionsComponent)
      },
      {
        path: 'dormitories',
        loadComponent: () => import('./dormitories/dormitories.component').then(m => m.DormitoriesComponent)
      },
      {
        path: 'transports',
        loadComponent: () => import('./transports/transports.component').then(m => m.TransportsComponent)
      },
      {
        path: 'family',
        loadComponent: () => import('./family/family-list/family-list.component').then(m => m.FamilyListComponent)
      },
      {
        path: 'family/add',
        loadComponent: () => import('./family/family-add/family-add.component').then(m => m.FamilyAddComponent)
      },
      {
        path: 'family/list',
        loadComponent: () => import('./family/family-list/family-list.component').then(m => m.FamilyListComponent)
      },
      {
        path: 'family/fee-add-on',
        loadComponent: () => import('./family/fee-add-on/fee-add-on.component').then(m => m.FeeAddOnComponent)
      },
      {
        path: 'family/defaulter-families',
        loadComponent: () => import('./family/defaulter-families/defaulter-families.component').then(m => m.DefaulterFamiliesComponent)
      },
      {
        path: 'whatsapp-notifications',
        loadComponent: () => import('./whatsapp-notifications/whatsapp-notifications.component').then(m => m.WhatsAppNotificationsComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent)
      }
    ]
  }
];
