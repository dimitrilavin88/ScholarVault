import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Redirects district admins to the district dashboard. Use on teacher-only routes. */
export function teacherOnlyGuard(): boolean {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.hasRole('district_admin')) {
    router.navigate(['/district']);
    return false;
  }
  return true;
}
