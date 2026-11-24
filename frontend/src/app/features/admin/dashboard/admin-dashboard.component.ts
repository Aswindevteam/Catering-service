import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DashboardService, DashboardOverview, PopularDishItem, ActivityItem, RevenueChartPoint } from '../../../core/services/dashboard.service';
import { SelectionService } from '../../../core/services/selection.service';
import { ToastService } from '../../../core/services/toast.service';
import { TranslationService } from '../../../core/services/translation.service';
import { WeddingEvent } from '../../../core/models';

interface TimelineEvent {
  id: string;
  dateStr: string;
  name: string;
  guestCount: number;
  status: string;
  statusClass: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="executive-overview-page">
      <!-- Header Greeting matching Figma Screen 04 -->
      <header class="executive-header">
        <div class="header-text">
          <h1 class="greeting-title">{{ tService.t('admin.overviewTitle') }}</h1>
          <p class="greeting-subtitle">{{ tService.t('admin.overviewLead') }}</p>
        </div>
        <div class="header-actions">
          <button type="button" class="btn-royal-action" (click)="openScheduleModal()">
            <span class="material-symbols-outlined">add</span>
            <span>{{ tService.t('admin.actions.scheduleEvent') }}</span>
          </button>
        </div>
      </header>

      <!-- Main Layout: Left/Center Section (68%) + Right Panel (32%) -->
      <div class="overview-grid">
        <!-- Left & Center: KPI Cards + Revenue Wave + Timeline -->
        <div class="main-column">
          <!-- Top Row: 3 Executive KPI Cards matching Figma Screen 04 -->
          <div class="kpi-cards-grid">
            <!-- Active Wedding Events -->
            <div class="kpi-card">
              <span class="kpi-label">{{ tService.t('admin.kpi.activeEvents') }}</span>
              <div class="kpi-val-row">
                <span class="kpi-val">{{ overview()?.total_events || 42 }}</span>
                <span class="trend-pill positive">
                  <span class="material-symbols-outlined">arrow_upward</span>
                  <span>+8%</span>
                </span>
              </div>
              <span class="kpi-sub">Upcoming receptions & muhurthams</span>
            </div>

            <!-- Expected Guests -->
            <div class="kpi-card">
              <span class="kpi-label">{{ tService.t('admin.kpi.expectedGuests') }}</span>
              <div class="kpi-val-row">
                <span class="kpi-val">21k</span>
                <span class="trend-pill positive">
                  <span class="material-symbols-outlined">group</span>
                  <span>Peak Season</span>
                </span>
              </div>
              <span class="kpi-sub">Across 42 grand banquets</span>
            </div>

            <!-- Monthly Revenue -->
            <div class="kpi-card">
              <span class="kpi-label">{{ tService.t('admin.kpi.monthlyRevenue') }}</span>
              <div class="kpi-val-row">
                <span class="kpi-val"><span class="currency-symbol">₹</span>18.75L</span>
                <span class="trend-pill positive">
                  <span class="material-symbols-outlined">arrow_upward</span>
                  <span>+18%</span>
                </span>
              </div>
              <span class="kpi-sub">Confirmed catering pipeline</span>
            </div>
          </div>

          <!-- Revenue Overview Wave Chart Card matching Figma Screen 04 -->
          <div class="chart-luxury-card">
            <div class="chart-card-head">
              <div class="title-group">
                <h3>{{ tService.t('admin.chart.revenueOverview') }}</h3>
                <span class="range-pill">July &ndash; November</span>
              </div>
              <div class="legend-group">
                <span class="legend-dot"></span>
                <span class="legend-text">Catering Inflow (Lakhs)</span>
              </div>
            </div>

            <!-- Smooth Spline Wave Chart -->
            <div class="chart-svg-container">
              <svg viewBox="0 0 680 220" class="revenue-spline-svg">
                <defs>
                  <!-- Gradient fill from Brushed Gold to Deep Maroon -->
                  <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#C59B43" stop-opacity="0.45"/>
                    <stop offset="50%" stop-color="#5B1A24" stop-opacity="0.18"/>
                    <stop offset="100%" stop-color="#5B1A24" stop-opacity="0.0"/>
                  </linearGradient>
                  <!-- Glow filter for spline line -->
                  <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#C59B43" flood-opacity="0.35"/>
                  </filter>
                </defs>

