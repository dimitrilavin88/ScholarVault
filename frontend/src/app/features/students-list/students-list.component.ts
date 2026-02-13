import { Component, OnInit, computed, signal, effect } from '@angular/core';
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
        <h1 class="page-title">Students</h1>
        <p class="page-desc">
          @if (selectedClass.selectedName()) {
            <strong>{{ selectedClass.selectedName() }}</strong> — select a student below.
          } @else {
            Select a student to view their profile and work samples. Choose a class in the sidebar to filter.
          }
        </p>
        <div class="search-wrap">
          <span class="search-icon" aria-hidden="true">🔍</span>
          <input
            type="search"
            class="search-input input-field"
            placeholder="Search by name or ID…"
            [value]="searchQuery()"
            (input)="searchQuery.set($any($event.target).value)"
            aria-label="Search students"
          />
        </div>
      </div>
      <div class="card content-card">
        @if (loading) {
          <div class="state-message">
            <span class="spinner"></span>
            <span>Loading students…</span>
          </div>
        } @else if (error) {
          <div class="state-message state-error">{{ error }}</div>
        } @else if (filteredStudents().length === 0) {
          <div class="state-message empty-state">
            <span class="empty-icon">👥</span>
            <p>{{ searchQuery() ? 'No students match your search.' : 'No students found.' }}</p>
          </div>
        } @else {
          <ul class="student-list">
            @for (s of filteredStudents(); track s.id) {
              <li class="animate-fade-in">
                <a [routerLink]="['/student', s.id]" class="student-card">
                  <span class="student-avatar">{{ s.firstName.charAt(0) }}{{ s.lastName.charAt(0) }}</span>
                  <div class="student-info">
                    <span class="student-name">{{ s.lastName }}, {{ s.firstName }}</span>
                    <span class="student-id">ID: {{ s.uniqueStudentIdentifier }}</span>
                  </div>
                  <span class="student-arrow" aria-hidden="true">→</span>
                </a>
              </li>
            }
          </ul>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 1.5rem; }
    .page-title { margin: 0 0 0.35rem; font-size: 1.5rem; font-weight: 700; color: var(--text); }
    .page-desc { margin: 0 0 1rem; font-size: 0.9375rem; color: var(--text-secondary); }
    .search-wrap {
      position: relative;
      max-width: 320px;
    }
    .search-icon { position: absolute; left: 0.875rem; top: 50%; transform: translateY(-50%); font-size: 1rem; pointer-events: none; }
    .search-input { padding-left: 2.5rem; }
    .content-card { overflow: hidden; }
    .state-message {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 2rem 1.5rem;
      color: var(--text-secondary);
      font-size: 0.9375rem;
    }
    .state-error { color: var(--error); }
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
    .student-list { list-style: none; padding: 0; margin: 0; }
    .student-list li { border-bottom: 1px solid var(--border); }
    .student-list li:last-child { border-bottom: none; }
    .student-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.25rem;
      color: var(--text);
      text-decoration: none;
      transition: background var(--duration-fast), transform var(--duration-fast);
    }
    .student-card:hover { background: var(--primary-subtle); transform: translateX(4px); }
    .student-avatar {
      flex-shrink: 0;
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--primary-hover);
      background: var(--primary-light);
      border-radius: var(--radius);
    }
    .student-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.15rem; }
    .student-name { font-weight: 600; font-size: 0.9375rem; }
    .student-id { font-size: 0.8125rem; color: var(--text-muted); }
    .student-arrow { font-size: 1.125rem; color: var(--text-muted); }
  `],
})
export class StudentsListComponent implements OnInit {
  students: Student[] = [];
  searchQuery = signal('');
  loading = true;
  error = '';

  filteredStudents = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return this.students;
    return this.students.filter(
      (s) =>
        s.firstName.toLowerCase().includes(q) ||
        s.lastName.toLowerCase().includes(q) ||
        s.uniqueStudentIdentifier.toLowerCase().includes(q)
    );
  });

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
    this.error = '';
    const classId = this.selectedClass.selectedClassroomId();
    const request = classId
      ? this.api.getClassroomStudents(classId)
      : this.api.getStudents();
    request.subscribe({
      next: (list) => {
        this.students = list;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load students';
        this.loading = false;
      },
    });
  }
}
