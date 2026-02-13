import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export type Role = 'teacher' | 'admin' | 'district_admin';

export interface User {
  id: string;
  email: string;
  role: Role;
  schoolId: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private token = signal<string | null>(this.getStoredToken());
  private user = signal<User | null>(this.getStoredUser());

  isLoggedIn = computed(() => !!this.token());
  currentUser = computed(() => this.user());

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiBaseUrl}/login`, { email, password }).pipe(
      tap((res) => {
        this.token.set(res.access_token);
        this.user.set(res.user);
        this.setStored(res.access_token, res.user);
        this.router.navigate(['/dashboard']);
      }),
    );
  }

  logout() {
    this.token.set(null);
    this.user.set(null);
    localStorage.removeItem('sv_token');
    localStorage.removeItem('sv_user');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.token();
  }

  getStoredToken(): string | null {
    return localStorage.getItem('sv_token');
  }

  getStoredUser(): User | null {
    const raw = localStorage.getItem('sv_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  private setStored(token: string, user: User) {
    localStorage.setItem('sv_token', token);
    localStorage.setItem('sv_user', JSON.stringify(user));
  }

  hasRole(...roles: Role[]): boolean {
    const u = this.user();
    return u ? roles.includes(u.role) : false;
  }
}