                <!-- Horizontal guide lines -->
                <line x1="50" y1="35" x2="650" y2="35" stroke="#E5DEC9" stroke-dasharray="3 3"/>
                <text x="20" y="39" class="axis-txt">20L</text>

                <line x1="50" y1="80" x2="650" y2="80" stroke="#E5DEC9" stroke-dasharray="3 3"/>
                <text x="20" y="84" class="axis-txt">15L</text>

                <line x1="50" y1="125" x2="650" y2="125" stroke="#E5DEC9" stroke-dasharray="3 3"/>
                <text x="20" y="129" class="axis-txt">10L</text>

                <line x1="50" y1="170" x2="650" y2="170" stroke="#E5DEC9"/>
                <text x="25" y="174" class="axis-txt">0</text>

                <!-- Month labels on x-axis -->
                <text x="95" y="196" class="month-txt">July</text>
                <text x="230" y="196" class="month-txt">August</text>
                <text x="365" y="196" class="month-txt">September</text>
                <text x="500" y="196" class="month-txt">October</text>
                <text x="615" y="196" class="month-txt">November</text>

                <!-- Area gradient fill -->
                <path d="M 95 170 
                         L 95 145 
                         C 160 145, 180 110, 230 110 
                         C 285 110, 310 130, 365 125 
                         C 425 120, 455 75, 500 70 
                         C 555 65, 580 42, 615 38 
                         L 615 170 Z" 
                      fill="url(#waveGradient)"/>

                <!-- Smooth spline curve -->
                <path d="M 95 145 
                         C 160 145, 180 110, 230 110 
                         C 285 110, 310 130, 365 125 
                         C 425 120, 455 75, 500 70 
                         C 555 65, 580 42, 615 38" 
                      fill="none" 
                      stroke="#C59B43" 
                      stroke-width="3.5" 
                      stroke-linecap="round"
                      filter="url(#goldGlow)"/>

                <!-- Circular data point dots -->
                <circle cx="95" cy="145" r="4.5" fill="#5B1A24" stroke="#FAF8F5" stroke-width="2.5"/>
                <circle cx="230" cy="110" r="4.5" fill="#5B1A24" stroke="#FAF8F5" stroke-width="2.5"/>
                <circle cx="365" cy="125" r="4.5" fill="#5B1A24" stroke="#FAF8F5" stroke-width="2.5"/>
                <circle cx="500" cy="70" r="4.5" fill="#5B1A24" stroke="#FAF8F5" stroke-width="2.5"/>
                <circle cx="615" cy="38" r="6" fill="#C59B43" stroke="#5B1A24" stroke-width="3"/>

                <!-- Peak Badge Callout: ₹18.75L -->
                <rect x="575" y="6" width="76" height="24" rx="4" fill="#421119" stroke="#C59B43" stroke-width="1"/>
                <text x="613" y="22" fill="#FAF8F5" font-size="11.5" font-weight="700" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif">₹18.75L</text>
              </svg>
            </div>
          </div>

          <!-- Upcoming Wedding Events Timeline matching Figma Screen 04 -->
          <div class="timeline-luxury-card">
            <div class="timeline-head">
              <h3>{{ tService.t('admin.timeline.title') }}</h3>
              <a routerLink="/admin/selections" class="view-all-link">View All Events &rarr;</a>
            </div>

