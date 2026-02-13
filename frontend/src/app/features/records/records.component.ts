import { Component, OnInit, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService, Record, Student } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { DatePipe } from '@angular/common';

interface RecordRow {
  record: Record;
  studentName: string;
  studentId: string;
}

@Component({
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <div class="page-container animate-fade-in">
      <div class="page-header">
        <h1 class="page-title">All records</h1>
        <p class="page-desc">View and filter work samples across students.</p>
        <div class="toolbar">
          <div class="filter-group">
            <label for="filter-grade" class="sr-only">Filter by grade</label>
            <select id="filter-grade" class="input-field select-sm" [value]="filterGrade()" (change)="filterGrade.set($any($event.target).value)">
              <option value="">All grades</option>
              @for (g of grades(); track g) {
                <option [value]="g">{{ g }}</option>
              }
            </select>
            <label for="filter-subject" class="sr-only">Filter by subject</label>
            <select id="filter-subject" class="input-field select-sm" [value]="filterSubject()" (change)="filterSubject.set($any($event.target).value)">
              <option value="">All subjects</option>
              @for (s of subjects(); track s) {
                <option [value]="s">{{ s }}</option>
              }
            </select>
          </div>
        </div>
      </div>
      <div class="card table-card">
        @if (loading) {
          <div class="state-message">
            <span class="spinner"></span>
            <span>Loading records…</span>
          </div>
        } @else if (error) {
          <div class="state-message state-error">{{ error }}</div>
        } @else if (filteredRows().length === 0) {
          <div class="state-message empty-state">
            <span class="empty-icon">📋</span>
            <p>No records match your filters.</p>
            <a routerLink="/students" class="btn-primary">View students</a>
          </div>
        } @else {
          <div class="table-wrap">
            <table class="data-table" role="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Grade</th>
                  <th>Subject</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                @for (row of filteredRows(); track row.record.id) {
                  <tr>
                    <td>
                      <a [routerLink]="['/student', row.studentId]" class="student-link">{{ row.studentName }}</a>
                    </td>
                    <td>{{ row.record.gradeLevel }}</td>
                    <td>{{ row.record.subject }}</td>
                    <td>{{ row.record.createdAt | date:'shortDate' }}</td>
                    <td>
                      <span class="status-badge status-complete" title="Work sample on file">Complete</span>
                    </td>
                    <td>
                      <a [routerLink]="['/student', row.studentId, 'records']" class="link-sm">View</a>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 1.5rem; }
    .page-title { margin: 0 0 0.35rem; font-size: 1.5rem; font-weight: 700; color: var(--text); }
    .page-desc { margin: 0 0 1rem; font-size: 0.9375rem; color: var(--text-secondary); }
    .toolbar { margin-top: 1rem; }
    .filter-group { display: flex; flex-wrap: wrap; gap: 0.75rem; }
    .select-sm { width: auto; min-width: 120px; }
    .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); border: 0; }
    .table-card { overflow: hidden; }
    .state-message {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 2rem;
      color: var(--text-secondary);
      font-size: 0.9375rem;
    }
    .state-error { color: var(--error); }
    .empty-state { flex-direction: column; gap: 1rem; }
    .empty-icon { font-size: 2rem; opacity: 0.7; }
    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid var(--border);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    .table-wrap { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.9375rem; }
    .data-table th, .data-table td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid var(--border); }
    .data-table th { font-weight: 600; color: var(--text-secondary); background: var(--bg); }
    .data-table tbody tr:hover { background: var(--primary-subtle); }
    .student-link { font-weight: 500; color: var(--text); }
    .student-link:hover { color: var(--primary); }
    .status-badge {
      display: inline-block;
      padding: 0.2rem 0.5rem;
      font-size: 0.75rem;
      font-weight: 600;
      border-radius: 999px;
    }
    .status-complete { color: var(--success); background: var(--success-bg); }
    .link-sm { font-size: 0.875rem; font-weight: 500; }
  `],
})
export class RecordsComponent implements OnInit {
  rows: RecordRow[] = [];
  filterGrade = signal('');
  filterSubject = signal('');
  loading = true;
  error = '';

  grades = computed(() => {
    const set = new Set(this.rows.map((r) => r.record.gradeLevel).filter(Boolean));
    return Array.from(set).sort();
  });

  subjects = computed(() => {
    const set = new Set(this.rows.map((r) => r.record.subject).filter(Boolean));
    return Array.from(set).sort();
  });

  filteredRows = computed(() => {
    let list = this.rows;
    const grade = this.filterGrade().trim();
    const subject = this.filterSubject().trim();
    if (grade) list = list.filter((r) => r.record.gradeLevel === grade);
    if (subject) list = list.filter((r) => r.record.subject === subject);
    return list.sort((a, b) => new Date(b.record.createdAt).getTime() - new Date(a.record.createdAt).getTime());
  });

  constructor(
    public auth: AuthService,
    private api: ApiService,
  ) {}

  ngOnInit() {
    this.api.getStudents().subscribe({
      next: (students) => {
        if (!students || students.length === 0) {
          this.rows = [];
          this.loading = false;
          return;
        }
        const requests = students.map((s) =>
          this.api.getStudentWork(s.id).pipe(
            map((work) => work.map((r) => ({ record: r, studentName: `${s.firstName} ${s.lastName}`, studentId: s.id })))
          )
        );
        forkJoin(requests).subscribe({
          next: (results) => {
            this.rows = results.flat();
            this.loading = false;
          },
          error: (err) => {
            this.error = err?.error?.message || 'Failed to load records';
            this.loading = false;
          },
        });
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load students';
        this.loading = false;
      },
    });
  }
}
