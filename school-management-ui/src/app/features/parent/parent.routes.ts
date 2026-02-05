import { Routes } from '@angular/router';
import { LayoutComponent } from '../../shared/components/layout/layout.component';

export const PARENT_ROUTES: Routes = [
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
        path: 'invoices',
        loadComponent: () => import('../admin/invoices/invoices.component').then(m => m.InvoicesComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('../admin/profile/profile.component').then(m => m.ProfileComponent)
      }
    ]
  }
];
