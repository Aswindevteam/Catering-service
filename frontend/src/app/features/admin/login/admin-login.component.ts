import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { BrandLogoComponent } from '../../../shared/components/brand-logo/brand-logo.component';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, BrandLogoComponent],
  template: `
    <div class="login-page">
      <div class="login-card">
        <!-- Logo & Title -->
        <div class="card-header">
          <div class="crest-icon">
            <app-brand-logo [size]="64"></app-brand-logo>
          </div>
          <h1 class="portal-title">Thirumala Catering Service</h1>
          <p class="portal-subtitle">Admin Management Portal</p>
        </div>

        <!-- Login Form -->
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          <div class="wf-form-group">
            <label for="username">Username or Email</label>
            <div class="input-wrap">
              <span class="material-symbols-outlined input-icon">person</span>
              <input 
                id="username" 
                type="text" 
                formControlName="username" 
                placeholder="admin or admin@thirumalacatering.com"
                autocomplete="username"
              />
            </div>
            @if (loginForm.get('username')?.touched && loginForm.get('username')?.invalid) {
              <span class="err-msg">Username is required</span>
            }
          </div>

          <div class="wf-form-group">
            <label for="password">Password</label>
            <div class="input-wrap">
              <span class="material-symbols-outlined input-icon">lock</span>
              <input 
                id="password" 
                type="password" 
                formControlName="password" 
                placeholder="••••••••"
                autocomplete="current-password"
              />
            </div>
            @if (loginForm.get('password')?.touched && loginForm.get('password')?.invalid) {
              <span class="err-msg">Password is required</span>
            }
          </div>

          <button 
            type="submit" 
            class="wf-btn primary lg submit-btn" 
            [disabled]="loginForm.invalid || loading()"
          >
            @if (loading()) {
              <span class="material-symbols-outlined spin">progress_activity</span>
              <span>Signing In...</span>
            } @else {
              <span>Sign In to Dashboard</span>
              <span class="material-symbols-outlined">arrow_forward</span>
            }
          </button>
        </form>

        <!-- Quick Demo Credential Pill -->
        <div class="demo-creds">
          <div class="cred-pill" (click)="fillDemoCreds()">
            <span class="material-symbols-outlined">key</span>
            <span>Use Demo: <strong>admin</strong> / <strong>Admin&#64;123</strong></span>
          </div>
        </div>

        <div class="card-footer">
          <a routerLink="/menu" class="back-link">
            <span class="material-symbols-outlined">arrow_back</span>
            <span>Back to Customer Website</span>
          </a>
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
      background: linear-gradient(135deg, #420d1a 0%, #29050d 100%);
      padding: 1.5rem;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(rgba(244, 208, 104, 0.08) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }
    }

    .login-card {
      background: #ffffff;
      border-radius: var(--radius-lg);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
      border: 1px solid var(--border-gold);
      width: 100%;
      max-width: 440px;
      padding: 2.5rem 2rem;
      position: relative;
      z-index: 1;
    }

    .card-header {
      text-align: center;
      margin-bottom: 2rem;

      .crest-icon {
        margin-bottom: 0.75rem;
        display: inline-flex;
        filter: drop-shadow(0 4px 8px rgba(0,0,0,0.15));
      }

      .portal-title {
        font-family: var(--font-display);
        font-size: 1.6rem;
        font-weight: 700;
        color: var(--primary-maroon);
        letter-spacing: 0.5px;
      }

      .portal-subtitle {
        font-size: 0.85rem;
        color: var(--accent-gold-dark);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        margin-top: 0.25rem;
      }
    }

    .input-wrap {
      position: relative;
      display: flex;
      align-items: center;

      .input-icon {
        position: absolute;
        left: 0.85rem;
        font-size: 20px;
        color: var(--text-muted);
      }

      input {
        padding-left: 2.6rem !important;
      }
    }

    .err-msg {
      font-size: 0.75rem;
      color: var(--nonveg-red);
      margin-top: 0.25rem;
      display: block;
    }

    .submit-btn {
      width: 100%;
      margin-top: 0.5rem;
    }

    .demo-creds {
      margin-top: 1.5rem;
      text-align: center;

      .cred-pill {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.8rem;
        background: var(--bg-cream);
        border: 1px dashed var(--border-gold);
        padding: 0.4rem 0.8rem;
        border-radius: 20px;
        color: var(--primary-maroon);
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          background: var(--accent-gold-subtle);
          border-style: solid;
        }

        .material-symbols-outlined {
          font-size: 16px;
          color: var(--accent-gold-dark);
        }
      }
    }

    .card-footer {
      margin-top: 1.75rem;
      text-align: center;
      border-top: 1px solid var(--border-subtle);
      padding-top: 1rem;

      .back-link {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--text-secondary);

        &:hover {
          color: var(--primary-maroon);
        }

        .material-symbols-outlined {
          font-size: 18px;
        }
      }
    }

    .spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }
  `]
})
export class AdminLoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  loading = signal<boolean>(false);

  loginForm = this.fb.group({
    username: ['admin', [Validators.required]],
    password: ['Admin@123', [Validators.required]]
  });

  fillDemoCreds() {
    this.loginForm.patchValue({
      username: 'admin',
      password: 'Admin@123'
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading.set(true);
    const { username, password } = this.loginForm.value;

    this.authService.login(username!, password!).subscribe({
      next: () => {
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.toastService.error(err.error?.error || 'Invalid credentials. Please try again.');
      }
    });
  }
}
