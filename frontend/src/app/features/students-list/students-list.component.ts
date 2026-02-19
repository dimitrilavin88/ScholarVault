import { Component, OnInit, computed, signal, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService, Student, School, DistrictHomeroom } from '../../core/services/api.service';
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
          @if (auth.hasRole('district_admin')) {
            Browse by school, grade level, and teacher to view students in each class.
          } @else if (selectedClass.selectedName()) {
            <strong>{{ selectedClass.selectedName() }}</strong> — select a student below.
          } @else {
            Select a student to view their profile and work samples. Choose a class in the sidebar to filter.
          }
        </p>
        @if (!auth.hasRole('district_admin')) {
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
        }
      </div>

      @if (auth.hasRole('district_admin')) {
        <div class="district-browse">
          <div class="browse-column card">
            <h2 class="browse-title">Schools</h2>
            @if (schoolsLoading()) {
              <div class="state-message"><span class="spinner"></span> Loading…</div>
            } @else {
              <div class="school-buttons">
                @for (school of schools(); track school.id) {
                  <button
                    type="button"
                    class="school-btn"
                    [class.active]="selectedSchoolId() === school.id"
                    (click)="selectSchool(school.id)">
                    {{ school.name }}
                  </button>
                }
              </div>
            }
            @if (selectedSchoolId()) {
              <div class="browse-section">
                <h3 class="browse-subtitle">Grade level</h3>
                @if (gradesLoading()) {
                  <div class="state-message small"><span class="spinner"></span></div>
                } @else {
                  <select class="input-field browse-select" [value]="selectedGradeLevel() ?? ''" (change)="onGradeChange($event)">
                    <option value="">Select grade…</option>
                    @for (g of gradeLevels(); track g) {
                      <option [value]="g">Grade {{ g }}</option>
                    }
                  </select>
                }
              </div>
            }
            @if (selectedSchoolId() && selectedGradeLevel()) {
              <div class="browse-section">
                <h3 class="browse-subtitle">Teacher</h3>
                @if (homeroomsLoading()) {
                  <div class="state-message small"><span class="spinner"></span></div>
                } @else {
                  <select class="input-field browse-select" [value]="selectedHomeroomClassroomId() ?? ''" (change)="onTeacherChange($event)">
                    <option value="">Select teacher…</option>
                    @for (h of homerooms(); track h.classroom.id) {
                      <option [value]="h.classroom.id">{{ teacherDisplayName(h.teacher) }}</option>
                    }
                  </select>
                }
              </div>
            }
          </div>
          <div class="browse-content card">
            @if (!selectedSchoolId()) {
              <div class="state-message empty-state">
                <span class="empty-icon">🏫</span>
                <p>Select a school to see grade levels and teachers.</p>
              </div>
            } @else if (!selectedGradeLevel()) {
              <div class="state-message empty-state">
                <span class="empty-icon">📚</span>
                <p>Select a grade level.</p>
              </div>
            } @else if (!selectedHomeroomClassroomId()) {
              <div class="state-message empty-state">
                <span class="empty-icon">👨‍🏫</span>
                <p>Select a teacher to see their class roster.</p>
              </div>
            } @else if (loading) {
              <div class="state-message"><span class="spinner"></span> Loading students…</div>
            } @else if (error) {
              <div class="state-message state-error">{{ error }}</div>
            } @else if (filteredStudents().length === 0) {
              <div class="state-message empty-state">
                <span class="empty-icon">👥</span>
                <p>No students in this class.</p>
              </div>
            } @else {
              <h2 class="roster-title">Class roster</h2>
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

        <section class="pending-section card">
          <h2 class="pending-title">Pending class enrollment</h2>
          <p class="pending-desc">Students in your district who are not yet assigned to a class (e.g. after a transfer). Assign them to a classroom below.</p>
          @if (unenrolledLoading()) {
            <div class="state-message"><span class="spinner"></span> Loading…</div>
          } @else if (unenrolledStudents().length === 0) {
            <div class="state-message empty-state">
              <span class="empty-icon">✓</span>
              <p>No students pending class assignment.</p>
            </div>
          } @else {
            <ul class="pending-list">
              @for (s of unenrolledStudents(); track s.id) {
                <li class="pending-item">
                  <a [routerLink]="['/student', s.id]" class="pending-student-link">
                    <span class="pending-avatar">{{ (s.firstName ?? '').charAt(0) }}{{ (s.lastName ?? '').charAt(0) }}</span>
                    <div class="pending-info">
                      <span class="pending-name">{{ s.lastName }}, {{ s.firstName }}</span>
                      <span class="pending-meta">ID: {{ s.uniqueStudentIdentifier }} · DOB: {{ s.dob }}</span>
                    </div>
                  </a>
                  @if (assigningStudentId() === s.id) {
                    <div class="assign-form">
                      @if (assignError()) {
                        <span class="assign-error">{{ assignError() }}</span>
                      }
                      <select class="input-field assign-select" [value]="assignSchoolId() ?? ''" (change)="onAssignSchoolChange($event)">
                        <option value="">Select school…</option>
                        @for (sch of schools(); track sch.id) {
                          <option [value]="sch.id">{{ sch.name }}</option>
                        }
                      </select>
                      @if (assignSchoolId()) {
                        <select class="input-field assign-select" [value]="assignGradeLevel() ?? ''" (change)="onAssignGradeChange($event)">
                          <option value="">Select grade…</option>
                          @for (g of assignGradeLevels(); track g) {
                            <option [value]="g">Grade {{ g }}</option>
                          }
                        </select>
                      }
                      @if (assignSchoolId() && assignGradeLevel()) {
                        <select class="input-field assign-select" [value]="assignClassroomId() ?? ''" (change)="onAssignClassroomChange($event)">
                          <option value="">Select teacher…</option>
                          @for (h of assignHomerooms(); track h.classroom.id) {
                            <option [value]="h.classroom.id">{{ teacherDisplayName(h.teacher) }}</option>
                          }
                        </select>
                      }
                      @if (assignClassroomId()) {
                        <button type="button" class="btn-primary assign-btn" (click)="confirmAssign()" [disabled]="assigning()">Assign</button>
                      }
                      <button type="button" class="btn-secondary assign-btn" (click)="cancelAssign()">Cancel</button>
                    </div>
                  } @else {
                    <button type="button" class="btn-secondary btn-sm" (click)="startAssign(s.id)">Assign to class</button>
                  }
                </li>
              }
            </ul>
          }
        </section>
      } @else {
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
      }
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
    .district-browse { display: flex; gap: 1.5rem; flex-wrap: wrap; }
    .pending-section { margin-top: 2rem; padding: 1.5rem; }
    .pending-title { margin: 0 0 0.35rem; font-size: 1.125rem; font-weight: 600; color: var(--text); }
    .pending-desc { margin: 0 0 1rem; font-size: 0.875rem; color: var(--text-secondary); }
    .pending-list { list-style: none; padding: 0; margin: 0; }
    .pending-item { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem 1rem; padding: 0.75rem 0; border-bottom: 1px solid var(--border); }
    .pending-item:last-child { border-bottom: none; }
    .pending-student-link { display: flex; align-items: center; gap: 0.75rem; flex: 1; min-width: 0; text-decoration: none; color: var(--text); }
    .pending-student-link:hover { color: var(--primary); }
    .pending-avatar { width: 2.25rem; height: 2.25rem; border-radius: 50%; background: var(--bg); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600; flex-shrink: 0; }
    .pending-info { display: flex; flex-direction: column; gap: 0.15rem; min-width: 0; }
    .pending-name { font-weight: 500; }
    .pending-meta { font-size: 0.8125rem; color: var(--text-muted); }
    .assign-form { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; }
    .assign-select { min-width: 140px; }
    .assign-btn { flex-shrink: 0; }
    .btn-sm { padding: 0.35rem 0.75rem; font-size: 0.8125rem; }
    .assign-error { font-size: 0.875rem; color: var(--error); width: 100%; }
    .browse-column { flex: 0 0 260px; padding: 1.25rem; }
    .browse-title { margin: 0 0 1rem; font-size: 1rem; font-weight: 600; color: var(--text); }
    .browse-subtitle { margin: 0.75rem 0 0.35rem; font-size: 0.8125rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; }
    .browse-section { margin-top: 1rem; }
    .browse-select { width: 100%; margin-top: 0.25rem; }
    .school-buttons { display: flex; flex-direction: column; gap: 0.5rem; }
    .school-btn {
      width: 100%; padding: 0.6rem 0.75rem; text-align: left; font-size: 0.9375rem; font-weight: 500;
      background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius);
      color: var(--text); cursor: pointer; transition: background var(--duration-fast), border-color var(--duration-fast);
    }
    .school-btn:hover { background: var(--primary-subtle); border-color: var(--primary-light); }
    .school-btn.active { background: var(--primary-light); border-color: var(--primary); color: var(--primary-hover); }
    .browse-content { flex: 1; min-width: 280px; padding: 1.25rem; }
    .roster-title { margin: 0 0 1rem; font-size: 1.0625rem; font-weight: 600; color: var(--text); }
    .state-message.small { padding: 0.5rem 0; }
  `],
})
export class StudentsListComponent implements OnInit {
  students: Student[] = [];
  searchQuery = signal('');
  loading = true;
  error = '';

  schools = signal<School[]>([]);
  schoolsLoading = signal(false);
  selectedSchoolId = signal<string | null>(null);
  gradeLevels = signal<string[]>([]);
  gradesLoading = signal(false);
  selectedGradeLevel = signal<string | null>(null);
  homerooms = signal<DistrictHomeroom[]>([]);
  homeroomsLoading = signal(false);
  selectedHomeroom = signal<DistrictHomeroom | null>(null);

  selectedHomeroomClassroomId = computed(() => this.selectedHomeroom()?.classroom.id ?? null);

  unenrolledStudents = signal<Student[]>([]);
  unenrolledLoading = signal(false);
  assigningStudentId = signal<string | null>(null);
  assignSchoolId = signal<string | null>(null);
  assignGradeLevel = signal<string | null>(null);
  assignClassroomId = signal<string | null>(null);
  assignGradeLevels = signal<string[]>([]);
  assignHomerooms = signal<DistrictHomeroom[]>([]);
  assigning = signal(false);
  assignError = signal<string | null>(null);

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
      if (!this.auth.hasRole('district_admin')) {
        this.selectedClass.selectedClassroomId();
        this.loadStudents();
      }
    });
  }

  ngOnInit(): void {
    if (this.auth.hasRole('district_admin')) {
      this.loadSchools();
      this.loadUnenrolledStudents();
    }
  }

  teacherDisplayName(teacher: { firstName?: string | null; lastName?: string | null; email: string }): string {
    const first = teacher.firstName?.trim();
    const last = teacher.lastName?.trim();
    if (first && last) return `${first} ${last}`;
    if (first) return first;
    if (last) return last;
    return teacher.email;
  }

  loadSchools(): void {
    this.schoolsLoading.set(true);
    this.api.getMyDistrictSchools().subscribe({
      next: (list) => {
        this.schools.set(list);
        this.schoolsLoading.set(false);
      },
      error: () => this.schoolsLoading.set(false),
    });
  }

  selectSchool(schoolId: string): void {
    this.selectedSchoolId.set(schoolId);
    this.selectedGradeLevel.set(null);
    this.selectedHomeroom.set(null);
    this.gradeLevels.set([]);
    this.homerooms.set([]);
    this.gradesLoading.set(true);
    this.api.getDistrictGradeLevels(schoolId).subscribe({
      next: (list) => {
        this.gradeLevels.set(list);
        this.gradesLoading.set(false);
      },
      error: () => this.gradesLoading.set(false),
    });
  }

  onGradeChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedGradeLevel.set(value || null);
    this.selectedHomeroom.set(null);
    this.homerooms.set([]);
    const schoolId = this.selectedSchoolId();
    if (!schoolId || !value) return;
    this.homeroomsLoading.set(true);
    this.api.getDistrictHomerooms(schoolId, value).subscribe({
      next: (list) => {
        this.homerooms.set(list);
        this.homeroomsLoading.set(false);
      },
      error: () => this.homeroomsLoading.set(false),
    });
  }

  onTeacherChange(event: Event): void {
    const classroomId = (event.target as HTMLSelectElement).value;
    if (!classroomId) {
      this.selectedHomeroom.set(null);
      this.students = [];
      return;
    }
    const h = this.homerooms().find((x) => x.classroom.id === classroomId) ?? null;
    this.selectedHomeroom.set(h);
    this.loadStudentsForClassroom(classroomId);
  }

  loadStudentsForClassroom(classroomId: string): void {
    this.loading = true;
    this.error = '';
    this.api.getClassroomStudents(classroomId).subscribe({
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

  loadUnenrolledStudents(): void {
    this.unenrolledLoading.set(true);
    this.api.getUnenrolledStudents().subscribe({
      next: (list) => {
        this.unenrolledStudents.set(list);
        this.unenrolledLoading.set(false);
      },
      error: () => this.unenrolledLoading.set(false),
    });
  }

  startAssign(studentId: string): void {
    this.assigningStudentId.set(studentId);
    this.assignSchoolId.set(null);
    this.assignGradeLevel.set(null);
    this.assignClassroomId.set(null);
    this.assignGradeLevels.set([]);
    this.assignHomerooms.set([]);
    this.assignError.set(null);
  }

  cancelAssign(): void {
    this.assigningStudentId.set(null);
    this.assignSchoolId.set(null);
    this.assignGradeLevel.set(null);
    this.assignClassroomId.set(null);
    this.assignError.set(null);
  }

  onAssignSchoolChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value || null;
    this.assignSchoolId.set(value);
    this.assignGradeLevel.set(null);
    this.assignClassroomId.set(null);
    this.assignHomerooms.set([]);
    if (!value) {
      this.assignGradeLevels.set([]);
      return;
    }
    this.api.getDistrictGradeLevels(value).subscribe({
      next: (list) => this.assignGradeLevels.set(list),
      error: () => this.assignGradeLevels.set([]),
    });
  }

  onAssignGradeChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value || null;
    this.assignGradeLevel.set(value);
    this.assignClassroomId.set(null);
    const schoolId = this.assignSchoolId();
    if (!schoolId || !value) {
      this.assignHomerooms.set([]);
      return;
    }
    this.api.getDistrictHomerooms(schoolId, value).subscribe({
      next: (list) => this.assignHomerooms.set(list),
      error: () => this.assignHomerooms.set([]),
    });
  }

  onAssignClassroomChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value || null;
    this.assignClassroomId.set(value);
  }

  confirmAssign(): void {
    const studentId = this.assigningStudentId();
    const classroomId = this.assignClassroomId();
    if (!studentId || !classroomId) return;
    this.assigning.set(true);
    this.api.addStudentToClassroom(classroomId, studentId).subscribe({
      next: () => {
        this.assigning.set(false);
        this.assignError.set(null);
        this.cancelAssign();
        this.loadUnenrolledStudents();
      },
      error: (err) => {
        this.assigning.set(false);
        this.assignError.set(err?.error?.message ?? 'Failed to assign student to class');
      },
    });
  }

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
