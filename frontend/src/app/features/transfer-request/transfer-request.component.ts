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

      @if (successMessage()) {
        <div class="card message success-message">
          <span class="message-icon">✓</span>
          {{ successMessage() }}
        </div>
      }
      @if (errorMessage()) {
        <div class="card message error-message">
          <span class="message-icon">!</span>
          {{ errorMessage() }}
        </div>
      }

      @if (scenario() === 'none') {
        <div class="scenario-picker">
          <p class="scenario-prompt">What do you need to do?</p>
          <div class="scenario-cards">
            <button type="button" class="scenario-card card" (click)="setScenario('outbound')">
              <span class="scenario-icon" aria-hidden="true">↗</span>
              <h2 class="scenario-title">Send student to another district</h2>
              <p class="scenario-desc">The student is leaving your district. You’re initiating the transfer of their profile to the receiving district.</p>
              <span class="scenario-cta">Choose student & destination →</span>
            </button>
            <button type="button" class="scenario-card card" (click)="setScenario('inbound')">
              <span class="scenario-icon" aria-hidden="true">↙</span>
              <h2 class="scenario-title">Request student into our district</h2>
              <p class="scenario-desc">The student has already moved to your district. The previous district didn’t submit a transfer—you’re requesting their records.</p>
              <span class="scenario-cta">Enter student ID & previous district →</span>
            </button>
          </div>
        </div>
      } @else {
        <button type="button" class="back-link" (click)="setScenario('none')">
          ← Choose a different scenario
        </button>

        @if (scenario() === 'outbound') {
      <!-- Outbound: send student to another district -->
      <div class="card form-card">
        <h2 class="form-section-title">Send student to another district</h2>
        <p class="form-section-desc">You are in the student’s current district and want to transfer their profile to another district.</p>
        <form (ngSubmit)="onSubmitOutbound()" #formOut="ngForm" class="transfer-form">
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

          <div class="field">
              <label for="newState" class="label">State (new district) <span class="required">*</span></label>
              <select
                id="newState"
                name="newState"
                [(ngModel)]="newState"
                required
                class="input-field"
                (change)="onNewStateChange()">
                <option value="">Select state…</option>
                @for (st of states(); track st) {
                  <option [value]="st">{{ st }}</option>
                }
              </select>
              <span class="hint">Filter by state so you select the correct district.</span>
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
                [disabled]="!newState || loadingDistrictsInState()"
                (change)="onNewDistrictChange()">
                <option value="">{{ loadingDistrictsInState() ? 'Loading…' : 'Select district…' }}</option>
                @for (d of districtsInState(); track d.id) {
                  <option [value]="d.id">{{ d.name }}, {{ d.state }}</option>
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
            <button type="submit" class="btn-primary" [disabled]="submitting() || !formOut.valid">
              {{ submitting() ? 'Submitting…' : 'Submit transfer request' }}
            </button>
            <a routerLink="/dashboard" class="btn-secondary link-btn">Cancel</a>
          </div>
        </form>
      </div>
        }

        @if (scenario() === 'inbound') {
      <!-- Inbound: request student into our district -->
      <div class="card form-card">
        <h2 class="form-section-title">Request student into our district</h2>
        <p class="form-section-desc">Use this when the student has moved to your district but the previous district did not submit a transfer. You are requesting their records to be transferred in.</p>
        <form (ngSubmit)="onSubmitInbound()" #formIn="ngForm" class="transfer-form">
          <div class="field">
            <label for="inboundState" class="label">State (student’s previous district) <span class="required">*</span></label>
            <select
              id="inboundState"
              name="inboundState"
              [(ngModel)]="inboundState"
              required
              class="input-field"
              (change)="onInboundStateChange()">
              <option value="">Select state…</option>
              @for (st of states(); track st) {
                <option [value]="st">{{ st }}</option>
              }
            </select>
          </div>
          <div class="form-row">
            <div class="field">
              <label for="inboundDistrictId" class="label">Previous district <span class="required">*</span></label>
              <select
                id="inboundDistrictId"
                name="inboundDistrictId"
                [(ngModel)]="inboundDistrictId"
                required
                class="input-field"
                [disabled]="!inboundState || loadingInboundDistricts()"
                (change)="onInboundDistrictChange()">
                <option value="">{{ loadingInboundDistricts() ? 'Loading…' : 'Select district…' }}</option>
                @for (d of inboundDistricts(); track d.id) {
                  <option [value]="d.id">{{ d.name }}, {{ d.state }}</option>
                }
              </select>
            </div>
            <div class="field">
              <label for="inboundOldSchoolId" class="label">Previous school (optional)</label>
              <select
                id="inboundOldSchoolId"
                name="inboundOldSchoolId"
                [(ngModel)]="inboundOldSchoolId"
                class="input-field">
                <option value="">—</option>
                @for (s of inboundOldSchools(); track s.id) {
                  <option [value]="s.id">{{ s.name }}</option>
                }
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="field">
              <label for="inboundUniqueId" class="label">Student ID (from previous district) <span class="required">*</span></label>
              <input
                id="inboundUniqueId"
                type="text"
                name="inboundUniqueId"
                [(ngModel)]="inboundUniqueId"
                required
                maxlength="255"
                placeholder="e.g. DEMO-001"
                class="input-field"
              />
              <span class="hint">The unique student identifier from their previous district records.</span>
            </div>
            <div class="field">
              <label for="inboundDob" class="label">Date of birth (YYYY-MM-DD) <span class="required">*</span></label>
              <input
                id="inboundDob"
                type="text"
                name="inboundDob"
                [(ngModel)]="inboundDob"
                required
                placeholder="e.g. 2015-03-10"
                maxlength="10"
                class="input-field"
              />
            </div>
          </div>
          <div class="field">
            <label for="inboundNotes" class="label">Notes (optional)</label>
            <textarea
              id="inboundNotes"
              name="inboundNotes"
              [(ngModel)]="inboundNotes"
              rows="2"
              maxlength="2000"
              placeholder="Any context for the reviewer…"
              class="input-field"
            ></textarea>
          </div>
          <div class="field">
            <label class="label">Proof documents (optional)</label>
            <input
              type="file"
              #inboundProofInput
              accept=".pdf,image/*"
              (change)="onInboundProofChange($event)"
              class="file-input"
            />
            @if (inboundProofFile()) {
              <span class="file-name">{{ inboundProofFile()!.name }}</span>
            }
          </div>
          <div class="form-actions">
            <button type="submit" class="btn-primary" [disabled]="submitting() || !formIn.valid">
              {{ submitting() ? 'Submitting…' : 'Request student in' }}
            </button>
            <a routerLink="/dashboard" class="btn-secondary link-btn">Cancel</a>
          </div>
        </form>
      </div>
        }
      }
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
    .form-section-title { margin: 0 0 0.35rem; font-size: 1.125rem; font-weight: 700; color: var(--text); }
    .form-section-desc { margin: 0 0 1rem; font-size: 0.875rem; color: var(--text-secondary); }
    .scenario-picker { margin-top: 0.5rem; }
    .scenario-prompt { font-size: 1rem; font-weight: 600; color: var(--text); margin: 0 0 1rem; }
    .scenario-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem; }
    .scenario-card {
      display: block;
      width: 100%;
      text-align: left;
      padding: 1.5rem;
      border: 2px solid var(--border);
      background: var(--surface);
      cursor: pointer;
      transition: border-color var(--duration-fast), box-shadow var(--duration-fast), transform var(--duration-fast);
    }
    .scenario-card:hover {
      border-color: var(--primary);
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }
    .scenario-card:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
    .scenario-icon { font-size: 2rem; display: block; margin-bottom: 0.75rem; opacity: 0.9; }
    .scenario-title { margin: 0 0 0.5rem; font-size: 1.125rem; font-weight: 700; color: var(--text); }
    .scenario-desc { margin: 0 0 1rem; font-size: 0.875rem; color: var(--text-secondary); line-height: 1.45; }
    .scenario-cta { font-size: 0.8125rem; font-weight: 600; color: var(--primary); }
    .back-link {
      display: inline-block;
      margin-bottom: 1rem;
      padding: 0.35rem 0;
      font-size: 0.875rem;
      color: var(--text-muted);
      background: none;
      border: none;
      cursor: pointer;
      text-decoration: none;
    }
    .back-link:hover { color: var(--primary); }
  `],
})
export class TransferRequestComponent implements OnInit {
  students = signal<Student[]>([]);
  districts = signal<District[]>([]);
  /** Districts in the selected state — populated by API when state is selected. */
  districtsInState = signal<District[]>([]);
  oldSchools = signal<School[]>([]);
  /** Schools in the selected new district — populated by API when district is selected. */
  newSchools = signal<School[]>([]);

  studentId = '';
  dob = '';
  oldDistrictId = '';
  oldSchoolId = '';
  newState = '';
  newDistrictId = '';
  newSchoolId = '';
  notes = '';
  proofFile = signal<File | null>(null);

  inboundState = '';
  inboundDistrictId = '';
  inboundOldSchoolId = '';
  inboundUniqueId = '';
  inboundDob = '';
  inboundNotes = '';
  inboundProofFile = signal<File | null>(null);
  inboundDistricts = signal<District[]>([]);
  inboundOldSchools = signal<School[]>([]);
  loadingInboundDistricts = signal(false);

  /** 'none' = show scenario picker; 'outbound' | 'inbound' = show that form */
  scenario = signal<'none' | 'outbound' | 'inbound'>('none');

  submitting = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  loadingDistrictsInState = signal(false);

  selectedStudent = computed(() => {
    const id = this.studentId;
    return id ? this.students().find((s) => s.id === id) ?? null : null;
  });

  /** Unique states from all districts, sorted (e.g. California, Nevada). */
  states = computed(() => {
    const set = new Set(this.districts().map((d) => d.state).filter(Boolean));
    return Array.from(set).sort();
  });

  constructor(
    public auth: AuthService,
    private api: ApiService,
  ) {}

  setScenario(value: 'none' | 'outbound' | 'inbound'): void {
    this.scenario.set(value);
    this.errorMessage.set(null);
  }

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

  onNewStateChange(): void {
    this.newDistrictId = '';
    this.newSchoolId = '';
    this.districtsInState.set([]);
    this.newSchools.set([]);
    const state = this.newState?.trim();
    if (!state) return;
    this.loadingDistrictsInState.set(true);
    this.api.getDistrictsByState(state).subscribe({
      next: (list) => {
        this.districtsInState.set(list);
        this.loadingDistrictsInState.set(false);
      },
      error: () => {
        this.districtsInState.set([]);
        this.loadingDistrictsInState.set(false);
      },
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

  onInboundStateChange(): void {
    this.inboundDistrictId = '';
    this.inboundOldSchoolId = '';
    this.inboundDistricts.set([]);
    this.inboundOldSchools.set([]);
    const state = this.inboundState?.trim();
    if (!state) return;
    this.loadingInboundDistricts.set(true);
    this.api.getDistrictsByState(state).subscribe({
      next: (list) => {
        this.inboundDistricts.set(list);
        this.loadingInboundDistricts.set(false);
      },
      error: () => {
        this.inboundDistricts.set([]);
        this.loadingInboundDistricts.set(false);
      },
    });
  }

  onInboundDistrictChange(): void {
    this.inboundOldSchoolId = '';
    if (!this.inboundDistrictId) {
      this.inboundOldSchools.set([]);
      return;
    }
    this.api.getDistrictSchools(this.inboundDistrictId).subscribe({
      next: (list) => this.inboundOldSchools.set(list),
      error: () => this.inboundOldSchools.set([]),
    });
  }

  onInboundProofChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.inboundProofFile.set(file ?? null);
  }

  onSubmitOutbound(): void {
    this.successMessage.set(null);
    this.errorMessage.set(null);
    if (!this.studentId || !this.oldDistrictId || !this.newDistrictId) return;

    const formData = new FormData();
    formData.append('requestType', 'outbound');
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
        this.newState = '';
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

  onSubmitInbound(): void {
    this.successMessage.set(null);
    this.errorMessage.set(null);
    if (!this.inboundState || !this.inboundDistrictId || !this.inboundUniqueId.trim() || !this.inboundDob) return;

    const formData = new FormData();
    formData.append('requestType', 'inbound');
    formData.append('oldDistrictId', this.inboundDistrictId);
    formData.append('uniqueStudentIdentifier', this.inboundUniqueId.trim());
    formData.append('dob', this.inboundDob);
    if (this.inboundOldSchoolId) formData.append('oldSchoolId', this.inboundOldSchoolId);
    if (this.inboundNotes) formData.append('notes', this.inboundNotes);
    const file = this.inboundProofFile();
    if (file) formData.append('proof', file);

    this.submitting.set(true);
    this.api.createTransfer(formData).subscribe({
      next: () => {
        this.submitting.set(false);
        this.successMessage.set('Inbound transfer request submitted. A district admin will review it.');
        this.inboundState = '';
        this.inboundDistrictId = '';
        this.inboundOldSchoolId = '';
        this.inboundUniqueId = '';
        this.inboundDob = '';
        this.inboundNotes = '';
        this.inboundProofFile.set(null);
        this.inboundDistricts.set([]);
        this.inboundOldSchools.set([]);
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(err?.error?.message ?? 'Failed to submit inbound request.');
      },
    });
  }
}
