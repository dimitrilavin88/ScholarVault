import { Component, OnInit } from '@angular/core';
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
      } @else if (student) {
        <nav class="breadcrumb">
          <a routerLink="/dashboard">Dashboard</a>
          <span class="breadcrumb-sep">/</span>
          <a routerLink="/students">Students</a>
          <span class="breadcrumb-sep">/</span>
          <a [routerLink]="['/student', studentId]">{{ student.firstName }} {{ student.lastName }}</a>
          <span class="breadcrumb-sep">/</span>
          <span>Records</span>
        </nav>
        <div class="card records-card">
          <div class="card-header">
            <h1 class="card-title">Historical records</h1>
            <p class="card-subtitle">{{ student.firstName }} {{ student.lastName }}</p>
          </div>
          <div class="card-body">
            @if (loading) {
              <div class="state-message"><span class="spinner"></span> Loading records…</div>
            } @else if (error) {
              <div class="state-message state-error">{{ error }}</div>
            } @else if (records.length === 0) {
              <div class="state-message empty-state">
                <p>No work samples yet.</p>
                <a [routerLink]="['/student', studentId, 'upload']" class="btn-primary">Upload first sample</a>
              </div>
            } @else {
              <ul class="record-list">
                @for (r of records; track r.id) {
                  <li class="record-item">
                    <div class="record-head">
                      <span class="record-grade">{{ r.gradeLevel }} · {{ r.subject }}</span>
                      <span class="record-date">{{ r.createdAt | date:'mediumDate' }}</span>
                    </div>
                    @if (r.notes) {
                      <p class="record-notes">{{ r.notes }}</p>
                    }
                    <button type="button" class="record-download" (click)="downloadFile(r)">
                      Download file
                    </button>
                  </li>
                }
              </ul>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .breadcrumb {
      margin-bottom: 1.25rem;
      font-size: 0.875rem;
      color: var(--text-muted);
    }
    .breadcrumb a { color: var(--primary); }
    .breadcrumb-sep { margin: 0 0.35rem; }
    .state-message {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 2rem;
      color: var(--text-secondary);
    }
    .state-error { color: var(--error); }
    .empty-state { flex-direction: column; gap: 1rem; }
    .empty-state .btn-primary { text-decoration: none; }
    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid var(--border);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .card-title { margin: 0 0 0.2rem; font-size: 1.25rem; font-weight: 700; color: var(--text); }
    .card-subtitle { margin: 0; font-size: 0.9375rem; color: var(--text-secondary); }
    .records-card { max-width: 720px; }
    .record-list { list-style: none; padding: 0; margin: 0; }
    .record-item {
      padding: 1.125rem 0;
      border-bottom: 1px solid var(--border);
    }
    .record-item:last-child { border-bottom: none; }
    .record-head {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      flex-wrap: wrap;
      gap: 0.35rem;
    }
    .record-grade { font-weight: 600; font-size: 0.9375rem; color: var(--text); }
    .record-date { font-size: 0.8125rem; color: var(--text-muted); }
    .record-notes { margin: 0.5rem 0 0.35rem; font-size: 0.9375rem; color: var(--text-secondary); line-height: 1.5; }
    .record-download {
      margin-top: 0.5rem;
      padding: 0;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--primary);
      background: none;
      border: none;
      cursor: pointer;
    }
    .record-download:hover { text-decoration: underline; }
  `],
})
export class HistoricalRecordsComponent implements OnInit {
  studentId = '';
  student: Student | null = null;
  records: Record[] = [];
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
      this.loading = false;
      return;
    }
    this.studentId = id;
    this.api.getStudent(id).subscribe({
      next: (s) => {
        this.student = s;
      },
      error: () => {
        this.loading = false;
      },
    });
    this.api.getStudentWork(id).subscribe({
      next: (list) => {
        this.records = list;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load records';
        this.loading = false;
      },
    });
  }

  downloadFile(record: Record) {
    const url = this.api.getFileDownloadUrl(this.studentId, record.id);
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
