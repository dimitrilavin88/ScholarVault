import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ApiService, Student, Record, Classroom } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { FormsModule } from '@angular/forms';

const EXT_TO_MIME: { [key: string]: string } = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  bmp: 'image/bmp',
  svg: 'image/svg+xml',
};

function detectPreviewType(blob: Blob, fileUrl: string): 'pdf' | 'image' | 'other' {
  const mime = (blob.type || '').toLowerCase();
  if (mime === 'application/pdf') return 'pdf';
  if (mime.startsWith('image/')) return 'image';
  const ext = (fileUrl.split('.').pop() || '').toLowerCase();
  if (ext === 'pdf') return 'pdf';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) return 'image';
  return 'other';
}

function ensureBlobType(blob: Blob, fileUrl: string, type: 'pdf' | 'image' | 'other'): Blob {
  if (blob.type) return blob;
  if (type === 'other') return blob;
  const ext = (fileUrl.split('.').pop() || '').toLowerCase();
  const mime = EXT_TO_MIME[ext] || (type === 'pdf' ? 'application/pdf' : 'image/jpeg');
  return new Blob([blob], { type: mime });
}

@Component({
  standalone: true,
  imports: [RouterLink, DatePipe, FormsModule],
  template: `
    <div class="page-container animate-fade-in">
      @if (loading && !student) {
        <div class="state-message"><span class="spinner"></span> Loading…</div>
      } @else if (error) {
        <div class="state-message state-error">{{ error }}</div>
      } @else if (student) {
        <nav class="breadcrumb">
          @if (auth.hasRole('district_admin')) {
            <a routerLink="/district">District</a>
          } @else {
            <a routerLink="/dashboard">Dashboard</a>
          }
          <span class="breadcrumb-sep">/</span>
          <a routerLink="/students">Students</a>
          <span class="breadcrumb-sep">/</span>
          <span>{{ student.firstName }} {{ student.lastName }}</span>
        </nav>
        <div class="profile-layout">
          <div class="card profile-card">
            <div class="profile-header">
              <span class="profile-avatar">{{ student.firstName.charAt(0) }}{{ student.lastName.charAt(0) }}</span>
              <h1 class="profile-name">{{ student.firstName }} {{ student.lastName }}</h1>
              <span class="profile-id">ID: {{ student.uniqueStudentIdentifier }}</span>
            </div>
            @if (auth.hasRole('district_admin') && editingStudent()) {
              <form class="edit-form" (ngSubmit)="saveStudent()">
                <div class="form-row">
                  <label for="edit-firstName">First name</label>
                  <input id="edit-firstName" class="input-field" [(ngModel)]="editForm.firstName" name="firstName" required />
                </div>
                <div class="form-row">
                  <label for="edit-lastName">Last name</label>
                  <input id="edit-lastName" class="input-field" [(ngModel)]="editForm.lastName" name="lastName" required />
                </div>
                <div class="form-row">
                  <label for="edit-dob">Date of birth</label>
                  <input id="edit-dob" class="input-field" type="date" [(ngModel)]="editForm.dob" name="dob" required />
                </div>
                <div class="form-row">
                  <label for="edit-identifier">Student ID</label>
                  <input id="edit-identifier" class="input-field" [(ngModel)]="editForm.uniqueStudentIdentifier" name="uniqueStudentIdentifier" required />
                </div>
                <div class="form-actions">
                  <button type="submit" class="btn-primary" [disabled]="savingStudent()">Save</button>
                  <button type="button" class="btn-secondary" (click)="cancelEdit()">Cancel</button>
                </div>
              </form>
            } @else {
              <dl class="details-list">
                <div class="detail-row">
                  <dt>Date of birth</dt>
                  <dd>{{ student.dob }}</dd>
                </div>
                @if (student.district) {
                  <div class="detail-row">
                    <dt>District</dt>
                    <dd>{{ student.district.name }}</dd>
                  </div>
                }
                @if (student.parents?.length) {
                  <div class="detail-row">
                    <dt>Parent contact</dt>
                    <dd>
                      @for (p of student.parents; track p.id) {
                        <span>{{ p.email }}</span>
                        @if (!$last) { <span>, </span> }
                      }
                    </dd>
                  </div>
                }
              </dl>
              <div class="action-row">
                @if (auth.hasRole('district_admin')) {
                  <button type="button" class="btn-primary" (click)="startEditStudent()">✏️ Edit student</button>
                  <a [routerLink]="['/student', student.id, 'records']" class="btn-secondary">View all records</a>
                } @else {
                  <a [routerLink]="['/student', student.id, 'upload']" class="btn-primary">📤 Upload work sample</a>
                  <a [routerLink]="['/student', student.id, 'records']" class="btn-secondary">View all records</a>
                }
              </div>
            }

            @if (auth.hasRole('district_admin')) {
              <section class="placement-section">
                <h2 class="section-title">Placement</h2>
                @if (placementLoading()) {
                  <div class="state-message"><span class="spinner"></span> Loading placement…</div>
                } @else {
                  <ul class="placement-list">
                    @for (c of studentClassrooms(); track c.id) {
                      <li class="placement-item">
                        <span class="placement-name">{{ c.name }}{{ c.school ? ' — ' + c.school.name : '' }}</span>
                        <button type="button" class="btn-remove" (click)="removeFromClassroom(c.id)" [disabled]="placementActionLoading()">Remove</button>
                      </li>
                    }
                  </ul>
                  @if (studentClassrooms().length === 0) {
                    <p class="placement-empty">Not enrolled in any class.</p>
                  }
                  <div class="placement-add">
                    <select class="input-field placement-select" [value]="addClassroomId()" (change)="onAddClassroomChange($event)">
                      <option value="">Add to class…</option>
                      @for (c of availableClassrooms(); track c.id) {
                        <option [value]="c.id">{{ c.name }}{{ c.school ? ' — ' + c.school.name : '' }}</option>
                      }
                    </select>
                    <button type="button" class="btn-primary" (click)="addToClassroom()" [disabled]="!addClassroomId() || placementActionLoading()">Add</button>
                  </div>
                }
              </section>
            }
          </div>

          <!-- Work samples: Grade → Subject → samples -->
          <section class="timeline-section">
            <h2 class="section-title">Work samples</h2>
            @if (recordsLoading()) {
              <div class="state-message"><span class="spinner"></span> Loading records…</div>
            } @else if (records().length === 0) {
              <div class="empty-timeline card">
                <span class="empty-icon">📄</span>
                <p>No work samples yet.</p>
                <a [routerLink]="['/student', student.id, 'upload']" class="btn-primary">Upload first sample</a>
              </div>
            } @else {
              <div class="samples-nav card">
                <div class="nav-row">
                  <label for="grade-select" class="nav-label">Grade level</label>
                  <select id="grade-select" class="input-field nav-select"
                    [value]="selectedGrade() ?? ''"
                    (change)="onGradeChange($event)">
                    <option value="">Select grade…</option>
                    @for (g of gradeLevels(); track g) {
                      <option [value]="g">{{ g }}</option>
                    }
                  </select>
                </div>
                @if (selectedGrade()) {
                  <div class="nav-row">
                    <label for="subject-select" class="nav-label">Subject</label>
                    <select id="subject-select" class="input-field nav-select"
                      [value]="selectedSubject() ?? ''"
                      (change)="onSubjectChange($event)">
                      <option value="">Select subject…</option>
                      @for (s of subjectsInGrade(); track s) {
                        <option [value]="s">{{ s }}</option>
                      }
                    </select>
                  </div>
                }
              </div>
              @if (selectedGrade() && selectedSubject()) {
                <p class="samples-count">{{ filteredRecords().length }} sample{{ filteredRecords().length === 1 ? '' : 's' }} in {{ selectedSubject() }}</p>
                <div class="timeline">
                  @for (r of filteredRecords(); track r.id) {
                    <div class="timeline-item">
                      <div class="timeline-marker" aria-hidden="true"></div>
                      <div class="timeline-card card">
                        <button type="button" class="timeline-card-head"
                          (click)="toggleExpanded(r.id)"
                          [attr.aria-expanded]="expandedId() === r.id">
                          <span class="timeline-grade">{{ r.subject }}</span>
                          <span class="timeline-date">{{ r.createdAt | date:'mediumDate' }}</span>
                          <span class="timeline-chevron">{{ expandedId() === r.id ? '▼' : '▶' }}</span>
                        </button>
                        @if (expandedId() === r.id) {
                          <div class="timeline-card-body">
                            @if (r.notes) {
                              <p class="timeline-notes">{{ r.notes }}</p>
                            }
                            <div class="record-actions">
                              <button type="button" class="record-action" (click)="previewFile(r)">
                                👁 Quick view
                              </button>
                              <button type="button" class="record-action" (click)="downloadFile(r)">
                                📥 Download file
                              </button>
                            </div>
                            @if (previewRecordId() === r.id) {
                              <div class="preview-toolbar">
                                <button type="button" class="record-action" (click)="closePreview()">✕ Close preview</button>
                              </div>
                              @if (previewLoading()) {
                                <div class="preview-placeholder"><span class="spinner"></span> Loading preview…</div>
                              } @else if (previewError()) {
                                <div class="preview-placeholder preview-error">{{ previewError() }}</div>
                              } @else if (previewUrl() && previewType() === 'pdf') {
                                <div class="preview-container">
                                  <iframe [src]="previewSafeUrl()" class="preview-iframe" title="Document preview"></iframe>
                                </div>
                              } @else if (previewUrl() && previewType() === 'image') {
                                <div class="preview-container">
                                  <img [src]="previewUrl()" alt="Document preview" class="preview-image" />
                                </div>
                              } @else if (previewUrl() && previewType() === 'other') {
                                <div class="preview-placeholder">Preview not available for this file type. Use Download to open it.</div>
                              }
                            }
                          </div>
                        }
                      </div>
                    </div>
                  }
                </div>
              } @else if (selectedGrade()) {
                <p class="samples-hint">Select a subject to view work samples for this grade.</p>
              } @else {
                <p class="samples-hint">Select a grade level, then a subject, to view work samples.</p>
              }
            }
          </section>
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
    .profile-layout { max-width: 720px; display: flex; flex-direction: column; gap: 1.5rem; }
    .profile-card { padding: 1.75rem; }
    .profile-header { text-align: center; margin-bottom: 1.5rem; }
    .profile-avatar {
      display: inline-flex; align-items: center; justify-content: center;
      width: 72px; height: 72px; font-size: 1.5rem; font-weight: 700;
      color: var(--primary-hover); background: var(--primary-light);
      border-radius: 50%; margin-bottom: 1rem;
    }
    .profile-name { margin: 0 0 0.25rem; font-size: 1.375rem; font-weight: 700; color: var(--text); }
    .profile-id { font-size: 0.875rem; color: var(--text-muted); }
    .details-list { margin: 0 0 1.5rem; padding: 0; }
    .detail-row {
      display: flex; flex-wrap: wrap; gap: 0.35rem 1rem;
      padding: 0.75rem 0; border-bottom: 1px solid var(--border);
    }
    .detail-row:last-child { border-bottom: none; }
    .detail-row dt { margin: 0; font-size: 0.875rem; font-weight: 500; color: var(--text-muted); min-width: 120px; }
    .detail-row dd { margin: 0; font-size: 0.9375rem; color: var(--text); }
    .action-row { display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .action-row .btn-secondary { text-decoration: none; }
    .timeline-section { }
    .section-title { margin: 0 0 1rem; font-size: 1.125rem; font-weight: 600; color: var(--text); }
    .samples-nav { padding: 1.25rem; margin-bottom: 1rem; }
    .nav-row { margin-bottom: 0.75rem; }
    .nav-row:last-child { margin-bottom: 0; }
    .nav-label { display: block; margin-bottom: 0.35rem; font-size: 0.875rem; font-weight: 600; color: var(--text); }
    .nav-select { max-width: 280px; }
    .samples-count { font-size: 0.9375rem; color: var(--text-muted); margin: 0 0 0.75rem; }
    .samples-hint { font-size: 0.9375rem; color: var(--text-muted); margin: 0; }
    .empty-timeline {
      padding: 2rem; text-align: center;
      display: flex; flex-direction: column; align-items: center; gap: 0.75rem;
    }
    .empty-icon { font-size: 2.5rem; opacity: 0.7; }
    .timeline { position: relative; padding-left: 1.5rem; border-left: 3px solid var(--primary-light); margin-left: 0.5rem; }
    .timeline-item { position: relative; margin-bottom: 1rem; }
    .timeline-marker {
      position: absolute; left: -1.5rem; top: 1.25rem;
      width: 12px; height: 12px; background: var(--primary); border-radius: 50%;
      transform: translateX(-50%);
    }
    .timeline-card { overflow: hidden; }
    .timeline-card-head {
      width: 100%; display: flex; align-items: center; gap: 0.75rem; padding: 1rem 1.25rem;
      background: none; border: none; font: inherit; text-align: left; cursor: pointer;
      color: var(--text); transition: background var(--duration-fast);
    }
    .timeline-card-head:hover { background: var(--bg); }
    .timeline-grade { font-weight: 600; flex: 1; }
    .timeline-date { font-size: 0.875rem; color: var(--text-muted); }
    .timeline-chevron { font-size: 0.75rem; color: var(--text-muted); }
    .timeline-card-body { padding: 0 1.25rem 1rem; border-top: 1px solid var(--border); }
    .timeline-notes { margin: 0.75rem 0 0.5rem; font-size: 0.9375rem; color: var(--text-secondary); line-height: 1.5; }
    .record-actions { display: flex; gap: 1rem; margin-top: 0.5rem; flex-wrap: wrap; }
    .record-action {
      padding: 0.4rem 0; font-size: 0.875rem; font-weight: 500;
      color: var(--primary); background: none; border: none; cursor: pointer;
    }
    .record-action:hover { text-decoration: underline; }
    .preview-toolbar { margin-top: 0.75rem; }
    .preview-placeholder {
      margin-top: 1rem; padding: 1.5rem; text-align: center;
      font-size: 0.9375rem; color: var(--text-muted);
      background: var(--bg); border-radius: var(--radius);
      display: flex; align-items: center; justify-content: center; gap: 0.5rem;
    }
    .preview-error { color: var(--error); }
    .preview-container {
      margin-top: 1rem; border: 1px solid var(--border); border-radius: var(--radius);
      overflow: hidden; background: var(--bg);
      max-height: min(70vh, 520px); min-height: 200px;
    }
    .preview-iframe { width: 100%; height: 100%; min-height: 360px; border: none; display: block; }
    .preview-image { max-width: 100%; height: auto; max-height: min(70vh, 520px); display: block; margin: 0 auto; }
    .edit-form { margin: 1rem 0; padding: 1rem 0; border-top: 1px solid var(--border); }
    .form-row { margin-bottom: 0.75rem; }
    .form-row label { display: block; margin-bottom: 0.35rem; font-size: 0.875rem; font-weight: 600; color: var(--text); }
    .form-actions { display: flex; gap: 0.75rem; margin-top: 1rem; }
    .placement-section { margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border); }
    .placement-list { list-style: none; padding: 0; margin: 0 0 1rem; }
    .placement-item { display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border); }
    .placement-name { font-size: 0.9375rem; }
    .btn-remove { font-size: 0.875rem; color: var(--error); background: none; border: none; cursor: pointer; padding: 0.25rem 0; }
    .btn-remove:hover:not(:disabled) { text-decoration: underline; }
    .placement-empty { font-size: 0.9375rem; color: var(--text-muted); margin: 0 0 1rem; }
    .placement-add { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; }
    .placement-select { min-width: 200px; flex: 1; }
  `],
})
export class StudentProfileComponent implements OnInit, OnDestroy {
  student: Student | null = null;
  records = signal<Record[]>([]);
  recordsLoading = signal(true);
  expandedId = signal<string | null>(null);
  selectedGrade = signal<string | null>(null);
  selectedSubject = signal<string | null>(null);
  loading = true;
  error = '';

