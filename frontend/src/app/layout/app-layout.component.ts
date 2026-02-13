import { Component, signal, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { SelectedClassService } from '../core/services/selected-class.service';

@Component({
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-shell">
      <!-- Mobile menu toggle -->
      <button type="button" class="sidebar-toggle" (click)="sidebarOpen.set(!sidebarOpen())"
        aria-label="Toggle menu">
        <span class="hamburger"></span>
      </button>
      <!-- Overlay when sidebar open on mobile -->
      @if (sidebarOpen()) {
        <div class="sidebar-overlay" (click)="sidebarOpen.set(false)" aria-hidden="true"></div>
      }
      <!-- Sidebar -->
      <aside class="sidebar" [class.open]="sidebarOpen()">
        <a routerLink="/dashboard" class="logo" (click)="sidebarOpen.set(false)">
          <span class="logo-icon" aria-hidden="true">📚</span>
          <span class="logo-text">ScholarVault</span>
        </a>
        <!-- Class selector: affects Dashboard and Students when a class is selected -->
        <div class="class-selector-wrap">
          <label for="class-select" class="class-selector-label">Class</label>
          <select id="class-select" class="class-select input-field"
            [value]="selectedClass.selectedClassroomId() ?? ''"
            (change)="onClassChange($event)">
            <option value="">All classes</option>
            @for (c of selectedClass.classroomsList(); track c.id) {
              <option [value]="c.id">{{ c.name }}</option>
            }
          </select>
        </div>
        <nav class="sidebar-nav" aria-label="Main navigation">
          <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }"
            class="nav-item" (click)="sidebarOpen.set(false)">
            <span class="nav-icon" aria-hidden="true">🏠</span>
            <span class="nav-label">Dashboard</span>
          </a>
          <a routerLink="/students" routerLinkActive="active" class="nav-item" (click)="sidebarOpen.set(false)">
            <span class="nav-icon" aria-hidden="true">👥</span>
            <span class="nav-label">Students</span>
          </a>
          <a routerLink="/classrooms" routerLinkActive="active" class="nav-item" (click)="sidebarOpen.set(false)">
            <span class="nav-icon" aria-hidden="true">🏫</span>
            <span class="nav-label">Classrooms</span>
          </a>
          <a routerLink="/records" routerLinkActive="active" class="nav-item" (click)="sidebarOpen.set(false)">
            <span class="nav-icon" aria-hidden="true">📋</span>
            <span class="nav-label">Records</span>
          </a>
          <a routerLink="/transfer-request" routerLinkActive="active" class="nav-item" (click)="sidebarOpen.set(false)">
            <span class="nav-icon" aria-hidden="true">🔄</span>
            <span class="nav-label">Request transfer</span>
          </a>
          @if (auth.hasRole('district_admin')) {
            <a routerLink="/transfer-approvals" routerLinkActive="active" class="nav-item" (click)="sidebarOpen.set(false)">
              <span class="nav-icon" aria-hidden="true">✅</span>
              <span class="nav-label">Transfer approvals</span>
            </a>
          }
          <a routerLink="/settings" routerLinkActive="active" class="nav-item" (click)="sidebarOpen.set(false)">
            <span class="nav-icon" aria-hidden="true">⚙️</span>
            <span class="nav-label">Settings</span>
          </a>
        </nav>
        <div class="sidebar-footer">
          <div class="user-info">
            <span class="user-email" title="{{ auth.currentUser()?.email }}">{{ auth.currentUser()?.email }}</span>
            <span class="role-badge">{{ auth.currentUser()?.role }}</span>
          </div>
          <button type="button" class="btn-signout" (click)="auth.logout()">Sign out</button>
        </div>
      </aside>
      <main class="app-main">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-shell { display: flex; min-height: 100vh; }
    .sidebar-toggle {
      display: none;
      position: fixed;
      top: 1rem;
      left: 1rem;
      z-index: 1001;
      width: 44px;
      height: 44px;
      padding: 0;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
    }
    .sidebar-toggle .hamburger {
      display: block;
      width: 20px;
      height: 2px;
      margin: 0 auto;
      background: var(--text);
      box-shadow: 0 6px 0 var(--text), 0 12px 0 var(--text);
    }
    .sidebar-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.3);
      z-index: 999;
      animation: fadeIn 0.2s ease;
    }
    .sidebar {
      width: var(--sidebar-w);
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      background: var(--surface);
      border-right: 1px solid var(--border);
      box-shadow: var(--shadow-sm);
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1.25rem 1.5rem;
      color: var(--text);
      font-weight: 700;
      font-size: 1.125rem;
      text-decoration: none;
      border-bottom: 1px solid var(--border);
    }
    .logo:hover { color: var(--primary); }
    .logo-icon { font-size: 1.5rem; }
    .class-selector-wrap { padding: 1rem 1.5rem; border-bottom: 1px solid var(--border); }
    .class-selector-label { display: block; margin-bottom: 0.35rem; font-size: 0.75rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; }
    .class-select { width: 100%; padding: 0.5rem 0.75rem; font-size: 0.875rem; }
    .sidebar-nav { flex: 1; padding: 1rem 0.75rem; }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      margin-bottom: 0.25rem;
      color: var(--text-secondary);
      font-weight: 500;
      font-size: 0.9375rem;
      border-radius: var(--radius);
      transition: background var(--duration-fast), color var(--duration-fast);
    }
    .nav-item:hover { background: var(--primary-subtle); color: var(--primary-hover); }
    .nav-item.active { background: var(--primary-light); color: var(--primary-hover); }
    .nav-icon { font-size: 1.25rem; }
    .sidebar-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--border);
    }
    .user-info {
      margin-bottom: 0.75rem;
      min-width: 0;
    }
    .user-email {
      display: block;
      font-size: 0.8125rem;
      color: var(--text-muted);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .role-badge {
      display: inline-block;
      margin-top: 0.25rem;
      padding: 0.2rem 0.5rem;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: capitalize;
      color: var(--primary-hover);
      background: var(--primary-light);
      border-radius: 999px;
    }
    .btn-signout {
      width: 100%;
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-secondary);
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: var(--radius);
    }
    .btn-signout:hover { color: var(--text); background: var(--border); }
    .app-main { flex: 1; min-width: 0; }

    @media (max-width: 768px) {
      .sidebar-toggle { display: block; }
      .sidebar-overlay { display: block; }
      .sidebar {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        z-index: 1000;
        transform: translateX(-100%);
        transition: transform var(--duration-normal) var(--ease-out);
      }
      .sidebar.open { transform: translateX(0); }
      .app-main { margin-left: 0; }
    }
  `],
})
export class AppLayoutComponent implements OnInit {
  sidebarOpen = signal(false);
  constructor(
    public auth: AuthService,
    public selectedClass: SelectedClassService,
  ) {}

  ngOnInit(): void {
    this.selectedClass.loadClassrooms();
  }

  onClassChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value;
    this.selectedClass.setSelectedClassroomId(value || null);
  }
}
