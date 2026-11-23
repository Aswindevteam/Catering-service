import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService, SUPPORTED_LANGS, SupportedLang } from '../../../core/services/translation.service';

@Component({
  selector: 'app-language-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="lang-selector-bar">
      <span class="material-symbols-outlined lang-icon">translate</span>
      <div class="lang-options desktop-langs">
        @for (lang of supportedLangs; track lang.code) {
          <button 
            type="button" 
            class="lang-btn" 
            [class.active]="translationService.currentLang() === lang.code"
            (click)="translationService.setLanguage(lang.code)"
            [title]="lang.label"
          >
            {{ lang.native }}
          </button>
        }
      </div>

      <!-- Mobile compact select to prevent navbar horizontal blowout -->
      <select 
        class="lang-select-mobile" 
        [value]="translationService.currentLang()"
        (change)="onMobileLangChange($event)"
        aria-label="Select language"
      >
        @for (lang of supportedLangs; track lang.code) {
          <option [value]="lang.code">{{ lang.native }}</option>
        }
      </select>
    </div>
  `,
  styles: [`
    .lang-selector-bar {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      background: rgba(255, 255, 255, 0.85);
      border: 1px solid var(--border-gold, #dfc17b);
      padding: 0.25rem 0.5rem;
      border-radius: 20px;
      backdrop-filter: blur(8px);
      box-shadow: 0 2px 6px rgba(91, 26, 36, 0.05);

      .lang-icon {
        font-size: 16px;
        color: var(--accent-gold-dark, #a87922);
      }

      .lang-options {
        display: flex;
        align-items: center;
        gap: 0.25rem;

        .lang-btn {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary, #6e6467);
          padding: 0.2rem 0.5rem;
          border-radius: 12px;
          border: none;
          background: transparent;
          cursor: pointer;
          transition: all 0.2s ease;

          &:hover {
            color: var(--primary-maroon, #5b1a24);
            background: rgba(197, 155, 67, 0.15);
          }

          &.active {
            background: var(--primary-maroon, #5b1a24);
            color: #ffffff;
            font-weight: 700;
            box-shadow: 0 2px 4px rgba(91, 26, 36, 0.2);
          }
        }
      }

      .lang-select-mobile {
        display: none;
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        font-size: 0.76rem;
        font-weight: 700;
        color: var(--primary-maroon, #5b1a24);
        outline: none;
        cursor: pointer;
        padding: 0 !important;
        width: auto !important;
        min-width: 0 !important;
        background-image: none !important;
      }

      @media (max-width: 720px) {
        padding: 0.2rem 0.45rem;
        gap: 0.2rem;

        .desktop-langs {
          display: none !important;
        }
        .lang-select-mobile {
          display: block !important;
          font-size: 0.74rem;
          max-width: 58px;
        }
      }
    }
  `]
})
export class LanguagePickerComponent {
  translationService = inject(TranslationService);
  supportedLangs = SUPPORTED_LANGS;

  onMobileLangChange(event: Event) {
    const val = (event.target as HTMLSelectElement).value as SupportedLang;
    if (val) {
      this.translationService.setLanguage(val);
    }
  }
}
