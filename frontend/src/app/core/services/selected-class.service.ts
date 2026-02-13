import { Injectable, signal, computed } from '@angular/core';
import { ApiService, Classroom } from './api.service';

/**
 * Holds the currently selected classroom for filtering Dashboard and Students.
 * "All classes" = null; selecting a class = its id.
 * Phase 2: Could persist selection (e.g. localStorage) or sync with backend preference.
 */
@Injectable({ providedIn: 'root' })
export class SelectedClassService {
  private readonly selectedId = signal<string | null>(null);
  private readonly classrooms = signal<Classroom[]>([]);

  selectedClassroomId = this.selectedId.asReadonly();
  classroomsList = this.classrooms.asReadonly();

  selectedName = computed(() => {
    const id = this.selectedId();
    const list = this.classrooms();
    if (!id) return null;
    return list.find((c) => c.id === id)?.name ?? null;
  });

  constructor(private api: ApiService) {}

  setSelectedClassroomId(id: string | null): void {
    this.selectedId.set(id);
  }

  loadClassrooms(): void {
    this.api.getClassrooms().subscribe({
      next: (list: Classroom[]) => this.classrooms.set(list),
      error: () => this.classrooms.set([]),
    });
  }

  refreshClassrooms(): void {
    this.loadClassrooms();
  }
}