            <div class="events-table-wrap">
              <table class="timeline-table">
                <tbody>
                  @for (ev of timelineEvents(); track ev.id) {
                    <tr class="timeline-row">
                      <td class="cell-date">
                        <span class="date-badge">{{ ev.dateStr }}</span>
                      </td>
                      <td class="cell-name">
                        <span class="event-title">{{ ev.name }}</span>
                      </td>
                      <td class="cell-guests">
                        <span class="guest-count">{{ ev.guestCount }} Guests</span>
                      </td>
                      <td class="cell-status text-right">
                        <span class="status-badge" [ngClass]="ev.statusClass">
                          {{ ev.status }}
                        </span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Right Side Column: Top Performing Dishes + Quick Actions -->
        <aside class="side-column">
          <!-- Top Performing Dishes matching Figma Screen 04 -->
          <div class="dishes-rank-card">
            <div class="rank-head">
              <h3>{{ tService.t('admin.dishes.topPerforming') }}</h3>
              <a routerLink="/admin/dishes" class="rank-link">Catalog &rarr;</a>
            </div>

            <div class="ranked-dishes-list">
              @for (dish of topDishes(); track dish.id) {
                <div class="dish-rank-item">
                  <div class="dish-img-wrap">
                    <img [src]="dish.image_url" [alt]="dish.name" class="dish-thumb-round" />
                  </div>
                  <div class="dish-details">
                    <span class="dish-name">{{ dish.name }}</span>
                    <div class="dish-bar-bg">
                      <div class="dish-bar-fill" [style.width.%]="dish.percentage"></div>
                    </div>
                  </div>
                  <div class="dish-share-badge">
                    <span>({{ dish.percentage }}%)</span>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Quick Actions Panel matching Figma Screen 04 -->
          <div class="quick-actions-card">
            <h3 class="actions-head">{{ tService.t('admin.actions.title') }}</h3>
            <div class="actions-buttons-list">
              <button type="button" class="action-btn" (click)="openScheduleModal()">
                <span class="material-symbols-outlined icon">add</span>
                <span class="lbl">{{ tService.t('admin.actions.scheduleEvent') }}</span>
              </button>

              <button type="button" class="action-btn" (click)="openPurchaseOrdersModal()">
                <span class="material-symbols-outlined icon">receipt_long</span>
                <span class="lbl">{{ tService.t('admin.actions.reviewPO') }}</span>
              </button>

              <button type="button" class="action-btn" (click)="exportFinancialReport()">
                <span class="material-symbols-outlined icon">file_download</span>
                <span class="lbl">{{ tService.t('admin.actions.exportFinancials') }}</span>
              </button>
            </div>
          </div>
        </aside>
      </div>

      <!-- Schedule New Event Modal -->
      @if (showScheduleModal()) {
        <div class="modal-backdrop" (click)="showScheduleModal.set(false)">
          <div class="modal-dialog" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Schedule Wedding Event</h3>
              <button class="close-btn" (click)="showScheduleModal.set(false)">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            <div class="modal-body">
              <div class="modal-field">
                <label>Event / Family Name</label>
                <input type="text" [(ngModel)]="newEvent.event_name" placeholder="e.g. Iyer-Krishnan Grand Reception" />
              </div>
              <div class="modal-row-2">
                <div class="modal-field">
                  <label>Customer Name</label>
                  <input type="text" [(ngModel)]="newEvent.customer_name" placeholder="e.g. Ramesh Iyer" />
                </div>
                <div class="modal-field">
                  <label>Contact Phone</label>
                  <input type="text" [(ngModel)]="newEvent.customer_phone" placeholder="+91 72998 87725" />
                </div>
              </div>
              <div class="modal-row-2">
                <div class="modal-field">
                  <label>Event Date</label>
                  <input type="date" [(ngModel)]="newEvent.event_date" />
                </div>
                <div class="modal-field">
                  <label>Guest Count</label>
                  <input type="number" [(ngModel)]="newEvent.guest_count" min="50" max="5000" />
                </div>
              </div>
              <div class="modal-field">
                <label>Banquet Venue</label>
                <input type="text" [(ngModel)]="newEvent.venue" placeholder="e.g. ITC Grand Chola, Chennai" />
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-cancel" (click)="showScheduleModal.set(false)">Cancel</button>
              <button type="button" class="btn-submit" (click)="saveScheduledEvent()">Save Celebration Event</button>
            </div>
          </div>
        </div>
      }

      <!-- Purchase Orders & Raw Ingredients Modal -->
      @if (showPurchaseModal()) {
        <div class="modal-backdrop" (click)="showPurchaseModal.set(false)">
          <div class="modal-dialog large" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div>
                <h3>Aggregate Kitchen Purchase Orders</h3>
                <span class="modal-sub">Calculated for 42 Upcoming Wedding Receptions (21k Guests)</span>
              </div>
              <button class="close-btn" (click)="showPurchaseModal.set(false)">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            <div class="modal-body">
              <table class="po-table">
                <thead>
                  <tr>
                    <th>Raw Ingredient</th>
                    <th>Required Batch</th>
                    <th>Supplier Benchmark</th>
                    <th>Estimated Value</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Fresh Malai Paneer</td>
                    <td>1,680 kg</td>
                    <td>₹375 / kg</td>
                    <td>₹6,30,000</td>
                    <td><span class="po-pill ready">PO Approved</span></td>
                  </tr>
                  <tr>
                    <td>Royal Basmati Rice (Daawat)</td>
                    <td>2,100 kg</td>
                    <td>₹140 / kg</td>
                    <td>₹2,94,000</td>
                    <td><span class="po-pill ready">PO Approved</span></td>
                  </tr>
                  <tr>
                    <td>Pure Desi Ghee (Amul / Nandini)</td>
                    <td>630 kg</td>
                    <td>₹580 / kg</td>
                    <td>₹3,65,400</td>
                    <td><span class="po-pill pending">Awaiting Delivery</span></td>
                  </tr>
                  <tr>
                    <td>Kashmiri Saffron & Whole Spices</td>
                    <td>125 kg</td>
                    <td>₹1,800 / kg</td>
                    <td>₹2,25,000</td>
                    <td><span class="po-pill ready">PO Approved</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-cancel" (click)="showPurchaseModal.set(false)">Close</button>
              <button type="button" class="btn-submit" (click)="downloadPurchaseOrderPdf()">Download PO Sheet</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .executive-overview-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      width: 100%;
    }

    /* Executive Header */
    .executive-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;

      .greeting-title {
        font-family: var(--font-serif, 'Playfair Display', serif);
        font-size: 1.85rem;
        font-weight: 700;
        color: #5B1A24;
        letter-spacing: -0.3px;
        line-height: 1.2;
      }

      .greeting-subtitle {
        font-family: var(--font-sans, sans-serif);
        font-size: 0.92rem;
        color: #7A695C;
        margin-top: 0.25rem;
      }

      .btn-royal-action {
        display: flex;
        align-items: center;
        gap: 0.45rem;
        padding: 0.55rem 1.25rem;
        border-radius: 6px;
        border: 1px solid #C59B43;
        background: #5B1A24;
        color: #FAF8F5;
        font-size: 0.86rem;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(91, 26, 36, 0.2);
        transition: background 0.2s, transform 0.15s;

        &:hover {
          background: #421119;
          transform: translateY(-1px);
        }
      }
    }

    /* Main Grid */
    .overview-grid {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 1.5rem;
      align-items: start;

      @media (max-width: 1100px) {
        grid-template-columns: 1fr;
      }
    }

    .main-column {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      min-width: 0;
    }

    /* 3 Executive KPI Cards matching Figma Screen 04 */
    .kpi-cards-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.25rem;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .kpi-card {
      background: #FFFFFF;
      border: 1px solid #E5DEC9;
      border-radius: 12px;
      padding: 1.25rem 1.35rem;
      box-shadow: 0 2px 8px rgba(66, 17, 25, 0.03);
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
      transition: transform 0.2s ease, border-color 0.2s;

      &:hover {
        transform: translateY(-2px);
        border-color: #C59B43;
      }

      .kpi-label {
        font-size: 0.78rem;
        font-weight: 600;
        color: #8C7B70;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .kpi-val-row {
        display: flex;
        align-items: baseline;
        justify-content: space-between;

        .kpi-val {
          font-family: var(--font-serif, serif);
          font-size: 1.85rem;
          font-weight: 700;
          color: #5B1A24;
          line-height: 1.1;
        }

        .trend-pill {
          display: flex;
          align-items: center;
          gap: 0.2rem;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.2rem 0.5rem;
          border-radius: 20px;

          &.positive {
            background: #ECFDF5;
            color: #15803D;
            border: 1px solid #A7F3D0;
          }

          .material-symbols-outlined { font-size: 13px; }
        }
      }

      .kpi-sub {
        font-size: 0.74rem;
        color: #9C8B7E;
        font-style: italic;
      }
    }

    /* Revenue Wave Chart Card matching Figma Screen 04 */
    .chart-luxury-card {
      background: #FFFFFF;
      border: 1px solid #E5DEC9;
      border-radius: 12px;
      padding: 1.35rem 1.5rem;
      box-shadow: 0 2px 10px rgba(66, 17, 25, 0.03);
      display: flex;
      flex-direction: column;
      gap: 1rem;

      .chart-card-head {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .title-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;

          h3 {
            font-family: var(--font-serif, serif);
            font-size: 1.25rem;
            font-weight: 700;
            color: #5B1A24;
          }

          .range-pill {
            font-size: 0.74rem;
            font-weight: 600;
            color: #8C7B70;
            background: #FAF8F5;
            border: 1px solid #E5DEC9;
            padding: 0.2rem 0.6rem;
            border-radius: 20px;
          }
        }

        .legend-group {
          display: flex;
          align-items: center;
          gap: 0.4rem;

          .legend-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #C59B43;
          }

          .legend-text {
            font-size: 0.76rem;
            font-weight: 600;
            color: #7A695C;
          }
        }
      }

