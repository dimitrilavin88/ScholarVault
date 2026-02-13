import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export function districtAdminGuard(): boolean {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.hasRole('district_admin')) return true;
  router.navigate(['/dashboard']);
  return false;
}
