import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast-item" [ngClass]="toast.type">
          <div class="icon">
            @if (toast.type === 'success') {
              <span class="material-symbols-outlined">check_circle</span>
            } @else if (toast.type === 'error') {
              <span class="material-symbols-outlined">error</span>
            } @else {
              <span class="material-symbols-outlined">info</span>
            }
          </div>
          <div class="message">{{ toast.message }}</div>
          <button type="button" class="close-btn" (click)="toastService.remove(toast.id)" aria-label="Close notification">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 5rem; /* Safely below the 64px sticky header */
      right: 1.5rem;
      z-index: 999999; /* Safely above sticky navbar (10000) and modals (9999) */
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      max-width: 380px;
      pointer-events: none;

      @media (max-width: 680px) {
        top: 4.5rem;
        left: 1rem;
        right: 1rem;
        max-width: calc(100vw - 2rem);
      }
    }

    .toast-item {
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.85rem 1.15rem;
      border-radius: 12px;
      background: #FFFFFF;
      box-shadow: 0 10px 30px rgba(91, 26, 36, 0.18), 0 2px 8px rgba(0, 0, 0, 0.06);
      border: 1px solid var(--border-hairline, #E5DEC9);
      border-left: 5px solid var(--accent-gold, #C59B43);
      animation: slideInToast 0.28s cubic-bezier(0.16, 1, 0.3, 1);

      .icon {
        display: flex;
        align-items: center;
        flex-shrink: 0;

        .material-symbols-outlined {
          font-size: 22px;
        }
      }

      .message {
        flex: 1;
        font-size: 0.88rem;
        font-weight: 600;
        color: var(--primary-maroon, #5B1A24);
        line-height: 1.35;
      }

      .close-btn {
        color: var(--text-muted, #8C7F83);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.2rem;
        border-radius: 50%;
        background: transparent;
        border: none;
        cursor: pointer;
        flex-shrink: 0;
        transition: all 0.15s ease;

        &:hover {
          color: var(--primary-maroon, #5B1A24);
          background: rgba(91, 26, 36, 0.08);
        }

        .material-symbols-outlined {
          font-size: 18px;
        }
      }

      &.success {
        border-left-color: var(--veg-green, #247530);
        .icon { color: var(--veg-green, #247530); }
      }

      &.error {
        border-left-color: var(--nonveg-red, #BA1A1A);
        .icon { color: var(--nonveg-red, #BA1A1A); }
      }

      &.info {
        border-left-color: var(--accent-gold, #C59B43);
        .icon { color: var(--accent-gold-dark, #9E7626); }
      }
    }

    @keyframes slideInToast {
      from {
        transform: translateY(-16px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}