      .chart-svg-container {
        width: 100%;
        overflow: hidden;

        .revenue-spline-svg {
          width: 100%;
          height: auto;
          display: block;

          .axis-txt {
            font-size: 11px;
            fill: #9C8B7E;
            font-family: var(--font-sans, sans-serif);
          }

          .month-txt {
            font-size: 12px;
            font-weight: 600;
            fill: #6B5B52;
            font-family: var(--font-sans, sans-serif);
          }
        }
      }
    }

    /* Upcoming Wedding Events Timeline */
    .timeline-luxury-card {
      background: #FFFFFF;
      border: 1px solid #E5DEC9;
      border-radius: 12px;
      padding: 1.35rem;
      box-shadow: 0 2px 10px rgba(66, 17, 25, 0.03);

      .timeline-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1rem;
        padding-bottom: 0.65rem;
        border-bottom: 1px solid #F0ECE4;

        h3 {
          font-family: var(--font-serif, serif);
          font-size: 1.25rem;
          font-weight: 700;
          color: #5B1A24;
        }

        .view-all-link {
          font-size: 0.82rem;
          font-weight: 600;
          color: #C59B43;
          text-decoration: none;
          &:hover { text-decoration: underline; color: #5B1A24; }
        }
      }

      .events-table-wrap {
        width: 100%;
        overflow-x: auto;
      }

      .timeline-table {
        width: 100%;
        border-collapse: collapse;

        .timeline-row {
          border-bottom: 1px solid #F0ECE4;
          transition: background 0.15s;

          &:hover { background: #FAF8F5; }
          &:last-child { border-bottom: none; }

          td {
            padding: 0.85rem 0.5rem;
            vertical-align: middle;
          }

          .cell-date {
            width: 90px;
            .date-badge {
              font-family: var(--font-sans, sans-serif);
              font-weight: 700;
              font-size: 0.82rem;
              color: #5B1A24;
            }
          }

          .cell-name {
            .event-title {
              font-weight: 600;
              font-size: 0.88rem;
              color: #382F2D;
            }
          }

          .cell-guests {
            width: 130px;
            .guest-count {
              font-size: 0.82rem;
              color: #7A695C;
            }
          }

          .cell-status {
            width: 160px;
            text-align: right;

            .status-badge {
              font-size: 0.74rem;
              font-weight: 600;
              padding: 0.3rem 0.75rem;
              border-radius: 20px;
              display: inline-block;

              &.confirming {
                background: #FAF4E8;
                border: 1px solid #C59B43;
                color: #5B1A24;
              }

              &.tasting {
                background: #EFF6FF;
                border: 1px solid #BFDBFE;
                color: #1E40AF;
              }

              &.advance {
                background: #ECFDF5;
                border: 1px solid #A7F3D0;
                color: #15803D;
              }
            }
          }
        }
      }
    }

    /* Right Column: Top Performing Dishes & Quick Actions */
    .side-column {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    /* Top Performing Dishes */
    .dishes-rank-card {
      background: #FFFFFF;
      border: 1px solid #E5DEC9;
      border-radius: 12px;
      padding: 1.35rem;
      box-shadow: 0 2px 10px rgba(66, 17, 25, 0.03);

      .rank-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1rem;
        padding-bottom: 0.65rem;
        border-bottom: 1px solid #F0ECE4;

        h3 {
          font-family: var(--font-serif, serif);
          font-size: 1.15rem;
          font-weight: 700;
          color: #5B1A24;
        }

        .rank-link {
          font-size: 0.8rem;
          font-weight: 600;
          color: #C59B43;
          text-decoration: none;
          &:hover { text-decoration: underline; }
        }
      }

      .ranked-dishes-list {
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
      }

      .dish-rank-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;

        .dish-img-wrap {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1.5px solid #E5DEC9;
          overflow: hidden;
          flex-shrink: 0;

          .dish-thumb-round {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        .dish-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.3rem;

          .dish-name {
            font-size: 0.86rem;
            font-weight: 600;
            color: #382F2D;
          }

          .dish-bar-bg {
            height: 6px;
            border-radius: 3px;
            background: #F0ECE4;
            overflow: hidden;

            .dish-bar-fill {
              height: 100%;
              border-radius: 3px;
              background: linear-gradient(90deg, #5B1A24 0%, #C59B43 100%);
            }
          }
        }

        .dish-share-badge {
          font-size: 0.8rem;
          font-weight: 700;
          color: #5B1A24;
          white-space: nowrap;
        }
      }
    }

    /* Quick Actions */
    .quick-actions-card {
      background: #FFFFFF;
      border: 1px solid #E5DEC9;
      border-radius: 12px;
      padding: 1.35rem;
      box-shadow: 0 2px 10px rgba(66, 17, 25, 0.03);

      .actions-head {
        font-family: var(--font-serif, serif);
        font-size: 1.15rem;
        font-weight: 700;
        color: #5B1A24;
        margin-bottom: 0.95rem;
        padding-bottom: 0.55rem;
        border-bottom: 1px solid #F0ECE4;
      }

      .actions-buttons-list {
        display: flex;
        flex-direction: column;
        gap: 0.65rem;

        .action-btn {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          border: 1px solid #E5DEC9;
          background: #FAF8F5;
          color: #382F2D;
          font-size: 0.86rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;

          .icon {
            font-size: 19px;
            color: #C59B43;
            transition: transform 0.2s;
          }

          &:hover {
            background: #5B1A24;
            color: #FAF8F5;
            border-color: #5B1A24;

            .icon {
              color: #EAD9B7;
              transform: translateX(2px);
            }
          }
        }
      }
    }

    /* Modal Backdrop & Dialog */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(47, 11, 18, 0.6);
      backdrop-filter: blur(4px);
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      animation: fadeIn 0.15s ease-out;
    }

    .modal-dialog {
      background: #FFFFFF;
      border: 1px solid #E5DEC9;
      border-radius: 12px;
      width: 100%;
      max-width: 520px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
      display: flex;
      flex-direction: column;
      overflow: hidden;

      &.large { max-width: 760px; }

      .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.15rem 1.5rem;
        background: #FAF8F5;
        border-bottom: 1px solid #E5DEC9;

        h3 {
          font-family: var(--font-serif, serif);
          font-size: 1.25rem;
          font-weight: 700;
          color: #5B1A24;
        }

        .modal-sub {
          font-size: 0.78rem;
          color: #7A695C;
        }

        .close-btn {
          background: transparent;
          border: none;
          color: #8C7B70;
          cursor: pointer;
          &:hover { color: #5B1A24; }
        }
      }

      .modal-body {
        padding: 1.35rem 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        max-height: 70vh;
        overflow-y: auto;
      }

      .modal-field {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;

        label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #4A3E39;
        }

        input {
          padding: 0.65rem 0.85rem;
          border-radius: 6px;
          border: 1px solid #E5DEC9;
          background: #FAF8F5;
          font-size: 0.88rem;
          color: #2F0B12;
          outline: none;
          &:focus { border-color: #C59B43; background: #FFFFFF; }
        }
      }

      .modal-row-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
      }

      .modal-footer {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 0.75rem;
        padding: 1rem 1.5rem;
        border-top: 1px solid #E5DEC9;
        background: #FAF8F5;

        .btn-cancel {
          padding: 0.55rem 1rem;
          border-radius: 6px;
          border: 1px solid #E5DEC9;
          background: #FFFFFF;
          color: #5B1A24;
          font-size: 0.86rem;
          font-weight: 600;
          cursor: pointer;
        }

        .btn-submit {
          padding: 0.55rem 1.25rem;
          border-radius: 6px;
          border: none;
          background: #5B1A24;
          color: #FAF8F5;
          font-size: 0.86rem;
          font-weight: 600;
          cursor: pointer;
          &:hover { background: #421119; }
        }
      }
    }

    /* Purchase Orders Table */
    .po-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.86rem;

      thead th {
        text-align: left;
        padding: 0.65rem 0.75rem;
        background: #FAF8F5;
        border-bottom: 2px solid #E5DEC9;
        color: #5B1A24;
        font-size: 0.78rem;
        text-transform: uppercase;
      }

      tbody td {
        padding: 0.75rem;
        border-bottom: 1px solid #F0ECE4;
        color: #382F2D;
      }

      .po-pill {
        font-size: 0.72rem;
        font-weight: 700;
        padding: 0.2rem 0.6rem;
        border-radius: 20px;

        &.ready {
          background: #ECFDF5;
          color: #15803D;
          border: 1px solid #A7F3D0;
        }

        &.pending {
          background: #FFFBEB;
          color: #B45309;
          border: 1px solid #FDE68A;
        }
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private selectionService = inject(SelectionService);
  private toast = inject(ToastService);
  tService = inject(TranslationService);

  overview = signal<DashboardOverview | null>(null);
  popularDishes = signal<PopularDishItem[]>([]);
  activities = signal<ActivityItem[]>([]);

  // Timeline Events matching Screen 04
  timelineEvents = signal<TimelineEvent[]>([
    { id: 'ev1', dateStr: 'Nov 28', name: 'Iyer-Krishnan Reception (Chennai)', guestCount: 600, status: 'Confirming Menu', statusClass: 'confirming' },
    { id: 'ev2', dateStr: 'Dec 05', name: 'Sharma-Verma Sangeet (Bangalore)', guestCount: 850, status: 'Tasting Scheduled', statusClass: 'tasting' },
    { id: 'ev3', dateStr: 'Dec 14', name: 'Reddy-Rao Muhurtham (Hyderabad)', guestCount: 1200, status: 'Advance Received', statusClass: 'advance' },
    { id: 'ev4', dateStr: 'Dec 20', name: 'Nair-Menon Wedding Feast (Kochi)', guestCount: 500, status: 'Confirming Menu', statusClass: 'confirming' },
    { id: 'ev5', dateStr: 'Jan 10', name: 'Kapoor-Malhotra Reception (Delhi)', guestCount: 1500, status: 'Advance Received', statusClass: 'advance' }
  ]);

  // Top Performing Dishes with percentages matching Screen 04
  topDishes = signal<PopularDishItem[]>([
    { id: 'd1', name: 'Paneer Tikka', category_name: 'Starters', image_url: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300&q=80', selection_count: 85, percentage: 28 },
    { id: 'd2', name: 'Gobi 65', category_name: 'Starters', image_url: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=300&q=80', selection_count: 72, percentage: 24 },
    { id: 'd3', name: 'Chicken 65', category_name: 'Starters', image_url: 'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?w=300&q=80', selection_count: 60, percentage: 20 },
    { id: 'd4', name: 'Hyderabadi Dum Biryani', category_name: 'Main Course', image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&q=80', selection_count: 55, percentage: 18 },
    { id: 'd5', name: 'Gulab Jamun with Rabdi', category_name: 'Desserts', image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&q=80', selection_count: 45, percentage: 15 }
  ]);

  // Modals state
  showScheduleModal = signal(false);
  showPurchaseModal = signal(false);

  newEvent: Partial<WeddingEvent> = {
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    event_name: '',
    event_type: 'Wedding Reception',
    event_date: new Date().toISOString().split('T')[0],
    venue: '',
    guest_count: 500
  };

  ngOnInit() {
    this.dashboardService.getOverview().subscribe({
      next: (res) => {
        if (res.success) this.overview.set(res.data);
      }
    });

    this.dashboardService.getPopularDishes().subscribe({
      next: (res) => {
        if (res.success && res.data.length > 0) {
          this.popularDishes.set(res.data);
        }
      }
    });

    this.dashboardService.getActivities().subscribe({
      next: (res) => {
        if (res.success) this.activities.set(res.data);
      }
    });

    this.selectionService.getEvents().subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.length > 0) {
          const mapped: TimelineEvent[] = res.data.map(ev => {
            const dateObj = new Date(ev.event_date);
            const dateStr = !isNaN(dateObj.getTime())
              ? dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              : ev.event_date;

            let status = 'Confirming Menu';
            let statusClass = 'confirming';
            if (ev.status === 'confirmed') {
              status = 'Advance Received';
              statusClass = 'advance';
            } else if (ev.status === 'completed') {
              status = 'Completed';
              statusClass = 'advance';
            }

            return {
              id: ev.id,
              dateStr,
              name: `${ev.event_name} (${ev.venue || 'Banqueting'})`,
              guestCount: ev.guest_count,
              status,
              statusClass
            };
          });
          this.timelineEvents.set(mapped);
        }
      }
    });
  }

  openScheduleModal() {
    this.newEvent = {
      customer_name: '',
      customer_phone: '',
      customer_email: '',
      event_name: '',
      event_type: 'Wedding Reception',
      event_date: new Date().toISOString().split('T')[0],
      venue: '',
      guest_count: 600
    };
    this.showScheduleModal.set(true);
  }

  saveScheduledEvent() {
    if (!this.newEvent.event_name || !this.newEvent.guest_count) {
      this.toast.error('Please enter the event name and guest count.');
      return;
    }

    const dateObj = new Date(this.newEvent.event_date || '');
    const dateStr = !isNaN(dateObj.getTime())
      ? dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : 'Upcoming';

    this.timelineEvents.update(list => [
      {
        id: 'ev_' + Date.now(),
        dateStr,
        name: `${this.newEvent.event_name} (${this.newEvent.venue || 'Grand Banquet'})`,
        guestCount: Number(this.newEvent.guest_count),
        status: 'Confirming Menu',
        statusClass: 'confirming'
      },
      ...list
    ]);

    this.toast.success(`Wedding event "${this.newEvent.event_name}" scheduled successfully!`);
    this.showScheduleModal.set(false);
  }

  openPurchaseOrdersModal() {
    this.showPurchaseModal.set(true);
  }

  downloadPurchaseOrderPdf() {
    this.toast.success('Kitchen Purchase Order exported to PDF successfully.');
    this.showPurchaseModal.set(false);
  }

  exportFinancialReport() {
    const csvContent = 'data:text/csv;charset=utf-8,' +
      'Month,Revenue (INR),Events,Expected Guests\n' +
      'July,850000,18,9000\n' +
      'August,1100000,24,12000\n' +
      'September,1250000,28,14000\n' +
      'October,1500000,35,17500\n' +
      'November,1875000,42,21000\n';

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'wedding_feast_financials_2026.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.toast.success('Financial spreadsheet downloaded.');
  }
}