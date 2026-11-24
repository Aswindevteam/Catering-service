import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslationService } from '../../core/services/translation.service';
import { BrandLogoComponent } from '../../shared/components/brand-logo/brand-logo.component';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, BrandLogoComponent],
  template: `
    <!-- Mobile Backdrop -->
    @if (mobileOpen) {
      <div class="mobile-backdrop" (click)="closeMobile()"></div>
    }

    <aside class="admin-sidebar" [class.mobile-open]="mobileOpen">
      <!-- Royal Crest Brand Icon at Top -->
      <div class="sidebar-top">
        <a routerLink="/admin/dashboard" class="brand-crest" title="Thiruma Catering Service Admin">
          <app-brand-logo [size]="40"></app-brand-logo>
        </a>
      </div>

      <!-- Slim 68px Icon Rail Nav with Tooltips & Micro-Labels -->
      <nav class="sidebar-nav">
        <!-- Dashboard / Executive Overview -->
        <a routerLink="/admin/dashboard" routerLinkActive="active" class="nav-item" (click)="closeMobile()" title="Executive Overview">
          <div class="icon-wrap">
            <span class="material-symbols-outlined">dashboard</span>
          </div>
          <span class="micro-label">{{ tService.t('admin.sidebar.overview') }}</span>
          <span class="tooltip">{{ tService.t('admin.sidebar.overview') }}</span>
        </a>

        <!-- Events Hub / Customer Selections -->
        <a routerLink="/admin/selections" routerLinkActive="active" class="nav-item" (click)="closeMobile()" title="Wedding Events">
          <div class="icon-wrap">
            <span class="material-symbols-outlined">calendar_month</span>
          </div>
          <span class="micro-label">{{ tService.t('admin.sidebar.events') }}</span>
          <span class="tooltip">{{ tService.t('admin.sidebar.events') }}</span>
        </a>

        <!-- Culinary Studio / Dishes -->
        <a routerLink="/admin/dishes" routerLinkActive="active" class="nav-item" (click)="closeMobile()" title="Culinary Studio & Dishes">
          <div class="icon-wrap">
            <span class="material-symbols-outlined">restaurant_menu</span>
          </div>
          <span class="micro-label">{{ tService.t('admin.sidebar.studio') }}</span>
          <span class="tooltip">{{ tService.t('admin.sidebar.studio') }}</span>
        </a>

        <!-- Recipe Hub -->
        <a routerLink="/admin/recipes" routerLinkActive="active" class="nav-item" (click)="closeMobile()" title="Recipe Hub & Scaling">
          <div class="icon-wrap">
            <span class="material-symbols-outlined">menu_book</span>
          </div>
          <span class="micro-label">{{ tService.t('admin.sidebar.recipes') }}</span>
          <span class="tooltip">{{ tService.t('admin.sidebar.recipes') }}</span>
        </a>

        <!-- Pricing & Estimation -->
        <a routerLink="/admin/pricing" routerLinkActive="active" class="nav-item" (click)="closeMobile()" title="Pricing & Estimation Rules">
          <div class="icon-wrap">
            <span class="material-symbols-outlined">receipt_long</span>
          </div>
          <span class="micro-label">{{ tService.t('admin.sidebar.pricing') }}</span>
          <span class="tooltip">{{ tService.t('admin.sidebar.pricing') }}</span>
        </a>

        <!-- Food Categories -->
        <a routerLink="/admin/categories" routerLinkActive="active" class="nav-item" (click)="closeMobile()" title="Food Categories">
          <div class="icon-wrap">
            <span class="material-symbols-outlined">category</span>
          </div>
          <span class="micro-label">{{ tService.t('admin.sidebar.categories') }}</span>
          <span class="tooltip">{{ tService.t('admin.sidebar.categories') }}</span>
        </a>
      </nav>

      <!-- Bottom Profile / Collapse Footer -->
      <div class="sidebar-bottom">
        <a routerLink="/menu" class="nav-item client-link" title="Customer Website" target="_blank">
          <div class="icon-wrap">
            <span class="material-symbols-outlined">storefront</span>
          </div>
          <span class="micro-label">{{ tService.t('admin.sidebar.store') }}</span>
          <span class="tooltip">{{ tService.t('admin.sidebar.store') }}</span>
        </a>
      </div>
    </aside>
  `,
  styles: [`
    .admin-sidebar {
      width: 68px;
      min-width: 68px;
      max-width: 68px;
      background: linear-gradient(180deg, #5B1A24 0%, #421119 55%, #2F0B12 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100vh;
      position: sticky;
      top: 0;
      border-right: 1px solid rgba(197, 155, 67, 0.22);
      box-shadow: 2px 0 16px rgba(0, 0, 0, 0.15);
      z-index: 50;
      user-select: none;
      padding: 0.75rem 0;
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .sidebar-top {
      padding: 0.5rem 0 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-bottom: 1px solid rgba(234, 217, 183, 0.12);
      width: 100%;

      .brand-crest {
        display: flex;
        align-items: center;
        justify-content: center;
        filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.35));
        transition: transform 0.2s ease;

        &:hover {
          transform: scale(1.08);
        }
      }
    }

    .sidebar-nav {
      flex: 1;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.4rem;
      padding: 1rem 0;
      overflow-y: auto;
      overflow-x: hidden;
      scrollbar-width: none;
      &::-webkit-scrollbar { display: none; }
    }

    .nav-item {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 56px;
      height: 52px;
      border-radius: 8px;
      color: rgba(234, 217, 183, 0.7);
      text-decoration: none;
      transition: all 0.2s ease;
      cursor: pointer;

      .icon-wrap {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 24px;

        .material-symbols-outlined {
          font-size: 22px;
          transition: transform 0.2s ease, color 0.2s ease;
        }
      }

      .micro-label {
        font-size: 0.62rem;
        letter-spacing: 0.2px;
        margin-top: 2px;
        font-family: var(--font-sans, sans-serif);
        font-weight: 500;
        text-transform: uppercase;
        color: rgba(234, 217, 183, 0.65);
        transition: color 0.2s ease;
      }

      /* Hover Tooltip */
      .tooltip {
        position: absolute;
        left: 74px;
        top: 50%;
        transform: translateY(-50%) translateX(-8px);
        background: #3B0D15;
        color: #FAF8F5;
        font-size: 0.75rem;
        font-weight: 600;
        padding: 0.35rem 0.65rem;
        border-radius: 6px;
        white-space: nowrap;
        pointer-events: none;
        opacity: 0;
        visibility: hidden;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        border: 1px solid rgba(197, 155, 67, 0.4);
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
        z-index: 60;
      }

      &:hover {
        background: rgba(197, 155, 67, 0.12);
        color: #FFFFFF;

        .material-symbols-outlined {
          color: #EAD9B7;
          transform: scale(1.1);
        }

        .micro-label {
          color: #FAF8F5;
        }

        .tooltip {
          opacity: 1;
          visibility: visible;
          transform: translateY(-50%) translateX(0);
        }
      }

      &.active {
        background: rgba(197, 155, 67, 0.2);
        color: #FFFFFF;
        box-shadow: inset 3px 0 0 #C59B43;

        .icon-wrap .material-symbols-outlined {
          color: #C59B43;
          transform: scale(1.08);
        }

        .micro-label {
          color: #C59B43;
          font-weight: 700;
        }
      }
    }

    .sidebar-bottom {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-top: 0.5rem;
      border-top: 1px solid rgba(234, 217, 183, 0.12);

      .client-link {
        color: rgba(234, 217, 183, 0.6);
        &:hover {
          color: #C59B43;
        }
      }
    }

    .mobile-backdrop {
      display: none;
    }

    /* Mobile Responsive */
    @media (max-width: 991px) {
      .admin-sidebar {
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        transform: translateX(-100%);
        box-shadow: 4px 0 24px rgba(0, 0, 0, 0.35);

        &.mobile-open {
          transform: translateX(0);
        }
      }

      .mobile-backdrop {
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        z-index: 45;
      }
    }
  `]
})
export class AdminSidebarComponent {
  tService = inject(TranslationService);
  @Input() mobileOpen = false;
  @Output() mobileOpenChange = new EventEmitter<boolean>();

  closeMobile() {
    this.mobileOpen = false;
    this.mobileOpenChange.emit(false);
  }
}