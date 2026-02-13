import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService, Student, District, School } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="page-container animate-fade-in">
      <div class="page-header">
        <h1 class="page-title">Student transfer request</h1>
        <p class="page-desc">Request a transfer when a student moves from one school district to another. A district admin will review and approve or reject.</p>
      </div>

      <div class="card form-card">
        @if (successMessage()) {
          <div class="message success-message">
            <span class="message-icon">✓</span>
            {{ successMessage() }}
          </div>
        }
        @if (errorMessage()) {
          <div class="message error-message">
            <span class="message-icon">!</span>
            {{ errorMessage() }}
          </div>
        }

        <form (ngSubmit)="onSubmit()" #form="ngForm" class="transfer-form">
          <div class="form-row">
            <div class="field">
              <label for="studentId" class="label">Student <span class="required">*</span></label>
              <select
                id="studentId"
                name="studentId"
                [(ngModel)]="studentId"
                required
                class="input-field"
                (change)="onStudentChange()">
                <option value="">Select a student…</option>
                @for (s of students(); track s.id) {
                  <option [value]="s.id">{{ s.lastName }}, {{ s.firstName }} ({{ s.uniqueStudentIdentifier }}) — {{ s.district?.name }}</option>
                }
              </select>
            </div>
            <div class="field">
              <label for="dob" class="label">Date of birth (YYYY-MM-DD)</label>
              <input
                id="dob"
                type="text"
                name="dob"
                [(ngModel)]="dob"
                placeholder="e.g. 2015-03-10"
                maxlength="10"
                class="input-field"
              />
              @if (selectedStudent()) {
                <span class="hint">Student DOB: {{ selectedStudent()!.dob }}</span>
              }
            </div>
          </div>

          <div class="form-row">
            <div class="field">
              <span class="label">Previous district</span>
              @if (selectedStudent()?.district) {
                <p class="value-text">{{ selectedStudent()!.district!.name }}</p>
              } @else {
                <p class="value-text muted">Select a student above</p>
              }
            </div>
            <div class="field">
              <label for="oldSchoolId" class="label">Previous school (optional)</label>
              <select
                id="oldSchoolId"
                name="oldSchoolId"
                [(ngModel)]="oldSchoolId"
                class="input-field">
                <option value="">—</option>
                @for (s of oldSchools(); track s.id) {
                  <option [value]="s.id">{{ s.name }}</option>
                }
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="field">
              <label for="newDistrictId" class="label">New district <span class="required">*</span></label>
              <select
                id="newDistrictId"
                name="newDistrictId"
                [(ngModel)]="newDistrictId"
                required
                class="input-field"
                (change)="onNewDistrictChange()">
                <option value="">Select district…</option>
                @for (d of districts(); track d.id) {
                  <option [value]="d.id">{{ d.name }}</option>
                }
              </select>
            </div>
            <div class="field">
              <label for="newSchoolId" class="label">New school (optional)</label>
              <select
                id="newSchoolId"
                name="newSchoolId"
                [(ngModel)]="newSchoolId"
                class="input-field">
                <option value="">—</option>
                @for (s of newSchools(); track s.id) {
                  <option [value]="s.id">{{ s.name }}</option>
                }
              </select>
            </div>
          </div>

          <div class="field">
            <label for="notes" class="label">Notes (optional)</label>
            <textarea
              id="notes"
              name="notes"
              [(ngModel)]="notes"
              rows="2"
              maxlength="2000"
              placeholder="Any additional context for the reviewer…"
              class="input-field"
            ></textarea>
          </div>

          <div class="field">
            <label class="label">Proof documents (optional)</label>
            <input
              type="file"
              #proofInput
              accept=".pdf,image/*"
              (change)="onProofChange($event)"
              class="file-input"
            />
            @if (proofFile()) {
              <span class="file-name">{{ proofFile()!.name }}</span>
            }
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-primary" [disabled]="submitting() || !form.valid">
              {{ submitting() ? 'Submitting…' : 'Submit transfer request' }}
            </button>
            <a routerLink="/dashboard" class="btn-secondary link-btn">Cancel</a>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 1.5rem; }
    .page-title { margin: 0 0 0.35rem; font-size: 1.5rem; font-weight: 700; color: var(--text); }
    .page-desc { margin: 0; font-size: 0.9375rem; color: var(--text-secondary); }
    .form-card { padding: 1.5rem; max-width: 640px; }
    .message { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1rem; margin-bottom: 1rem; border-radius: var(--radius); }
    .success-message { background: var(--primary-light); color: var(--primary-hover); }
    .error-message { background: var(--error-bg); color: var(--error); }
    .message-icon { font-weight: 700; }
    .transfer-form .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    @media (max-width: 600px) { .transfer-form .form-row { grid-template-columns: 1fr; } }
    .field { margin-bottom: 1rem; }
    .label { display: block; margin-bottom: 0.35rem; font-size: 0.875rem; font-weight: 600; color: var(--text); }
    .required { color: var(--error); }
    .hint { display: block; margin-top: 0.25rem; font-size: 0.8125rem; color: var(--text-muted); }
    .file-input { display: block; margin-top: 0.35rem; }
    .file-name { font-size: 0.875rem; color: var(--text-muted); margin-left: 0.5rem; }
    .form-actions { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 1.25rem; }
    .link-btn { text-decoration: none; display: inline-flex; align-items: center; }
    .value-text { margin: 0.35rem 0 0; font-size: 0.9375rem; color: var(--text); }
    .value-text.muted { color: var(--text-muted); }
  `],
})
export class TransferRequestComponent implements OnInit {
  students = signal<Student[]>([]);
  districts = signal<District[]>([]);
  oldSchools = signal<School[]>([]);
  newSchools = signal<School[]>([]);

  studentId = '';
  dob = '';
  oldDistrictId = '';
  oldSchoolId = '';
  newDistrictId = '';
  newSchoolId = '';
  notes = '';
  proofFile = signal<File | null>(null);

  submitting = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  selectedStudent = computed(() => {
    const id = this.studentId;
    return id ? this.students().find((s) => s.id === id) ?? null : null;
  });

  constructor(
    public auth: AuthService,
    private api: ApiService,
  ) {}

  ngOnInit(): void {
    this.api.getStudents().subscribe({
      next: (list) => this.students.set(list),
      error: () => this.students.set([]),
    });
    this.api.getDistricts().subscribe({
      next: (list) => this.districts.set(list),
      error: () => this.districts.set([]),
    });
  }

  onStudentChange(): void {
    const s = this.selectedStudent();
    if (s) {
      this.oldDistrictId = s.districtId;
      this.dob = s.dob || '';
      this.loadOldSchools();
    } else {
      this.oldDistrictId = '';
      this.oldSchoolId = '';
      this.oldSchools.set([]);
    }
  }

  loadOldSchools(): void {
    if (!this.oldDistrictId) {
      this.oldSchools.set([]);
      return;
    }
    this.api.getDistrictSchools(this.oldDistrictId).subscribe({
      next: (list) => this.oldSchools.set(list),
      error: () => this.oldSchools.set([]),
    });
  }

  onNewDistrictChange(): void {
    this.newSchoolId = '';
    if (!this.newDistrictId) {
      this.newSchools.set([]);
      return;
    }
    this.api.getDistrictSchools(this.newDistrictId).subscribe({
      next: (list) => this.newSchools.set(list),
      error: () => this.newSchools.set([]),
    });
  }

  onProofChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.proofFile.set(file ?? null);
  }

  onSubmit(): void {
    this.successMessage.set(null);
    this.errorMessage.set(null);
    if (!this.studentId || !this.oldDistrictId || !this.newDistrictId) return;

    const formData = new FormData();
    formData.append('studentId', this.studentId);
    formData.append('oldDistrictId', this.oldDistrictId);
    formData.append('newDistrictId', this.newDistrictId);
    if (this.dob) formData.append('dob', this.dob);
    if (this.oldSchoolId) formData.append('oldSchoolId', this.oldSchoolId);
    if (this.newSchoolId) formData.append('newSchoolId', this.newSchoolId);
    if (this.notes) formData.append('notes', this.notes);
    const file = this.proofFile();
    if (file) formData.append('proof', file);

    this.submitting.set(true);
    this.api.createTransfer(formData).subscribe({
      next: () => {
        this.submitting.set(false);
        this.successMessage.set('Transfer request submitted successfully. A district admin will review it.');
        this.studentId = '';
        this.dob = '';
        this.oldDistrictId = '';
        this.oldSchoolId = '';
        this.newDistrictId = '';
        this.newSchoolId = '';
        this.notes = '';
        this.proofFile.set(null);
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(err?.error?.message ?? 'Failed to submit transfer request.');
      },
    });
  }
}
