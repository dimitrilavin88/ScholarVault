import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService, Classroom, Student } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="page-container animate-fade-in">
      <nav class="breadcrumb">
        <a routerLink="/dashboard">Dashboard</a>
        <span class="breadcrumb-sep">/</span>
        <a routerLink="/classrooms">Classrooms</a>
        <span class="breadcrumb-sep">/</span>
        <span>{{ classroom()?.name }}</span>
      </nav>

      @if (loading && !classroom()) {
        <div class="state-message"><span class="spinner"></span> Loading…</div>
      } @else if (error) {
        <div class="state-message state-error">{{ error }}</div>
      } @else if (classroom()) {
        <div class="detail-header">
          <h1 class="page-title">{{ classroom()!.name }}</h1>
          <div class="header-actions">
            <button type="button" class="btn-secondary" (click)="showAddStudent.set(!showAddStudent())">
              {{ showAddStudent() ? 'Cancel' : 'Add student' }}
            </button>
          </div>
        </div>

        @if (showAddStudent()) {
          <div class="card add-student-card">
            <label for="add-student-select" class="label">Student to add</label>
            <select id="add-student-select" class="input-field" [(ngModel)]="studentToAddId" name="studentToAdd">
              <option value="">Select a student…</option>
              @for (s of availableStudents(); track s.id) {
                <option [value]="s.id">{{ s.lastName }}, {{ s.firstName }} ({{ s.uniqueStudentIdentifier }})</option>
              }
            </select>
            @if (availableStudents().length === 0 && !loadingAll) {
              <p class="hint">All your students are already in this class.</p>
            }
            <button type="button" class="btn-primary" style="margin-top: 0.75rem;"
              [disabled]="!studentToAddId || adding"
              (click)="addStudent()">
              {{ adding ? 'Adding…' : 'Add to class' }}
            </button>
            @if (addError) {
              <p class="message-error">{{ addError }}</p>
            }
          </div>
        }

        <div class="card roster-card">
          <h2 class="card-title">Roster</h2>
          @if (studentsLoading()) {
            <div class="state-message"><span class="spinner"></span> Loading roster…</div>
          } @else if (students().length === 0) {
            <div class="state-message empty-state">No students in this class yet. Add students above.</div>
          } @else {
            <ul class="roster-list">
              @for (s of students(); track s.id) {
                <li class="roster-item">
                  <a [routerLink]="['/student', s.id]" class="roster-link">
                    <span class="roster-avatar">{{ s.firstName.charAt(0) }}{{ s.lastName.charAt(0) }}</span>
                    <span class="roster-name">{{ s.lastName }}, {{ s.firstName }}</span>
                    <span class="roster-id">{{ s.uniqueStudentIdentifier }}</span>
                  </a>
                  <button type="button" class="btn-remove" (click)="removeStudent(s.id)" [disabled]="removing === s.id"
                    title="Remove from class">Remove</button>
                </li>
              }
            </ul>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .breadcrumb { margin-bottom: 1.25rem; font-size: 0.875rem; color: var(--text-muted); }
    .breadcrumb a { color: var(--primary); }
    .breadcrumb-sep { margin: 0 0.35rem; }
    .state-message { display: flex; align-items: center; gap: 0.75rem; padding: 2rem; color: var(--text-secondary); }
    .state-error { color: var(--error); }
    .spinner {
      width: 20px; height: 20px;
      border: 2px solid var(--border); border-top-color: var(--primary);
      border-radius: 50%; animation: spin 0.7s linear infinite;
    }
    .detail-header { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1.5rem; }
    .page-title { margin: 0; font-size: 1.5rem; font-weight: 700; color: var(--text); }
    .add-student-card { padding: 1.25rem; margin-bottom: 1.5rem; }
    .hint { font-size: 0.875rem; color: var(--text-muted); margin: 0.5rem 0 0; }
    .message-error { margin: 0.5rem 0 0; font-size: 0.875rem; color: var(--error); }
    .roster-card { padding: 1.25rem; }
    .card-title { margin: 0 0 1rem; font-size: 1.125rem; font-weight: 600; }
    .roster-list { list-style: none; padding: 0; margin: 0; }
    .roster-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 0; border-bottom: 1px solid var(--border); }
    .roster-item:last-child { border-bottom: none; }
    .roster-link {
      flex: 1; display: flex; align-items: center; gap: 0.75rem;
      color: var(--text); text-decoration: none; min-width: 0;
    }
    .roster-link:hover { color: var(--primary); }
    .roster-avatar {
      width: 36px; height: 36px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.75rem; font-weight: 600;
      color: var(--primary-hover); background: var(--primary-light);
      border-radius: var(--radius);
    }
    .roster-name { font-weight: 500; }
    .roster-id { font-size: 0.8125rem; color: var(--text-muted); margin-left: auto; }
    .btn-remove {
      padding: 0.35rem 0.65rem; font-size: 0.8125rem;
      color: var(--error); background: none; border: 1px solid var(--border);
      border-radius: var(--radius);
    }
    .btn-remove:hover:not(:disabled) { background: var(--error-bg); }
    .btn-remove:disabled { opacity: 0.6; cursor: not-allowed; }
    .empty-state { flex-direction: column; }
  `],
})
export class ClassroomDetailComponent implements OnInit {
  classroomId = '';
  classroom = signal<Classroom | null>(null);
  students = signal<Student[]>([]);
  studentsLoading = signal(true);
  allStudents = signal<Student[]>([]);
  loading = true;
  loadingAll = false;
  error = '';
  showAddStudent = signal(false);
  studentToAddId = '';
  adding = false;
  addError = '';
  removing: string | null = null;

  availableStudents = computed(() => {
    const enrolledIds = new Set(this.students().map((s) => s.id));
    return this.allStudents().filter((s) => !enrolledIds.has(s.id));
  });

  constructor(
    private route: ActivatedRoute,
    public auth: AuthService,
    private api: ApiService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Invalid classroom';
      this.loading = false;
      return;
    }
    this.classroomId = id;
    this.api.getClassroom(id).subscribe({
      next: (c) => {
        this.classroom.set(c);
        this.loading = false;
        this.loadRoster();
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Classroom not found';
        this.loading = false;
      },
    });
    this.loadingAll = true;
    this.api.getStudents().subscribe({
      next: (list) => {
        this.allStudents.set(list);
        this.loadingAll = false;
      },
      error: () => this.loadingAll = false,
    });
  }

  loadRoster(): void {
    this.studentsLoading.set(true);
    this.api.getClassroomStudents(this.classroomId).subscribe({
      next: (list) => {
        this.students.set(list);
        this.studentsLoading.set(false);
      },
      error: () => this.studentsLoading.set(false),
    });
  }

  addStudent(): void {
    if (!this.studentToAddId) return;
    this.addError = '';
    this.adding = true;
    this.api.addStudentToClassroom(this.classroomId, this.studentToAddId).subscribe({
      next: () => {
        this.adding = false;
        this.studentToAddId = '';
        this.showAddStudent.set(false);
        this.loadRoster();
      },
      error: (err) => {
        this.addError = err?.error?.message ?? 'Failed to add student';
        this.adding = false;
      },
    });
  }

  removeStudent(studentId: string): void {
    this.removing = studentId;
    this.api.removeStudentFromClassroom(this.classroomId, studentId).subscribe({
      next: () => {
        this.removing = null;
        this.loadRoster();
      },
      error: () => this.removing = null,
    });
  }
}
