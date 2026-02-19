import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService, ClassTransferRequest, Classroom, Student } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="page-container animate-fade-in">
      <div class="page-header">
        <h1 class="page-title">Class transfer</h1>
        <p class="page-desc">Move a student from one class to another within your school. No district approval needed—the other teacher accepts the request.</p>
      </div>

      <section class="card section-card">
        <h2 class="section-title">Requests awaiting your response</h2>
        @if (incomingLoading()) {
          <div class="state-message"><span class="spinner"></span> Loading…</div>
        } @else if (incoming().length === 0) {
          <div class="state-message empty-state">
            <span class="empty-icon">✓</span>
            <p>No pending requests.</p>
          </div>
        } @else {
          <ul class="request-list">
            @for (r of incoming(); track r.id) {
              <li class="request-item">
                <div class="request-main">
                  <a [routerLink]="['/student', r.studentId]" class="request-student">{{ r.student?.lastName }}, {{ r.student?.firstName }}</a>
                  <span class="request-meta">from {{ r.fromClassroom?.name }} ({{ teacherDisplayName(r.fromClassroom?.teacher) }}) → {{ r.toClassroom?.name }} ({{ teacherDisplayName(r.toClassroom?.teacher) }})</span>
                  <span class="request-by">Requested by {{ teacherDisplayName(r.requestedBy) }}</span>
                </div>
                <div class="request-actions">
                  <button type="button" class="btn-primary btn-accept" (click)="accept(r.id)" [disabled]="actionLoading(r.id)()">Accept</button>
                  <button type="button" class="btn-secondary" (click)="reject(r.id)" [disabled]="actionLoading(r.id)()">Reject</button>
                </div>
              </li>
            }
          </ul>
        }
      </section>

      <section class="card section-card">
        <h2 class="section-title">Request a class transfer</h2>
        <p class="section-desc">Send a student to another teacher's class, or request a student from another teacher's class.</p>
        <div class="form-row">
          <label class="label">Type</label>
          <select class="input-field" [(ngModel)]="requestType" (ngModelChange)="onRequestTypeChange()">
            <option value="send">Send student to another class</option>
            <option value="request">Request student from another teacher</option>
          </select>
        </div>
        @if (requestType === 'send') {
          <div class="form-row">
            <label class="label">From (your class)</label>
            <select class="input-field" [(ngModel)]="fromClassroomId" (ngModelChange)="onFromClassChange()">
              <option value="">Select class…</option>
              @for (c of myClassrooms(); track c.id) {
                <option [value]="c.id">{{ c.name }}</option>
              }
            </select>
          </div>
          @if (fromClassroomId) {
            <div class="form-row">
              <label class="label">Student</label>
              <select class="input-field" [(ngModel)]="studentId">
                <option value="">Select student…</option>
                @for (s of fromClassStudents(); track s.id) {
                  <option [value]="s.id">{{ s.lastName }}, {{ s.firstName }} ({{ s.uniqueStudentIdentifier }})</option>
                }
              </select>
            </div>
          }
          <div class="form-row">
            <label class="label">To (other teacher's class)</label>
            <select class="input-field" [(ngModel)]="toClassroomId">
              <option value="">Select class…</option>
              @for (c of otherClassrooms(); track c.id) {
                <option [value]="c.id">{{ c.name }} — {{ teacherDisplayName(c.teacher) }}</option>
              }
            </select>
          </div>
        } @else {
          <div class="form-row">
            <label class="label">To (your class)</label>
            <select class="input-field" [(ngModel)]="toClassroomId" (ngModelChange)="onToClassChange()">
              <option value="">Select class…</option>
              @for (c of myClassrooms(); track c.id) {
                <option [value]="c.id">{{ c.name }}</option>
              }
            </select>
          </div>
          <div class="form-row">
            <label class="label">From (other teacher's class)</label>
            <select class="input-field" [(ngModel)]="fromClassroomId" (ngModelChange)="onFromClassChange()">
              <option value="">Select class…</option>
              @for (c of otherClassrooms(); track c.id) {
                <option [value]="c.id">{{ c.name }} — {{ teacherDisplayName(c.teacher) }}</option>
              }
            </select>
          </div>
          @if (fromClassroomId) {
            <div class="form-row">
              <label class="label">Student</label>
              <select class="input-field" [(ngModel)]="studentId">
                <option value="">Select student…</option>
                @for (s of fromClassStudents(); track s.id) {
                  <option [value]="s.id">{{ s.lastName }}, {{ s.firstName }} ({{ s.uniqueStudentIdentifier }})</option>
                }
              </select>
            </div>
          }
        }
        @if (submitError()) {
          <p class="form-error">{{ submitError() }}</p>
        }
        <div class="form-actions">
          <button type="button" class="btn-primary" (click)="submitRequest()" [disabled]="submitting() || !canSubmit()">
            {{ submitting() ? 'Submitting…' : 'Submit request' }}
          </button>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 1.5rem; }
    .page-title { margin: 0 0 0.35rem; font-size: 1.5rem; font-weight: 700; color: var(--text); }
    .page-desc { margin: 0; font-size: 0.9375rem; color: var(--text-secondary); }
    .section-card { padding: 1.5rem; margin-bottom: 1.5rem; }
    .section-title { margin: 0 0 0.5rem; font-size: 1.125rem; font-weight: 600; color: var(--text); }
    .section-desc { margin: 0 0 1rem; font-size: 0.875rem; color: var(--text-secondary); }
    .state-message { display: flex; align-items: center; gap: 0.75rem; padding: 1.5rem; color: var(--text-secondary); }
    .empty-state { flex-direction: column; }
    .empty-icon { font-size: 1.5rem; }
    .spinner { width: 20px; height: 20px; border: 2px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.7s linear infinite; }
    .request-list { list-style: none; padding: 0; margin: 0; }
    .request-item { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.75rem 0; border-bottom: 1px solid var(--border); }
    .request-item:last-child { border-bottom: none; }
    .request-main { display: flex; flex-direction: column; gap: 0.25rem; }
    .request-student { font-weight: 600; color: var(--primary); text-decoration: none; }
    .request-student:hover { text-decoration: underline; }
    .request-meta { font-size: 0.875rem; color: var(--text-secondary); }
    .request-by { font-size: 0.8125rem; color: var(--text-muted); }
    .request-actions { display: flex; gap: 0.5rem; }
    .btn-accept { background: var(--success, #0d9488); }
    .form-row { margin-bottom: 1rem; }
    .label { display: block; margin-bottom: 0.35rem; font-size: 0.875rem; font-weight: 500; color: var(--text); }
    .input-field { width: 100%; max-width: 320px; padding: 0.5rem 0.75rem; border: 1px solid var(--border); border-radius: var(--radius); }
    .form-error { color: var(--error); font-size: 0.875rem; margin: 0 0 0.5rem; }
    .form-actions { margin-top: 1rem; }
  `],
})
export class ClassTransfersComponent implements OnInit {
  incoming = signal<ClassTransferRequest[]>([]);
  incomingLoading = signal(true);
  myClassrooms = signal<Classroom[]>([]);
  schoolClassrooms = signal<Classroom[]>([]);
  fromClassStudents = signal<Student[]>([]);
  requestType: 'send' | 'request' = 'send';
  fromClassroomId = '';
  toClassroomId = '';
  studentId = '';
  submitting = signal(false);
  submitError = signal<string | null>(null);
  private actionLoadingMap = new Map<string, ReturnType<typeof signal<boolean>>>();

  otherClassrooms = computed(() => {
    const my = this.myClassrooms();
    const all = this.schoolClassrooms();
    const myIds = new Set(my.map((c) => c.id));
    return all.filter((c) => !myIds.has(c.id));
  });

  constructor(
    private api: ApiService,
    public auth: AuthService,
  ) {}

  teacherDisplayName(t: { firstName?: string | null; lastName?: string | null; email: string } | undefined): string {
    if (!t) return '—';
    const first = t.firstName?.trim();
    const last = t.lastName?.trim();
    if (first && last) return `${first} ${last}`;
    if (first) return first;
    if (last) return last;
    return t.email;
  }

  ngOnInit(): void {
    this.loadIncoming();
    this.api.getClassrooms().subscribe({
      next: (list) => this.myClassrooms.set(list),
      error: () => this.myClassrooms.set([]),
    });
    this.api.getClassroomsInMySchool().subscribe({
      next: (list) => this.schoolClassrooms.set(list),
      error: () => this.schoolClassrooms.set([]),
    });
  }

  loadIncoming(): void {
    this.incomingLoading.set(true);
    this.api.getClassTransferIncoming().subscribe({
      next: (list) => {
        this.incoming.set(list);
        this.incomingLoading.set(false);
      },
      error: () => this.incomingLoading.set(false),
    });
  }

  onRequestTypeChange(): void {
    this.fromClassroomId = '';
    this.toClassroomId = '';
    this.studentId = '';
    this.fromClassStudents.set([]);
    this.submitError.set(null);
  }

  onFromClassChange(): void {
    this.studentId = '';
    if (!this.fromClassroomId) {
      this.fromClassStudents.set([]);
      return;
    }
    this.api.getClassroomStudents(this.fromClassroomId).subscribe({
      next: (list) => this.fromClassStudents.set(list),
      error: () => this.fromClassStudents.set([]),
    });
  }

  onToClassChange(): void {
    this.submitError.set(null);
  }

  canSubmit(): boolean {
    return !!(this.studentId && this.fromClassroomId && this.toClassroomId && this.fromClassroomId !== this.toClassroomId);
  }

  submitRequest(): void {
    if (!this.canSubmit()) return;
    this.submitError.set(null);
    this.submitting.set(true);
    this.api
      .createClassTransfer({
        studentId: this.studentId,
        fromClassroomId: this.fromClassroomId,
        toClassroomId: this.toClassroomId,
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.fromClassroomId = '';
          this.toClassroomId = '';
          this.studentId = '';
          this.fromClassStudents.set([]);
          this.loadIncoming();
        },
        error: (err) => {
          this.submitting.set(false);
          this.submitError.set(err?.error?.message ?? 'Failed to submit request.');
        },
      });
  }

  actionLoading(id: string) {
    if (!this.actionLoadingMap.has(id)) {
      this.actionLoadingMap.set(id, signal(false));
    }
    return this.actionLoadingMap.get(id)!;
  }

  accept(id: string): void {
    const loading = this.actionLoading(id);
    loading.set(true);
    this.api.acceptClassTransfer(id).subscribe({
      next: () => {
        loading.set(false);
        this.incoming.update((list) => list.filter((r) => r.id !== id));
      },
      error: () => loading.set(false),
    });
  }

  reject(id: string): void {
    const loading = this.actionLoading(id);
    loading.set(true);
    this.api.rejectClassTransfer(id).subscribe({
      next: () => {
        loading.set(false);
        this.incoming.update((list) => list.filter((r) => r.id !== id));
      },
      error: () => loading.set(false),
    });
  }
}
