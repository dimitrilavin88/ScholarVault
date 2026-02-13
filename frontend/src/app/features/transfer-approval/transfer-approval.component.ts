import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService, Transfer } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="page-container animate-fade-in">
      <div class="page-header">
        <h1 class="page-title">Transfer approval dashboard</h1>
        <p class="page-desc">Review and approve or reject student transfer requests. Only district admins can access this page.</p>
      </div>

      <div class="card content-card">
        @if (loading()) {
          <div class="state-message">
            <span class="spinner"></span>
            <span>Loading pending requests…</span>
          </div>
        } @else if (error()) {
          <div class="state-message state-error">{{ error() }}</div>
        } @else if (transfers().length === 0) {
          <div class="state-message empty-state">
            <span class="empty-icon">📋</span>
            <p>No pending transfer requests.</p>
          </div>
        } @else {
          <ul class="transfer-list">
            @for (t of transfers(); track t.id) {
              <li class="transfer-item card">
                <div class="transfer-main">
                  <div class="transfer-row">
                    <span class="transfer-label">Student</span>
                    <a [routerLink]="['/student', t.studentId]" class="transfer-value link">
                      {{ t.student?.firstName }} {{ t.student?.lastName }}
                      ({{ t.student?.uniqueStudentIdentifier }})
                    </a>
                  </div>
                  <div class="transfer-row">
                    <span class="transfer-label">Previous school</span>
                    <span class="transfer-value">{{ t.oldDistrict?.name }}{{ t.oldSchool?.name ? ' — ' + (t.oldSchool?.name ?? '') : '' }}</span>
                  </div>
                  <div class="transfer-row">
                    <span class="transfer-label">Requested new school</span>
                    <span class="transfer-value">{{ t.newDistrict?.name || '—' }}{{ t.newSchool?.name ? ' — ' + (t.newSchool?.name ?? '') : '' }}</span>
                  </div>
                  <div class="transfer-row">
                    <span class="transfer-label">Requested by</span>
                    <span class="transfer-value">{{ t.requestedBy?.email }}</span>
                  </div>
                  <div class="transfer-row">
                    <span class="transfer-label">Date</span>
                    <span class="transfer-value">{{ formatDate(t.createdAt) }}</span>
                  </div>
                  @if (t.notes) {
                    <div class="transfer-row">
                      <span class="transfer-label">Notes</span>
                      <span class="transfer-value notes">{{ t.notes }}</span>
                    </div>
                  }
                </div>
                <div class="transfer-actions">
                  @if (actionMessage(t.id)(); as msg) {
                    <span class="action-feedback" [class.error]="msg.error">{{ msg.text }}</span>
                  } @else {
                    <button type="button" class="btn-primary btn-approve" (click)="approve(t.id)" [disabled]="actionLoading(t.id)()">
                      Approve
                    </button>
                    <button type="button" class="btn-secondary btn-reject" (click)="reject(t.id)" [disabled]="actionLoading(t.id)()">
                      Reject
                    </button>
                  }
                </div>
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
    .page-desc { margin: 0; font-size: 0.9375rem; color: var(--text-secondary); }
    .content-card { padding: 1.5rem; }
    .state-message { display: flex; align-items: center; gap: 0.75rem; padding: 2rem; color: var(--text-secondary); }
    .state-error { color: var(--error); }
    .empty-state { flex-direction: column; gap: 0.5rem; }
    .empty-icon { font-size: 2rem; opacity: 0.7; }
    .spinner {
      width: 20px; height: 20px;
      border: 2px solid var(--border); border-top-color: var(--primary);
      border-radius: 50%; animation: spin 0.7s linear infinite;
    }
    .transfer-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 1rem; }
    .transfer-item { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: 1rem; padding: 1.25rem; }
    .transfer-main { flex: 1; min-width: 0; }
    .transfer-row { margin-bottom: 0.5rem; font-size: 0.9375rem; }
    .transfer-row:last-child { margin-bottom: 0; }
    .transfer-label { display: inline-block; width: 140px; color: var(--text-muted); }
    .transfer-value { color: var(--text); }
    .transfer-value.notes { white-space: pre-wrap; }
    .transfer-value.link { color: var(--primary); text-decoration: none; }
    .transfer-value.link:hover { text-decoration: underline; }
    .transfer-actions { display: flex; align-items: center; gap: 0.75rem; flex-shrink: 0; }
    .btn-approve { background: var(--success, #0d9488); }
    .btn-approve:hover:not(:disabled) { filter: brightness(1.1); }
    .action-feedback { font-size: 0.875rem; color: var(--primary); }
    .action-feedback.error { color: var(--error); }
  `],
})
export class TransferApprovalComponent implements OnInit {
  transfers = signal<Transfer[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  private actionLoadingMap = new Map<string, WritableSignal<boolean>>();
  private actionMessageMap = new Map<string, WritableSignal<{ text: string; error?: boolean } | null>>();

  constructor(
    public auth: AuthService,
    private api: ApiService,
  ) {}

  actionLoading(id: string): WritableSignal<boolean> {
    if (!this.actionLoadingMap.has(id)) {
      this.actionLoadingMap.set(id, signal(false));
    }
    return this.actionLoadingMap.get(id)!;
  }

  actionMessage(id: string): WritableSignal<{ text: string; error?: boolean } | null> {
    if (!this.actionMessageMap.has(id)) {
      this.actionMessageMap.set(id, signal(null));
    }
    return this.actionMessageMap.get(id)!;
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.getPendingTransfers().subscribe({
      next: (list) => {
        this.transfers.set(list);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Failed to load transfer requests');
        this.loading.set(false);
      },
    });
  }

  formatDate(iso: string): string {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { dateStyle: 'medium' });
  }

  approve(id: string): void {
    const loadingSig = this.actionLoading(id);
    const msgSig = this.actionMessage(id);
    loadingSig.set(true);
    msgSig.set(null);
    this.api.approveTransfer(id).subscribe({
      next: () => {
        loadingSig.set(false);
        msgSig.set({ text: 'Approved.' });
        this.transfers.update((list) => list.filter((t) => t.id !== id));
      },
      error: (err) => {
        loadingSig.set(false);
        msgSig.set({ text: err?.error?.message ?? 'Failed to approve', error: true });
      },
    });
  }

  reject(id: string): void {
    const loadingSig = this.actionLoading(id);
    const msgSig = this.actionMessage(id);
    loadingSig.set(true);
    msgSig.set(null);
    this.api.rejectTransfer(id).subscribe({
      next: () => {
        loadingSig.set(false);
        msgSig.set({ text: 'Rejected.' });
        this.transfers.update((list) => list.filter((t) => t.id !== id));
      },
      error: (err) => {
        loadingSig.set(false);
        msgSig.set({ text: err?.error?.message ?? 'Failed to reject', error: true });
      },
    });
  }
}
