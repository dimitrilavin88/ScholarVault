import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { ApiService, Student, Record } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <div class="page-container animate-fade-in">
      @if (loading && !student) {
        <div class="state-message"><span class="spinner"></span> Loading…</div>
      } @else if (error) {
        <div class="state-message state-error">{{ error }}</div>
      } @else if (student) {
        <nav class="breadcrumb">
          <a routerLink="/dashboard">Dashboard</a>
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
              <a [routerLink]="['/student', student.id, 'upload']" class="btn-primary">📤 Upload work sample</a>
              <a [routerLink]="['/student', student.id, 'records']" class="btn-secondary">View all records</a>
            </div>
          </div>

          <!-- Timeline: work samples (expandable cards) -->
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
              <div class="timeline">
                @for (r of records(); track r.id) {
                  <div class="timeline-item">
                    <div class="timeline-marker" aria-hidden="true"></div>
                    <div class="timeline-card card">
                      <button type="button" class="timeline-card-head"
                        (click)="toggleExpanded(r.id)"
                        [attr.aria-expanded]="expandedId() === r.id">
                        <span class="timeline-grade">{{ r.gradeLevel }} · {{ r.subject }}</span>
                        <span class="timeline-date">{{ r.createdAt | date:'mediumDate' }}</span>
                        <span class="timeline-chevron">{{ expandedId() === r.id ? '▼' : '▶' }}</span>
                      </button>
                      @if (expandedId() === r.id) {
                        <div class="timeline-card-body">
                          @if (r.notes) {
                            <p class="timeline-notes">{{ r.notes }}</p>
                          }
                          <button type="button" class="record-download" (click)="downloadFile(r)">
                            📥 Download file
                          </button>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
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
    .record-download {
      margin-top: 0.5rem; padding: 0.4rem 0; font-size: 0.875rem; font-weight: 500;
      color: var(--primary); background: none; border: none; cursor: pointer;
    }
    .record-download:hover { text-decoration: underline; }
  `],
})
export class StudentProfileComponent implements OnInit {
  student: Student | null = null;
  records = signal<Record[]>([]);
  recordsLoading = signal(true);
  expandedId = signal<string | null>(null);
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    public auth: AuthService,
    private api: ApiService,
    private http: HttpClient,
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
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load student';
        this.loading = false;
      },
    });
  }

  toggleExpanded(id: string) {
    this.expandedId.set(this.expandedId() === id ? null : id);
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
}
