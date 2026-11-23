import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { SelectionService } from '../../../core/services/selection.service';
import { TranslationService } from '../../../core/services/translation.service';
import { ToastService } from '../../../core/services/toast.service';
import { CustomerSelection, WeddingEvent } from '../../../core/models';

@Component({
  selector: 'app-menu-review',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="editorial-proposal-page">
      <!-- Back Link & Top Metadata matching Figma Screen 02 -->
      <div class="proposal-header-block">
        <div class="header-titles">
          <a routerLink="/menu" class="back-link">
            <span class="material-symbols-outlined">arrow_back</span>
            <span>{{ translationService.t('nav.browseMenu') }}</span>
          </a>
          <h1 class="serif-main-title">{{ translationService.t('proposal.title') }}</h1>
          <div class="itinerary-meta-pill">
            <span>{{ selectionService.eventDetails().event_name }}</span>
            <span class="dot">&bull;</span>
            <span>{{ selectionService.eventDetails().event_date }}</span>
            <span class="dot">&bull;</span>
            <span>{{ selectionService.eventDetails().guest_count }} {{ translationService.t('unit.guests') }}</span>
          </div>
          <p class="proposal-lead-text">{{ translationService.t('proposal.lead') }}</p>
        </div>

        <!-- 3D Toggle: Digital Estimate vs 3D Printed Wedding Menu Card -->
        <div class="view-mode-toggle">
          <button 
            type="button" 
            class="toggle-pill-btn" 
            [class.active]="viewMode() === 'estimate'"
            (click)="viewMode.set('estimate')"
          >
            <span class="material-symbols-outlined">receipt_long</span>
            <span>{{ translationService.t('proposal.viewEstimate') }}</span>
          </button>
          <button 
            type="button" 
            class="toggle-pill-btn" 
            [class.active]="viewMode() === 'card3d'"
            (click)="viewMode.set('card3d')"
          >
            <span class="material-symbols-outlined">view_in_ar</span>
            <span>{{ translationService.t('proposal.viewCard3D') }}</span>
          </button>
        </div>
      </div>

      @if (selectionService.selectedDishes().size === 0) {
        <div class="empty-tray-card">
          <span class="material-symbols-outlined empty-icon">restaurant_menu</span>
          <h3>No dishes selected yet</h3>
          <p>Please return to our menu curation and select your favorite royal feast items.</p>
          <a routerLink="/menu" class="wf-btn primary">Curate Menu Now</a>
        </div>
      } @else {
        <!-- 3D Printed Menu Card Mode -->
        @if (viewMode() === 'card3d') {
          <div class="card3d-showcase-container perspective-container">
            <div class="foil-menu-card gold-foil-card platter-3d-wrap">
              <div class="foil-inner-border">
                <div class="card-wedding-crest">
                  <span class="material-symbols-outlined crest-symbol">stars</span>
                  <h2>Wedding Feast Menu</h2>
                  <span class="couple-celebration">{{ selectionService.eventDetails().customer_name }}</span>
                  <span class="venue-date">{{ selectionService.eventDetails().venue }} &bull; {{ selectionService.eventDetails().event_date }}</span>
                </div>

                <div class="menu-divider-floral">✦ ✦ ✦</div>

                <div class="card-courses-columns">
                  @for (group of groupedDishes(); track group.categoryName) {
                    <div class="card-course-block">
                      <h4 class="card-course-heading">{{ group.categoryName }}</h4>
                      <div class="card-dish-items">
                        @for (item of group.items; track item.dish.id) {
                          <div class="card-dish-line">
                            <span class="line-name">{{ item.dish.name }}</span>
                            <span class="line-portion">({{ item.quantity_per_person }} {{ item.dish.serving_unit }})</span>
                          </div>
                        }
                      </div>
                    </div>
                  }
                </div>

                <div class="card-footer-quote">
                  <p>"May this celebration of culinary mastery nourish eternal love and joy."</p>
                </div>
              </div>
            </div>
          </div>
        }

        <!-- 2-Column Asymmetric Layout (65% Left / 35% Right) matching Figma Screen 02 -->
        <div class="proposal-columns-layout" [class.hidden-on-card]="viewMode() === 'card3d'">
          <!-- Left 65% Column: Bespoke Menu Itinerary -->
          <div class="left-itinerary-col">
            <div class="itinerary-list">
              @for (item of selectedDishesList(); track item.dish.id) {
                <div class="itinerary-row">
                  <!-- Circular Thumbnail Photo -->
                  <div class="circular-dish-visual">
                    <img 
                      [src]="item.dish.primary_image_url || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=250&q=80'" 
                      [alt]="item.dish.name" 
                    />
                  </div>

                  <!-- Tasting Notes & Quantity -->
                  <div class="itinerary-info">
                    <div class="row-top">
                      <h3 class="itinerary-dish-name">{{ item.dish.name }}</h3>
                      <span class="course-chip">{{ item.dish.category_name || 'Course' }}</span>
                    </div>

                    <p class="itinerary-tasting-notes">
                      Tasting Notes: {{ item.dish.description || 'Authentic traditional recipe cooked with pure ghee, slow simmered to perfection.' }}
                    </p>

                    <div class="itinerary-calculations-bar">
                      <div class="calc-portion">
                        <span class="calc-dim">Portion per Guest:</span>
                        <strong>{{ item.quantity_per_person }} {{ item.dish.serving_unit }}</strong>
                      </div>
                      <div class="calc-prep">
                        <span class="calc-dim">{{ translationService.t('proposal.totalPrep') }}:</span>
                        <strong class="gold-qty">{{ formatBulkKitchenQuantity(item.quantity_per_person, item.dish.serving_unit) }}</strong>
                      </div>
                      <div class="calc-cost">
                        <span class="calc-dim">Cost ({{ selectionService.eventDetails().guest_count }} Guests):</span>
                        <strong class="maroon-cost">₹{{ getItemCost(item).toLocaleString('en-IN') }}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>

            <!-- Dietary Instructions Box -->
            <div class="dietary-notes-box">
              <div class="box-head">
                <span class="material-symbols-outlined">edit_note</span>
                <h4>Special Culinary Instructions</h4>
              </div>
              <textarea 
                [(ngModel)]="specialRequests" 
                rows="3" 
                placeholder="Mention specific spice requirements, Jain portions, live counter arrangements or custom dietary requirements..."
              ></textarea>
            </div>
          </div>

          <!-- Right 35% Sticky Column: Deep-Maroon "Your Estimation" Card matching Figma Screen 02 -->
          <aside class="right-estimation-col">
            <div class="sticky-estimation-receipt">
              <div class="receipt-inner-frame">
                <!-- Receipt Crest -->
                <div class="receipt-crest">
                  <span class="material-symbols-outlined crest-icon">celebration</span>
                  <span class="brand-sub-title">Wedding Feast</span>
                  <h3>Your Estimation</h3>
                </div>

                <!-- Financial Rows matching Figma Screen 02 -->
                @if (selectionService.calculation(); as calc) {
                  <div class="receipt-rows-group">
                    <div class="receipt-line">
                      <span class="label">{{ translationService.t('calc.subtotal') }}</span>
                      <span class="val">₹{{ (calc.subtotal / 100).toLocaleString('en-IN') }}</span>
                    </div>

                    @if (calc.service_charge_enabled) {
                      <div class="receipt-line">
                        <span class="label">{{ translationService.t('calc.serviceCharges') }}</span>
                        <span class="val">₹{{ (calc.service_charge / 100).toLocaleString('en-IN') }}</span>
                      </div>
                    }

                    @if (calc.transportation_enabled) {
                      <div class="receipt-line">
                        <span class="label">{{ translationService.t('calc.transportation') }}</span>
                        <span class="val">₹{{ (calc.transportation_charge / 100).toLocaleString('en-IN') }}</span>
                      </div>
                    }

                    @if (calc.gst_enabled) {
                      <div class="receipt-line">
                        <span class="label">{{ translationService.t('calc.gst') }} ({{ calc.gst_rate }}%)</span>
                        <span class="val">₹{{ (calc.gst_amount / 100).toLocaleString('en-IN') }}</span>
                      </div>
                    }

                    <!-- Brushed Gold Grand Total Highlight Card matching Figma Screen 02 -->
                    <div class="brushed-gold-total-card">
                      <div class="total-label-row">
                        <span class="gt-word">{{ translationService.t('calc.grandTotal') }}:</span>
                        <strong class="gt-figure">₹{{ (calc.grand_total / 100).toLocaleString('en-IN') }}</strong>
                      </div>
                      <div class="per-guest-callout">
                        (₹{{ (calc.cost_per_guest / 100).toFixed(0) }} / {{ translationService.t('unit.guest') }})
                      </div>
                    </div>
                  </div>

                  <!-- Actions matching Figma Screen 02 -->
                  <div class="receipt-actions-block">
                    <span class="interactive-action-sub">Interactive Primary Action</span>
                    <button type="button" class="action-btn pdf-btn" (click)="printProposal()">
                      <span class="material-symbols-outlined">download</span>
                      <span>{{ translationService.t('action.downloadPdf') }}</span>
                    </button>

                    <button 
                      type="button" 
                      class="action-btn confirm-feast-btn" 
                      [disabled]="submitting()"
                      (click)="openConfirmFeastModal()"
                    >
                      <span>{{ translationService.t('action.confirmFeast') }}</span>
                    </button>
                  </div>

                  <!-- Direct WhatsApp Concierge & Inquiry Card -->
                  <div class="whatsapp-inquiry-card">
                    <div class="wa-card-header">
                      <span class="wa-icon-glow">
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="#25D366">
                          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2Z"/>
                        </svg>
                      </span>
                      <div class="wa-title-wrap">
                        <strong>Have Queries or Suggestions?</strong>
                        <span>Chat directly with Banquet Concierge</span>
                      </div>
                    </div>
                    <p class="wa-desc">
                      Need live counters, custom heirloom recipes, or dietary accommodations? Connect on WhatsApp.
                    </p>
                    <a [href]="getWhatsAppConciergeUrl()" target="_blank" class="btn-wa-direct">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="#FFFFFF">
                        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2Z"/>
                      </svg>
                      <span>Chat on WhatsApp (+91 98765 43210)</span>
                    </a>
                  </div>
                }
              </div>
            </div>
          </aside>
        </div>
      }

      <!-- Contact Details & Delivery Address Confirmation Modal -->
      @if (showContactModal()) {
        <div class="modal-backdrop" (click)="showContactModal.set(false)">
          <div class="contact-confirm-dialog" (click)="$event.stopPropagation()">
            <div class="dialog-header">
              <div class="dialog-titles">
                <span class="sub-crest">✦ Regal Feast Catering Reservation ✦</span>
                <h3>Provide Contact & Banquet Venue Address</h3>
              </div>
              <button type="button" class="close-x" (click)="showContactModal.set(false)" aria-label="Close modal">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <div class="dialog-body">
              <p class="dialog-intro">
                Please confirm your contact details and banquet venue address so our catering service fleet and culinary team can coordinate your feast flawlessly.
              </p>

              <div class="form-grid-2">
                <div class="form-group">
                  <label>Customer / Host Full Name *</label>
                  <input type="text" [(ngModel)]="bookingForm.customer_name" placeholder="e.g. Radhika Sharma & Arjun Nair" />
                </div>
                <div class="form-group">
                  <label>Contact Phone Number *</label>
                  <input type="text" [(ngModel)]="bookingForm.customer_phone" placeholder="+91 98765 43210" />
                </div>
              </div>

              <div class="form-grid-2">
                <div class="form-group">
                  <label>Email Address</label>
                  <input type="email" [(ngModel)]="bookingForm.customer_email" placeholder="radhika.arjun@wedding.com" />
                </div>
                <div class="form-group">
                  <label>Celebration Event Type</label>
                  <input type="text" [(ngModel)]="bookingForm.event_type" placeholder="Wedding Reception" />
                </div>
              </div>

              <div class="form-grid-2">
                <div class="form-group">
                  <label>Event Date</label>
                  <input type="date" [(ngModel)]="bookingForm.event_date" />
                </div>
                <div class="form-group">
                  <label>Guest Count</label>
                  <input type="number" [(ngModel)]="bookingForm.guest_count" min="25" />
                </div>
              </div>

              <div class="form-group">
                <label>Banquet Venue & Full Delivery Street Address *</label>
                <textarea rows="2" [(ngModel)]="bookingForm.venue" placeholder="e.g. Manikandan, Aalur, Thirukoilur Taluk, Kallakurichi Dt, 605751, Tamil Nadu"></textarea>
              </div>

              <div class="form-group">
                <label>Special Culinary Requests / Dietary Notes (Optional)</label>
                <textarea rows="2" [(ngModel)]="bookingForm.notes" placeholder="e.g. Provide 20 Jain portions, serve welcome drinks in brass glasses..."></textarea>
              </div>
            </div>

            <div class="dialog-footer">
              <button type="button" class="btn-cancel" (click)="showContactModal.set(false)">Back to Review</button>
              <button 
                type="button" 
                class="btn-submit-booking" 
                [disabled]="submitting() || !bookingForm.customer_name || !bookingForm.customer_phone || !bookingForm.venue"
                (click)="submitFinalFeastBooking()"
              >
                @if (submitting()) {
                  <span class="material-symbols-outlined spin">progress_activity</span>
                  <span>Confirming Feast...</span>
                } @else {
                  <span class="material-symbols-outlined">check_circle</span>
                  <span>Confirm & Lock Feast Booking</span>
                }
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Confirmation Success Modal -->
      @if (confirmedSelection()) {
        <div class="modal-backdrop">
          <div class="success-card">
            <div class="success-crest">
              <span class="material-symbols-outlined">verified</span>
            </div>
            <h2>Regal Feast Reserved</h2>
            <p>Your wedding catering order has been registered in the database with reference ID:</p>
            <div class="booking-id-box">{{ confirmedSelection()?.id }}</div>

            <div class="booking-summary-box">
              <div class="summary-line">
                <span class="lbl">Host:</span>
                <strong>{{ bookingForm.customer_name }}</strong>
              </div>
              <div class="summary-line">
                <span class="lbl">Guests:</span>
                <strong>{{ bookingForm.guest_count }} Guests</strong>
              </div>
              <div class="summary-line">
                <span class="lbl">Venue:</span>
                <span>{{ bookingForm.venue }}</span>
              </div>
            </div>

            <div class="modal-buttons">
              <a [href]="getWhatsAppSuccessUrl()" target="_blank" class="btn-wa-success">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="#FFFFFF">
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2Z"/>
                </svg>
                <span>Notify Concierge on WhatsApp</span>
              </a>
              <button class="wf-btn secondary" (click)="confirmedSelection.set(null)" routerLink="/menu">Curate Another Feast</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .editorial-proposal-page {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem 2rem 5rem;
      display: flex;
      flex-direction: column;
      gap: 2rem;

      @media (max-width: 768px) {
        padding: 1rem 0.85rem 5rem;
        gap: 1.25rem;
      }
    }

    .proposal-header-block {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 2rem;
      border-bottom: 1px solid var(--border-hairline);
      padding-bottom: 1.5rem;
      flex-wrap: wrap;

      .header-titles {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--primary-maroon);
          margin-bottom: 0.25rem;

          .material-symbols-outlined { font-size: 16px; }
          &:hover { text-decoration: underline; }
        }

        .serif-main-title {
          font-family: var(--font-serif);
          font-size: 2.2rem;
          font-weight: 700;
          color: var(--primary-maroon);
        }

        .itinerary-meta-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--accent-gold-dark);

          .dot { color: var(--border-gold); }
        }

        .proposal-lead-text {
          font-size: 0.95rem;
          color: var(--text-secondary);
          margin-top: 0.25rem;
        }
      }

      .view-mode-toggle {
        display: flex;
        background: #ffffff;
        border: 1px solid var(--border-hairline);
        border-radius: 24px;
        padding: 0.25rem;
        box-shadow: 0 2px 6px rgba(91, 26, 36, 0.04);

        .toggle-pill-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.45rem 1rem;
          border-radius: 20px;
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--text-secondary);
          transition: all 0.2s ease;

          .material-symbols-outlined { font-size: 18px; }

          &.active {
            background: var(--primary-maroon);
            color: #ffffff;
            box-shadow: 0 2px 8px rgba(91, 26, 36, 0.2);
          }
        }
      }
    }

    /* 2-Column Asymmetric Layout (65% / 35%) matching Figma Screen 02 */
    .proposal-columns-layout {
      display: grid;
      grid-template-columns: 65% 35%;
      gap: 2.5rem;
      align-items: start;

      @media (max-width: 1024px) {
        grid-template-columns: 1fr;
      }
    }

    /* Left Itinerary Column */
    .left-itinerary-col {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .itinerary-list {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .itinerary-row {
      display: flex;
      align-items: center;
      gap: 1.75rem;
      background: #ffffff;
      border: 1px solid var(--border-hairline);
      border-radius: var(--radius-lg);
      padding: 1.25rem 1.5rem;
      box-shadow: var(--shadow-hairline);
      transition: all 0.25s ease;

      @media (max-width: 680px) {
        flex-direction: column;
        align-items: flex-start;
      }

      &:hover {
        border-color: var(--border-champagne);
        box-shadow: var(--shadow-editorial);
      }

      .circular-dish-visual {
        width: 100px;
        height: 100px;
        min-width: 100px;
        border-radius: 50%;
        overflow: hidden;
        border: 2px solid #ffffff;
        box-shadow: 0 4px 14px rgba(91, 26, 36, 0.16);

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .itinerary-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.45rem;

        .row-top {
          display: flex;
          align-items: center;
          justify-content: space-between;

          .itinerary-dish-name {
            font-family: var(--font-serif);
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--text-primary);
          }

          .course-chip {
            font-size: 0.72rem;
            font-weight: 700;
            color: var(--primary-maroon);
            background: var(--primary-maroon-subtle);
            padding: 0.2rem 0.55rem;
            border-radius: 12px;
          }
        }

        .itinerary-tasting-notes {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.45;
        }

        .itinerary-calculations-bar {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-top: 0.35rem;
          padding-top: 0.5rem;
          border-top: 1px solid var(--border-hairline);
          flex-wrap: wrap;
          font-size: 0.8rem;

          .calc-dim {
            color: var(--text-muted);
            margin-right: 0.3rem;
          }

          .gold-qty {
            color: var(--accent-gold-dark);
          }

          .maroon-cost {
            color: var(--primary-maroon);
            font-size: 0.95rem;
          }
        }
      }
    }

    .dietary-notes-box {
      background: #ffffff;
      border: 1px solid var(--border-hairline);
      border-radius: var(--radius-md);
      padding: 1.25rem;

      .box-head {
        display: flex;
        align-items: center;
        gap: 0.45rem;
        color: var(--primary-maroon);
        margin-bottom: 0.6rem;

        h4 {
          font-size: 0.92rem;
          font-weight: 700;
        }
      }

      textarea {
        width: 100%;
        border: 1px solid var(--border-hairline);
        border-radius: var(--radius-sm);
        padding: 0.75rem;
        font-size: 0.88rem;
        background: var(--bg-card-subtle);
        resize: vertical;
      }
    }

    /* Right 35% Sticky Estimation Receipt matching Figma Screen 02 */
    .right-estimation-col {
      position: sticky;
      top: 85px;
    }

    .sticky-estimation-receipt {
      background: #4a131b;
      border: 1.5px solid var(--accent-gold);
      border-radius: var(--radius-lg);
      padding: 1.75rem 1.5rem;
      color: #ffffff;
      box-shadow: 0 12px 35px rgba(91, 26, 36, 0.35);

      .receipt-crest {
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.2rem;
        border-bottom: 1px solid rgba(229, 222, 201, 0.2);
        padding-bottom: 1rem;
        margin-bottom: 1.25rem;

        .crest-icon {
          font-size: 28px;
          color: var(--accent-gold-light);
        }

        .brand-sub-title {
          font-size: 0.75rem;
          color: var(--accent-gold-light);
          text-transform: uppercase;
          letter-spacing: 1.5px;
          font-weight: 600;
        }

        h3 {
          font-family: var(--font-serif);
          font-size: 1.35rem;
          font-weight: 700;
          color: #ffffff;
        }
      }

      .receipt-rows-group {
        display: flex;
        flex-direction: column;
        gap: 0.65rem;

        .receipt-line {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.85);

          .val {
            font-weight: 600;
            color: #ffffff;
          }
        }
      }

      /* Brushed Gold Grand Total Highlight Card matching Figma Screen 02 */
      .brushed-gold-total-card {
        margin-top: 1rem;
        background: linear-gradient(135deg, #c59b43 0%, #a87922 100%);
        border: 1px solid #e5bd68;
        border-radius: var(--radius-sm);
        padding: 0.85rem 1rem;
        color: #ffffff;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);

        .total-label-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;

          .gt-word {
            font-size: 0.88rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .gt-figure {
            font-family: var(--font-serif);
            font-size: 1.45rem;
            font-weight: 800;
          }
        }

        .per-guest-callout {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.9);
          text-align: right;
          margin-top: 0.15rem;
        }
      }

      .receipt-actions-block {
        margin-top: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;

        .interactive-action-sub {
          font-size: 0.72rem;
          color: var(--accent-gold-light);
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .action-btn {
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem;
          border-radius: var(--radius-sm);
          font-size: 0.88rem;
          font-weight: 700;
          transition: all 0.2s ease;

          &.pdf-btn {
            background: rgba(255, 255, 255, 0.12);
            color: #ffffff;
            border: 1px solid rgba(229, 222, 201, 0.3);

            &:hover {
              background: rgba(255, 255, 255, 0.2);
            }
          }

          &.confirm-feast-btn {
            background: #ffffff;
            color: var(--primary-maroon);
            border: 1px solid #ffffff;

            &:hover {
              background: var(--accent-gold-light);
              border-color: var(--accent-gold-light);
              color: #2b0810;
              box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
            }
          }
        }
      }
    }

    /* 3D Printed Wedding Menu Card */
    .card3d-showcase-container {
      display: flex;
      justify-content: center;
      padding: 2rem 0;
    }

    .foil-menu-card {
      width: 100%;
      max-width: 680px;
      padding: 2.5rem;
      border: 2px solid var(--accent-gold);
      box-shadow: 0 20px 50px rgba(91, 26, 36, 0.35);

      .foil-inner-border {
        border: 1px solid rgba(229, 222, 201, 0.4);
        padding: 2rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 1.25rem;

        .card-wedding-crest {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;

          .crest-symbol {
            color: var(--accent-gold-light);
            font-size: 32px;
          }

          h2 {
            font-family: var(--font-serif);
            font-size: 1.8rem;
            color: var(--accent-gold-light);
          }

          .couple-celebration {
            font-size: 1.1rem;
            font-weight: 700;
            color: #ffffff;
          }

          .venue-date {
            font-size: 0.8rem;
            color: rgba(255, 255, 255, 0.7);
          }
        }

        .menu-divider-floral {
          color: var(--accent-gold-light);
          letter-spacing: 6px;
        }

        .card-courses-columns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          width: 100%;
          text-align: left;
          margin: 1rem 0;

          @media (max-width: 600px) {
            grid-template-columns: 1fr;
          }

          .card-course-block {
            .card-course-heading {
              font-family: var(--font-serif);
              color: var(--accent-gold-light);
              font-size: 0.95rem;
              border-bottom: 1px solid rgba(229, 222, 201, 0.25);
              padding-bottom: 0.35rem;
              margin-bottom: 0.5rem;
            }

            .card-dish-items {
              display: flex;
              flex-direction: column;
              gap: 0.35rem;

              .card-dish-line {
                font-size: 0.85rem;
                color: rgba(255, 255, 255, 0.9);

                .line-portion {
                  font-size: 0.75rem;
                  color: var(--accent-gold-light);
                  margin-left: 0.3rem;
                }
              }
            }
          }
        }

        .card-footer-quote {
          font-style: italic;
          font-size: 0.82rem;
          color: rgba(255, 255, 255, 0.65);
        }
      }
    }

    /* WhatsApp Inquiry Card */
    .whatsapp-inquiry-card {
      margin-top: 1.25rem;
      background: #F0FDF4;
      border: 1px solid #BBF7D0;
      border-radius: 12px;
      padding: 1rem 1.15rem;
      display: flex;
      flex-direction: column;
      gap: 0.65rem;

      .wa-card-header {
        display: flex;
        align-items: center;
        gap: 0.65rem;

        .wa-icon-glow {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .wa-title-wrap {
          display: flex;
          flex-direction: column;
          line-height: 1.2;

          strong {
            font-size: 0.88rem;
            color: #166534;
          }

          span {
            font-size: 0.74rem;
            color: #15803D;
          }
        }
      }

      .wa-desc {
        font-size: 0.78rem;
        color: #166534;
        margin: 0;
        line-height: 1.35;
      }

      .btn-wa-direct {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.65rem 1rem;
        border-radius: 8px;
        background: #25D366;
        color: #FFFFFF;
        font-size: 0.82rem;
        font-weight: 700;
        text-decoration: none;
        box-shadow: 0 3px 10px rgba(37, 211, 102, 0.3);
        transition: transform 0.15s ease;

        &:hover {
          transform: translateY(-1px);
        }
      }
    }

    /* Modal Backdrop */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(30, 8, 14, 0.78);
      backdrop-filter: blur(8px);
      z-index: 99999;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding: 2.5rem 1rem 2rem;
      overflow-y: auto;
      box-sizing: border-box;
      animation: fadeIn 0.15s ease-out;
    }

    /* Contact Details Modal */
    .contact-confirm-dialog {
      background: #FFFFFF;
      border: 1px solid var(--accent-gold, #c59b43);
      border-radius: var(--radius-lg, 16px);
      width: 100%;
      max-width: 620px;
      margin: auto;
      max-height: calc(100vh - 4rem);
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.45);
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;

      .dialog-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.25rem 1.5rem;
        background: #FAF8F5;
        border-bottom: 1px solid var(--border-hairline, #e5dec9);

        .dialog-titles {
          .sub-crest {
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

        .close-x {
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

      .dialog-body {
        padding: 1.35rem 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.9rem;
        max-height: 70vh;
        overflow-y: auto;

        .dialog-intro {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.45;
          margin: 0;
        }

        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.85rem;

          @media (max-width: 600px) {
            grid-template-columns: 1fr;
          }
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;

          label {
            font-size: 0.78rem;
            font-weight: 600;
            color: #4A3E39;
          }

          input, textarea {
            padding: 0.65rem 0.85rem;
            border-radius: 6px;
            border: 1px solid var(--border-hairline, #e5dec9);
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
        }
      }

      .dialog-footer {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 0.75rem;
        padding: 1rem 1.5rem;
        background: #FAF8F5;
        border-top: 1px solid var(--border-hairline, #e5dec9);

        .btn-cancel {
          padding: 0.6rem 1rem;
          border-radius: 6px;
          border: 1px solid var(--border-hairline);
          background: #FFFFFF;
          color: var(--primary-maroon);
          font-weight: 600;
          font-size: 0.86rem;
          cursor: pointer;
        }

        .btn-submit-booking {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.65rem 1.35rem;
          border-radius: 6px;
          border: none;
          background: var(--primary-maroon);
          color: #FAF8F5;
          font-weight: 700;
          font-size: 0.88rem;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(91, 26, 36, 0.25);
          transition: background 0.2s, transform 0.15s;

          &:hover:not(:disabled) {
            background: var(--primary-maroon-hover, #421119);
            transform: translateY(-1px);
          }

          &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        }
      }
    }

    .success-card {
      background: #ffffff;
      border: 2px solid var(--border-gold);
      border-radius: var(--radius-lg);
      padding: 2.25rem 2rem;
      max-width: 520px;
      width: 100%;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;

      .success-crest {
        color: var(--veg-green);
        .material-symbols-outlined { font-size: 48px; }
      }

      h2 {
        font-family: var(--font-serif);
        font-size: 1.6rem;
        color: var(--primary-maroon);
      }

      .booking-id-box {
        background: var(--bg-cream);
        border: 1px dashed var(--border-gold);
        padding: 0.6rem 1.25rem;
        border-radius: var(--radius-sm);
        font-size: 0.95rem;
        font-weight: 800;
        color: var(--primary-maroon);
      }

      .booking-summary-box {
        background: #FAF8F5;
        border: 1px solid var(--border-hairline, #e5dec9);
        border-radius: 8px;
        padding: 0.85rem 1rem;
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        text-align: left;
        font-size: 0.84rem;

        .summary-line {
          display: flex;
          gap: 0.5rem;

          .lbl {
            color: var(--text-muted);
            min-width: 55px;
          }
        }
      }

      .modal-buttons {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        width: 100%;
        margin-top: 0.5rem;

        .btn-wa-success {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem;
          border-radius: 8px;
          background: #25D366;
          color: #FFFFFF;
          font-weight: 700;
          font-size: 0.88rem;
          text-decoration: none;
          box-shadow: 0 4px 12px rgba(37, 211, 102, 0.35);

          &:hover {
            transform: translateY(-1px);
          }
        }

        button { width: 100%; }
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
export class MenuReviewComponent {
  selectionService = inject(SelectionService);
  translationService = inject(TranslationService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  viewMode = signal<'estimate' | 'card3d'>('estimate');
  specialRequests = '';
  submitting = signal<boolean>(false);
  confirmedSelection = signal<CustomerSelection | null>(null);
  showContactModal = signal<boolean>(false);

  bookingForm: Partial<WeddingEvent> = {
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    event_name: 'Grand Wedding Reception',
    event_type: 'Wedding Reception',
    event_date: '',
    venue: '',
    guest_count: 100,
    notes: ''
  };

  selectedDishesList = computed(() => {
    return Array.from(this.selectionService.selectedDishes().values());
  });

  groupedDishes = computed(() => {
    const list = this.selectedDishesList();
    const map = new Map<string, typeof list>();
    for (const item of list) {
      const cat = item.dish.category_name || 'General';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(item);
    }
    return Array.from(map.entries()).map(([categoryName, items]) => ({
      categoryName,
      items
    }));
  });

  getItemCost(item: any): number {
    const baseQty = (item.dish.quantity_per_person && item.dish.quantity_per_person > 0)
      ? item.dish.quantity_per_person
      : 1;
    const ratio = item.quantity_per_person / baseQty;
    const guests = this.selectionService.eventDetails().guest_count || 1;
    const scaledPaise = Math.round(item.dish.price_per_person * ratio);
    return Math.round((scaledPaise * guests) / 100);
  }

  formatBulkKitchenQuantity(qtyPerGuest: number, unit: string): string {
    const guests = this.selectionService.eventDetails().guest_count || 1;
    const total = qtyPerGuest * guests;
    const u = (unit || '').toLowerCase();

    if (['pcs', 'pieces', 'piece'].includes(u)) {
      return `${total} pieces`;
    } else if (['g', 'grams', 'gram'].includes(u)) {
      return total >= 1000 ? `${(total / 1000).toFixed(1).replace(/\.0$/, '')} kg` : `${total} g`;
    } else if (['ml', 'milliliter', 'millilitre'].includes(u)) {
      return total >= 1000 ? `${(total / 1000).toFixed(1).replace(/\.0$/, '')} Liters` : `${total} ml`;
    }
    return `${total} ${unit}`;
  }

  printProposal() {
    window.print();
  }

  openConfirmFeastModal() {
    const ev = this.selectionService.eventDetails();
    this.bookingForm = {
      customer_name: ev.customer_name || '',
      customer_phone: ev.customer_phone || '',
      customer_email: ev.customer_email || '',
      event_name: ev.event_name || 'Grand Wedding Reception',
      event_type: ev.event_type || 'Wedding Reception',
      event_date: ev.event_date || '',
      venue: ev.venue || '',
      guest_count: ev.guest_count || 100,
      notes: this.specialRequests || ev.notes || ''
    };
    this.showContactModal.set(true);
  }

  submitFinalFeastBooking() {
    this.submitting.set(true);
    // Sync into selection service
    this.selectionService.setEventDetails(this.bookingForm);

    this.selectionService.submitSelection(this.bookingForm.notes || this.specialRequests).subscribe({
      next: (res) => {
        this.submitting.set(false);
        this.showContactModal.set(false);
        if (res.success && res.data) {
          this.confirmedSelection.set(res.data);
          this.toastService.success('Wedding feast order submitted successfully!');
        }
      },
      error: (err) => {
        this.submitting.set(false);
        this.toastService.error(err.error?.error || 'Failed to submit feast order');
      }
    });
  }

  getWhatsAppConciergeUrl(): string {
    const ev = this.selectionService.eventDetails();
    const grandPaise = this.selectionService.calculation()?.grand_total || 0;
    const grandInr = (grandPaise / 100).toLocaleString('en-IN');
    const msg = `Namaste Wedding Feast Concierge! I am curating our catering for ${ev.customer_name || 'our wedding feast'} (${ev.guest_count || 100} guests). Total Estimate: ₹${grandInr}. I have a few questions/special menu requests.`;
    return `https://wa.me/919876543210?text=${encodeURIComponent(msg)}`;
  }

  getWhatsAppSuccessUrl(): string {
    const orderId = this.confirmedSelection()?.id || '';
    const ev = this.bookingForm;
    const grandPaise = this.selectionService.calculation()?.grand_total || 0;
    const grandInr = (grandPaise / 100).toLocaleString('en-IN');
    const msg = `Namaste! We have confirmed our Wedding Feast catering reservation (Ref ID: ${orderId}) for ${ev.customer_name} (${ev.guest_count} guests) at ${ev.venue}. Total: ₹${grandInr}. Please share further catering arrangements.`;
    return `https://wa.me/919876543210?text=${encodeURIComponent(msg)}`;
  }
}
