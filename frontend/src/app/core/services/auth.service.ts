import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AdminUser } from '../models';
import { ToastService } from './toast.service';
import { Observable, tap, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private toast = inject(ToastService);
  private apiUrl = `${environment.apiUrl}/auth`;

  currentUser = signal<AdminUser | null>(null);
  token = signal<string | null>(null);
  isAuthenticated = computed(() => !!this.token());

  constructor() {
    this.initFromStorage();
  }

  private initFromStorage() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedToken = localStorage.getItem('wf_admin_token');
      const storedUser = localStorage.getItem('wf_admin_user');
      if (storedToken) {
        this.token.set(storedToken);
      }
      if (storedUser) {
        try {
          this.currentUser.set(JSON.parse(storedUser));
        } catch {
          this.logout();
        }
      }
    }
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { username, password }).pipe(
      tap((res) => {
        if (res.success && res.data) {
          this.token.set(res.data.token);
          this.currentUser.set(res.data.user);
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem('wf_admin_token', res.data.token);
            localStorage.setItem('wf_admin_user', JSON.stringify(res.data.user));
          }
          this.toast.success(`Welcome back, ${res.data.user.full_name || 'Admin'}!`);
          this.router.navigate(['/admin/dashboard']);
        }
      })
    );
  }

  logout() {
    this.token.set(null);
    this.currentUser.set(null);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('wf_admin_token');
      localStorage.removeItem('wf_admin_user');
    }
    this.toast.info('You have been logged out.');
    this.router.navigate(['/admin/login']);
  }

  getAuthHeaders(): { [header: string]: string } {
    const t = this.token();
    return t ? { Authorization: `Bearer ${t}` } : {};
  }
}