  /** District admin: edit form and placement */
  editingStudent = signal(false);
  editForm: { firstName: string; lastName: string; dob: string; uniqueStudentIdentifier: string } = { firstName: '', lastName: '', dob: '', uniqueStudentIdentifier: '' };
  savingStudent = signal(false);
  studentClassrooms = signal<Classroom[]>([]);
  allClassrooms = signal<Classroom[]>([]);
  placementLoading = signal(false);
  placementActionLoading = signal(false);
  addClassroomId = signal<string>('');

  availableClassrooms = computed(() => {
    const enrolled = new Set(this.studentClassrooms().map((c) => c.id));
    return this.allClassrooms().filter((c) => !enrolled.has(c.id));
  });

  /** Quick view: which record is previewed, blob URL, type, loading, error */
  previewRecordId = signal<string | null>(null);
  previewUrl = signal<string | null>(null);
  previewType = signal<'pdf' | 'image' | 'other' | null>(null);
  previewLoading = signal(false);
  previewError = signal<string | null>(null);

  /** Sanitized URL for iframe (PDF preview). */
  previewSafeUrl = computed(() => {
    const url = this.previewUrl();
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null;
  });

  /** Unique grade levels from records, sorted. */
  gradeLevels = computed(() => {
    const set = new Set(this.records().map((r) => r.gradeLevel).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  });

  /** Unique subjects in the selected grade. */
  subjectsInGrade = computed(() => {
    const grade = this.selectedGrade();
    if (!grade) return [];
    const set = new Set(
      this.records()
        .filter((r) => r.gradeLevel === grade)
        .map((r) => r.subject)
        .filter(Boolean)
    );
    return Array.from(set).sort();
  });

  /** Records for the selected grade and subject. */
  filteredRecords = computed(() => {
    const grade = this.selectedGrade();
    const subject = this.selectedSubject();
    if (!grade || !subject) return [];
    return this.records().filter(
      (r) => r.gradeLevel === grade && r.subject === subject
    );
  });

  constructor(
    private route: ActivatedRoute,
    public auth: AuthService,
    private api: ApiService,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Invalid student';
      this.loading = false;
      return;
    }
    this.api.getStudent(id).subscribe({
      next: (s) => {
        this.student = s;
        this.loading = false;
        this.api.getStudentWork(id).subscribe({
          next: (list) => {
            this.records.set(list);
            this.recordsLoading.set(false);
          },
          error: () => this.recordsLoading.set(false),
        });
        if (this.auth.hasRole('district_admin')) {
          this.loadPlacement(id);
          this.api.getClassrooms().subscribe({ next: (list) => this.allClassrooms.set(list) });
        }
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load student';
        this.loading = false;
      },
    });
  }

