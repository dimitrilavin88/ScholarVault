import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService, Transfer } from '../../core/services/api.service';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page-container animate-fade-in">
      <div class="page-header">
        <h1 class="page-title">District dashboard</h1>
        <p class="page-desc">Manage transfer requests and district-wide actions. Release students leaving your district, then the receiving district can accept.</p>
      </div>

      <section class="section">
        <h2 class="section-title">Transfer requests</h2>
        <div class="queues-grid">
          <div class="queue-card card">
            <div class="queue-header">
              <span class="queue-icon" aria-hidden="true">📤</span>
              <h3 class="queue-title">Awaiting your release</h3>
            </div>
            <p class="queue-desc">Students leaving your district. Release the student so the receiving district can accept.</p>
            @if (loadingRelease()) {
              <div class="queue-placeholder"><span class="queue-empty-text">Loading…</span></div>
            } @else if (transfersForRelease().length === 0) {
              <div class="queue-placeholder">
                <span class="queue-empty-icon">—</span>
                <span class="queue-empty-text">No requests at this time</span>
              </div>
            } @else {
              <ul class="queue-list">
                @for (t of transfersForRelease(); track t.id) {
                  <li class="queue-item">
                    <a [routerLink]="['/student', t.studentId]" class="queue-student">{{ t.student?.firstName }} {{ t.student?.lastName }}</a>
                    <span class="queue-meta">→ {{ t.newDistrict?.name }}</span>
                  </li>
                }
              </ul>
              <p class="queue-count">{{ transfersForRelease().length }} request(s) awaiting release</p>
            }
            <a routerLink="/transfer-approvals" class="queue-link">View transfer approval dashboard →</a>
          </div>
          <div class="queue-card card">
            <div class="queue-header">
              <span class="queue-icon" aria-hidden="true">📥</span>
              <h3 class="queue-title">Awaiting your acceptance</h3>
            </div>
            <p class="queue-desc">Students entering your district (released by sending district). Accept to complete the transfer.</p>
            @if (loadingAccept()) {
              <div class="queue-placeholder"><span class="queue-empty-text">Loading…</span></div>
            } @else if (transfersForAccept().length === 0) {
              <div class="queue-placeholder">
                <span class="queue-empty-icon">—</span>
                <span class="queue-empty-text">No requests at this time</span>
              </div>
            } @else {
              <ul class="queue-list">
                @for (t of transfersForAccept(); track t.id) {
                  <li class="queue-item">
                    <a [routerLink]="['/student', t.studentId]" class="queue-student">{{ t.student?.firstName }} {{ t.student?.lastName }}</a>
                    <span class="queue-meta">from {{ t.oldDistrict?.name }}</span>
                  </li>
                }
              </ul>
              <p class="queue-count">{{ transfersForAccept().length }} request(s) awaiting acceptance</p>
            }
            <a routerLink="/transfer-approvals" class="queue-link">View transfer approval dashboard →</a>
          </div>
        </div>
      </section>

      <!-- Quick link to full approval list -->
      <section class="section">
        <h2 class="section-title">Quick actions</h2>
        <div class="quick-actions">
          <a routerLink="/transfer-approvals" class="action-card card">
            <span class="action-icon">✅</span>
            <span class="action-label">Transfer approval dashboard</span>
            <span class="action-hint">Review, approve, or reject all pending transfer requests</span>
          </a>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 1.75rem; }
    .page-title { margin: 0 0 0.35rem; font-size: 1.5rem; font-weight: 700; color: var(--text); }
    .page-desc { margin: 0; font-size: 0.9375rem; color: var(--text-secondary); }
    .section { margin-bottom: 2rem; }
    .section-title { margin: 0 0 1rem; font-size: 1.125rem; font-weight: 600; color: var(--text); }
    .queues-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.25rem;
    }
    .queue-card {
      display: flex;
      flex-direction: column;
      padding: 1.25rem;
      transition: box-shadow var(--duration-normal);
    }
    .queue-card:hover { box-shadow: var(--shadow-lg); }
    .queue-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
    .queue-icon { font-size: 1.5rem; }
    .queue-title { margin: 0; font-size: 1.0625rem; font-weight: 600; color: var(--text); }
    .queue-desc {
      margin: 0 0 1rem;
      font-size: 0.875rem;
      color: var(--text-secondary);
      line-height: 1.5;
    }
    .queue-placeholder {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem;
      margin-bottom: 1rem;
      background: var(--bg);
      border-radius: var(--radius);
      border: 1px dashed var(--border);
    }
    .queue-empty-icon { color: var(--text-muted); font-size: 1.25rem; }
    .queue-empty-text { font-size: 0.875rem; color: var(--text-muted); }
    .queue-list { list-style: none; padding: 0; margin: 0 0 0.75rem; }
    .queue-item { font-size: 0.9375rem; margin-bottom: 0.35rem; }
    .queue-student { color: var(--primary); text-decoration: none; }
    .queue-student:hover { text-decoration: underline; }
    .queue-meta { color: var(--text-muted); margin-left: 0.25rem; }
    .queue-count { margin: 0 0 0.75rem; font-size: 0.875rem; color: var(--text-secondary); }
    .queue-link {
      margin-top: auto;
      font-size: 0.9375rem;
      font-weight: 500;
      color: var(--primary);
    }
    .queue-link:hover { text-decoration: underline; }
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
  `],
})
export class DistrictDashboardComponent implements OnInit {
  transfersForRelease = signal<Transfer[]>([]);
  transfersForAccept = signal<Transfer[]>([]);
  loadingRelease = signal(true);
  loadingAccept = signal(true);

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getTransfersForRelease().subscribe({
      next: (list) => {
        this.transfersForRelease.set(list);
        this.loadingRelease.set(false);
      },
      error: () => this.loadingRelease.set(false),
    });
    this.api.getTransfersForAccept().subscribe({
      next: (list) => {
        this.transfersForAccept.set(list);
        this.loadingAccept.set(false);
      },
      error: () => this.loadingAccept.set(false),
    });
  }
}
