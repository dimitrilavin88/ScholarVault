import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="login-page">
      <div class="login-bg" aria-hidden="true"></div>
      <div class="login-wrap">
        <!-- Left: welcome + illustration (desktop) -->
        <div class="login-welcome">
          <h1 class="welcome-title">Welcome to ScholarVault</h1>
          <p class="welcome-desc">A friendly place to manage student work samples and keep records organized.</p>
          <div class="welcome-illus" role="img" aria-label="Education illustration">
            <span class="illus-book">📚</span>
            <span class="illus-star">✨</span>
            <span class="illus-pencil">✏️</span>
          </div>
          <p class="welcome-tagline">Designed for teachers and school admins.</p>
        </div>
        <!-- Right: sign-in card -->
        <div class="login-card card">
          <div class="login-brand">
            <span class="login-logo" aria-hidden="true">📚</span>
            <h2 class="login-title">Sign in</h2>
            <p class="login-tagline">Enter your credentials to continue</p>
          </div>
          <form (ngSubmit)="onSubmit()" #form="ngForm" class="login-form">
            <div class="field">
              <label for="email" class="label">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                [(ngModel)]="email"
                required
                email
                placeholder="you&#64;school.edu"
                autocomplete="email"
                class="input-field"
              />
            </div>
            <div class="field">
              <label for="password" class="label">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                [(ngModel)]="password"
                required
                minlength="1"
                placeholder="Password"
                autocomplete="current-password"
                class="input-field"
              />
            </div>
            @if (errorMessage) {
              <div class="message message-error" role="alert">{{ errorMessage }}</div>
            }
            <button type="submit" class="btn-primary btn-block" [disabled]="form.invalid || loading">
              {{ loading ? 'Signing in…' : 'Sign in' }}
            </button>
          </form>
          <p class="login-hint">Demo: teacher&#64;demo.edu / password123</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      position: relative;
      overflow: hidden;
    }
    .login-bg {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, var(--bg) 0%, var(--primary-subtle) 40%, var(--primary-light) 100%);
      opacity: 0.6;
    }
    .login-wrap {
      position: relative;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
      align-items: center;
      max-width: 900px;
      width: 100%;
    }
    .login-welcome { padding: 1rem 0; }
    .welcome-title { margin: 0 0 0.75rem; font-size: 1.75rem; font-weight: 700; color: var(--text); line-height: 1.3; }
    .welcome-desc { margin: 0 0 1.5rem; font-size: 1rem; color: var(--text-secondary); line-height: 1.6; }
    .welcome-illus {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1.5rem;
      margin: 2rem 0;
      font-size: 4rem;
    }
    .illus-book, .illus-star, .illus-pencil { animation: pulse-soft 2s ease-in-out infinite; }
    .illus-star { animation-delay: 0.3s; }
    .illus-pencil { animation-delay: 0.6s; }
    .welcome-tagline { margin: 0; font-size: 0.9375rem; color: var(--text-muted); }
    .login-card { padding: 2rem; max-width: 400px; }
    .login-brand { text-align: center; margin-bottom: 1.75rem; }
    .login-logo { font-size: 2.5rem; display: block; margin-bottom: 0.5rem; }
    .login-title { margin: 0 0 0.25rem; font-size: 1.375rem; font-weight: 700; color: var(--text); }
    .login-tagline { margin: 0; font-size: 0.9375rem; color: var(--text-secondary); }
    .login-form .field { margin-bottom: 1.125rem; }
    .message { padding: 0.625rem 0.875rem; border-radius: var(--radius); font-size: 0.875rem; margin-bottom: 1rem; }
    .message-error { color: var(--error); background: var(--error-bg); }
    .btn-block { width: 100%; }
    .login-hint { margin: 1.25rem 0 0; font-size: 0.8rem; color: var(--text-muted); text-align: center; }

    @media (max-width: 768px) {
      .login-wrap { grid-template-columns: 1fr; }
      .login-welcome { text-align: center; }
      .welcome-illus { font-size: 3rem; }
    }
  `],
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  loading = false;

  constructor(private auth: AuthService) {}

  onSubmit() {
    this.errorMessage = '';
    this.loading = true;
    const email = this.email.trim();
    const password = this.password;
    if (!email || !password) {
      this.errorMessage = 'Email and password are required.';
      this.loading = false;
      return;
    }
    this.auth.login(email, password).subscribe({
      error: () => {
        this.errorMessage = 'Invalid email or password.';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
}
