import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService, Student } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="page-container animate-fade-in">
      @if (loading && !student) {
        <div class="state-message"><span class="spinner"></span> Loading…</div>
      } @else if (student) {
        <nav class="breadcrumb">
          <a routerLink="/dashboard">Dashboard</a>
          <span class="breadcrumb-sep">/</span>
          <a [routerLink]="['/student', studentId]">{{ student.firstName }} {{ student.lastName }}</a>
          <span class="breadcrumb-sep">/</span>
          <span>Upload work</span>
        </nav>
        <div class="card form-card">
          <div class="card-header">
            <h1 class="card-title">Upload work sample</h1>
            <p class="card-subtitle">{{ student.firstName }} {{ student.lastName }}</p>
          </div>
          <div class="card-body">
            <form (ngSubmit)="onSubmit()" #form="ngForm" class="upload-form">
              <div class="form-row">
                <div class="field">
                  <label for="gradeLevel" class="label">Grade level</label>
                  <input
                    id="gradeLevel"
                    name="gradeLevel"
                    [(ngModel)]="gradeLevel"
                    required
                    maxlength="32"
                    placeholder="e.g. 3"
                    class="input-field"
                  />
                </div>
                <div class="field">
                  <label for="subject" class="label">Subject</label>
                  <input
                    id="subject"
                    name="subject"
                    [(ngModel)]="subject"
                    required
                    maxlength="64"
                    placeholder="e.g. Math"
                    class="input-field"
                  />
                </div>
              </div>
              <div class="field">
                <label for="notes" class="label">Notes (optional)</label>
                <textarea
                  id="notes"
                  name="notes"
                  [(ngModel)]="notes"
                  rows="3"
                  maxlength="2000"
                  placeholder="Add any notes about this work sample…"
                  class="input-field"
                  style="resize: vertical; min-height: 80px;"
                ></textarea>
              </div>
              <div class="field">
                <label class="label">Attachment (optional)</label>
                <div
                  class="dropzone"
                  [class.drag-over]="dragOver()"
                  [class.has-file]="!!file()"
                  (click)="fileInput.click()"
                  (dragover)="onDragOver($event)"
                  (dragleave)="dragOver.set(false)"
                  (drop)="onDrop($event)"
                >
                  <input
                    #fileInput
                    type="file"
                    (change)="onFileChange($event)"
                    class="file-input-hidden"
                  />
                  @if (file()) {
                    <span class="file-icon">📄</span>
                    <span class="file-name">{{ file()!.name }}</span>
                    <button type="button" class="remove-file" (click)="clearFile($event)">Remove</button>
                  } @else {
                    <span class="dropzone-icon">📤</span>
                    <span class="dropzone-text">Drag and drop a file here, or click to browse</span>
                    <span class="dropzone-hint">PDF, images, or documents</span>
                  }
                </div>
              </div>
              @if (submitting) {
                <div class="progress-wrap" role="status" aria-live="polite">
                  <div class="progress-bar"><span class="progress-fill"></span></div>
                  <span>Uploading…</span>
                </div>
              }
              @if (errorMessage) {
                <div class="message message-error" role="alert">{{ errorMessage }}</div>
              }
              @if (success) {
                <div class="message message-success" role="status">✓ Work sample uploaded successfully.</div>
              }
              <div class="form-actions">
                <button type="submit" class="btn-primary" [disabled]="form.invalid || submitting">
                  {{ submitting ? 'Uploading…' : 'Upload' }}
                </button>
                <a [routerLink]="['/student', studentId]" class="btn-secondary">Cancel</a>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .breadcrumb { margin-bottom: 1.25rem; font-size: 0.875rem; color: var(--text-muted); }
    .breadcrumb a { color: var(--primary); }
    .breadcrumb-sep { margin: 0 0.35rem; }
    .state-message { display: flex; align-items: center; gap: 0.75rem; padding: 2rem; color: var(--text-secondary); }
    .spinner {
      width: 20px; height: 20px;
      border: 2px solid var(--border); border-top-color: var(--primary);
      border-radius: 50%; animation: spin 0.7s linear infinite;
    }
    .form-card { max-width: 560px; }
    .card-title { margin: 0 0 0.2rem; font-size: 1.25rem; font-weight: 700; color: var(--text); }
    .card-subtitle { margin: 0; font-size: 0.9375rem; color: var(--text-secondary); }
    .upload-form .field { margin-bottom: 1.25rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .dropzone {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      min-height: 140px;
      padding: 1.5rem;
      border: 2px dashed var(--border);
      border-radius: var(--radius-lg);
      background: var(--bg);
      cursor: pointer;
      transition: border-color var(--duration-fast), background var(--duration-fast);
    }
    .dropzone:hover, .dropzone.drag-over { border-color: var(--primary); background: var(--primary-subtle); }
    .dropzone.has-file { border-style: solid; border-color: var(--primary-light); background: var(--primary-subtle); }
    .file-input-hidden { position: absolute; width: 0; height: 0; opacity: 0; pointer-events: none; }
    .dropzone-icon, .file-icon { font-size: 2rem; }
    .dropzone-text { font-weight: 500; color: var(--text); }
    .dropzone-hint { font-size: 0.8125rem; color: var(--text-muted); }
    .file-name { font-size: 0.9375rem; color: var(--text); word-break: break-all; }
    .remove-file {
      margin-top: 0.25rem; padding: 0.25rem 0.5rem; font-size: 0.8125rem;
      color: var(--error); background: none; border: none; cursor: pointer;
    }
    .remove-file:hover { text-decoration: underline; }
    .progress-wrap {
      display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;
    }
    .progress-bar {
      flex: 1; height: 6px; background: var(--border); border-radius: 999px; overflow: hidden;
    }
    .progress-fill {
      display: block; height: 100%; width: 30%; background: var(--primary);
      border-radius: 999px; animation: progress-indeterminate 1.2s ease-in-out infinite;
    }
    @keyframes progress-indeterminate {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(400%); }
    }
    .message { padding: 0.625rem 0.875rem; border-radius: var(--radius); font-size: 0.875rem; margin-bottom: 1rem; }
    .message-error { color: var(--error); background: var(--error-bg); }
    .message-success { color: var(--success); background: var(--success-bg); }
    .form-actions { display: flex; gap: 0.75rem; margin-top: 1.5rem; }
    .form-actions .btn-secondary { text-decoration: none; }
  `],
})
export class UploadWorkComponent implements OnInit {
  studentId = '';
  student: Student | null = null;
  gradeLevel = '';
  subject = '';
  notes = '';
  file = signal<File | null>(null);
  dragOver = signal(false);
  loading = true;
  submitting = false;
  errorMessage = '';
  success = false;

  constructor(
    private route: ActivatedRoute,
    public auth: AuthService,
    private api: ApiService,
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
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  onDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.dragOver.set(true);
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.dragOver.set(false);
    const f = e.dataTransfer?.files?.[0];
    if (f) this.file.set(f);
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.file.set(input.files?.[0] ?? null);
  }

  clearFile(e: Event) {
    e.stopPropagation();
    this.file.set(null);
  }

  onSubmit() {
    this.errorMessage = '';
    this.success = false;
    const formData = new FormData();
    formData.append('gradeLevel', this.gradeLevel.trim());
    formData.append('subject', this.subject.trim());
    if (this.notes.trim()) formData.append('notes', this.notes.trim());
    const f = this.file();
    if (f) formData.append('file', f);
    this.submitting = true;
    this.api.uploadWork(this.studentId, formData).subscribe({
      next: () => {
        this.success = true;
        this.submitting = false;
        this.notes = '';
        this.file.set(null);
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Upload failed';
        this.submitting = false;
      },
    });
  }
}
