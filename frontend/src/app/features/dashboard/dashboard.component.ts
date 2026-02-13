import { Component, OnInit, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService, Student } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { SelectedClassService } from '../../core/services/selected-class.service';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page-container animate-fade-in">
      <div class="page-header">
        <h1 class="page-title">Welcome back!</h1>
        <p class="page-desc">
          @if (selectedClass.selectedName()) {
            Showing <strong>{{ selectedClass.selectedName() }}</strong>
          } @else {
            Here’s an overview of your classroom activity. Select a class in the sidebar to filter.
          }
        </p>
      </div>

      <!-- Overview cards -->
      <div class="stats-grid">
        <div class="stat-card card">
          <span class="stat-icon" aria-hidden="true">👥</span>
          <div class="stat-content">
            <span class="stat-value">{{ studentCount }}</span>
            <span class="stat-label">Students</span>
          </div>
        </div>
        <div class="stat-card card">
          <span class="stat-icon" aria-hidden="true">📤</span>
          <div class="stat-content">
            <span class="stat-value">{{ recentUploads }}</span>
            <span class="stat-label">Recent uploads</span>
          </div>
        </div>
        <div class="stat-card card">
          <span class="stat-icon" aria-hidden="true">✅</span>
          <div class="stat-content">
            <span class="stat-value">{{ studentCount }}</span>
            <span class="stat-label">Active records</span>
          </div>
        </div>
      </div>

      <!-- Quick actions -->
      <section class="section">
        <h2 class="section-title">Quick actions</h2>
        <div class="quick-actions">
          <a routerLink="/students" class="action-card card">
            <span class="action-icon">👥</span>
            <span class="action-label">View students</span>
            <span class="action-hint">Browse and search your class</span>
          </a>
          <a routerLink="/records" class="action-card card">
            <span class="action-icon">📋</span>
            <span class="action-label">View all records</span>
            <span class="action-hint">Filter and sort work samples</span>
          </a>
        </div>
      </section>

      <!-- Recent activity placeholder -->
      <section class="section">
        <h2 class="section-title">Recent activity</h2>
        <div class="card activity-card">
          @if (loading) {
            <div class="state-message"><span class="spinner"></span> Loading…</div>
          } @else if (students.length === 0) {
            <div class="state-message empty-state">
              <span class="empty-icon">📚</span>
              <p>No students yet. Add students to see activity here.</p>
            </div>
          } @else {
            <ul class="recent-list">
              @for (s of students.slice(0, 5); track s.id) {
                <li>
                  <a [routerLink]="['/student', s.id]" class="recent-item">
                    <span class="recent-avatar">{{ s.firstName.charAt(0) }}{{ s.lastName.charAt(0) }}</span>
                    <span class="recent-name">{{ s.firstName }} {{ s.lastName }}</span>
                    <span class="recent-link">View profile →</span>
                  </a>
                </li>
              }
            </ul>
            @if (students.length > 5) {
              <a routerLink="/students" class="view-all">View all students</a>
            }
          }
        </div>
      </section>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 1.75rem; }
    .page-title { margin: 0 0 0.35rem; font-size: 1.5rem; font-weight: 700; color: var(--text); }
    .page-desc { margin: 0; font-size: 0.9375rem; color: var(--text-secondary); }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .stat-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
      transition: transform var(--duration-fast);
    }
    .stat-card:hover { transform: translateY(-2px); }
    .stat-icon { font-size: 2rem; }
    .stat-content { display: flex; flex-direction: column; gap: 0.15rem; }
    .stat-value { font-size: 1.5rem; font-weight: 700; color: var(--text); }
    .stat-label { font-size: 0.8125rem; color: var(--text-muted); }
    .section { margin-bottom: 2rem; }
    .section-title { margin: 0 0 1rem; font-size: 1.125rem; font-weight: 600; color: var(--text); }
    .quick-actions { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }
    .action-card {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding: 1.25rem;
      text-decoration: none;
      color: var(--text);
      transition: transform var(--duration-fast), box-shadow var(--duration-normal);
    }
    .action-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
    .action-icon { font-size: 1.75rem; }
    .action-label { font-weight: 600; font-size: 0.9375rem; }
    .action-hint { font-size: 0.8125rem; color: var(--text-muted); }
    .activity-card { padding: 1rem; }
    .state-message {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 2rem;
      color: var(--text-secondary);
      font-size: 0.9375rem;
    }
    .empty-state { flex-direction: column; gap: 0.5rem; }
    .empty-icon { font-size: 2rem; opacity: 0.7; }
    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid var(--border);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    .recent-list { list-style: none; padding: 0; margin: 0; }
    .recent-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 0;
      text-decoration: none;
      color: var(--text);
      border-bottom: 1px solid var(--border);
      transition: background var(--duration-fast);
    }
    .recent-item:last-child { border-bottom: none; }
    .recent-item:hover { background: var(--primary-subtle); }
    .recent-avatar {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--primary-hover);
      background: var(--primary-light);
      border-radius: var(--radius);
    }
    .recent-name { flex: 1; font-weight: 500; }
    .recent-link { font-size: 0.875rem; color: var(--primary); }
    .view-all {
      display: block;
      padding: 0.75rem;
      text-align: center;
      font-weight: 500;
      font-size: 0.9375rem;
      color: var(--primary);
    }
    .view-all:hover { background: var(--primary-subtle); }
  `],
})
export class DashboardComponent implements OnInit {
  students: Student[] = [];
  loading = true;

  get studentCount(): number {
    return this.students.length;
  }

  get recentUploads(): number {
    return this.students.length;
  }

  constructor(
    public auth: AuthService,
    private api: ApiService,
    public selectedClass: SelectedClassService,
  ) {
    effect(() => {
      this.selectedClass.selectedClassroomId();
      this.loadStudents();
    });
  }

  ngOnInit(): void {}

  loadStudents(): void {
    this.loading = true;
    const classId = this.selectedClass.selectedClassroomId();
    const request = classId
      ? this.api.getClassroomStudents(classId)
      : this.api.getStudents();
    request.subscribe({
      next: (list) => {
        this.students = list;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}
