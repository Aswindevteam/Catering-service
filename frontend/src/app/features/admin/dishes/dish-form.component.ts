import { Component, OnInit, inject, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DishService } from '../../../core/services/dish.service';
import { CategoryService } from '../../../core/services/category.service';
import { RecipeService } from '../../../core/services/recipe.service';
import { ToastService } from '../../../core/services/toast.service';
import { TranslationService } from '../../../core/services/translation.service';
import { ImageService } from '../../../core/services/image.service';
import { Dish, FoodCategory, DishImage, RecipeIngredient, RecipeStep } from '../../../core/models';

interface EditableIngredient {
  id?: string;
  name: string;
  base_quantity: number; // per guest
  unit: string; // 'g', 'ml', 'pcs', 'kg'
  cost_per_kg_or_unit: number; // in rupees (e.g. ₹375 / kg for paneer)
}

interface EditableStep {
  id?: string;
  step_number: number;
  instruction: string;
}

@Component({
  selector: 'app-dish-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="culinary-studio-page">
      <!-- Breadcrumb Bar matching Figma Screen 03 -->
      <div class="studio-topbar">
        <div class="breadcrumb">
          <a routerLink="/admin/dishes" class="crumb-link">Manage dishes</a>
          <span class="sep">/</span>
          <span class="crumb-current">{{ isEditing() ? 'Edit: ' + (dishForm.get('name')?.value || 'Dish') : 'Add New Dish' }}</span>
        </div>
        <div class="topbar-actions">
          <button type="button" class="btn-ghost" routerLink="/admin/dishes">
            <span class="material-symbols-outlined">close</span>
            <span>Discard</span>
          </button>
          <button type="button" class="btn-royal" (click)="onSubmit()" [disabled]="dishForm.invalid || saving()">
            @if (saving()) {
              <span class="material-symbols-outlined spin">progress_activity</span>
              <span>Saving...</span>
            } @else {
              <span class="material-symbols-outlined">save</span>
              <span>Save & Update Dish</span>
            }
          </button>
        </div>
      </div>

      <!-- Main Layout: Central Editorial Canvas (68-72%) + Right Pricing Inspector (320px) -->
      <div class="studio-grid">
        <!-- Central Editorial Canvas -->
        <main class="studio-canvas">
          <!-- Page Title Block -->
          <header class="dish-header-block">
            <h1 class="dish-title">{{ isEditing() ? 'Edit Dish: ' + (dishForm.get('name')?.value || 'Dish') : 'New Dish Creation' }}</h1>
            <p class="dish-subtitle">
              {{ dishForm.get('description')?.value || 'A celebratory feast centerpiece crafted with traditional spices and bespoke culinary artistry.' }}
            </p>
          </header>

          <!-- Hero Media Gallery Section matching Figma Screen 03 -->
          <section class="hero-gallery-section">
            <div class="hero-preview-box">
              @if (activePreviewUrl()) {
                <img [src]="imageService.resolveUrl(activePreviewUrl())" (error)="imageService.handleImageError($event)" [alt]="dishForm.get('name')?.value || 'Dish Preview'" class="hero-preview-img" />
              } @else {
                <div class="no-preview">
                  <span class="material-symbols-outlined icon">soup_kitchen</span>
                  <span class="hint">No Plated Photo Selected</span>
                </div>
              }

              <!-- Interactive Primary Cover Badge / Action Button -->
              @if (isCurrentPreviewPrimary()) {
                <div class="hero-badge is-primary" title="This image renders first in customer view">
                  <span class="material-symbols-outlined star-icon">star</span>
                  <span>{{ tService.currentLang() === 'ta' ? 'முதன்மை காட்சி படம் (வாடிக்கையாளருக்கு முதலில் தோன்றும்)' : 'Primary Presentation (Renders First to Customers)' }}</span>
                </div>
              } @else if (currentPreviewImage()) {
                <button 
                  type="button" 
                  class="set-primary-hero-btn" 
                  (click)="setAsPrimary(currentPreviewImage()!, $event)"
                  title="Make this photo render first to customers"
                >
                  <span class="material-symbols-outlined star-icon">hotel_class</span>
                  <span>{{ tService.currentLang() === 'ta' ? 'இதை முதன்மை படமாக மாற்று (Render First)' : 'Set as Primary Cover (Render First)' }}</span>
                </button>
              }
            </div>

            <!-- Thumbnail Grid & Cloudflare R2 Upload Box -->
            <div class="gallery-thumbs-grid">
              @for (img of existingImages(); track img.id) {
                <div 
                  class="thumb-box" 
                  [class.active]="activePreviewUrl() === img.image_url"
                  [class.is-primary]="img.is_primary === 1"
                  (click)="activePreviewUrl.set(img.image_url)"
                  [title]="img.is_primary === 1 ? 'Primary Cover (Renders first to customers)' : 'Click to preview or set as primary'"
                >
                  <img [src]="imageService.resolveUrl(img.image_url)" (error)="imageService.handleImageError($event)" [alt]="img.file_name || 'Thumbnail'" />
                  
                  <!-- Primary Star Tag or Make Primary Button -->
                  @if (img.is_primary === 1) {
                    <span class="thumb-primary-tag" title="Renders first to customers">
                      <span class="material-symbols-outlined">star</span>
                      <span class="tag-txt">Primary</span>
                    </span>
                  } @else {
                    <button 
                      type="button" 
                      class="thumb-make-primary-btn" 
                      (click)="setAsPrimary(img, $event)" 
                      title="Set as Primary (render first to customers)"
                    >
                      <span class="material-symbols-outlined">star_border</span>
                    </button>
                  }

                  <button type="button" class="thumb-delete-btn" (click)="deleteImage(img, $event)" title="Delete image">
                    <span class="material-symbols-outlined">delete</span>
                  </button>
                </div>
              }

              <!-- Upload + Box -->
              <label class="add-thumb-box" title="Upload Plated Dish Photo to Cloudflare R2">
                <input type="file" accept="image/*" (change)="onUploadImage($event)" hidden [disabled]="uploadingImage()" />
                @if (uploadingImage()) {
                  <span class="material-symbols-outlined spin">progress_activity</span>
                } @else {
                  <span class="material-symbols-outlined">add</span>
                }
                <span class="upload-lbl">Add Image</span>
              </label>
            </div>
          </section>

          <!-- Split Sub-Content: The Story (Left) + Culinary Blueprint & Scaling (Right) -->
          <div class="content-split-grid">
            <!-- Left Sub-card: The Story -->
            <div class="sub-card the-story-card">
              <div class="sub-card-header">
                <h3>{{ tService.t('admin.story.title') }}</h3>
                <span class="header-sub">{{ tService.t('admin.story.subtitle') }}</span>
              </div>

              <form [formGroup]="dishForm" class="story-form">
                <!-- Dish Name -->
                <div class="form-field">
                  <label for="name">{{ tService.t('admin.story.dishTitle') }} <span class="req">*</span></label>
                  <input id="name" type="text" formControlName="name" placeholder="e.g. Paneer Tikka" class="editorial-input" />
                </div>

                <!-- Narrative Description -->
                <div class="form-field">
                  <label for="description">{{ tService.t('admin.story.description') }}</label>
                  <textarea 
                    id="description" 
                    formControlName="description" 
                    rows="3" 
                    placeholder="Handcrafted, skewered cottage cheese, fire-roasted to perfection. An essential celebratory centerpiece representing tradition."
                    class="editorial-textarea"
                  ></textarea>
                </div>

                <!-- Food Category (Full Width Row) -->
                <div class="form-field category-autocomplete-field" (click)="$event.stopPropagation()">
                  <label for="category-search">{{ tService.t('admin.story.category') }} <span class="req">*</span></label>
                  <div 
                    class="cat-ac-input-box" 
                    [class.open]="catDropdownOpen()"
                    [class.invalid]="dishForm.get('category_id')?.touched && dishForm.get('category_id')?.invalid"
                  >
                    <span class="material-symbols-outlined cat-ac-icon">restaurant_menu</span>
                    <input 
                      id="category-search"
                      type="text" 
                      class="cat-ac-input" 
                      [placeholder]="getSelectedCategoryName() ? getSelectedCategoryName() : 'Search or select course...'"
                      [ngModel]="catSearchQuery()"
                      [ngModelOptions]="{standalone: true}"
                      (ngModelChange)="onCatSearchChange($event)"
                      (focus)="openCatDropdown()"
                      (keydown)="onCatKeydown($event)"
                    />
                    @if (catSearchQuery()) {
                      <button type="button" class="cat-ac-clear" (click)="clearCatSearch($event)" title="Clear filter">
                        <span class="material-symbols-outlined">close</span>
                      </button>
                    }
                    <button type="button" class="cat-ac-toggle" (click)="toggleCatDropdown($event)" aria-label="Toggle category list">
                      <span class="material-symbols-outlined">{{ catDropdownOpen() ? 'expand_less' : 'expand_more' }}</span>
                    </button>
                  </div>

                  @if (catDropdownOpen()) {
                    <div class="cat-ac-dropdown">
                      <div class="cat-ac-header">
                        <span>Select Course Category</span>
                        @if (catSearchQuery()) {
                          <span class="term">"{{ catSearchQuery() }}"</span>
                        }
                      </div>
                      <div class="cat-ac-list" role="listbox">
                        @for (cat of filteredCategories(); track cat.id; let idx = $index) {
                          <div 
                            class="cat-ac-item" 
                            [class.selected]="dishForm.get('category_id')?.value === cat.id"
                            [class.highlighted]="idx === highlightedCatIndex()"
                            (click)="selectCategory(cat)"
                            (mouseenter)="highlightedCatIndex.set(idx)"
                            role="option"
                          >
                            <div class="cat-ac-item-content">
                              <strong class="cat-name">{{ cat.name }}</strong>
                              @if (cat.description) {
                                <span class="cat-desc">{{ cat.description }}</span>
                              }
                            </div>
                            @if (dishForm.get('category_id')?.value === cat.id) {
                              <span class="material-symbols-outlined cat-check">check</span>
                            }
                          </div>
                        } @empty {
                          <div class="cat-no-match">
                            <span class="material-symbols-outlined">search_off</span>
                            <span>No category matches "{{ catSearchQuery() }}"</span>
                          </div>
                        }
                      </div>
                    </div>
                  }
                </div>

                <!-- Base Serving Unit (Moved to Next Row) -->
                <div class="form-field base-serving-unit-field">
                  <label>{{ tService.t('admin.story.baseUnit') }}</label>
                  <div class="unit-group">
                    <input type="number" formControlName="quantity_per_person" class="editorial-input qty-input" />
                    <select formControlName="serving_unit" class="editorial-select unit-select">
                      <option value="g">g (grams)</option>
                      <option value="pcs">pcs (pieces)</option>
                      <option value="ml">ml (milliliters)</option>
                    </select>
                  </div>
                </div>

                <!-- Food Type Chips -->
                <div class="form-field">
                  <label>{{ tService.t('admin.story.diet') }}</label>
                  <div class="diet-chips">
                    <button 
                      type="button" 
                      class="diet-chip veg" 
                      [class.active]="dishForm.get('food_type')?.value === 'veg'"
                      (click)="dishForm.patchValue({ food_type: 'veg' })"
                    >
                      <span class="diet-dot veg-dot"></span>
                      <span>Vegetarian</span>
                    </button>
                    <button 
                      type="button" 
                      class="diet-chip non-veg" 
                      [class.active]="dishForm.get('food_type')?.value === 'non-veg'"
                      (click)="dishForm.patchValue({ food_type: 'non-veg' })"
                    >
                      <span class="diet-dot non-veg-dot"></span>
                      <span>Non-Veg</span>
                    </button>
                    <button 
                      type="button" 
                      class="diet-chip vegan" 
                      [class.active]="dishForm.get('food_type')?.value === 'vegan'"
                      (click)="dishForm.patchValue({ food_type: 'vegan' })"
                    >
                      <span class="diet-dot vegan-dot"></span>
                      <span>Vegan / Jain</span>
                    </button>
                  </div>
                </div>

                <!-- Price & Min Order Row -->
                <div class="form-row-2">
                  <div class="form-field">
                    <label for="price-input">{{ tService.t('admin.targetPrice') }} (₹) <span class="req">*</span></label>
                    <input id="price-input" type="number" formControlName="price_per_person" min="1" class="editorial-input" />
                  </div>
                  <div class="form-field">
                    <label for="min-order">{{ tService.t('admin.story.minOrder') }}</label>
                    <input id="min-order" type="number" formControlName="min_order_quantity" class="editorial-input" />
                  </div>
                </div>

                <!-- Prep Time & Status -->
                <div class="form-row-2">
                  <div class="form-field">
                    <label for="prep-time">{{ tService.t('admin.story.prepTime') }}</label>
                    <input id="prep-time" type="text" formControlName="prep_time" placeholder="20 mins" class="editorial-input" />
                  </div>
                  <div class="form-field">
                    <label>{{ tService.t('admin.story.status') }}</label>
                    <label class="toggle-pill">
                      <input type="checkbox" formControlName="availability" />
                      <span class="toggle-track"></span>
                      <span class="toggle-text">{{ dishForm.get('availability')?.value ? 'Active & Curatable' : 'Inactive' }}</span>
                    </label>
                  </div>
                </div>
              </form>
            </div>

            <!-- Right Sub-card: Culinary Blueprint & Interactive Scaling -->
            <div class="sub-card blueprint-card">
              <div class="blueprint-header">
                <div class="header-titles">
                  <h3>Culinary Blueprint</h3>
                  <span class="guest-scaling-pill">
                    <span class="material-symbols-outlined">group</span>
                    Interactive Scaling for {{ guestScaleCount() }} Guests
                  </span>
                </div>

                <!-- Tabs: Ingredients & Cost | Preparation -->
                <div class="blueprint-tabs">
                  <button 
                    type="button" 
                    class="tab-link" 
                    [class.active]="blueprintTab() === 'ingredients'"
                    (click)="blueprintTab.set('ingredients')"
                  >
                    Ingredients & Cost
                  </button>
                  <button 
                    type="button" 
                    class="tab-link" 
                    [class.active]="blueprintTab() === 'preparation'"
                    (click)="blueprintTab.set('preparation')"
                  >
                    Preparation
                  </button>
                </div>
              </div>

              <!-- Interactive Guest Count Slider -->
              <div class="guest-slider-box">
                <div class="slider-info">
                  <span class="slider-label">Scale Raw Batch For:</span>
                  <div class="slider-count-badge">
                    <span class="count-num">{{ guestScaleCount() }}</span>
                    <span class="count-unit">Wedding Guests</span>
                  </div>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="2000" 
                  step="25" 
                  [value]="guestScaleCount()" 
                  (input)="onGuestCountChange($event)"
                  class="guest-range-slider"
                />
                <span class="slider-hint">
                  <span class="material-symbols-outlined">auto_awesome</span>
                  Multiplies raw quantities automatically (g &rarr; kg, ml &rarr; L, pcs)
                </span>
              </div>

              <!-- Tab Content: Ingredients & Cost Table -->
              @if (blueprintTab() === 'ingredients') {
                <div class="table-responsive">
                  <table class="editorial-table">
                    <thead>
                      <tr>
                        <th>Ingredient</th>
                        <th>Base Qty (per guest)</th>
                        <th>Scaled Qty (for {{ guestScaleCount() }})</th>
                        <th class="text-right">Estimated Cost</th>
                        <th class="col-act"></th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (item of ingredientsList(); track item.name; let idx = $index) {
                        <tr>
                          <td class="cell-name">
                            <input 
                              type="text" 
                              [(ngModel)]="item.name" 
                              class="inline-table-input"
                              placeholder="Ingredient name" 
                            />
                          </td>
                          <td class="cell-base">
                            <div class="inline-qty-wrap">
                              <input 
                                type="number" 
                                [(ngModel)]="item.base_quantity" 
                                class="inline-table-input num" 
                              />
                              <span class="unit-tag">{{ item.unit }}</span>
                            </div>
                          </td>
                          <td class="cell-scaled">
                            <span class="scaled-val">{{ getFormattedScaledQty(item) }}</span>
                          </td>
                          <td class="cell-cost text-right">
                            <span class="cost-val">₹{{ getScaledCost(item) | number:'1.0-0' }}</span>
                          </td>
                          <td class="col-act">
                            <button type="button" class="row-del-btn" (click)="removeIngredient(idx)" title="Remove ingredient">
                              <span class="material-symbols-outlined">close</span>
                            </button>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>

                <div class="table-bottom-bar">
                  <button type="button" class="btn-add-ing" (click)="addIngredient()">
                    <span class="material-symbols-outlined">add</span>
                    <span>Add Ingredient</span>
                  </button>
                  <div class="table-total-raw">
                    <span class="lbl">Total Raw Cost:</span>
                    <span class="val">₹{{ totalScaledCost() | number:'1.0-0' }}</span>
                    <span class="per-plate">(₹{{ rawCostPerGuest() | number:'1.2-2' }}/guest)</span>
                  </div>
                </div>
              } @else {
                <!-- Tab Content: Preparation Steps -->
                <div class="prep-steps-container">
                  <div class="steps-list">
                    @for (step of prepSteps(); track step.step_number; let idx = $index) {
                      <div class="step-row">
                        <div class="step-num">{{ idx + 1 }}</div>
                        <div class="step-content">
                          <textarea 
                            [(ngModel)]="step.instruction" 
                            rows="2" 
                            class="editorial-textarea step-txt"
                            placeholder="Describe cooking or marinade step..."
                          ></textarea>
                        </div>
                        <button type="button" class="row-del-btn" (click)="removeStep(idx)" title="Remove step">
                          <span class="material-symbols-outlined">close</span>
                        </button>
                      </div>
                    }
                  </div>
                  <button type="button" class="btn-add-ing" (click)="addStep()">
                    <span class="material-symbols-outlined">add</span>
                    <span>Add Preparation Step</span>
                  </button>
                </div>
              }
            </div>
          </div>
        </main>

        <!-- Right Hand Inspector: Pricing & Margin Inspector (320px) matching Figma Screen 03 -->
        <aside class="margin-inspector-sidebar">
          <div class="inspector-card">
            <div class="inspector-header">
              <h3>Pricing & Margin Inspector</h3>
              <div class="status-pill active">
                <span class="pulse-dot"></span>
                <span>Active / Live</span>
              </div>
            </div>

            <!-- Section 1: Target Price Per Plate -->
            <div class="metric-block target-price-block">
              <span class="block-label">Target Price per Plate</span>
              <div class="serif-price-wrap">
                <span class="currency-symbol">₹</span>
                <input 
                  type="number" 
                  [formControl]="$any(dishForm.get('price_per_person'))" 
                  class="serif-price-input" 
                  min="1"
                />
              </div>
              <span class="micro-note">Client proposal rate per wedding attendee</span>
            </div>

            <!-- Section 2: Breakdown Cards -->
            <div class="breakdown-cards-list">
              <div class="breakdown-item">
                <div class="b-info">
                  <span class="b-title">Estimated Raw Ingredient Cost</span>
                  <span class="b-sub">Derived from scaled blueprint</span>
                </div>
                <div class="b-val">₹{{ rawCostPerGuest() | number:'1.2-2' }}</div>
              </div>

              <div class="breakdown-item">
                <div class="b-info">
                  <span class="b-title">Prep & Labor Margin</span>
                  <span class="b-sub">Culinary chef & plating staff</span>
                </div>
                <div class="b-val">₹{{ laborMargin() | number:'1.2-2' }}</div>
              </div>
            </div>

            <!-- Section 3: Calculated Profit Margin % Badge -->
            <div class="margin-result-box" [class.healthy]="profitMarginPct() >= 20" [class.low]="profitMarginPct() < 20">
              <div class="result-top">
                <span class="result-label">Calculated Profit Margin</span>
                <span class="margin-pct">{{ profitMarginPct() }}% (₹{{ profitMarginAmount() | number:'1.2-2' }})</span>
              </div>
              <div class="margin-badge">
                @if (profitMarginPct() >= 20) {
                  <span class="material-symbols-outlined icon">check_circle</span>
                  <span>Meets target margin ({{ profitMarginPct() }}%)</span>
                } @else {
                  <span class="material-symbols-outlined icon">warning</span>
                  <span>Low margin threshold (&lt;20%)</span>
                }
              </div>
            </div>

            <!-- Section 4: Cost Summary Matrix for Guest Count -->
            <div class="cost-matrix-box">
              <h4 class="matrix-title">Cost Summary Matrix</h4>
              <div class="matrix-row">
                <span>Subtotal ({{ guestScaleCount() }} Guests)</span>
                <strong>₹{{ subtotalForGuests() | number:'1.0-0' }}</strong>
              </div>
              <div class="matrix-row">
                <span>Tax (GST 5%)</span>
                <strong>₹{{ taxForGuests() | number:'1.0-0' }}</strong>
              </div>
              <div class="matrix-row total">
                <span>Suggested Client Total</span>
                <strong class="gold-total">₹{{ grandTotalForGuests() | number:'1.0-0' }}</strong>
              </div>
            </div>

            <!-- Section 5: Quick-Save Actions -->
            <div class="inspector-actions">
              <button 
                type="button" 
                class="save-btn-primary" 
                (click)="onSubmit()"
                [disabled]="dishForm.invalid || saving()"
              >
                @if (saving()) {
                  <span class="material-symbols-outlined spin">progress_activity</span>
                  <span>Updating Dish...</span>
                } @else {
                  <span>Save & Update Dish</span>
                }
              </button>
              <button type="button" class="cancel-btn-ghost" routerLink="/admin/dishes">
                Cancel Changes
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  `,
  styles: [`
    .culinary-studio-page {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      width: 100%;
    }

    /* Top Breadcrumb Bar */
    .studio-topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #E5DEC9;

      .breadcrumb {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.88rem;

        .crumb-link {
          color: #8C7B70;
          text-decoration: none;
          &:hover { color: #5B1A24; text-decoration: underline; }
        }

        .sep { color: #C59B43; }
        .crumb-current { color: #382F2D; font-weight: 600; }
      }

      .topbar-actions {
        display: flex;
        align-items: center;
        gap: 0.75rem;

        .btn-ghost {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          border: 1px solid #E5DEC9;
          background: #FFFFFF;
          color: #5B1A24;
          font-size: 0.84rem;
          font-weight: 600;
          cursor: pointer;
          &:hover { background: #FAF8F5; }
        }

        .btn-royal {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.55rem 1.25rem;
          border-radius: 6px;
          border: none;
          background: #5B1A24;
          color: #FAF8F5;
          font-size: 0.86rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;

          &:hover:not(:disabled) {
            background: #421119;
            transform: translateY(-1px);
          }
          &:disabled { opacity: 0.6; cursor: not-allowed; }
        }
      }
    }

    /* Main Studio Grid Layout */
    .studio-grid {
      display: grid;
      grid-template-columns: 1fr 320px;
      gap: 1.5rem;
      align-items: start;

      @media (max-width: 1100px) {
        grid-template-columns: 1fr;
      }
    }

    /* Central Editorial Canvas */
    .studio-canvas {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      min-width: 0;
    }

    .dish-header-block {
      .dish-title {
        font-family: var(--font-serif, 'Playfair Display', serif);
        font-size: 1.85rem;
        font-weight: 700;
        color: #5B1A24;
        letter-spacing: -0.3px;
        line-height: 1.2;
      }

      .dish-subtitle {
        font-family: var(--font-sans, sans-serif);
        font-size: 0.92rem;
        color: #7A695C;
        margin-top: 0.35rem;
        font-style: italic;
      }
    }

    /* Hero Media Gallery Section */
    .hero-gallery-section {
      display: grid;
      grid-template-columns: 1fr 240px;
      gap: 1.25rem;
      background: #FFFFFF;
      border: 1px solid #E5DEC9;
      border-radius: 12px;
      padding: 1.25rem;
      box-shadow: 0 2px 10px rgba(66, 17, 25, 0.03);

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }

      .hero-preview-box {
        position: relative;
        height: 240px;
        background: #FAF8F5;
        border-radius: 8px;
        border: 1px solid #E5DEC9;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;

        .hero-preview-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
          &:hover { transform: scale(1.02); }
        }

        .no-preview {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          color: #9C8B7E;

          .icon { font-size: 44px; color: #C59B43; }
          .hint { font-size: 0.85rem; font-weight: 500; }
        }

        .hero-badge {
          position: absolute;
          bottom: 12px;
          left: 12px;
          background: rgba(91, 26, 36, 0.9);
          color: #EAD9B7;
          backdrop-filter: blur(6px);
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.4px;
          padding: 0.35rem 0.75rem;
          border-radius: 4px;
          border: 1px solid rgba(197, 155, 67, 0.4);
          display: flex;
          align-items: center;
          gap: 0.35rem;

          &.is-primary {
            background: linear-gradient(135deg, #4A101D 0%, #2F0B12 100%);
            color: #FFF2A3;
            border-color: #C59B43;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

            .star-icon {
              font-size: 15px;
              color: #FFD700;
            }
          }
        }

        .set-primary-hero-btn {
          position: absolute;
          bottom: 12px;
          left: 12px;
          background: linear-gradient(135deg, #C59B43 0%, #AA771C 100%);
          color: #2F0B12;
          border: none;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.4px;
          padding: 0.4rem 0.85rem;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
          transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(197, 155, 67, 0.5);
            background: linear-gradient(135deg, #E5BD68 0%, #C59B43 100%);
          }

          .star-icon {
            font-size: 16px;
          }
        }
      }

      .gallery-thumbs-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.75rem;

        .thumb-box {
          position: relative;
          height: 98px;
          border-radius: 6px;
          border: 2px solid transparent;
          overflow: hidden;
          background: #FAF8F5;
          cursor: pointer;
          transition: all 0.2s;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          &.active {
            border-color: #C59B43;
            box-shadow: 0 0 0 2px rgba(197, 155, 67, 0.2);
          }

          &.is-primary {
            border-color: #C59B43;
            box-shadow: 0 0 0 2.5px rgba(197, 155, 67, 0.45);
          }

          .thumb-primary-tag {
            position: absolute;
            top: 4px;
            left: 4px;
            background: linear-gradient(135deg, #C59B43 0%, #996515 100%);
            color: #2F0B12;
            font-size: 0.62rem;
            font-weight: 800;
            letter-spacing: 0.4px;
            text-transform: uppercase;
            padding: 0.15rem 0.45rem;
            border-radius: 3px;
            display: flex;
            align-items: center;
            gap: 0.2rem;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
            pointer-events: none;

            .material-symbols-outlined { font-size: 11px; color: #2F0B12; }
          }

          .thumb-make-primary-btn {
            position: absolute;
            top: 4px;
            left: 4px;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: rgba(47, 11, 18, 0.8);
            color: #FFF2A3;
            border: 1px solid rgba(197, 155, 67, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            opacity: 0;
            transition: all 0.2s;

            &:hover {
              background: #C59B43;
              color: #2F0B12;
              transform: scale(1.1);
            }

            .material-symbols-outlined { font-size: 14px; }
          }

          &:hover .thumb-make-primary-btn { opacity: 1; }

          .thumb-delete-btn {
            position: absolute;
            top: 4px;
            right: 4px;
            width: 22px;
            height: 22px;
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.65);
            color: #FFFFFF;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.2s;

            &:hover { background: #DC2626; }

            .material-symbols-outlined { font-size: 13px; }
          }

          &:hover .thumb-delete-btn { opacity: 1; }
        }

        .add-thumb-box {
          height: 98px;
          border-radius: 6px;
          border: 1.5px dashed #C59B43;
          background: #FAF8F5;
          color: #5B1A24;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          cursor: pointer;
          transition: all 0.2s;

          &:hover {
            background: #F3EFEA;
            border-color: #5B1A24;
          }

          .material-symbols-outlined { font-size: 24px; color: #C59B43; }
          .upload-lbl { font-size: 0.74rem; font-weight: 600; color: #5B1A24; }
        }
      }
    }

    /* Split Content: The Story (Left) + Culinary Blueprint (Right) */
    .content-split-grid {
      display: grid;
      grid-template-columns: 340px 1fr;
      gap: 1.5rem;

      @media (max-width: 950px) {
        grid-template-columns: 1fr;
      }
    }

    /* Sub Cards */
    .sub-card {
      background: #FFFFFF;
      border: 1px solid #E5DEC9;
      border-radius: 12px;
      padding: 1.35rem;
      box-shadow: 0 2px 10px rgba(66, 17, 25, 0.03);
    }

    .sub-card-header {
      margin-bottom: 1.15rem;
      border-bottom: 1px solid #F0ECE4;
      padding-bottom: 0.65rem;

      h3 {
        font-family: var(--font-serif, serif);
        font-size: 1.25rem;
        font-weight: 700;
        color: #5B1A24;
      }

      .header-sub {
        font-size: 0.76rem;
        color: #8C7B70;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }

    /* Form Fields */
    .story-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;

      label {
        font-size: 0.8rem;
        font-weight: 600;
        color: #4A3E39;

        .req { color: #A32D2D; }
      }
    }

    .category-autocomplete-field {
      position: relative;

      .cat-ac-input-box {
        display: flex;
        align-items: center;
        gap: 0.45rem;
        background: #FAF8F5;
        border: 1px solid #E5DEC9;
        border-radius: 6px;
        padding: 0.55rem 0.75rem;
        transition: all 0.2s ease;

        &.open, &:focus-within {
          background: #FFFFFF;
          border-color: #C59B43;
          box-shadow: 0 0 0 3px rgba(197, 155, 67, 0.15);
        }

        &.invalid {
          border-color: #ba1a1a;
        }

        .cat-ac-icon {
          font-size: 18px;
          color: #9e7626;
        }

        .cat-ac-input {
          border: none;
          background: transparent;
          outline: none;
          font-size: 0.88rem;
          color: #2F0B12;
          font-weight: 600;
          width: 100%;
          padding: 0;

          &::placeholder {
            color: #8C7B70;
            font-weight: 500;
          }
        }

        .cat-ac-clear, .cat-ac-toggle {
          background: none;
          border: none;
          color: #8C7B70;
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 0;
          &:hover { color: #5B1A24; }
          .material-symbols-outlined { font-size: 18px; }
        }
      }

      .cat-ac-dropdown {
        position: absolute;
        top: calc(100% + 4px);
        left: 0;
        right: 0;
        max-height: 280px;
        background: #ffffff;
        border: 1px solid #E5DEC9;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(91, 26, 36, 0.12);
        z-index: 1000;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        animation: fadeIn 0.15s ease;

        .cat-ac-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem 0.75rem;
          background: #FAF8F5;
          border-bottom: 1px solid #F0ECE4;
          font-size: 0.72rem;
          font-weight: 700;
          color: #8C7B70;
          text-transform: uppercase;
          letter-spacing: 0.5px;

          .term {
            color: #9e7626;
            font-style: italic;
          }
        }

        .cat-ac-list {
          overflow-y: auto;
          max-height: 230px;
          padding: 0.25rem 0;
        }

        .cat-ac-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          padding: 0.55rem 0.75rem;
          cursor: pointer;
          transition: background 0.15s;

          &:hover, &.highlighted {
            background: #FAF8F5;
          }

          &.selected {
            background: rgba(197, 155, 67, 0.12);
          }

          .cat-ac-item-content {
            display: flex;
            flex-direction: column;
            gap: 0.1rem;

            .cat-name {
              font-size: 0.86rem;
              color: #5B1A24;
            }

            .cat-desc {
              font-size: 0.72rem;
              color: #8C7B70;
            }
          }

          .cat-check {
            font-size: 18px;
            color: #C59B43;
            font-weight: 700;
          }
        }

        .cat-no-match {
          padding: 1rem;
          text-align: center;
          color: #8C7B70;
          font-size: 0.82rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.3rem;

          .material-symbols-outlined { font-size: 24px; color: #E5DEC9; }
        }
      }
    }

    .form-row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;

      @media (max-width: 600px) {
        grid-template-columns: 1fr;
      }
    }

    .editorial-input, .editorial-select, .editorial-textarea {
      width: 100%;
      padding: 0.65rem 0.85rem;
      border-radius: 6px;
      border: 1px solid #E5DEC9;
      background: #FAF8F5;
      font-size: 0.88rem;
      color: #2F0B12;
      font-family: var(--font-sans, sans-serif);
      outline: none;
      transition: all 0.2s ease;

      &:focus {
        background: #FFFFFF;
        border-color: #C59B43;
        box-shadow: 0 0 0 3px rgba(197, 155, 67, 0.15);
      }
    }

    .base-serving-unit-field {
      .unit-group {
        display: flex;
        gap: 0.5rem;
        max-width: 280px;
        .qty-input { flex: 1; }
        .unit-select { width: 130px; }
      }
    }

    .unit-group {
      display: flex;
      gap: 0.35rem;
      .qty-input { flex: 1; }
      .unit-select { width: 85px; }
    }

    .diet-chips {
      display: flex;
      gap: 0.4rem;
      flex-wrap: wrap;

      .diet-chip {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.45rem 0.75rem;
        border-radius: 20px;
        border: 1px solid #E5DEC9;
        background: #FAF8F5;
        font-size: 0.78rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;

        .diet-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .veg-dot { background: #2E7D32; }
        .non-veg-dot { background: #C62828; }
        .vegan-dot { background: #F57C00; }

        &.active {
          border-color: #5B1A24;
          background: #5B1A24;
          color: #FAF8F5;
        }
      }
    }

    .toggle-pill {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      margin-top: 0.3rem;

      input { display: none; }

      .toggle-track {
        width: 38px;
        height: 22px;
        border-radius: 11px;
        background: #E5DEC9;
        position: relative;
        transition: background 0.2s;

        &::after {
          content: '';
          position: absolute;
          left: 2px;
          top: 2px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #FFFFFF;
          transition: transform 0.2s;
        }
      }

      input:checked + .toggle-track {
        background: #2E7D32;
        &::after { transform: translateX(16px); }
      }

      .toggle-text {
        font-size: 0.8rem;
        font-weight: 600;
        color: #382F2D;
      }
    }

    /* Culinary Blueprint Card */
    .blueprint-card {
      display: flex;
      flex-direction: column;
      gap: 1.15rem;
    }

    .blueprint-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.75rem;
      border-bottom: 1px solid #F0ECE4;
      padding-bottom: 0.75rem;

      .header-titles {
        display: flex;
        align-items: center;
        gap: 0.85rem;

        h3 {
          font-family: var(--font-serif, serif);
          font-size: 1.25rem;
          font-weight: 700;
          color: #5B1A24;
        }

        .guest-scaling-pill {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          background: #FAF4E8;
          border: 1px solid #C59B43;
          color: #5B1A24;
          font-size: 0.74rem;
          font-weight: 700;
          padding: 0.25rem 0.65rem;
          border-radius: 20px;

          .material-symbols-outlined { font-size: 15px; color: #C59B43; }
        }
      }

      .blueprint-tabs {
        display: flex;
        gap: 0.5rem;

        .tab-link {
          padding: 0.4rem 0.85rem;
          border-radius: 6px;
          border: 1px solid #E5DEC9;
          background: #FAF8F5;
          font-size: 0.82rem;
          font-weight: 600;
          color: #7A695C;
          cursor: pointer;
          transition: all 0.2s;

          &.active {
            background: #5B1A24;
            color: #FAF8F5;
            border-color: #5B1A24;
          }
        }
      }
    }

    /* Guest Slider Box */
    .guest-slider-box {
      background: #FAF8F5;
      border: 1px solid #E5DEC9;
      border-radius: 8px;
      padding: 0.95rem 1.15rem;
      display: flex;
      flex-direction: column;
      gap: 0.55rem;

      .slider-info {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .slider-label {
          font-size: 0.82rem;
          font-weight: 600;
          color: #5B1A24;
        }

        .slider-count-badge {
          display: flex;
          align-items: baseline;
          gap: 0.3rem;

          .count-num {
            font-family: var(--font-serif, serif);
            font-size: 1.35rem;
            font-weight: 700;
            color: #5B1A24;
          }

          .count-unit {
            font-size: 0.76rem;
            color: #8C7B70;
            text-transform: uppercase;
            font-weight: 600;
          }
        }
      }

      .guest-range-slider {
        width: 100%;
        accent-color: #C59B43;
        cursor: pointer;
      }

      .slider-hint {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        font-size: 0.74rem;
        color: #8C7B70;
        font-style: italic;

        .material-symbols-outlined { font-size: 14px; color: #C59B43; }
      }
    }

    /* Editorial Scaling Table matching Figma */
    .table-responsive {
      overflow-x: auto;
      border: 1px solid #E5DEC9;
      border-radius: 8px;
    }

    .editorial-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.86rem;

      thead {
        background: #5B1A24;
        color: #EAD9B7;

        th {
          padding: 0.75rem 0.85rem;
          text-align: left;
          font-weight: 600;
          letter-spacing: 0.4px;
          font-size: 0.78rem;
          text-transform: uppercase;
          border-bottom: 1px solid rgba(197, 155, 67, 0.3);

          &.text-right { text-align: right; }
          &.col-act { width: 36px; }
        }
      }

      tbody {
        background: #FFFFFF;

        tr {
          border-bottom: 1px solid #F0ECE4;
          transition: background 0.15s;

          &:hover { background: #FAF8F5; }
        }

        td {
          padding: 0.65rem 0.85rem;
          vertical-align: middle;

          &.text-right { text-align: right; }
        }

        .inline-table-input {
          width: 100%;
          padding: 0.35rem 0.5rem;
          border-radius: 4px;
          border: 1px solid transparent;
          background: transparent;
          font-size: 0.86rem;
          color: #382F2D;
          font-weight: 500;

          &:hover { border-color: #E5DEC9; background: #FFFFFF; }
          &:focus { border-color: #C59B43; background: #FFFFFF; outline: none; }

          &.num { width: 60px; }
        }

        .inline-qty-wrap {
          display: flex;
          align-items: center;
          gap: 0.3rem;

          .unit-tag {
            font-size: 0.78rem;
            color: #8C7B70;
            font-weight: 600;
          }
        }

        .scaled-val {
          font-family: var(--font-serif, serif);
          font-weight: 700;
          color: #5B1A24;
        }

        .cost-val {
          font-weight: 700;
          color: #382F2D;
        }

        .row-del-btn {
          background: transparent;
          border: none;
          color: #A32D2D;
          cursor: pointer;
          padding: 0.2rem;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;

          &:hover { background: #FDF2F2; }
          .material-symbols-outlined { font-size: 16px; }
        }
      }
    }

    .table-bottom-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-top: 0.75rem;

      .btn-add-ing {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.45rem 0.85rem;
        border-radius: 6px;
        border: 1px dashed #C59B43;
        background: #FAF8F5;
        color: #5B1A24;
        font-size: 0.82rem;
        font-weight: 600;
        cursor: pointer;

        &:hover { background: #F3EFEA; }
        .material-symbols-outlined { font-size: 16px; color: #C59B43; }
      }

      .table-total-raw {
        display: flex;
        align-items: baseline;
        gap: 0.4rem;
        font-size: 0.86rem;

        .lbl { color: #7A695C; font-weight: 500; }
        .val { font-family: var(--font-sans, system-ui, sans-serif); font-variant-numeric: tabular-nums; font-size: 1.15rem; font-weight: 700; color: #5B1A24; }
        .per-plate { font-size: 0.78rem; color: #C59B43; font-weight: 600; }
      }
    }

    /* Prep Steps */
    .prep-steps-container {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;

      .steps-list {
        display: flex;
        flex-direction: column;
        gap: 0.65rem;
      }

      .step-row {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        background: #FAF8F5;
        border: 1px solid #E5DEC9;
        border-radius: 8px;
        padding: 0.65rem;

        .step-num {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: #5B1A24;
          color: #FAF8F5;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.78rem;
          font-weight: 700;
          flex-shrink: 0;
        }

        .step-content {
          flex: 1;

          .step-txt {
            background: #FFFFFF;
            font-size: 0.84rem;
            padding: 0.45rem 0.65rem;
          }
        }
      }
    }

    /* Right Inspector Sidebar: Pricing & Margin Inspector */
    .margin-inspector-sidebar {
      position: sticky;
      top: 80px;

      .inspector-card {
        background: #FFFFFF;
        border: 1px solid #E5DEC9;
        border-radius: 12px;
        padding: 1.35rem;
        box-shadow: 0 4px 16px rgba(66, 17, 25, 0.05);
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }

      .inspector-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid #F0ECE4;
        padding-bottom: 0.75rem;

        h3 {
          font-family: var(--font-serif, serif);
          font-size: 1.05rem;
          font-weight: 700;
          color: #5B1A24;
        }

        .status-pill {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          background: #ECFDF5;
          color: #15803D;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.2rem 0.55rem;
          border-radius: 20px;
          border: 1px solid #A7F3D0;

          .pulse-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #15803D;
          }
        }
      }

      /* Target Price Block */
      .target-price-block {
        background: #FAF8F5;
        border: 1px solid #E5DEC9;
        border-radius: 8px;
        padding: 0.85rem 1rem;

        .block-label {
          font-size: 0.76rem;
          font-weight: 600;
          color: #8C7B70;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .serif-price-wrap {
          display: flex;
          align-items: baseline;
          gap: 0.25rem;
          margin: 0.25rem 0;

          .currency-symbol {
            font-family: var(--font-sans, system-ui, -apple-system, sans-serif);
            font-size: 1.6rem;
            font-weight: 700;
            color: #5B1A24;
          }

          .serif-price-input {
            font-family: var(--font-sans, system-ui, -apple-system, sans-serif);
            font-variant-numeric: tabular-nums;
            font-size: 1.85rem;
            font-weight: 700;
            color: #5B1A24;
            background: transparent;
            border: none;
            width: 140px;
            outline: none;

            &:focus {
              border-bottom: 2px solid #C59B43;
            }
          }
        }

        .micro-note {
          font-size: 0.72rem;
          color: #7A695C;
          font-style: italic;
        }
      }

      /* Breakdown Cards */
      .breakdown-cards-list {
        display: flex;
        flex-direction: column;
        gap: 0.6rem;

        .breakdown-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.65rem 0.85rem;
          border-radius: 6px;
          background: #FAF8F5;
          border: 1px solid #F0ECE4;

          .b-info {
            display: flex;
            flex-direction: column;
            line-height: 1.2;

            .b-title {
              font-size: 0.78rem;
              font-weight: 600;
              color: #4A3E39;
            }

            .b-sub {
              font-size: 0.68rem;
              color: #8C7B70;
            }
          }

          .b-val {
            font-family: var(--font-sans, system-ui, -apple-system, sans-serif);
            font-variant-numeric: tabular-nums;
            font-weight: 700;
            font-size: 0.95rem;
            color: #382F2D;
          }
        }
      }

      /* Margin Result Box */
      .margin-result-box {
        border-radius: 8px;
        padding: 0.85rem 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        .result-top {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        &.healthy {
          background: #F0FDF4;
          border: 1px solid #BBF7D0;

          .result-label { color: #166534; font-size: 0.78rem; font-weight: 600; }
          .margin-pct { 
            font-family: var(--font-sans, system-ui, -apple-system, sans-serif); 
            font-variant-numeric: tabular-nums;
            font-size: 1.25rem; 
            font-weight: 700; 
            color: #15803D; 
          }
          .margin-badge {
            display: flex;
            align-items: center;
            gap: 0.35rem;
            font-size: 0.74rem;
            color: #15803D;
            font-weight: 600;
            .icon { font-size: 16px; }
          }
        }

        &.low {
          background: #FFFBEB;
          border: 1px solid #FDE68A;

          .result-label { color: #92400E; font-size: 0.78rem; font-weight: 600; }
          .margin-pct { 
            font-family: var(--font-sans, system-ui, -apple-system, sans-serif); 
            font-variant-numeric: tabular-nums;
            font-size: 1.25rem; 
            font-weight: 700; 
            color: #B45309; 
          }
          .margin-badge {
            display: flex;
            align-items: center;
            gap: 0.35rem;
            font-size: 0.74rem;
            color: #B45309;
            font-weight: 600;
            .icon { font-size: 16px; }
          }
        }
      }

      /* Cost Summary Matrix */
      .cost-matrix-box {
        border: 1px solid #E5DEC9;
        border-radius: 8px;
        padding: 0.85rem 1rem;
        background: #FAF8F5;
        display: flex;
        flex-direction: column;
        gap: 0.45rem;

        .matrix-title {
          font-size: 0.78rem;
          font-weight: 700;
          color: #5B1A24;
          letter-spacing: 0.4px;
          text-transform: uppercase;
          margin-bottom: 0.2rem;
        }

        .matrix-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.8rem;
          color: #6B5B52;

          strong {
            font-family: var(--font-sans, system-ui, -apple-system, sans-serif);
            font-variant-numeric: tabular-nums;
            color: #382F2D;
            font-weight: 600;
          }

          &.total {
            border-top: 1px dashed #E5DEC9;
            padding-top: 0.45rem;
            margin-top: 0.2rem;
            font-weight: 700;
            color: #5B1A24;

            .gold-total {
              font-family: var(--font-sans, system-ui, -apple-system, sans-serif);
              font-variant-numeric: tabular-nums;
              font-size: 1.2rem;
              font-weight: 700;
              color: #C59B43;
            }
          }
        }
      }

      /* Inspector Save Actions */
      .inspector-actions {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        .save-btn-primary {
          width: 100%;
          padding: 0.75rem;
          border-radius: 8px;
          border: 1px solid #C59B43;
          background: #5B1A24;
          color: #FAF8F5;
          font-size: 0.92rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          box-shadow: 0 4px 12px rgba(91, 26, 36, 0.2);
          transition: background 0.2s, transform 0.15s;

          &:hover:not(:disabled) {
            background: #421119;
            transform: translateY(-1px);
          }
          &:disabled { opacity: 0.6; cursor: not-allowed; }
        }

        .cancel-btn-ghost {
          width: 100%;
          padding: 0.5rem;
          background: transparent;
          border: none;
          color: #8C7B70;
          font-size: 0.82rem;
          cursor: pointer;
          text-align: center;
          text-decoration: none;

          &:hover {
            color: #5B1A24;
            text-decoration: underline;
          }
        }
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
export class DishFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dishService = inject(DishService);
  private categoryService = inject(CategoryService);
  private recipeService = inject(RecipeService);
  private toastService = inject(ToastService);
  tService = inject(TranslationService);
  imageService = inject(ImageService);

  isEditing = signal<boolean>(false);
  editingDishId = signal<string | null>(null);
  categories = signal<FoodCategory[]>([]);
  existingImages = signal<DishImage[]>([]);
  activePreviewUrl = signal<string | null>(null);

  isCurrentPreviewPrimary = computed(() => {
    const preview = this.activePreviewUrl();
    if (!preview) return false;
    const match = this.existingImages().find(img => img.image_url === preview);
    return match ? match.is_primary === 1 : false;
  });

  currentPreviewImage = computed(() => {
    const preview = this.activePreviewUrl();
    if (!preview) return null;
    return this.existingImages().find(img => img.image_url === preview) || null;
  });

  blueprintTab = signal<'ingredients' | 'preparation'>('ingredients');
  guestScaleCount = signal<number>(500);

  saving = signal<boolean>(false);
  uploadingImage = signal<boolean>(false);

  // Ingredients and Preparation steps lists
  ingredientsList = signal<EditableIngredient[]>([
    { name: 'Paneer / Protein', base_quantity: 80, unit: 'g', cost_per_kg_or_unit: 375 },
    { name: 'Thick Yogurt (Curd)', base_quantity: 30, unit: 'ml', cost_per_kg_or_unit: 100 },
    { name: 'Spices & Marinade', base_quantity: 10, unit: 'g', cost_per_kg_or_unit: 400 },
    { name: 'Lemon & Garnishes', base_quantity: 5, unit: 'g', cost_per_kg_or_unit: 200 }
  ]);

  prepSteps = signal<EditableStep[]>([
    { step_number: 1, instruction: 'Whisk thick hung curd with roasted chickpea flour, mustard oil, Kashmiri red chilli paste, kasuri methi, and chaat masala.' },
    { step_number: 2, instruction: 'Cut fresh malai paneer and bell peppers into 1.5-inch cubes; marinate gently for at least 45 minutes.' },
    { step_number: 3, instruction: 'Thread onto stainless steel skewers and fire in the tandoor at 250°C for 8-10 minutes until lightly charred and aromatic.' }
  ]);

  laborMargin = signal<number>(15.00); // ₹15 / guest labor & prep allowance

  // Category Search Autocomplete State
  catSearchQuery = signal<string>('');
  catDropdownOpen = signal<boolean>(false);
  highlightedCatIndex = signal<number>(-1);

  filteredCategories = computed(() => {
    const q = this.catSearchQuery().trim().toLowerCase();
    const cats = this.categories();
    if (!q) return cats;
    return cats.filter(c => 
      c.name.toLowerCase().includes(q) || 
      (c.description && c.description.toLowerCase().includes(q))
    );
  });

  @HostListener('document:click')
  onDocumentClick() {
    this.catDropdownOpen.set(false);
  }

  getSelectedCategoryName(): string {
    const catId = this.dishForm.get('category_id')?.value;
    if (!catId) return '';
    const match = this.categories().find(c => c.id === catId);
    return match ? match.name : '';
  }

  openCatDropdown() {
    this.catDropdownOpen.set(true);
    this.highlightedCatIndex.set(-1);
  }

  toggleCatDropdown(e: Event) {
    e.stopPropagation();
    this.catDropdownOpen.update(v => !v);
  }

  clearCatSearch(e: Event) {
    e.stopPropagation();
    this.catSearchQuery.set('');
    this.catDropdownOpen.set(true);
  }

  onCatSearchChange(val: string) {
    this.catSearchQuery.set(val);
    this.catDropdownOpen.set(true);
    this.highlightedCatIndex.set(0);
  }

  selectCategory(cat: FoodCategory) {
    this.dishForm.patchValue({ category_id: cat.id });
    this.dishForm.get('category_id')?.markAsDirty();
    this.catSearchQuery.set(cat.name);
    this.catDropdownOpen.set(false);
  }

  onCatKeydown(e: KeyboardEvent) {
    const list = this.filteredCategories();
    if (!this.catDropdownOpen()) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        this.catDropdownOpen.set(true);
        e.preventDefault();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.highlightedCatIndex.update(idx => Math.min(idx + 1, list.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.highlightedCatIndex.update(idx => Math.max(idx - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const currentIdx = this.highlightedCatIndex();
      if (currentIdx >= 0 && currentIdx < list.length) {
        this.selectCategory(list[currentIdx]);
      }
    } else if (e.key === 'Escape') {
      this.catDropdownOpen.set(false);
    }
  }

  dishForm = this.fb.group({
    name: ['Paneer Tikka', [Validators.required]],
    category_id: ['', [Validators.required]],
    food_type: ['veg', [Validators.required]],
    description: ['A celebratory starter of marinated paneer cubes skewered with bell peppers and roasted to smoky perfection.'],
    price_per_person: [80, [Validators.required, Validators.min(1)]],
    quantity_per_person: [100, [Validators.required, Validators.min(1)]],
    serving_unit: ['g', [Validators.required]],
    min_order_quantity: [50, [Validators.required]],
    prep_time: ['20 mins'],
    availability: [true]
  });

  // Dynamic calculations for Inspector
  totalScaledCost = computed(() => {
    const guests = this.guestScaleCount();
    let total = 0;
    for (const item of this.ingredientsList()) {
      const scaledQtyInBaseUnit = (item.base_quantity || 0) * guests;
      if (item.unit === 'g' || item.unit === 'ml') {
        const kgOrL = scaledQtyInBaseUnit / 1000;
        total += kgOrL * (item.cost_per_kg_or_unit || 0);
      } else {
        total += scaledQtyInBaseUnit * (item.cost_per_kg_or_unit || 0);
      }
    }
    return total;
  });

  rawCostPerGuest = computed(() => {
    const guests = this.guestScaleCount();
    if (guests <= 0) return 0;
    return this.totalScaledCost() / guests;
  });

  profitMarginAmount = computed(() => {
    const targetPrice = Number(this.dishForm.get('price_per_person')?.value || 80);
    const rawCost = this.rawCostPerGuest();
    const labor = this.laborMargin();
    return Math.max(0, targetPrice - rawCost - labor);
  });

  profitMarginPct = computed(() => {
    const targetPrice = Number(this.dishForm.get('price_per_person')?.value || 80);
    if (targetPrice <= 0) return 0;
    const profit = this.profitMarginAmount();
    return Math.round((profit / targetPrice) * 100);
  });

  subtotalForGuests = computed(() => {
    const targetPrice = Number(this.dishForm.get('price_per_person')?.value || 80);
    return targetPrice * this.guestScaleCount();
  });

  taxForGuests = computed(() => {
    return Math.round(this.subtotalForGuests() * 0.05); // 5% GST
  });

  grandTotalForGuests = computed(() => {
    return this.subtotalForGuests() + this.taxForGuests();
  });

  ngOnInit() {
    this.categoryService.getCategories(true).subscribe({
      next: (res) => {
        if (res.success && res.data.length > 0) {
          this.categories.set(res.data);
          if (!this.dishForm.get('category_id')?.value) {
            this.dishForm.patchValue({ category_id: res.data[0].id });
            this.catSearchQuery.set(res.data[0].name);
          } else {
            const currId = this.dishForm.get('category_id')?.value;
            const match = res.data.find(c => c.id === currId);
            if (match) this.catSearchQuery.set(match.name);
          }
        }
      }
    });

    const dishId = this.route.snapshot.paramMap.get('id');
    if (dishId) {
      this.isEditing.set(true);
      this.editingDishId.set(dishId);
      this.loadDish(dishId);
      this.loadRecipe(dishId);
    }
  }

  loadDish(id: string) {
    this.dishService.getDish(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const dish = res.data;
          this.dishForm.patchValue({
            name: dish.name,
            category_id: dish.category_id,
            food_type: dish.food_type,
            description: dish.description || '',
            price_per_person: dish.price_per_person / 100, // convert paise to rupees for input
            quantity_per_person: dish.quantity_per_person,
            serving_unit: dish.serving_unit,
            min_order_quantity: dish.min_order_quantity,
            prep_time: dish.prep_time,
            availability: Boolean(dish.availability)
          });

          const match = this.categories().find(c => c.id === dish.category_id);
          if (match) this.catSearchQuery.set(match.name);

          this.existingImages.set(dish.images || []);
          if (dish.images && dish.images.length > 0) {
            const primary = dish.images.find(img => img.is_primary === 1);
            this.activePreviewUrl.set(primary ? primary.image_url : dish.images[0].image_url);
          } else if (dish.primary_image_url) {
            this.activePreviewUrl.set(dish.primary_image_url);
          }
        }
      },
      error: () => this.toastService.error('Failed to load dish details')
    });
  }

  setAsPrimary(img: DishImage, event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (img.is_primary === 1) return;

    const dishId = this.editingDishId();
    if (dishId) {
      this.dishService.setPrimaryDishImage(dishId, img.id).subscribe({
        next: () => {
          this.existingImages.update(imgs =>
            imgs.map(i => ({
              ...i,
              is_primary: i.id === img.id ? 1 : 0
            }))
          );
          this.activePreviewUrl.set(img.image_url);
          const msg = this.tService.currentLang() === 'ta'
            ? 'முதன்மை படம் மாற்றப்பட்டது! வாடிக்கையாளருக்கு முதலில் இது தோன்றும்.'
            : 'Primary cover updated! This image will now render first to customers.';
          this.toastService.success(msg);
        },
        error: () => this.toastService.error('Failed to update primary image')
      });
    } else {
      this.existingImages.update(imgs =>
        imgs.map(i => ({
          ...i,
          is_primary: i === img ? 1 : 0
        }))
      );
      this.activePreviewUrl.set(img.image_url);
      this.toastService.success('Cover image selected for customer view.');
    }
  }

  loadRecipe(dishId: string) {
    this.recipeService.getRecipeByDishId(dishId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const recipe = res.data;
          if (recipe.ingredients && recipe.ingredients.length > 0) {
            this.ingredientsList.set(
              recipe.ingredients.map(ing => ({
                id: ing.id,
                name: ing.name,
                base_quantity: ing.quantity,
                unit: ing.unit,
                cost_per_kg_or_unit: 300 // default benchmark
              }))
            );
          }
          if (recipe.steps && recipe.steps.length > 0) {
            this.prepSteps.set(
              recipe.steps.map(step => ({
                id: step.id,
                step_number: step.step_number,
                instruction: step.instruction
              }))
            );
          }
        }
      },
      error: () => {
        // Fallback default ingredients retain
      }
    });
  }

  onGuestCountChange(event: any) {
    const val = Number(event.target.value);
    this.guestScaleCount.set(val);
  }

  getFormattedScaledQty(item: EditableIngredient): string {
    const guests = this.guestScaleCount();
    const totalQty = (item.base_quantity || 0) * guests;

    if (item.unit === 'g') {
      if (totalQty >= 1000) {
        return (totalQty / 1000).toFixed(1).replace(/\.0$/, '') + ' kg';
      }
      return `${totalQty} g`;
    } else if (item.unit === 'ml') {
      if (totalQty >= 1000) {
        return (totalQty / 1000).toFixed(1).replace(/\.0$/, '') + ' L';
      }
      return `${totalQty} ml`;
    } else {
      return `${totalQty} ${item.unit}`;
    }
  }

  getScaledCost(item: EditableIngredient): number {
    const guests = this.guestScaleCount();
    const totalQty = (item.base_quantity || 0) * guests;
    if (item.unit === 'g' || item.unit === 'ml') {
      return (totalQty / 1000) * (item.cost_per_kg_or_unit || 0);
    }
    return totalQty * (item.cost_per_kg_or_unit || 0);
  }

  addIngredient() {
    this.ingredientsList.update(list => [
      ...list,
      { name: 'Fresh Aromatics / Herbs', base_quantity: 10, unit: 'g', cost_per_kg_or_unit: 150 }
    ]);
  }

  removeIngredient(index: number) {
    this.ingredientsList.update(list => list.filter((_, i) => i !== index));
  }

  addStep() {
    this.prepSteps.update(steps => [
      ...steps,
      { step_number: steps.length + 1, instruction: '' }
    ]);
  }

  removeStep(index: number) {
    this.prepSteps.update(steps => steps.filter((_, i) => i !== index));
  }

  onUploadImage(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    const dishId = this.editingDishId();
    if (!dishId) {
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        this.activePreviewUrl.set(url);
        this.existingImages.update(imgs => [
          ...imgs,
          {
            id: 'temp_' + Date.now(),
            dish_id: '',
            image_r2_key: 'temp',
            image_url: url,
            is_primary: imgs.length === 0 ? 1 : 0,
            display_order: imgs.length + 1,
            file_name: file.name
          }
        ]);
      };
      reader.readAsDataURL(file);
      return;
    }

    this.uploadingImage.set(true);
    const isPrimary = this.existingImages().length === 0;

    this.dishService.uploadDishImage(dishId, file, isPrimary).subscribe({
      next: (res) => {
        this.uploadingImage.set(false);
        if (res.success) {
          this.toastService.success('Dish image uploaded to Cloudflare R2!');
          this.existingImages.update(imgs => [...imgs, res.data]);
          this.activePreviewUrl.set(res.data.image_url);
        }
      },
      error: () => {
        this.uploadingImage.set(false);
        this.toastService.error('Failed to upload image to R2');
      }
    });
  }

  deleteImage(img: DishImage, event: Event) {
    event.stopPropagation();
    const dishId = this.editingDishId();
    if (!dishId) {
      this.existingImages.update(imgs => imgs.filter(i => i !== img));
      return;
    }

    this.dishService.deleteDishImage(dishId, img.id).subscribe({
      next: () => {
        this.toastService.success('Image deleted from Cloudflare R2.');
        this.existingImages.update(imgs => {
          const list = imgs.filter(i => i.id !== img.id);
          if (img.is_primary === 1 && list.length > 0) {
            list[0].is_primary = 1;
          }
          return list;
        });
        const remaining = this.existingImages();
        const primary = remaining.find(i => i.is_primary === 1);
        this.activePreviewUrl.set(primary ? primary.image_url : (remaining.length > 0 ? remaining[0].image_url : null));
      },
      error: () => this.toastService.error('Failed to delete image')
    });
  }

  onSubmit() {
    if (this.dishForm.invalid) return;

    this.saving.set(true);
    const formVal = this.dishForm.value;

    const payload: Partial<Dish> = {
      name: formVal.name!,
      category_id: formVal.category_id!,
      food_type: formVal.food_type as any,
      description: formVal.description || undefined,
      price_per_person: Math.round(Number(formVal.price_per_person) * 100), // rupees to paise
      quantity_per_person: Number(formVal.quantity_per_person),
      serving_unit: formVal.serving_unit || 'g',
      min_order_quantity: Number(formVal.min_order_quantity || 50),
      prep_time: formVal.prep_time || '20 mins',
      availability: formVal.availability ? 1 : 0
    };

    if (this.isEditing() && this.editingDishId()) {
      this.dishService.updateDish(this.editingDishId()!, payload).subscribe({
        next: () => {
          this.saving.set(false);
          this.toastService.success('Dish and scaling blueprint updated!');
          this.router.navigate(['/admin/dishes']);
        },
        error: () => {
          this.saving.set(false);
          this.toastService.error('Failed to update dish');
        }
      });
    } else {
      this.dishService.createDish(payload).subscribe({
        next: (res) => {
          this.saving.set(false);
          this.toastService.success('Dish created successfully in Culinary Studio!');
          this.router.navigate(['/admin/dishes']);
        },
        error: () => {
          this.saving.set(false);
          this.toastService.error('Failed to create dish');
        }
      });
    }
  }
}