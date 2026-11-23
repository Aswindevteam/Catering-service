import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DishService } from '../../../core/services/dish.service';
import { CategoryService } from '../../../core/services/category.service';
import { SelectionService, SelectedDishItem } from '../../../core/services/selection.service';
import { TranslationService } from '../../../core/services/translation.service';
import { RecipeService } from '../../../core/services/recipe.service';
import { ToastService } from '../../../core/services/toast.service';
import { Dish, FoodCategory, Recipe } from '../../../core/models';

@Component({
  selector: 'app-menu-selection',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="menu-selection-page">
      <!-- Atmospheric Wedding Banquet Hero Header -->
      <header class="celebration-hero-banner">
        <div class="hero-video-bg">
          <video 
            class="bg-video" 
            autoplay 
            muted 
            loop 
            playsinline 
            poster="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=80"
          >
            <source src="https://assets.mixkit.co/videos/preview/mixkit-dining-room-at-a-luxurious-wedding-banquet-42774-large.mp4" type="video/mp4">
          </video>
          <div class="hero-gradient-overlay"></div>
        </div>

        <div class="hero-banner-content">
          <div class="hero-left">
            <span class="hero-tagline">
              <span class="material-symbols-outlined">auto_awesome</span>
              {{ translationService.t('brand.tagline') }}
            </span>
            <h1 class="hero-headline">{{ translationService.t('hero.title') }}</h1>
            <p class="hero-desc">{{ translationService.t('hero.subtitle') }}</p>
          </div>

          <div class="hero-right-meta">
            <div class="event-quick-chip">
              <div class="chip-icon">
                <span class="material-symbols-outlined">celebration</span>
              </div>
              <div class="chip-text">
                <span class="chip-title">{{ selectionService.eventDetails().event_name }}</span>
                <span class="chip-sub">{{ selectionService.eventDetails().venue || 'Grand Banquet' }}</span>
              </div>
            </div>

            <div class="guest-counter-pill">
              <span class="lbl">{{ translationService.t('event.guestsCount') }}:</span>
              <div class="stepper-wrap">
                <button type="button" class="btn-step" (click)="adjustGuests(-25)" aria-label="Decrease guests">-</button>
                <strong class="count-val">{{ selectionService.eventDetails().guest_count }}</strong>
                <button type="button" class="btn-step" (click)="adjustGuests(25)" aria-label="Increase guests">+</button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Main 2-Column Split: 65% Menu Dishes (Left) + 35% Sticky Estimation (Right) -->
      <div class="catering-layout-grid">
        <!-- LEFT PANEL (65%): Categories, Search, Filters, Cascading Dishes -->
        <main class="dishes-stream-column">
          <!-- Sticky Course Navigation Bar -->
          <nav class="course-pills-bar">
            <button 
              type="button" 
              class="course-pill" 
              [class.active]="activeCategory() === 'all'"
              (click)="scrollToCategory('all')"
            >
              {{ translationService.t('cat.all') }}
            </button>
            @for (cat of categories(); track cat.id) {
              <button 
                type="button" 
                class="course-pill" 
                [class.active]="activeCategory() === cat.id"
                (click)="scrollToCategory(cat.id)"
              >
                {{ cat.name }}
              </button>
            }
          </nav>

          <!-- Search & Dietary Filters Toolbar -->
          <div class="filters-toolbar">
            <div class="search-input-wrap">
              <span class="material-symbols-outlined search-icon">search</span>
              <input 
                type="text" 
                [(ngModel)]="searchQuery" 
                placeholder="Search appetizers, idly, vada, gravies, biryani, desserts..." 
                class="dish-search-box"
              />
              @if (searchQuery) {
                <button type="button" class="clear-btn" (click)="searchQuery = ''">
                  <span class="material-symbols-outlined">close</span>
                </button>
              }
            </div>

            <div class="dietary-pills-wrap">
              <button 
                type="button" 
                class="diet-pill" 
                [class.active]="dietFilter() === 'all'"
                (click)="dietFilter.set('all')"
              >
                {{ translationService.t('diet.all') }}
              </button>
              <button 
                type="button" 
                class="diet-pill veg" 
                [class.active]="dietFilter() === 'veg'"
                (click)="dietFilter.set('veg')"
              >
                <span class="diet-dot veg-dot"></span>
                <span>{{ translationService.t('diet.veg') }}</span>
              </button>
              <button 
                type="button" 
                class="diet-pill non-veg" 
                [class.active]="dietFilter() === 'non-veg'"
                (click)="dietFilter.set('non-veg')"
              >
                <span class="diet-dot non-veg-dot"></span>
                <span>{{ translationService.t('diet.nonveg') }}</span>
              </button>
              <button 
                type="button" 
                class="diet-pill vegan" 
                [class.active]="dietFilter() === 'vegan'"
                (click)="dietFilter.set('vegan')"
              >
                <span class="diet-dot vegan-dot"></span>
                <span>{{ translationService.t('diet.vegan') }}</span>
              </button>
            </div>
          </div>

          <!-- Cascading Single-Column Plated Dish Cards -->
          <div class="dishes-list-wrap">
            @for (dish of filteredDishes(); track dish.id) {
              <article 
                class="editorial-dish-row" 
                [class.in-tray]="selectionService.isDishSelected(dish.id)"
              >
                <div class="dish-row-inner" (click)="openDishModal(dish)">
                  <!-- Circular Plated Photo with Specular Hover Depth -->
                  <div class="circular-platter-visual" (click)="openDishModal(dish, $event)" [title]="translationService.t('dishModal.viewPlating')">
                    <img 
                      [src]="dish.primary_image_url || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=350&q=80'" 
                      [alt]="dish.name" 
                      loading="lazy" 
                    />
                    <div class="specular-ring"></div>
                    <div class="zoom-cue">
                      <span class="material-symbols-outlined">zoom_in</span>
                    </div>
                  </div>

                  <!-- Dish Details -->
                  <div class="dish-content-body">
                    <div class="dish-title-row">
                      <h3 class="serif-dish-name" (click)="openDishModal(dish, $event)">{{ dish.name }}</h3>
                      <button type="button" class="view-plating-btn" (click)="openDishModal(dish, $event)" [title]="translationService.t('dishModal.viewPlating')">
                        <span class="material-symbols-outlined">photo_library</span>
                        <span>{{ translationService.t('dishModal.viewPlating') }}</span>
                      </button>
                    </div>

                    <!-- 2-Line Tasting Note -->
                    <p class="culinary-tasting-note" (click)="openDishModal(dish, $event)">
                      {{ dish.description || 'Authentic heirloom preparation cooked with royal spices and fragrant ghee.' }}
                    </p>

                    <!-- Dietary & Smart Portion Badges -->
                    <div class="badges-portion-row">
                      <span class="badge-chip dietary" [ngClass]="dish.food_type">
                        <span class="food-type-badge" [ngClass]="dish.food_type"><span class="dot"></span></span>
                        <span>{{ dish.food_type === 'veg' ? translationService.t('diet.veg') : dish.food_type === 'non-veg' ? translationService.t('diet.nonveg') : translationService.t('diet.vegan') }}</span>
                      </span>

                      <span class="badge-chip spice">
                        <span class="material-symbols-outlined fire-icon">local_fire_department</span>
                        <span>{{ getSpiceBadge(dish) }}</span>
                      </span>

                      <!-- Authentic Wedding Portion Specification e.g. "2 pcs / guest" or "100 g / guest" -->
                      <span class="badge-chip portion" [class.customized]="isPortionCustomized(dish)" title="Serving portion for each guest">
                        <span class="material-symbols-outlined">scale</span>
                        <span><strong>{{ formatServing(dish) }}</strong> / {{ translationService.t('unit.guest') }}</span>
                        @if (isPortionCustomized(dish)) {
                          <span class="customized-indicator" title="Customized portion">&bull; Custom</span>
                        }
                      </span>
                    </div>

                    <!-- Price & Add/Remove Action Strip -->
                    <div class="price-action-strip" (click)="$event.stopPropagation()">
                      <div class="price-callout">
                        <span class="currency-symbol">₹</span>
                        <span class="rupee-val">{{ getDishEffectivePrice(dish) }}</span>
                        <span class="rupee-sub">{{ translationService.t('unit.person') }}</span>
                        @if (isPortionCustomized(dish)) {
                          <span class="scaled-badge" [title]="'Customized portion from base ₹' + (dish.price_per_person / 100)">
                            (scaled)
                          </span>
                        }
                      </div>

                      <div class="action-btn-area">
                        @if (!selectionService.isDishSelected(dish.id)) {
                          <button type="button" class="wf-btn primary add-feast-btn" (click)="addDish(dish, $event)">
                            <span class="material-symbols-outlined plus-icon">add</span>
                            <span>{{ translationService.t('action.addToFeast') }}</span>
                          </button>
                        } @else {
                          <div class="morph-stepper">
                            <button type="button" class="step-btn" (click)="decrementPortion(dish, $event)" aria-label="Decrease portion">-</button>
                            <span class="step-display">
                              {{ formatSelectedPortion(dish) }}
                            </span>
                            <button type="button" class="step-btn" (click)="incrementPortion(dish, $event)" aria-label="Increase portion">+</button>
                            <button type="button" class="remove-chip-btn" (click)="removeDish(dish.id, $event)" title="Remove item">
                              <span class="material-symbols-outlined">close</span>
                            </button>
                          </div>
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            } @empty {
              <div class="no-results-card">
                <span class="material-symbols-outlined empty-icon">dinner_dining</span>
                <h4>No matching dishes found</h4>
                <p>Try clearing your dietary filter or search query.</p>
              </div>
            }
          </div>
        </main>

        <!-- RIGHT PANEL (35%): Sticky Live Catering Estimation Summary -->
        <aside class="sticky-estimation-column">
          <div class="estimation-receipt-card">
            <!-- Header matching Figma Luxury Receipt -->
            <div class="receipt-header">
              <div class="receipt-crest">
                <svg viewBox="0 0 36 36" width="30" height="30" fill="none">
                  <path d="M18 3C19 7 24 10 28 12C24 14 22 18 18 25C14 18 12 14 8 12C12 10 17 7 18 3Z" fill="#C59B43"/>
                  <circle cx="18" cy="15" r="3.5" fill="#421119"/>
                  <path d="M7 23C11 21 14 22 18 26C22 22 25 21 29 23C25 28 22 30 18 30C14 30 11 28 7 23Z" fill="#EAD9B7"/>
                </svg>
              </div>
              <h3 class="receipt-title">{{ translationService.t('receipt.yourEstimation') }}</h3>
              <div class="receipt-event-badge">
                <span>{{ selectionService.eventDetails().guest_count }} {{ translationService.t('unit.guests') }}</span>
                <span class="dot">&bull;</span>
                <span>{{ selectionService.eventDetails().event_type }}</span>
              </div>
            </div>

            <!-- Live Selected Dishes Tray -->
            <div class="selected-tray-section">
              <div class="tray-head">
                <span class="tray-title">{{ selectionService.selectedDishes().size }} Dishes Selected</span>
                @if (selectionService.selectedDishes().size > 0) {
                  <button type="button" class="btn-clear-tray" (click)="selectionService.clearSelection()">
                    Clear All
                  </button>
                }
              </div>

              @if (selectionService.selectedDishes().size === 0) {
                <div class="empty-tray-box">
                  <span class="material-symbols-outlined empty-tray-icon">soup_kitchen</span>
                  <p class="empty-tray-txt">Your feast tray is currently empty.</p>
                  <span class="empty-tray-sub">Tap <strong>+ Add to Feast</strong> on any dish to generate your live wedding estimate.</span>
                </div>
              } @else {
                <div class="tray-items-list">
                  @for (entry of selectedDishesList(); track entry.dish.id) {
                    <div class="tray-item-row">
                      <div class="item-meta">
                        <span class="item-name">{{ entry.dish.name }}</span>
                        <span class="item-portion">{{ entry.quantity_per_person }} {{ entry.dish.serving_unit || 'g' }} / guest</span>
                      </div>
                      <div class="item-price-actions">
                        <span class="item-cost">₹{{ getItemCost(entry).toLocaleString('en-IN') }}</span>
                        <button type="button" class="item-del-btn" (click)="removeDish(entry.dish.id, $event)" title="Remove item">
                          <span class="material-symbols-outlined">close</span>
                        </button>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>

            <!-- Cost Breakdown Rows -->
            <div class="receipt-breakdown">
              <div class="receipt-row">
                <span class="lbl">{{ translationService.t('receipt.foodSubtotal') }}</span>
                <strong class="val">₹{{ ((selectionService.calculation()?.subtotal || 0) / 100).toLocaleString('en-IN') }}</strong>
              </div>
              <div class="receipt-row">
                <span class="lbl">{{ translationService.t('receipt.cateringCharges') }} (10%)</span>
                <strong class="val">₹{{ ((selectionService.calculation()?.service_charge || 0) / 100).toLocaleString('en-IN') }}</strong>
              </div>
              <div class="receipt-row">
                <span class="lbl">{{ translationService.t('receipt.transportation') }}</span>
                <strong class="val">₹{{ ((selectionService.calculation()?.transportation_charge || 0) / 100).toLocaleString('en-IN') }}</strong>
              </div>
              <div class="receipt-row">
                <span class="lbl">{{ translationService.t('receipt.gst') }} (5%)</span>
                <strong class="val">₹{{ ((selectionService.calculation()?.gst_amount || 0) / 100).toLocaleString('en-IN') }}</strong>
              </div>
            </div>

            <!-- Grand Total Highlight Card -->
            <div class="receipt-grand-total-card">
              <div class="gt-left">
                <span class="gt-label">{{ translationService.t('receipt.grandTotal') }}:</span>
                <div class="gt-amount-wrap">
                  <span class="currency-symbol">₹</span>
                  <span class="gt-amount">{{ ((selectionService.calculation()?.grand_total || 0) / 100).toLocaleString('en-IN') }}</span>
                </div>
              </div>
              <div class="gt-right">
                <span class="per-guest-pill">
                  ₹{{ ((selectionService.calculation()?.cost_per_guest || 0) / 100).toFixed(0) }} / {{ translationService.t('unit.guest') }}
                </span>
              </div>
            </div>

            <!-- Primary Navigation to Proposal -->
            <div class="receipt-actions">
              <a 
                routerLink="/menu-review" 
                class="btn-confirm-proposal"
                [class.disabled]="selectionService.selectedDishes().size === 0"
              >
                <span>{{ translationService.t('action.reviewMenu') }}</span>
                <span class="material-symbols-outlined">arrow_forward</span>
              </a>
            </div>
          </div>
        </aside>
      </div>

      <!-- Mobile Floating Bottom Quote Dock (Shown only on small screens) -->
      @if (selectionService.selectedDishes().size > 0) {
        <aside class="mobile-floating-quote-dock">
          <div class="dock-glass-content">
            <div class="dock-left">
              <span class="dock-badge">{{ selectionService.selectedDishes().size }} Dishes Selected</span>
              <span class="dock-divider">&bull;</span>
              <span class="dock-guest-count">{{ selectionService.eventDetails().guest_count }} Guests</span>
              <div class="dock-total-cost">
                <span class="currency-symbol">₹</span>
                <strong class="rupee-val">{{ ((selectionService.calculation()?.grand_total || 0) / 100).toLocaleString('en-IN') }}</strong>
                <span class="est-lbl">Est. Total</span>
              </div>
            </div>
            <button class="review-cta-btn" routerLink="/menu-review">
              <span>Review</span>
              <span class="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </aside>
      }
      <!-- Luxury Editorial Dish Presentation & Carousel Modal -->
      @if (activeDishModal(); as modalDish) {
        <div class="dish-modal-backdrop" (click)="closeDishModal()">
          <div class="dish-modal-card" (click)="$event.stopPropagation()">
            <!-- Modal Header -->
            <div class="dish-modal-header">
              <div class="header-left">
                <span class="modal-category-badge">{{ modalDish.category_name || 'Traditional Feast' }}</span>
                <h2 class="modal-dish-title">{{ modalDish.name }}</h2>
              </div>
              <button type="button" class="modal-close-btn" (click)="closeDishModal()" aria-label="Close modal">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <!-- Modal Body (Scrollable) -->
            <div class="dish-modal-body">
              <!-- Big, Attractive Center Image Carousel -->
              <div class="carousel-container">
                <div class="carousel-stage">
                  <img 
                    [src]="getCurrentModalImage()" 
                    [alt]="modalDish.name" 
                    class="carousel-hero-img"
                  />
                  <div class="carousel-gradient-overlay"></div>

                  <!-- Carousel Navigation Arrows -->
                  @if (modalImages().length > 1) {
                    <button type="button" class="carousel-nav-btn prev" (click)="prevImage($event)" aria-label="Previous image">
                      <span class="material-symbols-outlined">chevron_left</span>
                    </button>
                    <button type="button" class="carousel-nav-btn next" (click)="nextImage($event)" aria-label="Next image">
                      <span class="material-symbols-outlined">chevron_right</span>
                    </button>
                    <div class="carousel-counter-badge">
                      {{ activeImageIndex() + 1 }} / {{ modalImages().length }}
                    </div>
                  }
                </div>

                <!-- Interactive Thumbnails Strip Below Main Photo -->
                @if (modalImages().length > 1) {
                  <div class="carousel-thumbnails-strip">
                    @for (img of modalImages(); track $index) {
                      <button 
                        type="button" 
                        class="thumb-item" 
                        [class.active]="activeImageIndex() === $index"
                        (click)="selectImage($index)"
                        [title]="'View angle ' + ($index + 1)"
                      >
                        <img [src]="img" [alt]="modalDish.name + ' thumbnail ' + ($index + 1)" />
                        <div class="thumb-ring"></div>
                      </button>
                    }
                  </div>
                }
              </div>

              <!-- Badges & Portion Strip -->
              <div class="modal-meta-row">
                <div class="modal-badges-wrap">
                  <span class="badge-chip dietary" [ngClass]="modalDish.food_type">
                    <span class="food-type-badge" [ngClass]="modalDish.food_type"><span class="dot"></span></span>
                    <span>{{ modalDish.food_type === 'veg' ? translationService.t('diet.veg') : modalDish.food_type === 'non-veg' ? translationService.t('diet.nonveg') : translationService.t('diet.vegan') }}</span>
                  </span>

                  <span class="badge-chip spice">
                    <span class="material-symbols-outlined fire-icon">local_fire_department</span>
                    <span>{{ getSpiceBadge(modalDish) }}</span>
                  </span>

                  <span class="badge-chip prep-time">
                    <span class="material-symbols-outlined">schedule</span>
                    <span>{{ modalDish.prep_time || '15 mins' }}</span>
                  </span>

                  <span class="badge-chip portion-spec">
                    <span class="material-symbols-outlined">scale</span>
                    <span><strong>{{ modalQuantity() }} {{ modalDish.serving_unit || 'pcs' }}</strong> / {{ translationService.t('unit.guest') }}</span>
                  </span>
                </div>
              </div>

              <!-- Tasting Note & Culinary Story -->
              <div class="modal-story-card">
                <h4 class="story-heading">
                  <span class="material-symbols-outlined">auto_awesome</span>
                  {{ translationService.t('dishModal.title') }}
                </h4>
                <p class="story-text">
                  {{ modalDish.description || 'Authentic heirloom royal banquet preparation cooked with pure cow ghee and fragrant freshly ground spices.' }}
                </p>
              </div>

              <!-- Curated Recipe Ingredients Section -->
              <div class="modal-ingredients-section">
                <div class="ingredients-header">
                  <div class="ing-title-group">
                    <span class="material-symbols-outlined ing-icon">soup_kitchen</span>
                    <h4 class="ingredients-title">{{ translationService.t('dishModal.ingredients') }}</h4>
                  </div>
                  <span class="ingredients-subtitle">Authentic composition scaled for wedding banquet guests</span>
                </div>

                @if (modalLoadingRecipe()) {
                  <div class="ingredients-loading">
                    <span class="material-symbols-outlined spin">progress_activity</span>
                    <span>Retrieving culinary composition...</span>
                  </div>
                } @else if (getModalIngredients().length > 0) {
                  <div class="ingredients-grid">
                    @for (ing of getModalIngredients(); track ing.name) {
                      <div class="ingredient-card">
                        <div class="ing-left">
                          <span class="ing-bullet">✦</span>
                          <div class="ing-info">
                            <span class="ing-name">{{ ing.name }}</span>
                            @if (ing.notes) {
                              <span class="ing-note">{{ ing.notes }}</span>
                            }
                          </div>
                        </div>
                        <span class="ing-qty">{{ ing.quantity }} {{ ing.unit }}</span>
                      </div>
                    }
                  </div>
                } @else {
                  <div class="ingredients-empty">
                    <p>Authentic heirloom preparation with organic farm spices and desi ghee.</p>
                  </div>
                }
              </div>
            </div>

            <!-- Sticky Modal Action Dock -->
            <div class="dish-modal-footer">
              <div class="footer-price-dock">
                <span class="price-lbl">Rate Per Guest:</span>
                <div class="price-val-wrap">
                  <span class="currency-symbol">₹</span>
                  <span class="price-val">{{ modalDish.price_per_person / 100 }}</span>
                  <span class="price-unit">{{ translationService.t('unit.person') }}</span>
                </div>
              </div>

              <div class="footer-stepper-dock">
                <span class="portion-label">{{ translationService.t('dishModal.portionPerGuest') }}:</span>
                <div class="modal-stepper">
                  <button type="button" class="btn-step" (click)="adjustModalPortion(-1)" aria-label="Decrease portion">-</button>
                  <span class="step-num">{{ modalQuantity() }} {{ modalDish.serving_unit || 'pcs' }}</span>
                  <button type="button" class="btn-step" (click)="adjustModalPortion(1)" aria-label="Increase portion">+</button>
                </div>
              </div>

              <div class="footer-action-dock">
                @if (!selectionService.isDishSelected(modalDish.id)) {
                  <button type="button" class="wf-btn primary modal-add-btn" (click)="addDishFromModal(modalDish)">
                    <span class="material-symbols-outlined">add</span>
                    <span>{{ translationService.t('action.addToFeast') }}</span>
                  </button>
                } @else {
                  <button type="button" class="wf-btn gold modal-update-btn" (click)="updateDishFromModal(modalDish)">
                    <span class="material-symbols-outlined">check_circle</span>
                    <span>{{ translationService.t('dishModal.updatePortion') }} ({{ modalQuantity() }} {{ modalDish.serving_unit || 'pcs' }})</span>
                  </button>
                }
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .menu-selection-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      width: 100%;
      max-width: 1560px;
      margin: 0 auto;
      padding: 1rem 1.5rem 5rem;
      box-sizing: border-box;

      @media (max-width: 768px) {
        padding: 0.75rem 0.85rem 5rem;
        gap: 1rem;
      }
    }

    /* Atmospheric Banquet Hero Header */
    .celebration-hero-banner {
      position: relative;
      height: 220px;
      border-radius: var(--radius-lg, 14px);
      overflow: hidden;
      display: flex;
      align-items: center;
      border: 1px solid var(--border-hairline, #e5dec9);
      box-shadow: 0 4px 18px rgba(66, 17, 25, 0.08);

      @media (max-width: 768px) {
        height: auto;
        min-height: 180px;
        padding: 1.25rem 0;
      }

      .hero-video-bg {
        position: absolute;
        inset: 0;
        z-index: 1;

        .bg-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: brightness(0.65) saturate(1.15);
        }

        .hero-gradient-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            rgba(66, 17, 25, 0.94) 0%,
            rgba(91, 26, 36, 0.88) 50%,
            rgba(45, 9, 16, 0.85) 100%
          );
        }
      }

      .hero-banner-content {
        position: relative;
        z-index: 2;
        width: 100%;
        padding: 1.75rem 2.25rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 2rem;
        color: #ffffff;

        @media (max-width: 900px) {
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.25rem 1.5rem;
        }

        .hero-left {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;

          .hero-tagline {
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            font-size: 0.74rem;
            font-weight: 700;
            color: var(--accent-gold-light, #f4d068);
            text-transform: uppercase;
            letter-spacing: 1px;

            .material-symbols-outlined { font-size: 15px; }
          }

          .hero-headline {
            font-family: var(--font-serif);
            font-size: 2rem;
            font-weight: 700;
            color: #FAF8F5;
            line-height: 1.15;

            @media (max-width: 600px) {
              font-size: 1.45rem;
            }
          }

          .hero-desc {
            font-size: 0.86rem;
            color: rgba(255, 255, 255, 0.82);
            max-width: 620px;
            line-height: 1.4;

            @media (max-width: 768px) {
              display: none;
            }
          }
        }

        .hero-right-meta {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;

          .event-quick-chip {
            display: flex;
            align-items: center;
            gap: 0.65rem;
            background: rgba(255, 255, 255, 0.12);
            border: 1px solid rgba(229, 222, 201, 0.3);
            border-radius: 10px;
            padding: 0.5rem 0.85rem;
            backdrop-filter: blur(8px);

            .chip-icon {
              color: var(--accent-gold-light, #f4d068);
              display: flex;
              align-items: center;
            }

            .chip-text {
              display: flex;
              flex-direction: column;
              line-height: 1.2;

              .chip-title {
                font-size: 0.82rem;
                font-weight: 700;
                color: #FAF8F5;
              }

              .chip-sub {
                font-size: 0.7rem;
                color: rgba(255, 255, 255, 0.7);
              }
            }
          }

          .guest-counter-pill {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            background: rgba(0, 0, 0, 0.35);
            border: 1px solid rgba(197, 155, 67, 0.4);
            border-radius: 10px;
            padding: 0.35rem 0.65rem;

            .lbl {
              font-size: 0.76rem;
              color: rgba(255, 255, 255, 0.8);
            }

            .stepper-wrap {
              display: flex;
              align-items: center;
              gap: 0.35rem;

              .btn-step {
                width: 22px;
                height: 22px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: var(--accent-gold-light, #f4d068);
                font-weight: 800;
                font-size: 0.95rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;

                &:hover { background: rgba(255, 255, 255, 0.35); }
              }

              .count-val {
                font-family: var(--font-serif);
                font-size: 1rem;
                color: #FAF8F5;
                min-width: 32px;
                text-align: center;
              }
            }
          }
        }
      }
    }

    /* Main 2-Column Split: 65% Left (Dishes) + 35% Right (Sticky Estimation) */
    .catering-layout-grid {
      display: grid;
      grid-template-columns: 1fr 360px;
      gap: 1.75rem;
      align-items: start;

      @media (max-width: 1024px) {
        grid-template-columns: 1fr;
      }
    }

    /* Left Dishes Column */
    .dishes-stream-column {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      min-width: 0;
    }

    .course-pills-bar {
      display: flex;
      gap: 0.5rem;
      overflow-x: auto;
      padding-bottom: 0.4rem;
      scrollbar-width: thin;

      .course-pill {
        padding: 0.5rem 1.15rem;
        border-radius: 20px;
        border: 1px solid var(--border-hairline, #e5dec9);
        background: #FFFFFF;
        font-size: 0.84rem;
        font-weight: 600;
        color: var(--text-secondary);
        white-space: nowrap;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          border-color: var(--accent-gold);
          color: var(--primary-maroon);
          background: #FAF8F5;
        }

        &.active {
          background: var(--primary-maroon);
          color: #FAF8F5;
          border-color: var(--primary-maroon);
          box-shadow: 0 2px 8px rgba(91, 26, 36, 0.2);
        }
      }
    }

    .filters-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;

      .search-input-wrap {
        flex: 1;
        min-width: 260px;
        position: relative;
        display: flex;
        align-items: center;

        .search-icon {
          position: absolute;
          left: 0.85rem;
          color: var(--text-muted);
          font-size: 19px;
          pointer-events: none;
        }

        .dish-search-box {
          width: 100%;
          height: 40px;
          padding: 0 2rem 0 2.5rem;
          background: #FFFFFF;
          border: 1px solid var(--border-hairline, #e5dec9);
          border-radius: 20px;
          font-size: 0.86rem;
          color: var(--text-primary);
          outline: none;

          &:focus {
            border-color: var(--accent-gold);
            box-shadow: 0 0 0 3px rgba(197, 155, 67, 0.15);
          }
        }

        .clear-btn {
          position: absolute;
          right: 0.75rem;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          .material-symbols-outlined { font-size: 16px; }
        }
      }

      .dietary-pills-wrap {
        display: flex;
        gap: 0.45rem;
        flex-wrap: wrap;

        @media (max-width: 600px) {
          overflow-x: auto;
          flex-wrap: nowrap;
          width: 100%;
          padding-bottom: 0.25rem;
          scrollbar-width: none;
          &::-webkit-scrollbar { display: none; }
        }

        .diet-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.4rem 0.85rem;
          border-radius: 16px;
          border: 1px solid var(--border-hairline);
          background: #FFFFFF;
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;

          .diet-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
          }
          .veg-dot { background: #2E7D32; }
          .non-veg-dot { background: #C62828; }
          .vegan-dot { background: #F57C00; }

          &:hover, &.active {
            border-color: var(--accent-gold);
            color: var(--primary-maroon);
            background: #FAF8F5;
          }

          &.active {
            border-color: var(--primary-maroon);
            background: var(--primary-maroon);
            color: #FAF8F5;
          }
        }
      }
    }

    /* Single-Column Editorial Dish Cards */
    .dishes-list-wrap {
      display: flex;
      flex-direction: column;
      gap: 1.15rem;
    }

    .editorial-dish-row {
      width: 100%;

      .dish-row-inner {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        background: #FFFFFF;
        border: 1px solid var(--border-hairline, #e5dec9);
        border-radius: var(--radius-lg, 12px);
        padding: 1.25rem 1.35rem;
        box-shadow: 0 1px 4px rgba(91, 26, 36, 0.03);
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
        cursor: pointer;

        @media (max-width: 680px) {
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem;
        }

        &:hover {
          border-color: var(--border-champagne, #c59b43);
          box-shadow: 0 6px 18px rgba(91, 26, 36, 0.06);
        }
      }

      &.in-tray .dish-row-inner {
        border-color: var(--accent-gold, #c59b43);
        background: #FFFDF9;
        box-shadow: 0 4px 16px rgba(197, 155, 67, 0.12);
      }
    }

    /* Circular Plated Visual */
    .circular-platter-visual {
      width: 110px;
      height: 110px;
      min-width: 110px;
      border-radius: 50%;
      position: relative;
      overflow: hidden;
      box-shadow: 0 6px 18px rgba(91, 26, 36, 0.18);
      border: 3px solid #FFFFFF;
      transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s ease;
      cursor: pointer;

      @media (max-width: 680px) {
        width: 85px;
        height: 85px;
        min-width: 85px;
      }

      &:hover {
        transform: scale(1.06);
        box-shadow: 0 10px 24px rgba(91, 26, 36, 0.25);
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .specular-ring {
        position: absolute;
        inset: 0;
        border-radius: 50%;
        box-shadow: inset 0 2px 6px rgba(255, 255, 255, 0.6), inset 0 -3px 8px rgba(0, 0, 0, 0.25);
        pointer-events: none;
      }

      .zoom-cue {
        position: absolute;
        inset: 0;
        background: rgba(91, 26, 36, 0.45);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #FAF8F5;
        opacity: 0;
        transition: opacity 0.25s ease;
        span { font-size: 26px; }
      }

      &:hover .zoom-cue {
        opacity: 1;
      }
    }

    .dish-content-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
      min-width: 0;

      .dish-title-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        flex-wrap: wrap;

        .serif-dish-name {
          font-family: var(--font-serif);
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.2;
          cursor: pointer;
          transition: color 0.2s ease;

          &:hover {
            color: var(--primary-maroon);
          }
        }

        .view-plating-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.25rem 0.65rem;
          border-radius: 14px;
          background: #FAF8F5;
          border: 1px solid var(--border-hairline, #e5dec9);
          font-size: 0.74rem;
          font-weight: 600;
          color: var(--accent-gold-dark, #9e7626);
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;

          span.material-symbols-outlined {
            font-size: 15px;
            color: var(--accent-gold, #c59b43);
          }

          &:hover {
            background: #F7EFF1;
            border-color: var(--accent-gold, #c59b43);
            color: var(--primary-maroon, #5b1a24);
          }
        }
      }

      .culinary-tasting-note {
        font-size: 0.85rem;
        color: var(--text-secondary);
        line-height: 1.45;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        cursor: pointer;
      }

      .badges-portion-row {
        display: flex;
        align-items: center;
        gap: 0.45rem;
        flex-wrap: wrap;

        .badge-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.2rem 0.55rem;
          border-radius: 12px;
          font-size: 0.72rem;
          font-weight: 600;
          background: #F3EFEA;
          border: 1px solid var(--border-hairline);
          color: var(--text-secondary);

          &.dietary.veg { color: var(--veg-green); background: var(--veg-green-bg); }
          &.dietary.non-veg { color: var(--nonveg-red); background: var(--nonveg-red-bg); }
          .fire-icon { font-size: 14px; color: #D97706; }

          &.portion {
            background: #FAF4E8;
            border-color: rgba(197, 155, 67, 0.4);
            color: #5B1A24;
            font-weight: 600;
            transition: all 0.2s ease;

            .material-symbols-outlined { font-size: 13px; color: #C59B43; }

            &.customized {
              border-color: var(--accent-gold, #c59b43);
              background: #FFF9EE;
              color: var(--accent-gold-dark, #9e7626);
              box-shadow: 0 1px 4px rgba(197, 155, 67, 0.2);

              .customized-indicator {
                color: var(--accent-gold-dark, #9e7626);
                font-size: 0.68rem;
                font-weight: 700;
                margin-left: 0.2rem;
              }
            }
          }
        }
      }

      .price-action-strip {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 0.35rem;
        padding-top: 0.55rem;
        border-top: 1px solid var(--border-hairline);
        flex-wrap: wrap;
        gap: 0.65rem;

        .price-callout {
          display: flex;
          align-items: baseline;
          gap: 0.35rem;

          .currency-symbol {
            font-family: var(--font-sans, system-ui, sans-serif) !important;
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--primary-maroon);
          }

          .rupee-val {
            font-family: var(--font-serif);
            font-size: 1.35rem;
            font-weight: 800;
            color: var(--primary-maroon);
          }

          .rupee-sub {
            font-size: 0.78rem;
            color: var(--text-muted);
          }

          .scaled-badge {
            font-size: 0.68rem;
            color: var(--accent-gold-dark, #9e7626);
            background: #FAF4E8;
            border: 1px solid rgba(197, 155, 67, 0.3);
            border-radius: 10px;
            padding: 0.1rem 0.4rem;
            font-weight: 600;
          }
        }

        .action-btn-area {
          position: relative;
          z-index: 10;
          pointer-events: auto;

          .add-feast-btn {
            padding: 0.55rem 1.25rem;
            font-size: 0.85rem;
            font-weight: 700;
            border-radius: 24px;
            cursor: pointer;
            user-select: none;
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            background: var(--primary-maroon, #5B1A24);
            color: #ffffff;
            border: 1px solid var(--accent-gold, #C59B43);
            box-shadow: 0 4px 12px rgba(91, 26, 36, 0.2);
            transition: all 0.2s ease;

            .plus-icon { font-size: 18px; color: var(--accent-gold-light); }

            &:hover {
              background: var(--primary-maroon-hover, #421119);
              transform: translateY(-1px);
              box-shadow: 0 6px 16px rgba(91, 26, 36, 0.3);
            }
            &:active { transform: scale(0.96); }
          }

          .morph-stepper {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            background: var(--primary-maroon, #5B1A24);
            color: #ffffff;
            padding: 0.25rem 0.65rem;
            border-radius: 24px;
            border: 1px solid rgba(197, 155, 67, 0.4);
            box-shadow: 0 4px 12px rgba(91, 26, 36, 0.25);

            .step-btn {
              width: 28px;
              height: 28px;
              border-radius: 50%;
              background: rgba(255, 255, 255, 0.22);
              border: none;
              color: #ffffff;
              font-size: 1.05rem;
              font-weight: 800;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              user-select: none;
              transition: background 0.15s ease, transform 0.1s ease;

              &:hover { background: rgba(255, 255, 255, 0.38); }
              &:active { transform: scale(0.92); }
            }

            .step-display {
              font-size: 0.82rem;
              font-weight: 700;
              padding: 0 0.35rem;
              white-space: nowrap;
            }

            .remove-chip-btn {
              background: transparent;
              border: none;
              color: rgba(255, 255, 255, 0.75);
              display: flex;
              align-items: center;
              justify-content: center;
              margin-left: 0.25rem;
              cursor: pointer;
              padding: 0.2rem;
              border-radius: 50%;
              transition: all 0.15s ease;

              &:hover { color: #ffffff; background: rgba(255, 255, 255, 0.2); }
              .material-symbols-outlined { font-size: 16px; }
            }
          }
        }
      }
    }

    /* RIGHT PANEL (35%): Sticky Live Catering Estimation Summary */
    .sticky-estimation-column {
      position: sticky;
      top: 80px;

      @media (max-width: 1024px) {
        display: none; /* Collapses to mobile floating dock */
      }

      .estimation-receipt-card {
        background: #FFFFFF;
        border: 1px solid var(--border-hairline, #e5dec9);
        border-radius: var(--radius-lg, 14px);
        padding: 1.35rem 1.5rem;
        box-shadow: 0 4px 20px rgba(66, 17, 25, 0.06);
        display: flex;
        flex-direction: column;
        gap: 1.15rem;
      }

      .receipt-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        border-bottom: 1px solid var(--border-hairline);
        padding-bottom: 0.85rem;
        gap: 0.25rem;

        .receipt-crest {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .receipt-title {
          font-family: var(--font-serif);
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--primary-maroon);
        }

        .receipt-event-badge {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.76rem;
          font-weight: 600;
          color: var(--accent-gold-dark);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      }

      /* Selected Tray */
      .selected-tray-section {
        display: flex;
        flex-direction: column;
        gap: 0.65rem;

        .tray-head {
          display: flex;
          align-items: center;
          justify-content: space-between;

          .tray-title {
            font-size: 0.8rem;
            font-weight: 700;
            color: #4A3E39;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .btn-clear-tray {
            background: transparent;
            border: none;
            color: #A32D2D;
            font-size: 0.74rem;
            font-weight: 600;
            cursor: pointer;
            &:hover { text-decoration: underline; }
          }
        }

        .empty-tray-box {
          background: #FAF8F5;
          border: 1px dashed var(--border-hairline);
          border-radius: 8px;
          padding: 1.25rem 1rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.35rem;

          .empty-tray-icon {
            font-size: 32px;
            color: var(--accent-gold);
          }

          .empty-tray-txt {
            font-size: 0.82rem;
            font-weight: 600;
            color: var(--primary-maroon);
          }

          .empty-tray-sub {
            font-size: 0.72rem;
            color: var(--text-secondary);
            line-height: 1.35;
          }
        }

        .tray-items-list {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          max-height: 220px;
          overflow-y: auto;
          padding-right: 0.25rem;

          .tray-item-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0.45rem 0.65rem;
            background: #FAF8F5;
            border: 1px solid var(--border-hairline);
            border-radius: 6px;
            font-size: 0.8rem;

            .item-meta {
              display: flex;
              flex-direction: column;
              line-height: 1.2;

              .item-name {
                font-weight: 600;
                color: #2F0B12;
              }

              .item-portion {
                font-size: 0.68rem;
                color: #7A695C;
              }
            }

            .item-price-actions {
              display: flex;
              align-items: center;
              gap: 0.4rem;

              .item-cost {
                font-family: var(--font-serif);
                font-weight: 700;
                color: var(--primary-maroon);
              }

              .item-del-btn {
                background: transparent;
                border: none;
                color: #A32D2D;
                cursor: pointer;
                display: flex;
                align-items: center;
                padding: 0.15rem;

                .material-symbols-outlined { font-size: 14px; }
              }
            }
          }
        }
      }

      /* Receipt Breakdown */
      .receipt-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        border-top: 1px dashed var(--border-hairline);
        padding-top: 0.75rem;

        .receipt-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.8rem;
          color: var(--text-secondary);

          .val {
            color: #2F0B12;
            font-weight: 600;
          }
        }
      }

      /* Grand Total Highlight */
      .receipt-grand-total-card {
        background: linear-gradient(135deg, #FAF4E8 0%, #F5ECDB 100%);
        border: 1px solid var(--accent-gold);
        border-radius: 10px;
        padding: 0.85rem 1rem;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .gt-left {
          display: flex;
          flex-direction: column;
          line-height: 1.15;

          .gt-label {
            font-size: 0.74rem;
            font-weight: 700;
            color: var(--primary-maroon);
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .gt-amount-wrap {
            display: flex;
            align-items: baseline;
            gap: 0.2rem;

            .currency-symbol {
              font-family: var(--font-sans, system-ui, sans-serif) !important;
              font-size: 1.25rem;
              font-weight: 700;
              color: var(--primary-maroon);
            }

            .gt-amount {
              font-family: var(--font-serif);
              font-size: 1.45rem;
              font-weight: 800;
              color: var(--primary-maroon);
            }
          }
        }

        .gt-right {
          .per-guest-pill {
            background: var(--primary-maroon);
            color: #FAF8F5;
            font-size: 0.72rem;
            font-weight: 700;
            padding: 0.25rem 0.55rem;
            border-radius: 12px;
          }
        }
      }

      .receipt-actions {
        .btn-confirm-proposal {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.75rem;
          border-radius: 8px;
          background: var(--primary-maroon);
          color: #FAF8F5;
          text-decoration: none;
          font-weight: 700;
          font-size: 0.9rem;
          box-shadow: 0 4px 14px rgba(91, 26, 36, 0.25);
          transition: background 0.2s, transform 0.15s;

          &:hover:not(.disabled) {
            background: var(--primary-maroon-hover, #421119);
            transform: translateY(-1px);
          }

          &.disabled {
            opacity: 0.5;
            pointer-events: none;
          }
        }
      }
    }

    /* Mobile Floating Dock (< 1024px) */
    .mobile-floating-quote-dock {
      display: none;

      @media (max-width: 1024px) {
        display: block;
        position: fixed;
        bottom: 0.75rem;
        left: 0.75rem;
        right: 0.75rem;
        z-index: 50;
        animation: slideUpDock 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .dock-glass-content {
        background: rgba(91, 26, 36, 0.96);
        border: 1px solid var(--accent-gold);
        box-shadow: 0 12px 36px rgba(0, 0, 0, 0.35);
        backdrop-filter: blur(14px);
        border-radius: 30px;
        padding: 0.65rem 1rem 0.65rem 1.25rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: #ffffff;
        gap: 0.75rem;

        .dock-left {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.8rem;
          flex-wrap: wrap;

          .dock-badge { font-weight: 700; color: #FAF8F5; }
          .dock-divider { color: var(--accent-gold-light); }
          .dock-guest-count { color: rgba(255, 255, 255, 0.8); }

          .dock-total-cost {
            display: flex;
            align-items: baseline;
            gap: 0.2rem;
            margin-left: 0.25rem;

            .currency-symbol {
              font-family: var(--font-sans, system-ui, sans-serif) !important;
              font-size: 0.95rem;
              font-weight: 700;
              color: var(--accent-gold-light);
            }

            .rupee-val {
              font-family: var(--font-serif);
              font-size: 1.15rem;
              font-weight: 800;
              color: var(--accent-gold-light);
            }

            .est-lbl {
              font-size: 0.7rem;
              color: rgba(255, 255, 255, 0.7);
            }
          }
        }

        .review-cta-btn {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          background: #FAF8F5;
          color: var(--primary-maroon);
          padding: 0.45rem 0.95rem;
          border-radius: 20px;
          text-decoration: none;
          font-size: 0.82rem;
          font-weight: 700;
          white-space: nowrap;
          border: none;
          cursor: pointer;

          &:hover { background: #FFFFFF; }
          .material-symbols-outlined { font-size: 16px; }
        }
      }
    }

    .no-results-card {
      text-align: center;
      padding: 3rem 1.5rem;
      background: #FFFFFF;
      border: 1px dashed var(--border-hairline);
      border-radius: var(--radius-md);

      .empty-icon {
        font-size: 48px;
        color: var(--accent-gold);
      }
    }

    /* Luxury Editorial Dish Presentation Modal & Center Carousel */
    .dish-modal-backdrop {
      position: fixed;
      inset: 0;
      z-index: 99999;
      background: rgba(30, 8, 14, 0.78);
      backdrop-filter: blur(12px);
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding: 2.5rem 1rem 2rem;
      overflow-y: auto;
      animation: modalFadeIn 0.25s ease;
    }

    .dish-modal-card {
      background: #FAF8F5;
      border: 1px solid var(--accent-gold, #c59b43);
      border-radius: 20px;
      width: 100%;
      max-width: 860px;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      margin: auto 0;
      animation: modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .dish-modal-header {
      padding: 1.25rem 1.75rem;
      background: #FFFFFF;
      border-bottom: 1px solid var(--border-hairline, #e5dec9);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;

      .header-left {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;

        .modal-category-badge {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--accent-gold-dark, #9e7626);
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .modal-dish-title {
          font-family: var(--font-serif);
          font-size: 1.65rem;
          font-weight: 700;
          color: var(--primary-maroon, #5b1a24);
          line-height: 1.15;
          margin: 0;

          @media (max-width: 600px) {
            font-size: 1.35rem;
          }
        }
      }

      .modal-close-btn {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: #F3EFEA;
        border: 1px solid var(--border-hairline, #e5dec9);
        color: var(--text-secondary);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          background: #5B1A24;
          color: #FAF8F5;
          transform: rotate(90deg);
        }
      }
    }

    .dish-modal-body {
      padding: 0 0 1.5rem;
      overflow-y: auto;
      max-height: calc(85vh - 180px);
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    /* Big Center Image Carousel */
    .carousel-container {
      padding: 1.25rem 1.75rem 0.25rem;

      @media (max-width: 680px) {
        padding: 0.75rem 1rem 0;
      }
    }

    .carousel-stage {
      position: relative;
      width: 100%;
      height: 380px;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 12px 32px rgba(91, 26, 36, 0.16);
      border: 1px solid var(--border-hairline, #e5dec9);
      background: #2b0811;

      @media (max-width: 680px) {
        height: 230px;
      }

      .carousel-hero-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .carousel-gradient-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, rgba(0, 0, 0, 0.05) 0%, rgba(30, 8, 14, 0.35) 100%);
        pointer-events: none;
      }

      .carousel-nav-btn {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: rgba(91, 26, 36, 0.85);
        color: #FAF8F5;
        border: 1px solid var(--accent-gold, #c59b43);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        backdrop-filter: blur(8px);
        transition: all 0.2s ease;
        z-index: 10;

        &.prev { left: 1rem; }
        &.next { right: 1rem; }

        &:hover {
          background: #421119;
          transform: translateY(-50%) scale(1.08);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
        }
      }

      .carousel-counter-badge {
        position: absolute;
        bottom: 1rem;
        right: 1rem;
        background: rgba(0, 0, 0, 0.7);
        color: #FAF8F5;
        padding: 0.3rem 0.75rem;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 700;
        letter-spacing: 0.5px;
        border: 1px solid rgba(229, 222, 201, 0.4);
        backdrop-filter: blur(6px);
      }
    }

    .carousel-thumbnails-strip {
      display: flex;
      gap: 0.75rem;
      margin-top: 0.85rem;
      overflow-x: auto;
      padding-bottom: 0.35rem;

      .thumb-item {
        width: 76px;
        height: 76px;
        min-width: 76px;
        border-radius: 12px;
        overflow: hidden;
        position: relative;
        border: 2px solid transparent;
        cursor: pointer;
        padding: 0;
        background: transparent;
        transition: all 0.2s ease;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        &.active {
          border-color: var(--accent-gold, #c59b43);
          box-shadow: 0 0 0 2px rgba(197, 155, 67, 0.4);
          transform: translateY(-2px);
        }
      }
    }

    .modal-meta-row {
      padding: 0 1.75rem;

      @media (max-width: 680px) {
        padding: 0 1rem;
      }

      .modal-badges-wrap {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;

        .badge-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.3rem 0.65rem;
          border-radius: 14px;
          font-size: 0.76rem;
          font-weight: 600;
          background: #FFFFFF;
          border: 1px solid var(--border-hairline, #e5dec9);
          color: var(--text-secondary);

          &.dietary.veg { color: var(--veg-green); background: var(--veg-green-bg); }
          &.dietary.non-veg { color: var(--nonveg-red); background: var(--nonveg-red-bg); }
          &.dietary.vegan { color: var(--vegan-cyan); background: var(--vegan-cyan-bg); }
          .fire-icon { font-size: 15px; color: #D97706; }

          &.portion-spec {
            background: #FAF4E8;
            border-color: rgba(197, 155, 67, 0.45);
            color: #5B1A24;
            .material-symbols-outlined { color: #C59B43; }
          }
        }
      }
    }

    .modal-story-card {
      margin: 0 1.75rem;
      padding: 1rem 1.25rem;
      background: #FFFFFF;
      border: 1px solid var(--border-hairline, #e5dec9);
      border-radius: 12px;

      @media (max-width: 680px) {
        margin: 0 1rem;
        padding: 0.85rem 1rem;
      }

      .story-heading {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-family: var(--font-serif);
        font-size: 0.95rem;
        font-weight: 700;
        color: var(--primary-maroon, #5b1a24);
        margin-bottom: 0.35rem;

        .material-symbols-outlined {
          font-size: 16px;
          color: var(--accent-gold, #c59b43);
        }
      }

      .story-text {
        font-size: 0.88rem;
        color: var(--text-secondary);
        line-height: 1.5;
        margin: 0;
      }
    }

    .modal-ingredients-section {
      padding: 0 1.75rem;

      @media (max-width: 680px) {
        padding: 0 1rem;
      }

      .ingredients-header {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
        margin-bottom: 0.75rem;

        .ing-title-group {
          display: flex;
          align-items: center;
          gap: 0.45rem;

          .ing-icon {
            font-size: 18px;
            color: var(--accent-gold, #c59b43);
          }

          .ingredients-title {
            font-family: var(--font-serif);
            font-size: 1.1rem;
            font-weight: 700;
            color: var(--primary-maroon, #5b1a24);
            margin: 0;
          }
        }

        .ingredients-subtitle {
          font-size: 0.76rem;
          color: var(--text-muted);
        }
      }

      .ingredients-loading {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 1rem;
        color: var(--text-muted);
        font-size: 0.85rem;

        .spin {
          animation: spin 1s linear infinite;
        }
      }

      .ingredients-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 0.65rem;

        @media (max-width: 500px) {
          grid-template-columns: 1fr;
        }
      }

      .ingredient-card {
        background: #FFFFFF;
        border: 1px solid var(--border-hairline, #e5dec9);
        border-radius: 10px;
        padding: 0.65rem 0.85rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.65rem;
        transition: border-color 0.2s ease;

        &:hover {
          border-color: var(--accent-gold, #c59b43);
        }

        .ing-left {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          min-width: 0;

          .ing-bullet {
            font-size: 11px;
            color: var(--accent-gold, #c59b43);
          }

          .ing-info {
            display: flex;
            flex-direction: column;
            line-height: 1.25;

            .ing-name {
              font-size: 0.84rem;
              font-weight: 600;
              color: var(--text-primary);
            }

            .ing-note {
              font-size: 0.72rem;
              color: var(--text-muted);
            }
          }
        }

        .ing-qty {
          font-family: var(--font-serif);
          font-size: 0.84rem;
          font-weight: 700;
          color: var(--primary-maroon, #5b1a24);
          background: #F7EFF1;
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
          white-space: nowrap;
        }
      }

      .ingredients-empty {
        padding: 0.85rem 1rem;
        background: #FFFFFF;
        border: 1px dashed var(--border-hairline);
        border-radius: 10px;
        font-size: 0.82rem;
        color: var(--text-muted);
      }
    }

    .dish-modal-footer {
      padding: 1.15rem 1.75rem;
      background: #FFFFFF;
      border-top: 1px solid var(--border-hairline, #e5dec9);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.25rem;
      flex-wrap: wrap;

      @media (max-width: 680px) {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: 0.85rem;
        padding: 0.85rem 1rem;
        flex-wrap: wrap;

        .footer-price-dock {
          flex: 1 1 auto;
        }

        .footer-stepper-dock {
          flex: 0 0 auto;
        }

        .footer-action-dock {
          width: 100%;
          order: 3;

          .modal-add-btn, .modal-update-btn {
            width: 100%;
          }
        }
      }

      .footer-price-dock {
        display: flex;
        flex-direction: column;
        line-height: 1.15;

        .price-lbl {
          font-size: 0.72rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .price-val-wrap {
          display: flex;
          align-items: baseline;
          gap: 0.2rem;

          .currency-symbol {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--primary-maroon);
          }

          .price-val {
            font-family: var(--font-serif);
            font-size: 1.55rem;
            font-weight: 800;
            color: var(--primary-maroon);
          }

          .price-unit {
            font-size: 0.82rem;
            color: var(--text-secondary);
          }
        }
      }

      .footer-stepper-dock {
        display: flex;
        align-items: center;
        gap: 0.65rem;

        .portion-label {
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-secondary);

          @media (max-width: 500px) {
            display: none;
          }
        }

        .modal-stepper {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #FAF8F5;
          border: 1px solid var(--accent-gold, #c59b43);
          border-radius: 24px;
          padding: 0.25rem 0.65rem;

          .btn-step {
            width: 26px;
            height: 26px;
            border-radius: 50%;
            background: var(--primary-maroon, #5b1a24);
            color: #FAF8F5;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.15s ease;

            &:hover {
              background: #421119;
              transform: scale(1.08);
            }
          }

          .step-num {
            font-family: var(--font-serif);
            font-size: 0.95rem;
            font-weight: 700;
            color: var(--primary-maroon);
            min-width: 55px;
            text-align: center;
          }
        }
      }

      .footer-action-dock {
        .modal-add-btn, .modal-update-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          padding: 0.65rem 1.45rem;
          border-radius: 24px;
          font-weight: 700;
          font-size: 0.88rem;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;

          @media (max-width: 680px) {
            width: 100%;
          }
        }

        .modal-add-btn {
          background: var(--primary-maroon, #5b1a24);
          color: #FAF8F5;
          box-shadow: 0 4px 14px rgba(91, 26, 36, 0.25);

          &:hover {
            background: #421119;
            transform: translateY(-1px);
          }
        }

        .modal-update-btn {
          background: var(--accent-gold, #c59b43);
          color: #2b0811;
          box-shadow: 0 4px 14px rgba(197, 155, 67, 0.3);

          &:hover {
            background: #9e7626;
            color: #FAF8F5;
            transform: translateY(-1px);
          }
        }
      }
    }

    @keyframes modalFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes modalSlideUp {
      from { opacity: 0; transform: translateY(24px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @keyframes slideUpDock {
      from { transform: translateY(100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `]
})
export class MenuSelectionComponent implements OnInit {
  private dishService = inject(DishService);
  private categoryService = inject(CategoryService);
  private recipeService = inject(RecipeService);
  private toast = inject(ToastService);
  selectionService = inject(SelectionService);
  translationService = inject(TranslationService);

  categories = signal<FoodCategory[]>([]);
  allDishes = signal<Dish[]>([]);

  searchQuery = '';
  dietFilter = signal<'all' | 'veg' | 'non-veg' | 'vegan'>('all');
  activeCategory = signal<string>('all');

  // Dish details & multi-image carousel modal state
  activeDishModal = signal<Dish | null>(null);
  activeImageIndex = signal<number>(0);
  modalRecipe = signal<Recipe | null>(null);
  modalLoadingRecipe = signal<boolean>(false);
  modalQuantity = signal<number>(1);
  modalImages = signal<string[]>([]);

  filteredDishes = computed(() => {
    let list = this.allDishes();

    if (this.activeCategory() !== 'all') {
      list = list.filter(d => d.category_id === this.activeCategory());
    }

    if (this.dietFilter() !== 'all') {
      list = list.filter(d => d.food_type === this.dietFilter());
    }

    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(d =>
        d.name.toLowerCase().includes(q) ||
        (d.description && d.description.toLowerCase().includes(q))
      );
    }

    return list;
  });

  selectedDishesList = computed(() => {
    return Array.from(this.selectionService.selectedDishes().values());
  });

  ngOnInit() {
    this.categoryService.getCategories(true).subscribe({
      next: (res) => { if (res.success) this.categories.set(res.data); }
    });

    this.dishService.getDishes({ limit: 100, availability: 1 }).subscribe({
      next: (res) => {
        if (res.success) {
          this.allDishes.set(res.dishes);
          // Starts clean (no auto-order)
        }
      }
    });
  }

  scrollToCategory(catId: string) {
    this.activeCategory.set(catId);
  }

  adjustGuests(delta: number) {
    const current = this.selectionService.eventDetails().guest_count;
    this.selectionService.setGuestCount(Math.max(25, current + delta));
  }

  /**
   * Reactively formats the serving portion.
   * If the user adjusts the portion using the stepper (e.g. from 2 pcs to 4 pcs),
   * this immediately updates the card's badge.
   */
  formatServing(dish: Dish): string {
    const selected = this.selectionService.selectedDishes().get(dish.id);
    const qty = selected ? selected.quantity_per_person : dish.quantity_per_person;
    const unit = (dish.serving_unit || 'g').toLowerCase();
    if (['pcs', 'pieces', 'piece'].includes(unit)) {
      return `${qty} ${this.translationService.t('unit.pcs')}`;
    } else if (unit === 'ml') {
      return `${qty} ${this.translationService.t('unit.ml')}`;
    }
    return `${qty} ${this.translationService.t('unit.g')}`;
  }

  isPortionCustomized(dish: Dish): boolean {
    const selected = this.selectionService.selectedDishes().get(dish.id);
    return !!selected && selected.quantity_per_person !== dish.quantity_per_person;
  }

  getDishEffectivePrice(dish: Dish): number {
    const selected = this.selectionService.getSelectedDish(dish.id);
    if (!selected || !dish.quantity_per_person || dish.quantity_per_person <= 0) {
      return dish.price_per_person / 100;
    }
    const ratio = selected.quantity_per_person / dish.quantity_per_person;
    return Math.round(dish.price_per_person * ratio) / 100;
  }

  getItemCost(entry: SelectedDishItem): number {
    const baseQty = (entry.dish.quantity_per_person && entry.dish.quantity_per_person > 0)
      ? entry.dish.quantity_per_person
      : 1;
    const ratio = entry.quantity_per_person / baseQty;
    const guests = this.selectionService.eventDetails().guest_count || 1;
    const scaledPaise = Math.round(entry.dish.price_per_person * ratio);
    return Math.round((scaledPaise * guests) / 100);
  }

  formatSelectedPortion(dish: Dish): string {
    const selected = this.selectionService.getSelectedDish(dish.id);
    const qty = selected ? selected.quantity_per_person : dish.quantity_per_person;
    const unit = dish.serving_unit || 'g';
    return `${qty} ${unit}`;
  }

  addDish(dish: Dish, event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.selectionService.addDish(dish);
  }

  incrementPortion(dish: Dish, event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const item = this.selectionService.getSelectedDish(dish.id);
    if (!item) {
      this.selectionService.addDish(dish);
      return;
    }
    const unit = (dish.serving_unit || '').toLowerCase();
    const isPcs = ['pcs', 'pieces', 'piece'].includes(unit);
    const step = isPcs ? 1 : 25;
    this.selectionService.updateDishQuantity(dish.id, item.quantity_per_person + step);
  }

  decrementPortion(dish: Dish, event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const item = this.selectionService.getSelectedDish(dish.id);
    if (!item) return;
    const unit = (dish.serving_unit || '').toLowerCase();
    const isPcs = ['pcs', 'pieces', 'piece'].includes(unit);
    const step = isPcs ? 1 : 25;
    const newQty = item.quantity_per_person - step;
    if (newQty <= 0) {
      this.selectionService.removeDish(dish.id);
    } else {
      this.selectionService.updateDishQuantity(dish.id, newQty);
    }
  }

  removeDish(dishId: string, event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.selectionService.removeDish(dishId);
  }

  getSpiceBadge(dish: Dish): string {
    if (dish.food_type === 'non-veg') {
      return this.translationService.t('spice.spicy');
    } else if (dish.name.toLowerCase().includes('butter') || dish.name.toLowerCase().includes('idly')) {
      return this.translationService.t('spice.mild');
    }
    return this.translationService.t('spice.medium');
  }

  /* Dish Modal Popup & Multi-Image Carousel */
  openDishModal(dish: Dish, event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.activeDishModal.set(dish);
    this.activeImageIndex.set(0);

    const sel = this.selectionService.selectedDishes().get(dish.id);
    this.modalQuantity.set(sel ? sel.quantity_per_person : dish.quantity_per_person);

    // Initial image set
    const images: string[] = [];
    if (dish.primary_image_url) {
      images.push(dish.primary_image_url);
    }
    if (dish.images && dish.images.length > 0) {
      for (const img of dish.images) {
        if (img.image_url && !images.includes(img.image_url)) {
          images.push(img.image_url);
        }
      }
    }

    // Load full dish details for complete image gallery
    this.dishService.getDish(dish.id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const fetchedImages = [...images];
          if (res.data.images && res.data.images.length > 0) {
            for (const img of res.data.images) {
              if (img.image_url && !fetchedImages.includes(img.image_url)) {
                fetchedImages.push(img.image_url);
              }
            }
          }
          if (fetchedImages.length < 2) {
            const fallbacks = this.getFallbackImagesForDish(dish);
            for (const fb of fallbacks) {
              if (!fetchedImages.includes(fb)) fetchedImages.push(fb);
            }
          }
          this.modalImages.set(fetchedImages);
        }
      },
      error: () => {
        if (images.length < 2) {
          const fallbacks = this.getFallbackImagesForDish(dish);
          for (const fb of fallbacks) {
            if (!images.includes(fb)) images.push(fb);
          }
        }
        this.modalImages.set(images);
      }
    });

    if (images.length < 2) {
      const fallbacks = this.getFallbackImagesForDish(dish);
      for (const fb of fallbacks) {
        if (!images.includes(fb)) images.push(fb);
      }
    }
    this.modalImages.set(images);

    // Fetch recipe ingredients
    this.modalLoadingRecipe.set(true);
    this.recipeService.getRecipeByDishId(dish.id).subscribe({
      next: (res) => {
        this.modalLoadingRecipe.set(false);
        if (res.success && res.data) {
          this.modalRecipe.set(res.data);
        } else {
          this.modalRecipe.set(null);
        }
      },
      error: () => {
        this.modalLoadingRecipe.set(false);
        this.modalRecipe.set(null);
      }
    });
  }

  closeDishModal() {
    this.activeDishModal.set(null);
    this.modalRecipe.set(null);
    this.modalImages.set([]);
  }

  getCurrentModalImage(): string {
    const list = this.modalImages();
    const idx = this.activeImageIndex();
    if (list.length > 0 && list[idx]) {
      return list[idx];
    }
    return this.activeDishModal()?.primary_image_url || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1000&q=85';
  }

  prevImage(event?: Event) {
    if (event) event.stopPropagation();
    const total = this.modalImages().length;
    if (total <= 1) return;
    const prev = (this.activeImageIndex() - 1 + total) % total;
    this.activeImageIndex.set(prev);
  }

  nextImage(event?: Event) {
    if (event) event.stopPropagation();
    const total = this.modalImages().length;
    if (total <= 1) return;
    const next = (this.activeImageIndex() + 1) % total;
    this.activeImageIndex.set(next);
  }

  selectImage(index: number) {
    this.activeImageIndex.set(index);
  }

  adjustModalPortion(delta: number) {
    const dish = this.activeDishModal();
    if (!dish) return;
    const unit = (dish.serving_unit || '').toLowerCase();
    const isPcs = ['pcs', 'pieces', 'piece'].includes(unit);
    const step = isPcs ? 1 : 25;
    const current = this.modalQuantity();
    const next = Math.max(step, current + delta * step);
    this.modalQuantity.set(next);
  }

  addDishFromModal(dish: Dish) {
    this.selectionService.addDish(dish, this.modalQuantity());
    this.closeDishModal();
  }

  updateDishFromModal(dish: Dish) {
    this.selectionService.updateDishQuantity(dish.id, this.modalQuantity());
    this.toast.success(`Updated portion of ${dish.name} to ${this.modalQuantity()} ${dish.serving_unit || 'pcs'}`);
    this.closeDishModal();
  }

  getModalIngredients(): { name: string; quantity: number | string; unit: string; notes?: string | null }[] {
    const rcp = this.modalRecipe();
    if (rcp && rcp.ingredients && rcp.ingredients.length > 0) {
      return rcp.ingredients.map(i => ({
        name: i.name,
        quantity: i.quantity,
        unit: i.unit,
        notes: i.notes || null
      }));
    }

    const dish = this.activeDishModal();
    if (!dish) return [];
    return this.getFallbackIngredientsForDish(dish);
  }

  getFallbackImagesForDish(dish: Dish): string[] {
    const name = dish.name.toLowerCase();
    if (name.includes('idly')) {
      return [
        'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1000&q=85',
        'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=1000&q=85',
        'https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?auto=format&fit=crop&w=1000&q=85'
      ];
    } else if (name.includes('vada')) {
      return [
        'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1000&q=85',
        'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1000&q=85',
        'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=1000&q=85'
      ];
    } else if (name.includes('dosa')) {
      return [
        'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1000&q=85',
        'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=1000&q=85',
        'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=1000&q=85'
      ];
    } else if (name.includes('biryani')) {
      return [
        'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1000&q=85',
        'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=1000&q=85',
        'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=1000&q=85'
      ];
    } else if (name.includes('paneer')) {
      return [
        'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=1000&q=85',
        'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=1000&q=85',
        'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1000&q=80'
      ];
    } else if (name.includes('naan') || name.includes('roti') || name.includes('bread')) {
      return [
        'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=1000&q=85',
        'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=1000&q=85'
      ];
    } else if (name.includes('jamun') || name.includes('halwa') || name.includes('rasmalai') || name.includes('sweet')) {
      return [
        'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1000&q=85',
        'https://images.unsplash.com/photo-1605197584547-c93de1a4286b?auto=format&fit=crop&w=1000&q=85'
      ];
    } else if (name.includes('coffee') || name.includes('tea') || name.includes('lassi')) {
      return [
        'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1000&q=85',
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=85'
      ];
    }
    return [
      dish.primary_image_url || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=1000&q=85'
    ];
  }

  getFallbackIngredientsForDish(dish: Dish): { name: string; quantity: number | string; unit: string; notes?: string }[] {
    const name = dish.name.toLowerCase();
    if (name.includes('idly')) {
      return [
        { name: 'Fermented Idly Rice Batter', quantity: 500, unit: 'g', notes: 'Stone-ground parboiled rice & urad dal' },
        { name: 'Pure Desi Cow Ghee', quantity: 80, unit: 'g', notes: 'A2 cow ghee from grass-fed churn' },
        { name: 'Gunpowder Molagapodi', quantity: 40, unit: 'g', notes: 'Roasted lentils, red chillies & asafoetida' },
        { name: 'Crisp Curry Leaves', quantity: 10, unit: 'g', notes: 'Tempered in pure ghee' }
      ];
    } else if (name.includes('vada')) {
      return [
        { name: 'Whole Urad Gota Batter', quantity: 450, unit: 'g', notes: 'Fluffy stone-ground batter' },
        { name: 'Cracked Malabar Black Pepper', quantity: 20, unit: 'g', notes: 'Whole peppercorns & cumin' },
        { name: 'Fresh Coconut Bits & Ginger', quantity: 50, unit: 'g', notes: 'Diced for crisp crunch' },
        { name: 'Curry Leaves & Hing', quantity: 10, unit: 'g', notes: 'Tempered aromatics' }
      ];
    } else if (name.includes('dosa')) {
      return [
        { name: 'Aged Crisp Dosa Batter', quantity: 600, unit: 'g', notes: 'Stone-ground fermented batter' },
        { name: 'Pure Desi Ghee', quantity: 100, unit: 'g', notes: 'Drizzled on red-hot cast iron' },
        { name: 'Spiced Potato Masala', quantity: 350, unit: 'g', notes: 'Yukon potatoes tempered with mustard & onions' },
        { name: 'Mysore Red Chilli Chutney', quantity: 60, unit: 'g', notes: 'Roasted garlic and dried chillies' }
      ];
    } else if (name.includes('biryani')) {
      return [
        { name: '2-Year Aged Basmati Rice', quantity: 600, unit: 'g', notes: 'Extra-long fragrant grains' },
        { name: 'Kashmiri Saffron & Desi Ghee', quantity: 50, unit: 'g', notes: 'Infused in warm buffalo milk' },
        { name: 'Golden Fried Onions (Birista)', quantity: 150, unit: 'g', notes: 'Crispy caramelized shallots' },
        { name: 'Shahi Garam Masala Blend', quantity: 30, unit: 'g', notes: 'Star anise, mace, green cardamom, cloves' }
      ];
    } else if (name.includes('paneer')) {
      return [
        { name: 'Malai Cottage Cheese (Paneer)', quantity: 450, unit: 'g', notes: 'Fresh soft cubes' },
        { name: 'Cultured Hung Curd', quantity: 150, unit: 'g', notes: 'Whisked with roasted gram flour' },
        { name: 'Vine-Ripe Tomato Makhani', quantity: 250, unit: 'g', notes: 'Silky cashew and tomato gravy' },
        { name: 'Fresh Cream & Kasuri Methi', quantity: 50, unit: 'g', notes: 'Sun-dried fenugreek leaves' }
      ];
    } else if (name.includes('naan') || name.includes('roti')) {
      return [
        { name: 'Fine Flour Dough (Maida)', quantity: 500, unit: 'g', notes: 'Enriched with milk and yogurt' },
        { name: 'White Farm Butter', quantity: 80, unit: 'g', notes: 'Brushed fresh out of the clay tandoor' },
        { name: 'Nigella Seeds & Cilantro', quantity: 15, unit: 'g', notes: 'Pressed on crust' }
      ];
    } else if (name.includes('jamun') || name.includes('sweet')) {
      return [
        { name: 'Haryali Mawa / Khoya', quantity: 350, unit: 'g', notes: 'Slow-reduced buffalo milk solids' },
        { name: 'Fresh Chenna (Paneer)', quantity: 100, unit: 'g', notes: 'Hand-kneaded for melt-in-mouth soft texture' },
        { name: 'Saffron & Rose Sugar Nectar', quantity: 400, unit: 'ml', notes: 'Infused with green cardamom' },
        { name: 'Slivered Pistachios & Almonds', quantity: 25, unit: 'g', notes: 'Royal wedding garnish' }
      ];
    }
    return [
      { name: 'Farm Fresh Primary Ingredients', quantity: 400, unit: 'g', notes: 'Hand-selected farm produce' },
      { name: 'Desi Cow Ghee & Cold Pressed Oils', quantity: 60, unit: 'g', notes: 'Traditional cooking medium' },
      { name: 'Hand-Ground Royal Spices', quantity: 30, unit: 'g', notes: 'Artisanal spice blend' }
    ];
  }
}