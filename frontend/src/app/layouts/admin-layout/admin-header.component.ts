import { Component, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LanguagePickerComponent } from '../../shared/components/language-picker/language-picker.component';
import { TranslationService } from '../../core/services/translation.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule, RouterModule, LanguagePickerComponent],
  template: `
    <header class="admin-topbar">
      <!-- Left: Mobile Toggle & Context Breadcrumbs -->
      <div class="topbar-left">
        <button class="mobile-toggle-btn" (click)="toggleMobileSidebar()" aria-label="Toggle navigation">
          <span class="material-symbols-outlined">menu</span>
        </button>

        <div class="breadcrumb-trail">
          <span class="portal-badge">Admin Studio</span>
          <span class="crumb-separator">/</span>
          <span class="current-crumb">{{ currentSectionName() }}</span>
        </div>
      </div>

      <!-- Right: Language Picker, Notifications & Director Profile -->
      <div class="topbar-right">
        <!-- Multi-language Picker -->
        <app-language-picker></app-language-picker>

        <!-- Date Range Pill -->
        <div class="date-pill" title="Current Season">
          <span class="material-symbols-outlined icon">calendar_today</span>
          <span>Wedding Season 2026</span>
        </div>

        <!-- Notification Bell with Ping Dot -->
        <div class="notify-btn" title="System Notifications">
          <span class="material-symbols-outlined">notifications</span>
          <span class="ping-dot"></span>
        </div>

        <!-- Director Avatar & Dropdown -->
        <div class="director-menu-wrap">
          <button class="director-chip" (click)="toggleDropdown()">
            <div class="director-avatar">
              <span class="material-symbols-outlined">shield_person</span>
            </div>
            <div class="director-meta">
              <span class="name">{{ authService.currentUser()?.full_name || 'Director' }}</span>
              <span class="role">Executive Chef</span>
            </div>
            <span class="material-symbols-outlined expand-icon">expand_more</span>
          </button>

          @if (showDropdown()) {
            <div class="dropdown-pane">
              <div class="user-info">
                <strong>{{ authService.currentUser()?.full_name || 'Culinary Director' }}</strong>
                <span class="email">{{ authService.currentUser()?.email || 'director@weddingfeast.com' }}</span>
              </div>
              <div class="dropdown-divider"></div>
              <a routerLink="/menu" class="dropdown-link" target="_blank">
                <span class="material-symbols-outlined">storefront</span>
                <span>Open Customer Menu</span>
              </a>
              <button class="dropdown-link logout-btn" (click)="logout()">
                <span class="material-symbols-outlined">logout</span>
                <span>Sign Out</span>
              </button>
            </div>
          }
        </div>
      </div>
    </header>
  `,
  styles: [`
    .admin-topbar {
      height: 64px;
      background: #FFFFFF;
      border-bottom: 1px solid #E5DEC9;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.75rem;
      position: sticky;
      top: 0;
      z-index: 40;
      box-shadow: 0 2px 8px rgba(66, 17, 25, 0.03);
    }

    .topbar-left {
      display: flex;
      align-items: center;
      gap: 1rem;

      .mobile-toggle-btn {
        display: none;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: 6px;
        border: 1px solid #E5DEC9;
        background: transparent;
        color: #5B1A24;
        cursor: pointer;

        @media (max-width: 991px) {
          display: flex;
        }
      }

      .breadcrumb-trail {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-family: var(--font-sans, sans-serif);

        .portal-badge {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          color: #5B1A24;
          background: #FAF8F5;
          padding: 0.2rem 0.55rem;
          border-radius: 4px;
          border: 1px solid #E5DEC9;
        }

        .crumb-separator {
          color: #B59B74;
          font-size: 0.8rem;
        }

        .current-crumb {
          font-size: 0.88rem;
          font-weight: 600;
          color: #382F2D;
          font-family: var(--font-serif, serif);
        }
      }
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 1.1rem;

      .date-pill {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.35rem 0.75rem;
        border-radius: 20px;
        background: #F3EFEA;
        border: 1px solid #E5DEC9;
        font-size: 0.76rem;
        font-weight: 600;
        color: #5B1A24;

        .icon {
          font-size: 15px;
          color: #C59B43;
        }

        @media (max-width: 840px) {
          display: none;
        }
      }

      .notify-btn {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: #FAF8F5;
        border: 1px solid #E5DEC9;
        color: #5B1A24;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          background: #F3EFEA;
          color: #421119;
        }

        .ping-dot {
          position: absolute;
          top: 7px;
          right: 7px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #C59B43;
          border: 2px solid #FFFFFF;
        }
      }
    }

    /* Director Avatar Chip */
    .director-menu-wrap {
      position: relative;

      .director-chip {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        padding: 0.25rem 0.65rem 0.25rem 0.3rem;
        border-radius: 24px;
        background: #FAF8F5;
        border: 1px solid #E5DEC9;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          background: #F3EFEA;
          border-color: #C59B43;
        }

        .director-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #5B1A24 0%, #421119 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #C59B43;

          .material-symbols-outlined {
            font-size: 20px;
          }
        }

        .director-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          line-height: 1.15;

          .name {
            font-size: 0.82rem;
            font-weight: 700;
            color: #5B1A24;
          }

          .role {
            font-size: 0.65rem;
            color: #8C7B70;
            letter-spacing: 0.3px;
          }

          @media (max-width: 600px) {
            display: none;
          }
        }

        .expand-icon {
          font-size: 18px;
          color: #9C8B7E;
        }
      }

      .dropdown-pane {
        position: absolute;
        right: 0;
        top: calc(100% + 8px);
        width: 220px;
        background: #FFFFFF;
        border: 1px solid #E5DEC9;
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(66, 17, 25, 0.12);
        padding: 0.65rem;
        z-index: 100;
        animation: fadeIn 0.15s ease-out;

        .user-info {
          padding: 0.5rem 0.65rem;
          display: flex;
          flex-direction: column;
          gap: 2px;

          strong {
            font-size: 0.86rem;
            color: #5B1A24;
          }

          .email {
            font-size: 0.72rem;
            color: #8C7B70;
          }
        }

        .dropdown-divider {
          height: 1px;
          background: #E5DEC9;
          margin: 0.4rem 0;
        }

        .dropdown-link {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.55rem 0.65rem;
          border-radius: 6px;
          color: #382F2D;
          font-size: 0.82rem;
          font-weight: 500;
          text-decoration: none;
          background: transparent;
          border: none;
          width: 100%;
          cursor: pointer;
          transition: background 0.15s;

          &:hover {
            background: #FAF8F5;
            color: #5B1A24;
          }

          &.logout-btn {
            color: #A32D2D;
            &:hover {
              background: #FDF2F2;
            }
          }
        }
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class AdminHeaderComponent {
  authService = inject(AuthService);
  tService = inject(TranslationService);
  router = inject(Router);

  @Output() toggleSidebar = new EventEmitter<void>();
  showDropdown = signal(false);
  currentSectionName = signal('Executive Overview');

  constructor() {
    this.updateCrumb(this.router.url);
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.updateCrumb(event.urlAfterRedirects || event.url);
      });
  }

  updateCrumb(url: string) {
    if (url.includes('dishes/new')) {
      this.currentSectionName.set('Culinary Studio: Add New Dish');
    } else if (url.includes('dishes') && url.includes('edit')) {
      this.currentSectionName.set('Culinary Studio & Dish Editor');
    } else if (url.includes('dishes')) {
      this.currentSectionName.set('Culinary Studio');
    } else if (url.includes('recipes')) {
      this.currentSectionName.set('Recipe Hub & Scaling');
    } else if (url.includes('pricing')) {
      this.currentSectionName.set('Pricing & Estimation Settings');
    } else if (url.includes('selections')) {
      this.currentSectionName.set('Wedding Events & Selections');
    } else if (url.includes('categories')) {
      this.currentSectionName.set('Food Categories');
    } else {
      this.currentSectionName.set('Executive Overview');
    }
  }

  toggleMobileSidebar() {
    this.toggleSidebar.emit();
  }

  toggleDropdown() {
    this.showDropdown.update(v => !v);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }
}