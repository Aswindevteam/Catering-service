import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-brand-logo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="brand-logo-container" [style.width.px]="size" [style.height.px]="size">
      <svg
        viewBox="0 0 120 120"
        [attr.width]="size"
        [attr.height]="size"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="vishnu-crest"
      >
        <defs>
          <linearGradient id="blGoldLinear" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFF2A3"/>
            <stop offset="25%" stop-color="#E5BD68"/>
            <stop offset="60%" stop-color="#B8860B"/>
            <stop offset="100%" stop-color="#7A5600"/>
          </linearGradient>
          <linearGradient id="blRichGold" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#FCEABB"/>
            <stop offset="50%" stop-color="#DAA520"/>
            <stop offset="100%" stop-color="#996515"/>
          </linearGradient>
          <radialGradient id="blMaroonBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#54121E"/>
            <stop offset="70%" stop-color="#3A0812"/>
            <stop offset="100%" stop-color="#210309"/>
          </radialGradient>
          <linearGradient id="blVermilionGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#FF3B30"/>
            <stop offset="60%" stop-color="#D61A1A"/>
            <stop offset="100%" stop-color="#9E0B0B"/>
          </linearGradient>
          <filter id="blGoldGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="#FFD700" flood-opacity="0.3"/>
          </filter>
        </defs>

        <!-- Outer Medallion (Only if hasFrame is true) -->
        @if (hasFrame) {
          <circle cx="60" cy="60" r="57" fill="url(#blMaroonBg)"/>
          <circle cx="60" cy="60" r="56.5" stroke="url(#blGoldLinear)" stroke-width="2"/>
          <circle cx="60" cy="60" r="52.5" stroke="url(#blGoldLinear)" stroke-width="0.8" stroke-dasharray="2 2.5"/>
          
          <!-- Cardinal Ray Ornaments -->
          <g stroke="url(#blGoldLinear)" stroke-width="1.2" opacity="0.6">
            <line x1="60" y1="4" x2="60" y2="7"/>
            <line x1="60" y1="113" x2="60" y2="116"/>
            <line x1="4" y1="60" x2="7" y2="60"/>
            <line x1="113" y1="60" x2="116" y2="60"/>
          </g>
        }

        <!-- SHANKHA (Panchajanya Conch - Left) -->
        <g transform="translate(19, 28) scale(0.68)" filter="url(#blGoldGlow)">
          <!-- Jwala / Sacred Flames -->
          <path d="M18 4 C18 -2, 23 -6, 23 -6 C23 -6, 25 -1, 23 4 C28 0, 31 -3, 31 -3 C31 -3, 31 3, 27 7 Z" fill="url(#blRichGold)"/>
          <!-- Conch Body -->
          <path d="M12 18 C7 25, 6 36, 11 44 C16 52, 25 56, 28 58 C26 52, 24 45, 25 38 C26 31, 30 24, 32 18 C30 14, 25 12, 20 13 C16 14, 13 16, 12 18 Z" fill="#FFFFFF" stroke="url(#blRichGold)" stroke-width="1.2"/>
          <!-- Spirals & Details -->
          <path d="M20 13 C22 17, 24 23, 23 30 C22 37, 18 43, 23 48 C25 50, 27 52, 28 58" fill="none" stroke="url(#blRichGold)" stroke-width="1.2"/>
          <path d="M16 23 C18 26, 19 32, 17 38" fill="none" stroke="url(#blRichGold)" stroke-width="0.8"/>
          <!-- Spout Tip -->
          <path d="M28 58 L29 64 L26 61 Z" fill="url(#blRichGold)"/>
        </g>

        <!-- CHAKRA (Sudarshana Wheel - Right) -->
        <g transform="translate(67, 28) scale(0.68)" filter="url(#blGoldGlow)">
          <!-- Jwala / Sacred Flames -->
          <path d="M21 4 C21 -2, 26 -6, 26 -6 C26 -6, 28 -1, 26 4 C31 0, 34 -3, 34 -3 C34 -3, 34 3, 30 7 Z" fill="url(#blRichGold)"/>
          <!-- Outer Blazing Wheel -->
          <circle cx="26" cy="33" r="19" fill="url(#blMaroonBg)" stroke="url(#blRichGold)" stroke-width="2"/>
          <!-- Radiating Flame Spokes -->
          <path d="M26 14 L26 52 M7 33 L45 33 M13 20 L39 46 M13 46 L39 20" stroke="url(#blRichGold)" stroke-width="1.2"/>
          <!-- Inner Hub & Rings -->
          <circle cx="26" cy="33" r="10" fill="none" stroke="url(#blRichGold)" stroke-width="1"/>
          <circle cx="26" cy="33" r="4.5" fill="url(#blRichGold)"/>
          <!-- 8 Outer Rim Teeth -->
          <path d="M26 12 L28 8 L24 8 Z M45 27 L49 29 L47 33 Z M40 47 L44 50 L41 53 Z M26 54 L24 58 L28 58 Z M7 39 L3 37 L5 33 Z M12 19 L8 16 L11 13 Z" fill="url(#blRichGold)"/>
        </g>

        <!-- SACRED THIRUNAMAM (Urdhva Pundra - Center) -->
        <g filter="url(#blGoldGlow)">
          <!-- Left White Wing (Sacred Lotus Feet of Lord Vishnu) -->
          <path d="M46 25 C45 34, 46 48, 52 64 C53 66, 54 68, 55 70 L58 70 C56 66, 53 58, 51 46 C49.5 36, 50.5 28, 52 25 Z" fill="#FFFFFF" stroke="url(#blRichGold)" stroke-width="0.8"/>
          <!-- Right White Wing -->
          <path d="M74 25 C75 34, 74 48, 68 64 C67 66, 66 68, 65 70 L62 70 C64 66, 67 58, 69 46 C70.5 36, 69.5 28, 68 25 Z" fill="#FFFFFF" stroke="url(#blRichGold)" stroke-width="0.8"/>
          <!-- Pedestal / Paduka Base -->
          <path d="M55 70 C55 73, 58 76, 60 78 C62 76, 65 73, 65 70 Z" fill="#FFFFFF" stroke="url(#blRichGold)" stroke-width="0.8"/>

          <!-- Central Srichoornam (Vermilion Red Streak - Goddess Lakshmi) -->
          <path d="M59 20 C58.5 22, 58.5 30, 58.8 45 C59 55, 59.2 64, 59.5 73 L60.5 73 C60.8 64, 61 55, 61.2 45 C61.5 30, 61.5 22, 61 20 Z" fill="url(#blVermilionGrad)"/>
          <!-- Top Vermilion Bindu Diamond -->
          <path d="M60 16 L61.5 19 L60 21 L58.5 19 Z" fill="url(#blVermilionGrad)"/>
          <!-- Radiant Gold Jewel at crest -->
          <circle cx="60" cy="16" r="1.2" fill="#FFE082"/>
        </g>

        <!-- BASE LOTUS (Padma - Auspicious Throne of Abundance) -->
        <g fill="url(#blRichGold)" stroke="#664600" stroke-width="0.5" opacity="0.95">
          <!-- Center Petal -->
          <path d="M60 84 C56 89, 56 94, 60 97 C64 94, 64 89, 60 84 Z"/>
          <!-- Left Inner Petal -->
          <path d="M53 85 C48 89, 47 94, 52 97 C55 95, 56 90, 53 85 Z"/>
          <!-- Right Inner Petal -->
          <path d="M67 85 C72 89, 73 94, 68 97 C65 95, 64 90, 67 85 Z"/>
          <!-- Left Outer Petal -->
          <path d="M46 87 C40 91, 39 95, 45 97 C48 95, 49 91, 46 87 Z"/>
          <!-- Right Outer Petal -->
          <path d="M74 87 C80 91, 81 95, 75 97 C72 95, 71 91, 74 87 Z"/>
        </g>
      </svg>
    </div>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .brand-logo-container {
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 0;
      flex-shrink: 0;
    }
    .vishnu-crest {
      display: block;
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.3s ease;
      filter: drop-shadow(0 2px 6px rgba(66, 17, 25, 0.22));

      &:hover {
        transform: scale(1.06) rotate(1deg);
        filter: drop-shadow(0 4px 12px rgba(197, 155, 67, 0.45));
      }
    }
  `]
})
export class BrandLogoComponent {
  @Input() size = 36;
  @Input() hasFrame = true;
}
