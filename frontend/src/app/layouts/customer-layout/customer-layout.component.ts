import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-customer-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  template: `
    <div class="customer-app-wrapper">
      <app-navbar></app-navbar>
      <main class="customer-main-content">
        <router-outlet></router-outlet>
      </main>

      <footer class="customer-footer">
        <div class="footer-inner">
          <div class="footer-grid">
            <div class="footer-brand">
              <h3>Wedding Feast</h3>
              <p>Royal Wedding Catering, Heirloom Cuisine & Real-Time Estimation Platform.</p>
              <div class="footer-address">
                <span class="material-symbols-outlined addr-icon">location_on</span>
                <span><strong>Culinary Headquarters & Catering Contact:</strong><br/>Manikandan, Aalur, Thirukoilur Taluk, Kallakurichi Dt, 605751, Tamil Nadu</span>
              </div>
            </div>

            <div class="footer-concierge-card">
              <h4>Direct Catering Concierge</h4>
              <p>Have custom menu queries, tasting session requests, or live counter suggestions?</p>
              <div class="concierge-actions">
                <a 
                  href="https://wa.me/919876543210?text=Namaste%20Wedding%20Feast!%20I%20would%20like%20to%20inquire%20about%20wedding%20catering%20arrangements." 
                  target="_blank" 
                  class="footer-wa-btn"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="#FFFFFF">
                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2Z"/>
                  </svg>
                  <span>Chat on WhatsApp (+91 98765 43210)</span>
                </a>
                <span class="concierge-time">Available 7 Days • 9:00 AM – 10:00 PM IST</span>
              </div>
            </div>

            <div class="footer-nav-col">
              <h4>Platform Navigation</h4>
              <div class="footer-links">
                <a routerLink="/menu">Curate Wedding Feast</a>
                <a routerLink="/menu-review">Review Feast Estimation</a>
                <a routerLink="/admin/login">Admin Culinary Studio</a>
              </div>
            </div>
          </div>

          <div class="footer-bottom">
            <span>&copy; 2026 Wedding Feast Platform. Built on Cloudflare Workers, Cloudflare D1 & R2 Object Storage.</span>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .customer-app-wrapper {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: 
        radial-gradient(circle at 10% 15%, rgba(197, 155, 67, 0.06) 0%, transparent 45%),
        radial-gradient(circle at 90% 75%, rgba(91, 26, 36, 0.05) 0%, transparent 45%),
        linear-gradient(180deg, rgba(250, 248, 245, 0.93) 0%, rgba(246, 241, 234, 0.96) 50%, rgba(250, 248, 245, 0.95) 100%),
        url('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1920&q=80') center top / cover no-repeat fixed;
    }

    .customer-main-content {
      flex: 1;
    }

    .customer-footer {
      background: #23060d;
      color: #ebdcd5;
      padding: 3.5rem 1.5rem 2rem;
      border-top: 2px solid var(--accent-gold, #c59b43);
      position: relative;
      z-index: 10;

      .footer-inner {
        max-width: 1320px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 2.5rem;

        .footer-grid {
          display: grid;
          grid-template-columns: 1.2fr 1.2fr 0.8fr;
          gap: 2.5rem;
          text-align: left;

          @media (max-width: 900px) {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }

        .footer-brand {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;

          h3 {
            font-family: var(--font-display, 'Cinzel', serif);
            font-size: 1.5rem;
            color: #f4d068;
            letter-spacing: 1px;
          }

          p {
            font-size: 0.88rem;
            color: rgba(255, 255, 255, 0.75);
            line-height: 1.5;
            margin: 0;
          }

          .footer-address {
            display: flex;
            align-items: flex-start;
            gap: 0.5rem;
            font-size: 0.82rem;
            color: rgba(255, 255, 255, 0.8);
            line-height: 1.45;
            margin-top: 0.5rem;

            .addr-icon {
              font-size: 18px;
              color: var(--accent-gold, #c59b43);
              margin-top: 2px;
            }
          }
        }

        .footer-concierge-card {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(197, 155, 67, 0.3);
          border-radius: 12px;
          padding: 1.25rem;

          h4 {
            font-family: var(--font-serif);
            font-size: 1.1rem;
            color: #FAF8F5;
            margin: 0;
          }

          p {
            font-size: 0.82rem;
            color: rgba(255, 255, 255, 0.7);
            margin: 0;
            line-height: 1.4;
          }

          .concierge-actions {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            margin-top: 0.35rem;

            .footer-wa-btn {
              display: inline-flex;
              align-items: center;
              gap: 0.5rem;
              padding: 0.65rem 1.15rem;
              border-radius: 8px;
              background: #25D366;
              color: #FFFFFF;
              font-size: 0.84rem;
              font-weight: 700;
              text-decoration: none;
              box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
              transition: transform 0.15s ease;
              width: fit-content;

              &:hover {
                transform: translateY(-2px);
              }
            }

            .concierge-time {
              font-size: 0.72rem;
              color: rgba(255, 255, 255, 0.5);
            }
          }
        }

        .footer-nav-col {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;

          h4 {
            font-family: var(--font-serif);
            font-size: 1.05rem;
            color: #FAF8F5;
            margin: 0;
          }

          .footer-links {
            display: flex;
            flex-direction: column;
            gap: 0.65rem;

            a {
              font-size: 0.86rem;
              font-weight: 600;
              color: rgba(255, 255, 255, 0.8);
              transition: color 0.2s;

              &:hover {
                color: var(--accent-gold, #c59b43);
              }
            }
          }
        }

        .footer-bottom {
          font-size: 0.76rem;
          color: rgba(255, 255, 255, 0.5);
          border-top: 1px solid rgba(244, 208, 104, 0.18);
          width: 100%;
          padding-top: 1.5rem;
          text-align: center;
        }
      }
    }
  `]
})
export class CustomerLayoutComponent {}
