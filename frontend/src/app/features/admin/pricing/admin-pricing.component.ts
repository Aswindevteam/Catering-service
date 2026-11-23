import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { PricingService } from '../../../core/services/pricing.service';
import { ToastService } from '../../../core/services/toast.service';
import { EstimationSettings } from '../../../core/models';

@Component({
  selector: 'app-admin-pricing',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="pricing-page">
      <!-- Page Header matching Figma Screen 6 -->
      <div class="page-head">
        <div class="head-text">
          <h1>Pricing & Estimation Settings</h1>
          <p>Configure pricing rules and additional charges.</p>
        </div>
      </div>

      <!-- Settings Card matching Figma Screen 6 -->
      <div class="pricing-card">
        <!-- Tabs Header matching Figma -->
        <div class="tabs-header">
          <button 
            type="button" 
            class="tab-btn" 
            [class.active]="activeTab() === 'general'" 
            (click)="activeTab.set('general')"
          >
            General Settings
          </button>
          <button 
            type="button" 
            class="tab-btn" 
            [class.active]="activeTab() === 'catering'" 
            (click)="activeTab.set('catering')"
          >
            Catering Charges
          </button>
          <button 
            type="button" 
            class="tab-btn" 
            [class.active]="activeTab() === 'transportation'" 
            (click)="activeTab.set('transportation')"
          >
            Transportation
          </button>
          <button 
            type="button" 
            class="tab-btn" 
            [class.active]="activeTab() === 'taxes'" 
            (click)="activeTab.set('taxes')"
          >
            Taxes & Others
          </button>
        </div>

        <form [formGroup]="pricingForm" (ngSubmit)="saveSettings()" class="settings-form">
          <div class="settings-grid">
            <!-- Left Fields Form -->
            <div class="form-inputs-col">
              @if (activeTab() === 'general' || activeTab() === 'catering') {
                <div class="grid-2">
                  <!-- Per Person Serving Quantity -->
                  <div class="wf-form-group">
                    <label for="serving-qty">Per Person Serving Quantity</label>
                    <select id="serving-qty" formControlName="default_serving_quantity">
                      <option [value]="80">80 g</option>
                      <option [value]="100">100 g</option>
                      <option [value]="120">120 g</option>
                      <option [value]="150">150 g</option>
                    </select>
                  </div>

                  <!-- Currency -->
                  <div class="wf-form-group">
                    <label for="currency">Currency</label>
                    <select id="currency" formControlName="currency">
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                    </select>
                  </div>
                </div>

                <!-- Service Charges Toggle & Input matching Figma -->
                <div class="grid-2 align-items-center">
                  <div class="toggle-field-row">
                    <label class="wf-toggle">
                      <input type="checkbox" formControlName="service_charge_enabled" (change)="onValuesChange()" />
                      <span class="slider"></span>
                    </label>
                    <span class="toggle-label">Enable Service Charges</span>
                  </div>

                  <div class="wf-form-group">
                    <label for="service-pct">Service Charge (%)</label>
                    <input 
                      id="service-pct" 
                      type="number" 
                      formControlName="service_charge_rate" 
                      (input)="onValuesChange()" 
                    />
                  </div>
                </div>
              }

              @if (activeTab() === 'general' || activeTab() === 'transportation') {
                <!-- Transportation Toggle & Input matching Figma -->
                <div class="grid-2 align-items-center">
                  <div class="toggle-field-row">
                    <label class="wf-toggle">
                      <input type="checkbox" formControlName="transportation_enabled" (change)="onValuesChange()" />
                      <span class="slider"></span>
                    </label>
                    <span class="toggle-label">Enable Transportation</span>
                  </div>

                  <div class="wf-form-group">
                    <label for="trans-charge">Transportation Charge (₹)</label>
                    <input 
                      id="trans-charge" 
                      type="number" 
                      formControlName="transportation_charge" 
                      (input)="onValuesChange()" 
                    />
                  </div>
                </div>
              }

              @if (activeTab() === 'general' || activeTab() === 'taxes') {
                <!-- Tax & Guest Thresholds -->
                <div class="grid-2 align-items-center">
                  <div class="toggle-field-row">
                    <label class="wf-toggle">
                      <input type="checkbox" formControlName="gst_enabled" (change)="onValuesChange()" />
                      <span class="slider"></span>
                    </label>
                    <span class="toggle-label">Enable GST</span>
                  </div>

                  <div class="wf-form-group">
                    <label for="gst-rate">GST Rate (%)</label>
                    <input 
                      id="gst-rate" 
                      type="number" 
                      formControlName="gst_rate" 
                      (input)="onValuesChange()" 
                    />
                  </div>
                </div>

                <div class="grid-2">
                  <div class="wf-form-group">
                    <label for="min-guests">Minimum Guests</label>
                    <input id="min-guests" type="number" formControlName="min_guests" (input)="onValuesChange()" />
                  </div>
                </div>
              }
            </div>

            <!-- Right Preview Card matching Figma Screen 6 -->
            <div class="preview-box-col">
              <div class="preview-card-inner">
                <div class="tax-head">
                  <span class="tax-title">Tax Settings</span>
                  <span class="gst-label">GST ({{ pricingForm.get('gst_rate')?.value || 5 }}%)</span>
                </div>

                <div class="divider"></div>

                <div class="estimate-preview-block">
                  <span class="preview-sub">Estimated Cost Preview</span>
                  <span class="preview-guest-note">(per guest sample baseline)</span>
                  <div class="preview-price-tag">
                    ₹{{ previewPerGuest() }}
                  </div>
                  <span class="preview-desc">
                    Calculated with sample 100 guests, baseline menu items, service fee and GST.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Action matching Figma Screen 6 -->
          <div class="settings-actions">
            <button type="submit" class="wf-btn primary" [disabled]="pricingForm.invalid || saving()">
              @if (saving()) {
                <span class="material-symbols-outlined spin">progress_activity</span>
                <span>Saving Settings...</span>
              } @else {
                <span>Save Settings</span>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .pricing-page {
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

    .pricing-card {
      background: #ffffff;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-card);
      box-shadow: 0 2px 8px rgba(61, 9, 22, 0.04);
      overflow: hidden;
    }

    .tabs-header {
      display: flex;
      gap: 2rem;
      padding: 1.25rem 1.75rem 0;
      border-bottom: 1px solid var(--border-subtle);

      .tab-btn {
        font-size: 0.92rem;
        font-weight: 600;
        color: var(--text-secondary);
        padding-bottom: 0.85rem;
        position: relative;
        cursor: pointer;

        &.active {
          color: var(--primary-maroon);

          &::after {
            content: '';
            position: absolute;
            bottom: -1px;
            left: 0;
            right: 0;
            height: 2px;
            background: var(--primary-maroon);
          }
        }
      }
    }

    .settings-form {
      padding: 1.75rem;
    }

    .settings-grid {
      display: grid;
      grid-template-columns: 1.7fr 1fr;
      gap: 2rem;

      @media (max-width: 960px) {
        grid-template-columns: 1fr;
      }
    }

    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;

      &.align-items-center {
        align-items: center;
      }
    }

    .toggle-field-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.25rem;

      .toggle-label {
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--text-primary);
      }
    }

    /* Right Preview Card matching Figma Screen 6 */
    .preview-card-inner {
      background: #fcf8ee;
      border: 1px solid var(--border-gold);
      border-radius: var(--radius-md);
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;

      .tax-head {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .tax-title {
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .gst-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--primary-maroon);
        }
      }

      .divider {
        height: 1px;
        background: rgba(201, 151, 56, 0.25);
      }

      .estimate-preview-block {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 0.35rem;
        padding: 1rem 0;

        .preview-sub {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .preview-guest-note {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .preview-price-tag {
          font-family: var(--font-display);
          font-size: 2.2rem;
          font-weight: 800;
          color: var(--primary-maroon);
          margin: 0.5rem 0;
        }

        .preview-desc {
          font-size: 0.78rem;
          color: var(--text-secondary);
          line-height: 1.4;
          max-width: 220px;
        }
      }
    }

    .settings-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 2rem;
      border-top: 1px solid var(--border-subtle);
      padding-top: 1.25rem;
    }

    .spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }
  `]
})
export class AdminPricingComponent implements OnInit {
  private pricingService = inject(PricingService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  activeTab = signal<'general' | 'catering' | 'transportation' | 'taxes'>('general');
  saving = signal<boolean>(false);
  previewPerGuest = signal<number>(135);

  pricingForm = this.fb.group({
    default_serving_quantity: [100, [Validators.required]],
    currency: ['INR', [Validators.required]],
    service_charge_rate: [5.0, [Validators.required]],
    service_charge_enabled: [true],
    transportation_charge: [2000, [Validators.required]],
    transportation_enabled: [true],
    gst_rate: [5.0, [Validators.required]],
    gst_enabled: [true],
    min_guests: [50, [Validators.required]]
  });

  ngOnInit() {
    this.pricingService.getSettings().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const s = res.data;
          this.pricingForm.patchValue({
            default_serving_quantity: s.default_serving_quantity,
            currency: s.currency,
            service_charge_rate: s.service_charge_rate,
            service_charge_enabled: Boolean(s.service_charge_enabled),
            transportation_charge: s.transportation_charge / 100, // convert paise to rupees
            transportation_enabled: Boolean(s.transportation_enabled),
            gst_rate: s.gst_rate,
            gst_enabled: Boolean(s.gst_enabled),
            min_guests: s.min_guests
          });
          this.calculateLocalPreview();
        }
      },
      error: () => this.toastService.error('Failed to load estimation settings')
    });
  }

  onValuesChange() {
    this.calculateLocalPreview();
  }

  calculateLocalPreview() {
    const val = this.pricingForm.value;
    const baseDishCost = 120; // ₹120 per guest baseline
    let total = baseDishCost;

    if (val.service_charge_enabled) {
      total += baseDishCost * (Number(val.service_charge_rate || 5) / 100);
    }
    if (val.transportation_enabled) {
      // For 100 guests, ₹2000 transportation is ₹20/guest
      total += (Number(val.transportation_charge || 2000) / 100);
    }
    if (val.gst_enabled) {
      total += total * (Number(val.gst_rate || 5) / 100);
    }

    this.previewPerGuest.set(Math.round(total));
  }

  saveSettings() {
    if (this.pricingForm.invalid) return;

    this.saving.set(true);
    const formVal = this.pricingForm.value;

    const payload: Partial<EstimationSettings> = {
      default_serving_quantity: Number(formVal.default_serving_quantity),
      currency: formVal.currency || 'INR',
      service_charge_rate: Number(formVal.service_charge_rate),
      service_charge_enabled: formVal.service_charge_enabled ? 1 : 0,
      transportation_charge: Math.round(Number(formVal.transportation_charge) * 100), // convert to paise
      transportation_enabled: formVal.transportation_enabled ? 1 : 0,
      gst_rate: Number(formVal.gst_rate),
      gst_enabled: formVal.gst_enabled ? 1 : 0,
      min_guests: Number(formVal.min_guests || 50)
    };

    this.pricingService.updateSettings(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.toastService.success('Pricing and estimation settings saved successfully!');
      },
      error: () => {
        this.saving.set(false);
        this.toastService.error('Failed to update settings');
      }
    });
  }
}
