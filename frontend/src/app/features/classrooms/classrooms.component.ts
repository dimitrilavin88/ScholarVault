import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService, Classroom } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { SelectedClassService } from '../../core/services/selected-class.service';

@Component({
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="page-container animate-fade-in">
      <div class="page-header">
        <h1 class="page-title">Classrooms</h1>
        <p class="page-desc">Manage your classes and rosters. Select a class in the sidebar to filter Dashboard and Students.</p>
      </div>

      <!-- Create classroom -->
      <div class="card create-card">
        <h2 class="card-title">New class</h2>
        <form (ngSubmit)="createClass()" class="create-form">
          <input
            type="text"
            class="input-field"
            placeholder="Class name (e.g. Math 3 - Period 1)"
            [(ngModel)]="newClassName"
            name="newName"
            maxlength="255"
          />
          <button type="submit" class="btn-primary" [disabled]="!newClassName.trim() || creating">
            {{ creating ? 'Creating…' : 'Create class' }}
          </button>
        </form>
        @if (createError) {
          <p class="message-error">{{ createError }}</p>
        }
      </div>

      <!-- List of classrooms -->
      <section class="section">
        <h2 class="section-title">Your classes</h2>
        @if (loading) {
          <div class="state-message"><span class="spinner"></span> Loading…</div>
        } @else if (classrooms().length === 0) {
          <div class="card empty-state">
            <span class="empty-icon">🏫</span>
            <p>No classes yet. Create one above.</p>
          </div>
        } @else {
          <ul class="classroom-list">
            @for (c of classrooms(); track c.id) {
              <li>
                <a [routerLink]="['/classrooms', c.id]" class="classroom-card card">
                  <span class="classroom-icon">🏫</span>
                  <span class="classroom-name">{{ c.name }}</span>
                  <span class="classroom-arrow">→</span>
                </a>
              </li>
            }
          </ul>
        }
      </section>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 1.5rem; }
    .page-title { margin: 0 0 0.35rem; font-size: 1.5rem; font-weight: 700; color: var(--text); }
    .page-desc { margin: 0; font-size: 0.9375rem; color: var(--text-secondary); }
    .create-card { padding: 1.25rem 1.5rem; margin-bottom: 1.5rem; }
    .card-title { margin: 0 0 0.75rem; font-size: 1.125rem; font-weight: 600; }
    .create-form { display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center; }
    .create-form .input-field { flex: 1; min-width: 200px; }
    .message-error { margin: 0.5rem 0 0; font-size: 0.875rem; color: var(--error); }
    .section-title { margin: 0 0 1rem; font-size: 1.125rem; font-weight: 600; color: var(--text); }
    .state-message { display: flex; align-items: center; gap: 0.75rem; padding: 2rem; color: var(--text-secondary); }
    .spinner {
      width: 20px; height: 20px;
      border: 2px solid var(--border); border-top-color: var(--primary);
      border-radius: 50%; animation: spin 0.7s linear infinite;
    }
    .empty-state { padding: 2rem; text-align: center; }
    .empty-icon { font-size: 2.5rem; opacity: 0.7; display: block; margin-bottom: 0.5rem; }
    .classroom-list { list-style: none; padding: 0; margin: 0; }
    .classroom-card {
      display: flex; align-items: center; gap: 1rem;
      padding: 1rem 1.25rem; color: var(--text); text-decoration: none;
      transition: background var(--duration-fast), transform var(--duration-fast);
    }
    .classroom-card:hover { background: var(--primary-subtle); transform: translateX(4px); }
    .classroom-icon { font-size: 1.5rem; }
    .classroom-name { flex: 1; font-weight: 600; }
    .classroom-arrow { color: var(--text-muted); }
  `],
})
export class ClassroomsComponent implements OnInit {
  classrooms = signal<Classroom[]>([]);
  newClassName = '';
  loading = true;
  creating = false;
  createError = '';

  constructor(
    public auth: AuthService,
    private api: ApiService,
    private selectedClass: SelectedClassService,
  ) {}

  ngOnInit(): void {
    this.loadClassrooms();
  }

  loadClassrooms(): void {
    this.api.getClassrooms().subscribe({
      next: (list) => {
        this.classrooms.set(list);
        this.selectedClass.refreshClassrooms();
        this.loading = false;
      },
      error: () => this.loading = false,
    });
  }

  createClass(): void {
    const name = this.newClassName.trim();
    if (!name) return;
    this.createError = '';
    this.creating = true;
    this.api.createClassroom(name).subscribe({
      next: () => {
        this.newClassName = '';
        this.creating = false;
        this.loadClassrooms();
      },
      error: (err) => {
        this.createError = err?.error?.message ?? 'Failed to create class';
        this.creating = false;
      },
    });
  }
}
