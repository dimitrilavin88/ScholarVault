import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [],
  template: `
    <div class="page-container animate-fade-in">
      <div class="page-header">
        <h1 class="page-title">Settings</h1>
        <p class="page-desc">Manage your profile and preferences.</p>
      </div>

      <div class="settings-grid">
        <!-- Profile card -->
        <section class="card settings-card">
          <div class="card-header">
            <h2 class="card-title">Profile</h2>
          </div>
          <div class="card-body">
            <dl class="settings-list">
              <div class="settings-row">
                <dt>Email</dt>
                <dd>{{ auth.currentUser()?.email }}</dd>
              </div>
              <div class="settings-row">
                <dt>Role</dt>
                <dd><span class="role-badge">{{ auth.currentUser()?.role }}</span></dd>
              </div>
            </dl>
            <p class="hint">Phase 2: Profile updates will sync with AWS Cognito.</p>
          </div>
        </section>

        <!-- Preferences placeholder -->
        <section class="card settings-card">
          <div class="card-header">
            <h2 class="card-title">Preferences</h2>
          </div>
          <div class="card-body">
            <p class="text-muted">Notification and display preferences will appear here.</p>
            <p class="hint">Phase 2: Store preferences in backend or Cognito.</p>
          </div>
        </section>

        <!-- Notifications placeholder -->
        <section class="card settings-card">
          <div class="card-header">
            <h2 class="card-title">Notifications</h2>
          </div>
          <div class="card-body">
            <p class="text-muted">Email and in-app notification settings.</p>
            <p class="hint">Phase 2: Integrate with SNS or Cognito for alerts.</p>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 1.75rem; }
    .page-title { margin: 0 0 0.35rem; font-size: 1.5rem; font-weight: 700; color: var(--text); }
    .page-desc { margin: 0; font-size: 0.9375rem; color: var(--text-secondary); }
    .settings-grid { display: grid; gap: 1.5rem; max-width: 640px; }
    .settings-card .card-title { margin: 0; font-size: 1.125rem; font-weight: 600; }
    .settings-list { margin: 0; }
    .settings-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem 1rem;
      padding: 0.75rem 0;
      border-bottom: 1px solid var(--border);
    }
    .settings-row:last-of-type { border-bottom: none; }
    .settings-row dt { margin: 0; font-size: 0.875rem; color: var(--text-muted); min-width: 80px; }
    .settings-row dd { margin: 0; font-size: 0.9375rem; }
    .role-badge {
      display: inline-block;
      padding: 0.2rem 0.5rem;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: capitalize;
      color: var(--primary-hover);
      background: var(--primary-light);
      border-radius: 999px;
    }
    .text-muted { color: var(--text-secondary); font-size: 0.9375rem; margin: 0 0 0.5rem; }
    .hint { font-size: 0.8125rem; color: var(--text-muted); margin: 0.5rem 0 0; }
  `],
})
export class SettingsComponent {
  constructor(public auth: AuthService) {}
}
