import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { districtAdminGuard } from './core/guards/district-admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent) },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/app-layout.component').then(m => m.AppLayoutComponent),
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'students', loadComponent: () => import('./features/students-list/students-list.component').then(m => m.StudentsListComponent) },
      { path: 'classrooms', loadComponent: () => import('./features/classrooms/classrooms.component').then(m => m.ClassroomsComponent) },
      { path: 'classrooms/:id', loadComponent: () => import('./features/classroom-detail/classroom-detail.component').then(m => m.ClassroomDetailComponent) },
      { path: 'records', loadComponent: () => import('./features/records/records.component').then(m => m.RecordsComponent) },
      { path: 'transfer-request', loadComponent: () => import('./features/transfer-request/transfer-request.component').then(m => m.TransferRequestComponent) },
      { path: 'transfer-approvals', loadComponent: () => import('./features/transfer-approval/transfer-approval.component').then(m => m.TransferApprovalComponent), canActivate: [districtAdminGuard] },
      { path: 'settings', loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent) },
      { path: 'student/:id', loadComponent: () => import('./features/student-profile/student-profile.component').then(m => m.StudentProfileComponent) },
      { path: 'student/:id/upload', loadComponent: () => import('./features/upload-work/upload-work.component').then(m => m.UploadWorkComponent) },
      { path: 'student/:id/records', loadComponent: () => import('./features/historical-records/historical-records.component').then(m => m.HistoricalRecordsComponent) },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
