import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SelectionService } from '../../../core/services/selection.service';
import { AuthService } from '../../../core/services/auth.service';
import { TranslationService } from '../../../core/services/translation.service';
import { ToastService } from '../../../core/services/toast.service';
import { LanguagePickerComponent } from '../language-picker/language-picker.component';
import { BrandLogoComponent } from '../brand-logo/brand-logo.component';
import { WeddingEvent } from '../../../core/models';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LanguagePickerComponent, BrandLogoComponent],
  template: `
    <div class="navbar-wrapper">
      <header class="wf-editorial-header">
      <div class="header-inner">
        <!-- Brand Mark -->
        <a routerLink="/" class="brand-link">
          <div class="brand-crest">
            <app-brand-logo [size]="34"></app-brand-logo>
          </div>
          <div class="brand-typography">
            <span class="brand-name">{{ translationService.t('brand.name') }}</span>
            <span class="brand-sub">{{ translationService.t('brand.tagline') }}</span>
          </div>
        </a>

        <!-- Center Nav Links: Curate Feast, Event Details (Modal Configurator), Feast Proposal -->
        <nav class="nav-center">
          <a routerLink="/menu" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
            {{ translationService.t('nav.browseMenu') }}
          </a>

          <!-- Event Details triggers the celebration configurator modal -->
          <button type="button" class="nav-btn-link" (click)="openEventDetailsModal()">
            <span class="material-symbols-outlined nav-icon">celebration</span>
            <span>{{ translationService.t('nav.eventDetails') }}</span>
          </button>

          <a routerLink="/menu-review" routerLinkActive="active">
            {{ translationService.t('nav.reviewBooking') }}
          </a>
        </nav>

        <!-- Right Side: Language Picker + Tray Pill + Admin Portal + Mobile Toggle -->
        <div class="nav-right">
          <!-- Multi-language translation picker -->
          <app-language-picker></app-language-picker>

          <!-- Selected Tray Pill (only highlights when items selected) -->
          <a routerLink="/menu-review" class="tray-link" [title]="'Review Selected Dishes'">
            <span class="material-symbols-outlined tray-icon">dinner_dining</span>
            <span class="tray-count">{{ selectionService.selectedDishes().size }}</span>
            @if (selectionService.calculation(); as calc) {
              @if (calc.grand_total > 0) {
                <span class="tray-cost">₹{{ (calc.grand_total / 100).toLocaleString('en-IN') }}</span>
              }
            }
          </a>

          <!-- Admin Portal Link -->
          @if (authService.isAuthenticated()) {
            <a routerLink="/admin/dashboard" class="studio-link" title="Open Admin Studio">
              <span class="material-symbols-outlined">dashboard</span>
              <span class="studio-text">{{ translationService.t('nav.adminStudio') }}</span>
            </a>
          } @else {
            <a routerLink="/admin/login" class="studio-link" title="Admin Login">
              <span class="material-symbols-outlined">lock</span>
              <span class="studio-text">{{ translationService.t('nav.adminLogin') }}</span>
            </a>
          }

          <!-- Mobile Hamburger Menu Button -->
          <button type="button" class="mobile-menu-btn" (click)="mobileMenuOpen.set(!mobileMenuOpen())" aria-label="Toggle navigation menu">
            <span class="material-symbols-outlined">{{ mobileMenuOpen() ? 'close' : 'menu' }}</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Floating Mobile Cart FAB: Displayed as an elegant floating action button on screens <= 680px -->
    @if (selectionService.selectedDishes().size > 0 && !isReviewPage() && !isMenuPage()) {
      <a routerLink="/menu-review" class="mobile-floating-cart-fab" [title]="'Review Feast (' + selectionService.selectedDishes().size + ' dishes)'">
        <div class="fab-pill">
          <div class="fab-icon-box">
            <span class="material-symbols-outlined fab-cart-icon">dinner_dining</span>
            <span class="fab-badge">{{ selectionService.selectedDishes().size }}</span>
          </div>
          <div class="fab-info">
            <span class="fab-title">Review Feast</span>
            @if (selectionService.calculation(); as calc) {
              @if (calc.grand_total > 0) {
                <span class="fab-amount">₹{{ (calc.grand_total / 100).toLocaleString('en-IN') }}</span>
              }
            }
          </div>
          <span class="material-symbols-outlined fab-arrow">arrow_forward</span>
        </div>
      </a>
    }

    <!-- Mobile Navigation Drawer (Rendered outside header to prevent stacking context trapping) -->
    @if (mobileMenuOpen()) {
        <div class="mobile-drawer-backdrop" (click)="mobileMenuOpen.set(false)">
          <div class="mobile-drawer" (click)="$event.stopPropagation()">
            <div class="mobile-drawer-header">
              <span class="drawer-title">Navigation</span>
              <button class="drawer-close" (click)="mobileMenuOpen.set(false)">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <div class="mobile-nav-links">
              <!-- Language Switcher in Drawer -->
              <div class="drawer-lang-section">
                <span class="drawer-section-label">Select Language:</span>
                <app-language-picker></app-language-picker>
              </div>

              <a routerLink="/menu" (click)="mobileMenuOpen.set(false)" class="mobile-nav-item">
                <span class="material-symbols-outlined">restaurant_menu</span>
                <span>{{ translationService.t('nav.browseMenu') }}</span>
              </a>

              <button type="button" class="mobile-nav-item btn" (click)="openEventDetailsModal(); mobileMenuOpen.set(false)">
                <span class="material-symbols-outlined">celebration</span>
                <span>{{ translationService.t('nav.eventDetails') }}</span>
              </button>

              <a routerLink="/menu-review" (click)="mobileMenuOpen.set(false)" class="mobile-nav-item">
                <span class="material-symbols-outlined">receipt_long</span>
                <span>{{ translationService.t('nav.reviewBooking') }}</span>
              </a>

              <div class="mobile-divider"></div>

              @if (authService.isAuthenticated()) {
                <a routerLink="/admin/dashboard" (click)="mobileMenuOpen.set(false)" class="mobile-nav-item admin">
                  <span class="material-symbols-outlined">shield_person</span>
                  <span>{{ translationService.t('nav.adminStudio') }}</span>
                </a>
              } @else {
                <a routerLink="/admin/login" (click)="mobileMenuOpen.set(false)" class="mobile-nav-item admin">
                  <span class="material-symbols-outlined">lock</span>
                  <span>{{ translationService.t('nav.adminLogin') }}</span>
                </a>
              }

              <!-- Direct WhatsApp Concierge Button -->
              <div class="mobile-divider"></div>
              <a 
                href="https://wa.me/917299887725?text=Namaste%20Thirumala%20Catering%20Service!%20I%20have%20a%20query%20about%20catering%20and%20arrangements." 
                target="_blank" 
                class="mobile-whatsapp-btn"
                (click)="mobileMenuOpen.set(false)"
              >
                <span class="wa-icon-box">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="#FFFFFF">
                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2Z"/>
                  </svg>
                </span>
                <div class="wa-txt">
                  <strong>WhatsApp Concierge</strong>
                  <span>Instant Answers & Custom Menu</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      }

      <!-- Interactive Event Details Modal Configurator -->
      @if (showEventModal()) {
        <div class="event-modal-backdrop" (click)="showEventModal.set(false)">
          <div class="event-modal-dialog" (click)="$event.stopPropagation()">
            <div class="event-modal-head">
              <div class="head-titles">
                <span class="modal-subhead">✦ {{ translationService.t('brand.name') }} ✦</span>
                <h3>{{ translationService.t('event.title') }}</h3>
              </div>
              <button type="button" class="close-x-btn" (click)="showEventModal.set(false)" aria-label="Close modal">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <div class="event-modal-body">
              <p class="modal-intro">
                {{ translationService.t('event.intro') }}
              </p>

              <div class="modal-grid-2">
                <div class="field-wrap">
                  <label>{{ translationService.t('event.hostName') }} *</label>
                  <input type="text" [(ngModel)]="eventForm.customer_name" placeholder="e.g. Radhika Sharma & Arjun Nair" />
                </div>
                <div class="field-wrap">
                  <label>{{ translationService.t('dialog.phone') }}</label>
                  <input type="text" [(ngModel)]="eventForm.customer_phone" placeholder="+91 72998 87725" />
                </div>
              </div>

              <div class="modal-grid-2">
                <div class="field-wrap">
                  <label>{{ translationService.t('dialog.email') }}</label>
                  <input type="email" [(ngModel)]="eventForm.customer_email" placeholder="radhika.arjun@wedding.com" />
                </div>
                <div class="field-wrap">
                  <label>{{ translationService.t('event.type') }}</label>
                  <select [(ngModel)]="eventForm.event_type">
                    <option value="Wedding Reception">{{ translationService.t('eventType.reception') }}</option>
                    <option value="Traditional Muhurtham">{{ translationService.t('eventType.muhurtham') }}</option>
                    <option value="Sangeet & Mehendi">{{ translationService.t('eventType.sangeet') }}</option>
                    <option value="Engagement Feast">{{ translationService.t('eventType.engagement') }}</option>
                    <option value="Anniversary Gala">{{ translationService.t('eventType.anniversary') }}</option>
                  </select>
                </div>
              </div>

              <div class="modal-grid-2">
                <div class="field-wrap">
                  <label>{{ translationService.t('event.name') }}</label>
                  <input 
                    type="text" 
                    [(ngModel)]="eventForm.event_name" 
                    [placeholder]="translationService.currentLang() === 'ta' ? 'எ.கா. பிரம்மாண்ட திருமண வரவேற்பு' : 'e.g. Grand Wedding Reception'" 
                  />
                </div>
                <div class="field-wrap">
                  <label>{{ translationService.t('event.date') }}</label>
                  <input type="date" [(ngModel)]="eventForm.event_date" />
                </div>
              </div>

              <div class="modal-grid-2">
                <div class="field-wrap">
                  <label>{{ translationService.t('event.guestsCount') }}</label>
                  <div class="guest-counter-input">
                    <button type="button" class="btn-step" (click)="eventForm.guest_count = Math.max(25, (eventForm.guest_count || 100) - 50)">-</button>
                    <input type="number" [(ngModel)]="eventForm.guest_count" min="25" max="5000" />
                    <button type="button" class="btn-step" (click)="eventForm.guest_count = (eventForm.guest_count || 100) + 50">+</button>
                  </div>
                </div>
                <div class="field-wrap">
                  <label>{{ translationService.t('event.cityPincode') }}</label>
                  <input 
                    type="text" 
                    [placeholder]="translationService.currentLang() === 'ta' ? 'திருக்கோவிலூர் - 607201' : 'Tirukoilur - 607201'" 
                  />
                </div>
              </div>

              <div class="field-wrap">
                <label>{{ translationService.t('dialog.venueAddress') }}</label>
                <textarea rows="2" [(ngModel)]="eventForm.venue" [placeholder]="translationService.currentLang() === 'ta' ? 'எ.கா. எண். 73, மந்தைக்காரத் தெரு, திருக்கோவிலூர் - 607201' : 'e.g. No. 73, Mandhaikaara Street, Tirukoilur - 607201'"></textarea>
              </div>

              <div class="modal-concierge-callout">
                <div class="callout-icon">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="#25D366">
                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2Z"/>
                  </svg>
                </div>
                <div class="callout-text">
                  <strong>{{ translationService.t('proposal.waTitle') }}</strong>
                  <p>{{ translationService.t('event.waConciergeText') }} <strong>+91 72998 87725</strong></p>
                </div>
                <a 
                  href="https://wa.me/917299887725?text=Namaste%20Thirumala%20Catering%20Service!%20I%20have%20questions%20regarding%20our%20celebration%20catering%20details." 
                  target="_blank" 
                  class="callout-wa-link"
                >
                  WhatsApp
                </a>
              </div>
            </div>

            <div class="event-modal-foot">
              <button type="button" class="btn-ghost" (click)="showEventModal.set(false)">{{ translationService.t('dialog.backToReview') }}</button>
              <button type="button" class="btn-save-event" (click)="saveEventDetails()">
                <span class="material-symbols-outlined">check_circle</span>
                <span>{{ translationService.t('event.saveBtn') }}</span>
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      position: sticky;
      top: 0;
      z-index: 10000;
      width: 100%;
    }

    .wf-editorial-header {
      background: #FAF8F5;
      border-bottom: 1px solid var(--border-hairline, #e5dec9);
      position: relative;
      z-index: 1000;
      box-shadow: 0 2px 8px rgba(91, 26, 36, 0.04);
    }

    .header-inner {
      max-width: 1440px;
      margin: 0 auto;
      padding: 0.75rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;

      @media (max-width: 768px) {
        padding: 0.55rem 0.75rem;
        gap: 0.4rem;
      }
      @media (max-width: 480px) {
        padding: 0.45rem 0.5rem;
        gap: 0.3rem;
      }
      @media (max-width: 375px) {
        padding: 0.4rem 0.35rem;
        gap: 0.2rem;
      }
    }

    .brand-link {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      text-decoration: none;
      min-width: 0;
      flex-shrink: 0;

      @media (max-width: 680px) {
        gap: 0.35rem;
        flex: 1 1 auto;
      }
      @media (max-width: 375px) {
        gap: 0.25rem;
      }

      .brand-crest {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        filter: drop-shadow(0 2px 4px rgba(91, 26, 36, 0.15));

        @media (max-width: 480px) {
          width: 28px;
          height: 28px;
          ::ng-deep .brand-logo-container,
          ::ng-deep svg {
            width: 28px !important;
            height: 28px !important;
          }
        }
      }

      .brand-typography {
        display: flex;
        flex-direction: column;
        justify-content: center;
        min-width: 0;
        overflow: visible;

        .brand-name {
          font-family: var(--font-serif);
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--primary-maroon);
          letter-spacing: 0.1px;
          line-height: 1.35;
          padding-top: 1px;
          padding-bottom: 4px;
          white-space: nowrap;

          @media (max-width: 680px) {
            font-size: 0.98rem;
            line-height: 1.35;
          }
          @media (max-width: 440px) {
            font-size: clamp(0.70rem, 3.15vw, 0.82rem);
            letter-spacing: -0.15px;
            padding-bottom: 3px;
          }
          @media (max-width: 375px) {
            font-size: clamp(0.66rem, 2.95vw, 0.74rem);
            letter-spacing: -0.25px;
            padding-bottom: 3px;
          }
        }

        .brand-sub {
          font-size: 0.7rem;
          color: var(--accent-gold-dark);
          letter-spacing: 0.8px;
          font-weight: 600;
          text-transform: uppercase;
          white-space: nowrap;

          @media (max-width: 680px) {
            display: none;
          }
        }
      }
    }

    .nav-center {
      display: flex;
      align-items: center;
      gap: 1.75rem;

      @media (max-width: 900px) {
        display: none;
      }

      a, .nav-btn-link {
        font-size: 0.88rem;
        font-weight: 600;
        color: var(--text-secondary);
        position: relative;
        padding: 0.35rem 0;
        text-decoration: none;
        background: transparent;
        border: none;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        transition: color 0.2s ease;
        font-family: var(--font-sans);

        .nav-icon {
          font-size: 17px;
          color: var(--accent-gold);
        }

        &:hover, &.active {
          color: var(--primary-maroon);

          &::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            right: 0;
            height: 2px;
            background: var(--accent-gold);
            border-radius: 2px;
          }
        }
      }
    }

    .nav-right {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-shrink: 0;

      @media (max-width: 680px) {
        gap: 0.35rem;
      }
      @media (max-width: 420px) {
        gap: 0.25rem;
      }

      .tray-link {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        background: #ffffff;
        border: 1px solid var(--border-gold);
        padding: 0.4rem 0.85rem;
        border-radius: 20px;
        text-decoration: none;
        transition: all 0.2s ease;

        @media (max-width: 680px) {
          display: none !important;
        }

        .tray-icon {
          font-size: 18px;
          color: var(--accent-gold-dark);
        }

        .tray-count {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--primary-maroon);
        }

        .tray-cost {
          background: var(--primary-maroon);
          color: #ffffff;
          padding: 0.15rem 0.5rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 700;

          @media (max-width: 680px) {
            display: none;
          }
        }

        &:hover {
          background: var(--primary-maroon-subtle);
          transform: translateY(-1px);
          box-shadow: 0 3px 8px rgba(91, 26, 36, 0.1);
        }
      }

      .studio-link {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.4rem 0.85rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-hairline);
        background: #ffffff;
        font-size: 0.82rem;
        font-weight: 600;
        color: var(--primary-maroon);
        text-decoration: none;
        transition: all 0.2s;

        &:hover {
          background: var(--primary-maroon-subtle);
          border-color: var(--primary-maroon);
        }

        .material-symbols-outlined {
          font-size: 18px;
        }

        @media (max-width: 680px) {
          display: none !important;
        }
      }

      .mobile-menu-btn {
        display: none;
        align-items: center;
        justify-content: center;
        width: 38px;
        height: 38px;
        border-radius: 6px;
        border: 1px solid var(--border-hairline);
        background: #ffffff;
        color: var(--primary-maroon);
        cursor: pointer;

        @media (max-width: 900px) {
          display: flex;
        }

        @media (max-width: 480px) {
          width: 34px;
          height: 34px;
        }

        .material-symbols-outlined {
          font-size: 22px;
          @media (max-width: 480px) {
            font-size: 20px;
          }
        }
      }
    }

    /* Mobile Drawer */
    .mobile-drawer-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(45, 9, 16, 0.72);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      z-index: 99998;
      animation: fadeIn 0.15s ease-out;
    }

    .mobile-drawer {
      position: fixed;
      right: 0;
      top: 0;
      bottom: 0;
      width: 300px;
      max-width: 86vw;
      height: 100vh;
      height: 100dvh;
      background: #FAF8F5;
      border-left: 2px solid var(--accent-gold, #c59b43);
      box-shadow: -6px 0 32px rgba(0, 0, 0, 0.4);
      display: flex;
      flex-direction: column;
      padding: 1.25rem;
      z-index: 99999;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      animation: slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1);

      .mobile-drawer-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 0.85rem;
        border-bottom: 1px solid var(--border-hairline);

        .drawer-title {
          font-family: var(--font-serif);
          font-weight: 700;
          color: var(--primary-maroon);
          font-size: 1.25rem;
        }

        .drawer-close {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #F3EFEA;
          border: 1px solid var(--border-hairline);
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          &:hover { color: var(--primary-maroon); background: #FAF8F5; }
        }
      }

      .mobile-nav-links {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-top: 1.25rem;
        overflow-y: auto;

        .drawer-lang-section {
          padding: 0.65rem 0.85rem;
          background: #F3EFEA;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-hairline);
          margin-bottom: 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;

          .drawer-section-label {
            font-size: 0.72rem;
            font-weight: 600;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
        }

        .mobile-nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          color: var(--text-primary);
          text-decoration: none;
          font-size: 0.94rem;
          font-weight: 600;
          background: #FFFFFF;
          border: 1px solid var(--border-hairline, #e5dec9);
          width: 100%;
          text-align: left;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(91, 26, 36, 0.04);
          transition: all 0.2s ease;

          .material-symbols-outlined {
            color: var(--accent-gold);
            font-size: 22px;
          }

          &:hover {
            background: #F7EFF1;
            border-color: var(--accent-gold);
            color: var(--primary-maroon);
          }

          &.admin {
            color: var(--primary-maroon);
            background: #FAF4E8;
            border-color: rgba(197, 155, 67, 0.4);
          }
        }

        .mobile-divider {
          height: 1px;
          background: var(--border-hairline);
          margin: 0.65rem 0;
        }

        .mobile-whatsapp-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem 1rem;
          border-radius: 12px;
          background: #25D366;
          color: #FFFFFF;
          text-decoration: none;
          font-size: 0.85rem;
          box-shadow: 0 4px 14px rgba(37, 211, 102, 0.35);
          transition: transform 0.15s ease;

          &:hover {
            transform: scale(1.02);
          }

          .wa-icon-box {
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .wa-txt {
            display: flex;
            flex-direction: column;
            line-height: 1.2;

            strong {
              font-size: 0.88rem;
              letter-spacing: 0.3px;
            }

            span {
              font-size: 0.7rem;
              opacity: 0.9;
            }
          }
        }
      }
    }

    /* Event Configurator Modal */
    .event-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(30, 8, 14, 0.78);
      backdrop-filter: blur(8px);
      z-index: 99999;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: 2.5rem 1rem 2rem;
      overflow-y: auto;
      box-sizing: border-box;
      animation: fadeIn 0.15s ease-out;
    }

    .event-modal-dialog {
      background: #FFFFFF;
      border: 1px solid var(--accent-gold, #c59b43);
      border-radius: var(--radius-lg, 16px);
      width: 100%;
      max-width: 580px;
      margin: auto;
      max-height: calc(100vh - 4rem);
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.45);
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
      z-index: 100000;

      .event-modal-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.25rem 1.5rem;
        background: #FAF8F5;
        border-bottom: 1px solid var(--border-hairline);

        .head-titles {
          .modal-subhead {
            font-size: 0.74rem;
            color: var(--accent-gold-dark);
            text-transform: uppercase;
            letter-spacing: 0.8px;
            font-weight: 700;
          }

          h3 {
            font-family: var(--font-serif);
            font-size: 1.35rem;
            font-weight: 700;
            color: var(--primary-maroon);
            margin-top: 0.15rem;
          }
        }

        .close-x-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          &:hover { color: var(--primary-maroon); }
        }
      }

      .event-modal-body {
        padding: 1.35rem 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        max-height: 70vh;
        overflow-y: auto;

        .modal-intro {
          font-size: 0.86rem;
          color: var(--text-secondary);
          line-height: 1.45;
          margin-bottom: 0.25rem;
        }

        .modal-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.85rem;

          @media (max-width: 500px) {
            grid-template-columns: 1fr;
          }
        }

        .field-wrap {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;

          label {
            font-size: 0.8rem;
            font-weight: 600;
            color: #4A3E39;
          }

          input, select, textarea {
            padding: 0.65rem 0.85rem;
            border-radius: 6px;
            border: 1px solid var(--border-hairline);
            background: #FAF8F5;
            font-size: 0.88rem;
            color: #2F0B12;
            outline: none;
            font-family: inherit;
            transition: all 0.2s;

            &:focus {
              border-color: var(--accent-gold);
              background: #FFFFFF;
              box-shadow: 0 0 0 3px rgba(197, 155, 67, 0.15);
            }
          }

          textarea {
            resize: vertical;
            min-height: 55px;
          }

          .guest-counter-input {
            display: flex;
            align-items: center;
            border: 1px solid var(--border-hairline);
            border-radius: 6px;
            background: #FAF8F5;
            overflow: hidden;

            input {
              flex: 1;
              border: none;
              border-radius: 0;
              text-align: center;
              font-weight: 700;
              color: var(--primary-maroon);
              font-size: 0.95rem;
            }

            .btn-step {
              width: 38px;
              height: 38px;
              border: none;
              background: #F3EFEA;
              color: var(--primary-maroon);
              font-size: 1.1rem;
              font-weight: 800;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;

              &:hover {
                background: #E5DEC9;
              }
            }
          }
        }
        .modal-concierge-callout {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          background: #F0FDF4;
          border: 1px solid #BBF7D0;
          border-radius: 10px;
          padding: 0.75rem 1rem;
          margin-top: 0.25rem;

          .callout-icon {
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .callout-text {
            flex: 1;
            display: flex;
            flex-direction: column;
            line-height: 1.25;

            strong {
              font-size: 0.82rem;
              color: #166534;
            }

            p {
              font-size: 0.74rem;
              color: #15803D;
              margin: 0;
            }
          }

          .callout-wa-link {
            padding: 0.35rem 0.85rem;
            border-radius: 16px;
            background: #25D366;
            color: #FFFFFF;
            font-size: 0.76rem;
            font-weight: 700;
            text-decoration: none;
            box-shadow: 0 2px 6px rgba(37, 211, 102, 0.3);
            white-space: nowrap;
            transition: transform 0.15s ease;

            &:hover {
              transform: scale(1.05);
            }
          }
        }
      }

      .event-modal-foot {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 0.75rem;
        padding: 1rem 1.5rem;
        background: #FAF8F5;
        border-top: 1px solid var(--border-hairline);

        .btn-ghost {
          padding: 0.55rem 1rem;
          border-radius: 6px;
          border: 1px solid var(--border-hairline);
          background: #FFFFFF;
          color: var(--primary-maroon);
          font-weight: 600;
          font-size: 0.86rem;
          cursor: pointer;
        }

        .btn-save-event {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.6rem 1.35rem;
          border-radius: 6px;
          border: none;
          background: var(--primary-maroon);
          color: #FAF8F5;
          font-weight: 700;
          font-size: 0.88rem;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;

          &:hover {
            background: var(--primary-maroon-hover, #421119);
            transform: translateY(-1px);
          }
        }
      }
    }

    /* Floating Mobile Cart FAB */
    .mobile-floating-cart-fab {
      display: none;

      @media (max-width: 680px) {
        display: flex;
        position: fixed;
        bottom: 1.5rem;
        right: 1.25rem;
        z-index: 9999;
        text-decoration: none;
        transform: translateZ(0);
        will-change: transform;
        animation: fabSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .fab-pill {
        display: inline-flex;
        align-items: center;
        gap: 0.65rem;
        background: linear-gradient(135deg, #5B1A24 0%, #3D0E16 100%);
        border: 1.5px solid #C59B43;
        border-radius: 30px;
        padding: 0.55rem 1rem 0.55rem 0.65rem;
        box-shadow: 0 8px 24px rgba(91, 26, 36, 0.45), 0 0 12px rgba(197, 155, 67, 0.25);
        color: #FAF8F5;
        transition: transform 0.2s ease, box-shadow 0.2s ease;

        &:active {
          transform: scale(0.96);
        }

        .fab-icon-box {
          position: relative;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(197, 155, 67, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;

          .fab-cart-icon {
            font-size: 20px;
            color: #EAD9B7;
          }

          .fab-badge {
            position: absolute;
            top: -4px;
            right: -4px;
            background: #C59B43;
            color: #2F0B12;
            font-size: 0.72rem;
            font-weight: 800;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1.5px solid #5B1A24;
          }
        }

        .fab-info {
          display: flex;
          flex-direction: column;
          line-height: 1.2;

          .fab-title {
            font-size: 0.78rem;
            font-weight: 700;
            color: #FAF8F5;
            letter-spacing: 0.3px;
          }

          .fab-amount {
            font-size: 0.85rem;
            font-weight: 800;
            color: #EAD9B7;
          }
        }

        .fab-arrow {
          font-size: 18px;
          color: #EAD9B7;
          margin-left: 0.2rem;
        }
      }
    }

    @keyframes fabSlideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideInRight {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }
  `]
})
export class NavbarComponent {
  selectionService = inject(SelectionService);
  authService = inject(AuthService);
  translationService = inject(TranslationService);
  toast = inject(ToastService);
  router = inject(Router);

  mobileMenuOpen = signal(false);
  showEventModal = signal(false);
  Math = Math;

  eventForm: Partial<WeddingEvent> = {};

  isReviewPage(): boolean {
    return this.router.url.includes('/menu-review');
  }

  isMenuPage(): boolean {
    return this.router.url === '/menu' || this.router.url.startsWith('/menu?');
  }

  openEventDetailsModal() {
    const current = this.selectionService.eventDetails();
    this.eventForm = {
      customer_name: current.customer_name,
      customer_phone: current.customer_phone,
      customer_email: current.customer_email,
      event_name: current.event_name,
      event_type: current.event_type,
      event_date: current.event_date,
      venue: current.venue,
      guest_count: current.guest_count
    };
    this.showEventModal.set(true);
  }

  saveEventDetails() {
    this.selectionService.setEventDetails(this.eventForm);
    this.toast.success('Celebration details updated! Live catering estimations refreshed.');
    this.showEventModal.set(false);
  }
}