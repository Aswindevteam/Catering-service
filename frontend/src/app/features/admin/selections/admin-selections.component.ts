import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectionService } from '../../../core/services/selection.service';
import { ToastService } from '../../../core/services/toast.service';
import { CustomerSelection } from '../../../core/models';

@Component({
  selector: 'app-admin-selections',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="selections-page">
      <div class="page-head">
        <div class="head-text">
          <h1>Customer Selections & Bookings</h1>
          <p>Review customer wedding catering selections and real-time cost estimates.</p>
        </div>
      </div>

      <div class="wf-card table-card">
        <table class="wf-table">
          <thead>
            <tr>
              <th>Customer / Event</th>
              <th>Event Date</th>
              <th>Guests</th>
              <th>Food Subtotal</th>
              <th>Grand Total</th>
              <th>Per Guest</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (sel of selections(); track sel.id) {
              <tr>
                <td>
                  <div class="cust-info">
                    <strong>{{ sel.event?.customer_name || 'Customer' }}</strong>
                    <span class="event-name">{{ sel.event?.event_name }} ({{ sel.event?.event_type }})</span>
                  </div>
                </td>
                <td>{{ sel.event?.event_date }}</td>
                <td><strong>{{ sel.event?.guest_count }}</strong></td>
                <td>₹{{ (sel.subtotal / 100).toLocaleString('en-IN') }}</td>
                <td><strong class="grand-price">₹{{ (sel.grand_total / 100).toLocaleString('en-IN') }}</strong></td>
                <td>₹{{ (sel.cost_per_guest / 100).toFixed(0) }}</td>
                <td>
                  <span class="status-badge" [ngClass]="sel.status">
                    {{ sel.status | uppercase }}
                  </span>
                </td>
                <td>
                  <button class="wf-btn secondary sm" (click)="openDetail(sel.id)">
                    <span class="material-symbols-outlined">visibility</span>
                    <span>View Menu</span>
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="8" class="no-data">No customer selections received yet.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Detail Modal -->
      @if (selectedDetail()) {
        <div class="modal-backdrop" (click)="selectedDetail.set(null)">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <div class="modal-head">
              <div>
                <h2>{{ selectedDetail()?.event?.customer_name }}'s Menu</h2>
                <span class="event-sub">{{ selectedDetail()?.event?.event_name }} &bull; {{ selectedDetail()?.event?.guest_count }} Guests</span>
              </div>
              <button class="close-btn" (click)="selectedDetail.set(null)">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <div class="modal-body">
              <h4 class="section-title">Selected Dishes ({{ selectedDetail()?.items?.length }} Items)</h4>
              <div class="items-list">
                @for (item of selectedDetail()?.items; track item.id) {
                  <div class="item-row">
                    <div class="item-info">
                      <strong>{{ item.dish_name }}</strong>
                      <span class="cat-label">{{ item.category_name }}</span>
                    </div>
                    <div class="item-calc">
                      <span class="qty-calc">{{ item.quantity_per_person }}{{ item.serving_unit }}/guest &times; {{ item.total_guest_count }} = <strong>{{ item.total_calculated_quantity / 1000 }} kg</strong></span>
                      <strong class="item-cost">₹{{ (item.total_dish_cost / 100).toLocaleString('en-IN') }}</strong>
                    </div>
                  </div>
                }
              </div>

              <div class="breakdown-box">
                <div class="b-row"><span>Food Subtotal</span><span>₹{{ ((selectedDetail()?.subtotal || 0) / 100).toLocaleString('en-IN') }}</span></div>
                <div class="b-row"><span>Service Charges</span><span>₹{{ ((selectedDetail()?.service_charge || 0) / 100).toLocaleString('en-IN') }}</span></div>
                <div class="b-row"><span>Transportation</span><span>₹{{ ((selectedDetail()?.transportation_charge || 0) / 100).toLocaleString('en-IN') }}</span></div>
                <div class="b-row"><span>GST</span><span>₹{{ ((selectedDetail()?.gst_amount || 0) / 100).toLocaleString('en-IN') }}</span></div>
                <div class="b-row total"><span>Grand Total</span><span>₹{{ ((selectedDetail()?.grand_total || 0) / 100).toLocaleString('en-IN') }}</span></div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .selections-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .page-head {
      .head-text {
        h1 {
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--primary-maroon);
        }

        p {
          font-size: 0.88rem;
          color: var(--text-secondary);
          margin-top: 0.2rem;
        }
      }
    }

    .table-card {
      background: #ffffff;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-card);
      overflow-x: auto;
    }

    .wf-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.88rem;

      th {
        background: var(--bg-card-subtle);
        padding: 0.85rem 1rem;
        font-weight: 600;
        color: var(--text-secondary);
        border-bottom: 1px solid var(--border-card);
      }

      td {
        padding: 0.85rem 1rem;
        border-bottom: 1px solid var(--border-subtle);
      }

      .cust-info {
        display: flex;
        flex-direction: column;

        .event-name {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
      }

      .grand-price {
        color: var(--primary-maroon);
        font-size: 0.95rem;
      }

      .status-badge {
        font-size: 0.72rem;
        font-weight: 700;
        padding: 0.2rem 0.55rem;
        border-radius: 12px;

        &.submitted {
          background: #e3f2fd;
          color: #1565c0;
        }

        &.approved {
          background: #e8f5e9;
          color: var(--veg-green);
        }

        &.draft {
          background: #fff3e0;
          color: #ef6c00;
        }
      }

      .no-data {
        text-align: center;
        padding: 2.5rem;
        color: var(--text-muted);
      }
    }

    /* Modal */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(43, 8, 17, 0.5);
      backdrop-filter: blur(4px);
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }

    .modal-card {
      background: #ffffff;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-gold);
      box-shadow: var(--shadow-lg);
      width: 100%;
      max-width: 600px;
      overflow: hidden;

      .modal-head {
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid var(--border-subtle);
        display: flex;
        justify-content: space-between;
        align-items: center;

        h2 {
          font-family: var(--font-display);
          font-size: 1.2rem;
          color: var(--primary-maroon);
        }

        .event-sub {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
      }

      .modal-body {
        padding: 1.5rem;
        max-height: 75vh;
        overflow-y: auto;

        .section-title {
          font-size: 0.95rem;
          color: var(--primary-maroon);
          margin-bottom: 0.75rem;
        }

        .items-list {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          margin-bottom: 1.25rem;

          .item-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem 0.75rem;
            background: var(--bg-card-subtle);
            border-radius: var(--radius-sm);
            border: 1px solid var(--border-card);

            .item-info {
              display: flex;
              flex-direction: column;

              .cat-label {
                font-size: 0.75rem;
                color: var(--text-muted);
              }
            }

            .item-calc {
              display: flex;
              align-items: center;
              gap: 1rem;

              .qty-calc {
                font-size: 0.78rem;
                color: var(--text-secondary);
              }

              .item-cost {
                color: var(--primary-maroon);
              }
            }
          }
        }

        .breakdown-box {
          background: #fdfaf3;
          border: 1px solid var(--border-gold);
          border-radius: var(--radius-sm);
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;

          .b-row {
            display: flex;
            justify-content: space-between;
            font-size: 0.85rem;
            color: var(--text-secondary);

            &.total {
              margin-top: 0.5rem;
              border-top: 1px solid rgba(201, 151, 56, 0.3);
              padding-top: 0.5rem;
              font-size: 1.05rem;
              font-weight: 800;
              color: var(--primary-maroon);
            }
          }
        }
      }
    }
  `]
})
export class AdminSelectionsComponent implements OnInit {
  private selectionService = inject(SelectionService);
  private toastService = inject(ToastService);

  selections = signal<CustomerSelection[]>([]);
  selectedDetail = signal<CustomerSelection | null>(null);

  ngOnInit() {
    this.loadSelections();
  }

  loadSelections() {
    this.selectionService.getAllSelections().subscribe({
      next: (res) => {
        if (res.success) {
          this.selections.set(res.data);
        }
      },
      error: () => this.toastService.error('Failed to load customer selections')
    });
  }

  openDetail(id: string) {
    this.selectionService.getSelectionById(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.selectedDetail.set(res.data);
        }
      },
      error: () => this.toastService.error('Failed to load selection details')
    });
  }
}