  private loadPlacement(studentId: string) {
    this.placementLoading.set(true);
    this.api.getStudentClassrooms(studentId).subscribe({
      next: (list) => {
        this.studentClassrooms.set(list);
        this.placementLoading.set(false);
      },
      error: () => this.placementLoading.set(false),
    });
  }

  startEditStudent() {
    if (!this.student) return;
    this.editForm = {
      firstName: this.student.firstName,
      lastName: this.student.lastName,
      dob: this.student.dob,
      uniqueStudentIdentifier: this.student.uniqueStudentIdentifier,
    };
    this.editingStudent.set(true);
  }

  cancelEdit() {
    this.editingStudent.set(false);
  }

  saveStudent() {
    if (!this.student) return;
    this.savingStudent.set(true);
    this.api.updateStudent(this.student.id, this.editForm).subscribe({
      next: (updated) => {
        this.student = updated;
        this.editingStudent.set(false);
        this.savingStudent.set(false);
      },
      error: () => this.savingStudent.set(false),
    });
  }

  onAddClassroomChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.addClassroomId.set(value || '');
  }

  addToClassroom() {
    const classroomId = this.addClassroomId();
    if (!this.student || !classroomId) return;
    this.placementActionLoading.set(true);
    this.api.addStudentToClassroom(classroomId, this.student.id).subscribe({
      next: () => {
        this.loadPlacement(this.student!.id);
        this.addClassroomId.set('');
        this.placementActionLoading.set(false);
      },
      error: () => this.placementActionLoading.set(false),
    });
  }

  removeFromClassroom(classroomId: string) {
    if (!this.student) return;
    this.placementActionLoading.set(true);
    this.api.removeStudentFromClassroom(classroomId, this.student.id).subscribe({
      next: () => {
        this.loadPlacement(this.student!.id);
        this.placementActionLoading.set(false);
      },
      error: () => this.placementActionLoading.set(false),
    });
  }

  onGradeChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedGrade.set(value || null);
    this.selectedSubject.set(null);
    this.expandedId.set(null);
  }

  onSubjectChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedSubject.set(value || null);
    this.expandedId.set(null);
  }

  toggleExpanded(id: string) {
    const next = this.expandedId() === id ? null : id;
    this.expandedId.set(next);
    if (next !== this.previewRecordId()) this.clearPreview();
  }

  private clearPreview() {
    const url = this.previewUrl();
    if (url) URL.revokeObjectURL(url);
    this.previewRecordId.set(null);
    this.previewUrl.set(null);
    this.previewType.set(null);
    this.previewError.set(null);
    this.previewLoading.set(false);
  }

  previewFile(record: Record) {
    if (!this.student) return;
    this.clearPreview();
    this.previewRecordId.set(record.id);
    this.previewLoading.set(true);
    this.previewError.set(null);
    const url = this.api.getFileDownloadUrl(this.student.id, record.id);
    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        if (this.previewRecordId() !== record.id) return; // user closed preview while loading
        const type = detectPreviewType(blob, record.fileUrl);
        // Use a blob with correct MIME type so the iframe/browser can render it (backend may not send Content-Type)
        const blobForUrl = ensureBlobType(blob, record.fileUrl, type);
        const objectUrl = URL.createObjectURL(blobForUrl);
        this.previewUrl.set(objectUrl);
        this.previewType.set(type);
        this.previewLoading.set(false);
      },
      error: () => {
        if (this.previewRecordId() !== record.id) return;
        this.previewError.set('Could not load preview.');
        this.previewLoading.set(false);
      },
    });
  }

  closePreview() {
    this.clearPreview();
  }

  downloadFile(record: Record) {
    if (!this.student) return;
    const url = this.api.getFileDownloadUrl(this.student.id, record.id);
    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = record.fileUrl.split('/').pop() || 'download';
        a.click();
        URL.revokeObjectURL(a.href);
      },
    });
  }

  ngOnDestroy() {
    this.clearPreview();
  }
}
