import { Component, OnInit, inject, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { RecipeService } from '../../../core/services/recipe.service';
import { DishService } from '../../../core/services/dish.service';
import { ToastService } from '../../../core/services/toast.service';
import { Recipe, Dish, RecipeIngredient, RecipeStep } from '../../../core/models';

@Component({
  selector: 'app-admin-recipes',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="recipes-page">
      <!-- Header matching Figma Screen 5 -->
      <div class="page-head">
        <div class="head-text">
          <h1>Recipe Management</h1>
          <p>Manage recipe details, ingredients, cooking steps, and scaling for your dishes.</p>
        </div>
        <div class="head-controls">
          @if (currentDish()) {
            <a [routerLink]="['/admin/dishes', currentDish()?.id, 'edit']" class="wf-btn gold sm">
              <span class="material-symbols-outlined">edit</span>
              <span>Edit Dish Details</span>
            </a>
          }
          <!-- Searchable Autocomplete Combobox for Selecting Dish -->
          <div class="dish-autocomplete-wrap" (click)="$event.stopPropagation()">
            <label class="ac-label">Select Dish:</label>
            <div class="ac-input-box" [class.open]="dishDropdownOpen()">
              <span class="material-symbols-outlined ac-search-icon">search</span>
              <input 
                type="text" 
                class="ac-input" 
                [placeholder]="currentDish() ? currentDish()!.name : 'Search dish by name...'" 
                [ngModel]="dishSearchQuery()" 
                (ngModelChange)="onDishSearchChange($event)"
                (focus)="openDishDropdown()"
                (keydown)="onDishKeydown($event)"
              />
              @if (dishSearchQuery()) {
                <button type="button" class="ac-clear-btn" (click)="clearDishSearch($event)" title="Clear filter">
                  <span class="material-symbols-outlined">close</span>
                </button>
              }
              <button type="button" class="ac-toggle-btn" (click)="toggleDishDropdown($event)" aria-label="Toggle dish list">
                <span class="material-symbols-outlined">{{ dishDropdownOpen() ? 'expand_less' : 'expand_more' }}</span>
              </button>
            </div>

            <!-- Autocomplete Dropdown List -->
            @if (dishDropdownOpen()) {
              <div class="ac-dropdown-menu">
                <div class="ac-dropdown-header">
                  <span>{{ filteredDishes().length }} Dishes Available</span>
                  @if (dishSearchQuery()) {
                    <span class="ac-filter-term">Filtering: "{{ dishSearchQuery() }}"</span>
                  }
                </div>
                <div class="ac-list" role="listbox">
                  @for (dish of filteredDishes(); track dish.id; let idx = $index) {
                    <div 
                      class="ac-item" 
                      [class.selected]="dish.id === selectedDishId()"
                      [class.highlighted]="idx === highlightedDishIndex()"
                      (click)="selectDishFromAutocomplete(dish)"
                      (mouseenter)="highlightedDishIndex.set(idx)"
                      role="option"
                    >
                      <img [src]="dish.primary_image_url || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=100&q=80'" class="ac-item-img" alt="" />
                      <div class="ac-item-info">
                        <div class="ac-item-title-row">
                          <span class="ac-item-name">{{ dish.name }}</span>
                          <span class="food-type-badge" [ngClass]="dish.food_type"><span class="dot"></span></span>
                        </div>
                        <span class="ac-item-sub">
                          {{ dish.category_name || 'General' }} &bull; ₹{{ dish.price_per_person / 100 }}/person
                        </span>
                      </div>
                      @if (dish.id === selectedDishId()) {
                        <span class="material-symbols-outlined ac-check-icon">check</span>
                      }
                    </div>
                  } @empty {
                    <div class="ac-no-results">
                      <span class="material-symbols-outlined">search_off</span>
                      <span>No dishes match "{{ dishSearchQuery() }}"</span>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Main Layout matching Figma Screen 5 -->
      <div class="recipe-container">
        <!-- Left Column: Dish Card Preview matching Figma Screen 5 -->
        <div class="dish-preview-card">
          <div class="preview-img-wrap">
            <img 
              [src]="currentDish()?.primary_image_url || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80'" 
              [alt]="currentDish()?.name || 'Dish'" 
              class="preview-img"
              (error)="onImgError($event)"
            />
          </div>
          <div class="preview-body">
            <div class="title-row">
              <h3>{{ currentDish()?.name || 'Vegetable Biryani' }}</h3>
              <span class="food-type-badge" [ngClass]="currentDish()?.food_type || 'veg'">
                <span class="dot"></span>
              </span>
            </div>
            <div class="meta-row">
              <span class="price">₹{{ (currentDish()?.price_per_person || 10000) / 100 }}/person</span>
              <span class="prep-time">Prep Time: {{ currentDish()?.prep_time || '30 mins' }}</span>
            </div>
            <p class="desc">{{ currentDish()?.description || 'Royal preparation with authentic spices.' }}</p>
          </div>

          <!-- Dedicated Action Buttons for Selected Dish -->
          <div class="preview-actions">
            <a 
              [routerLink]="['/admin/dishes', currentDish()?.id, 'edit']" 
              class="btn-dish-action edit"
              title="Edit Dish, Pricing & Scaling Blueprint"
            >
              <span class="material-symbols-outlined">edit</span>
              <span>Edit Dish & Pricing</span>
            </a>
            <button 
              type="button" 
              class="btn-dish-action delete" 
              (click)="deleteSelectedDish()"
              title="Delete this dish"
            >
              <span class="material-symbols-outlined">delete</span>
              <span>Delete Dish</span>
            </button>
            <a 
              routerLink="/admin/dishes" 
              class="btn-dish-action browse"
              title="View all banquet dishes"
            >
              <span class="material-symbols-outlined">restaurant_menu</span>
              <span>Browse All Dishes</span>
            </a>
          </div>
        </div>

        <!-- Right Area: Tabs + Ingredients Table + Cooking Instructions -->
        <div class="recipe-details-card">
          <!-- Sub Tabs matching Figma -->
          <div class="tabs-bar">
            <div class="tabs-nav">
              <button class="tab-btn" [class.active]="activeTab() === 'ingredients'" (click)="activeTab.set('ingredients')">
                Ingredients ({{ ingredients().length }})
              </button>
              <button class="tab-btn" [class.active]="activeTab() === 'steps'" (click)="activeTab.set('steps')">
                Preparation Steps ({{ steps().length }})
              </button>
              <button class="tab-btn" [class.active]="activeTab() === 'images'" (click)="activeTab.set('images')">
                Images ({{ currentDish()?.images?.length || 0 }})
              </button>
            </div>
            <div class="tabs-actions">
              <a 
                [routerLink]="['/admin/dishes', currentDish()?.id, 'edit']" 
                class="wf-btn secondary sm"
                title="Edit Dish & Pricing"
              >
                <span class="material-symbols-outlined">edit</span>
                <span>Edit Dish</span>
              </a>
              @if (activeTab() === 'ingredients') {
                <button class="wf-btn primary sm" (click)="openAddIngredient()">
                  <span class="material-symbols-outlined">add</span>
                  <span>Add Ingredient</span>
                </button>
              } @else if (activeTab() === 'steps') {
                <button class="wf-btn primary sm" (click)="openAddStep()">
                  <span class="material-symbols-outlined">add</span>
                  <span>Add Step</span>
                </button>
              }
            </div>
          </div>

          <!-- Tab Content Area -->
          <div class="tab-content-grid">
            @if (activeTab() === 'ingredients') {
              <!-- Ingredients Table matching Figma Screen 5 -->
              <div class="ingredients-table-wrap">
                <table class="recipe-table">
                  <thead>
                    <tr>
                      <th>Ingredient</th>
                      <th>Quantity</th>
                      <th>Unit</th>
                      <th class="actions-th">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (ing of ingredients(); track ing.id || ing.name) {
                      <tr>
                        <td class="ing-name-cell">
                          <strong>{{ ing.name }}</strong>
                          @if (ing.notes) {
                            <span class="ing-notes">({{ ing.notes }})</span>
                          }
                        </td>
                        <td>{{ ing.quantity }}</td>
                        <td>{{ ing.unit }}</td>
                        <td>
                          <div class="row-actions">
                            <button class="act-btn edit" (click)="editIngredient(ing)" title="Edit Ingredient">
                              <span class="material-symbols-outlined">edit</span>
                            </button>
                            <button class="act-btn delete" (click)="removeIngredient(ing)" title="Delete Ingredient">
                              <span class="material-symbols-outlined">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    } @empty {
                      <tr>
                        <td colspan="4" class="no-data">
                          <div class="empty-ing-box">
                            <span class="material-symbols-outlined">soup_kitchen</span>
                            <p>No ingredients added yet for {{ currentDish()?.name || 'this dish' }}.</p>
                            <button type="button" class="wf-btn primary sm" (click)="openAddIngredient()">
                              <span class="material-symbols-outlined">add</span>
                              <span>Add First Ingredient</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              <!-- Cooking Instructions Sidebar Card matching Figma Screen 5 -->
              <div class="cooking-instructions-box">
                <h4>Cooking Instructions</h4>
                <ol class="ordered-steps">
                  @for (step of steps(); track step.step_number) {
                    <li>{{ step.instruction }}</li>
                  } @empty {
                    <li class="no-step">1. Wash and soak rice for 30 minutes.</li>
                    <li class="no-step">2. Prepare masala with vegetables.</li>
                    <li class="no-step">3. Layer and cook on low flame under dum.</li>
                  }
                </ol>

                <div class="cooking-time-badge">
                  <span class="material-symbols-outlined clock-icon">schedule</span>
                  <div class="time-texts">
                    <span class="label">Cooking Time</span>
                    <strong>{{ currentRecipe()?.cooking_time || 30 }} mins</strong>
                  </div>
                </div>
              </div>
            } @else if (activeTab() === 'steps') {
              <!-- Step Management View -->
              <div class="steps-full-wrap">
                <div class="steps-list">
                  @for (step of steps(); track step.step_number; let idx = $index) {
                    <div class="step-card-row">
                      <div class="step-num-circle">{{ idx + 1 }}</div>
                      <div class="step-text">{{ step.instruction }}</div>
                      <button class="act-btn delete" (click)="removeStep(idx)">
                        <span class="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  }
                </div>
              </div>
            } @else {
              <!-- Recipe Images View -->
              <div class="recipe-images-grid">
                @for (img of currentDish()?.images || []; track img.id) {
                  <div class="recipe-img-item">
                    <img [src]="img.image_url" [alt]="img.file_name || 'Recipe Image'" />
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Add Ingredient Modal -->
      @if (showIngredientModal()) {
        <div class="modal-backdrop" (click)="showIngredientModal.set(false)">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <div class="modal-head">
              <h3>Add Ingredient</h3>
              <button class="close-btn" (click)="showIngredientModal.set(false)">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            <div class="modal-body">
              <div class="wf-form-group">
                <label>Ingredient Name <span class="required">*</span></label>
                <input type="text" [(ngModel)]="newIngredientName" placeholder="e.g. Basmati Rice, Malai Paneer" />
              </div>
              <div class="grid-2">
                <div class="wf-form-group">
                  <label>Quantity <span class="required">*</span></label>
                  <input type="number" [(ngModel)]="newIngredientQty" placeholder="500" />
                </div>
                <div class="wf-form-group">
                  <label>Unit</label>
                  <select [(ngModel)]="newIngredientUnit">
                    <option value="g">g</option>
                    <option value="kg">kg</option>
                    <option value="ml">ml</option>
                    <option value="l">l</option>
                    <option value="pcs">pcs</option>
                    <option value="tbsp">tbsp</option>
                    <option value="tsp">tsp</option>
                  </select>
                </div>
              </div>
              <div class="wf-form-group">
                <label>Notes (optional)</label>
                <input type="text" [(ngModel)]="newIngredientNotes" placeholder="e.g. Extra long grain aged rice" />
              </div>
              <div class="modal-actions">
                <button class="wf-btn secondary" (click)="showIngredientModal.set(false)">Cancel</button>
                <button class="wf-btn primary" (click)="saveIngredient()">Save Ingredient</button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Add Step Modal -->
      @if (showStepModal()) {
        <div class="modal-backdrop" (click)="showStepModal.set(false)">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <div class="modal-head">
              <h3>Add Preparation Step</h3>
              <button class="close-btn" (click)="showStepModal.set(false)">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            <div class="modal-body">
              <div class="wf-form-group">
                <label>Instruction <span class="required">*</span></label>
                <textarea [(ngModel)]="newStepInstruction" rows="3" placeholder="Describe this cooking step..."></textarea>
              </div>
              <div class="modal-actions">
                <button class="wf-btn secondary" (click)="showStepModal.set(false)">Cancel</button>
                <button class="wf-btn primary" (click)="saveStep()">Save Step</button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .recipes-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .page-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;

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

      .head-controls {
        display: flex;
        align-items: center;
        gap: 0.85rem;
        flex-wrap: wrap;
      }

      .dish-autocomplete-wrap {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        position: relative;

        .ac-label {
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--text-secondary);
          white-space: nowrap;
        }

        .ac-input-box {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: #ffffff;
          border: 1px solid var(--border-hairline, #e5dec9);
          border-radius: var(--radius-sm, 8px);
          padding: 0.4rem 0.65rem;
          min-width: 250px;
          transition: all 0.2s;

          &.open, &:focus-within {
            border-color: var(--accent-gold, #c59b43);
            box-shadow: 0 0 0 3px rgba(197, 155, 67, 0.15);
          }

          .ac-search-icon {
            font-size: 18px;
            color: var(--accent-gold-dark, #9e7626);
          }

          .ac-input {
            border: none;
            background: transparent;
            outline: none;
            font-size: 0.88rem;
            color: var(--primary-maroon, #5b1a24);
            font-weight: 600;
            width: 100%;
            padding: 0;

            &::placeholder {
              color: var(--text-muted);
              font-weight: 400;
            }
          }

          .ac-clear-btn, .ac-toggle-btn {
            background: none;
            border: none;
            color: var(--text-muted);
            cursor: pointer;
            display: flex;
            align-items: center;
            padding: 0;
            &:hover { color: var(--primary-maroon); }
            .material-symbols-outlined { font-size: 18px; }
          }
        }

        .ac-dropdown-menu {
          position: absolute;
          top: calc(100% + 6px);
          right: 0;
          width: 320px;
          max-height: 380px;
          background: #ffffff;
          border: 1px solid var(--border-hairline, #e5dec9);
          border-radius: var(--radius-md, 12px);
          box-shadow: 0 10px 28px rgba(91, 26, 36, 0.12);
          z-index: 1000;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          animation: fadeIn 0.15s ease;

          .ac-dropdown-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0.6rem 0.85rem;
            background: #FAF8F5;
            border-bottom: 1px solid #F0ECE4;
            font-size: 0.74rem;
            font-weight: 700;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.5px;

            .ac-filter-term {
              color: var(--accent-gold-dark);
              font-style: italic;
              text-transform: none;
            }
          }

          .ac-list {
            overflow-y: auto;
            max-height: 320px;
            padding: 0.35rem 0;
          }

          .ac-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.55rem 0.85rem;
            cursor: pointer;
            transition: background 0.15s;

            &:hover, &.highlighted {
              background: #FAF8F5;
            }

            &.selected {
              background: rgba(197, 155, 67, 0.12);
            }

            .ac-item-img {
              width: 38px;
              height: 38px;
              border-radius: 6px;
              object-fit: cover;
              border: 1px solid #E5DEC9;
              flex-shrink: 0;
            }

            .ac-item-info {
              flex: 1;
              min-width: 0;
              display: flex;
              flex-direction: column;
              gap: 0.15rem;

              .ac-item-title-row {
                display: flex;
                align-items: center;
                gap: 0.4rem;

                .ac-item-name {
                  font-size: 0.88rem;
                  font-weight: 600;
                  color: var(--primary-maroon);
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                }
              }

              .ac-item-sub {
                font-size: 0.75rem;
                color: var(--text-secondary);
              }
            }

            .ac-check-icon {
              font-size: 18px;
              color: var(--accent-gold);
              font-weight: 700;
            }
          }

          .ac-no-results {
            padding: 1.5rem 1rem;
            text-align: center;
            color: var(--text-muted);
            font-size: 0.85rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.4rem;

            .material-symbols-outlined { font-size: 28px; color: var(--border-hairline); }
          }
        }
      }
    }

    /* Main Layout matching Figma Screen 5 */
    .recipe-container {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 1.5rem;

      @media (max-width: 960px) {
        grid-template-columns: 1fr;
      }
    }

    /* Dish Preview Card */
    .dish-preview-card {
      background: #ffffff;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-card);
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(61, 9, 22, 0.04);
      display: flex;
      flex-direction: column;
      height: fit-content;

      .preview-img-wrap {
        height: 180px;
        background: var(--bg-cream);

        .preview-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .preview-body {
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        .title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;

          h3 {
            font-size: 1.05rem;
            font-weight: 700;
            color: var(--text-primary);
          }
        }

        .meta-row {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          font-size: 0.85rem;

          .price {
            font-weight: 700;
            color: var(--primary-maroon);
          }

          .prep-time {
            color: var(--text-muted);
          }
        }

        .desc {
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.4;
          margin-top: 0.4rem;
        }
      }

      .preview-actions {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 0 1.25rem 1.25rem;

        .btn-dish-action {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          padding: 0.55rem 0.85rem;
          border-radius: var(--radius-sm, 6px);
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;

          &.edit {
            background: var(--primary-maroon, #5B1A24);
            color: #ffffff;
            border: 1px solid var(--primary-maroon, #5B1A24);
            &:hover {
              background: var(--primary-maroon-hover, #421119);
              box-shadow: 0 3px 8px rgba(91, 26, 36, 0.2);
            }
          }

          &.delete {
            background: #FEF2F2;
            color: #DC2626;
            border: 1px solid #FECACA;
            &:hover {
              background: #FEE2E2;
              border-color: #F87171;
            }
          }

          &.browse {
            background: #F3EFEA;
            color: var(--text-primary);
            border: 1px solid var(--border-hairline, #e5dec9);
            &:hover {
              background: #EBE5DC;
            }
          }
        }
      }
    }

    /* Recipe Details Card */
    .recipe-details-card {
      background: #ffffff;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-card);
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(61, 9, 22, 0.04);
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .tabs-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--border-subtle);
      padding-bottom: 0.75rem;
      gap: 1rem;
      flex-wrap: wrap;

      .tabs-actions {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        flex-wrap: wrap;
      }

      .tabs-nav {
        display: flex;
        gap: 1.5rem;

        .tab-btn {
          font-size: 0.92rem;
          font-weight: 600;
          color: var(--text-secondary);
          padding-bottom: 0.75rem;
          position: relative;
          margin-bottom: -0.75rem;

          &.active {
            color: var(--primary-maroon);

            &::after {
              content: '';
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
              height: 2px;
              background: var(--primary-maroon);
            }
          }
        }
      }
    }

    .tab-content-grid {
      display: grid;
      grid-template-columns: 1.6fr 1.1fr;
      gap: 1.5rem;

      @media (max-width: 900px) {
        grid-template-columns: 1fr;
      }
    }

    /* Ingredients Table matching Figma Screen 5 */
    .ingredients-table-wrap {
      border: 1px solid var(--border-card);
      border-radius: var(--radius-sm);
      overflow: hidden;

      .recipe-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.88rem;

        th {
          background: var(--bg-card-subtle);
          padding: 0.75rem 0.9rem;
          font-weight: 600;
          color: var(--text-secondary);
          border-bottom: 1px solid var(--border-card);
          text-align: left;

          &.actions-th {
            text-align: right;
          }
        }

        td {
          padding: 0.75rem 0.9rem;
          border-bottom: 1px solid var(--border-subtle);

          &.ing-name-cell {
            display: flex;
            flex-direction: column;

            .ing-notes {
              font-size: 0.75rem;
              color: var(--text-muted);
            }
          }
        }

        .row-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.35rem;

          .act-btn {
            width: 28px;
            height: 28px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-secondary);

            .material-symbols-outlined {
              font-size: 16px;
            }

            &.edit:hover {
              background: var(--bg-cream);
              color: var(--accent-gold-dark);
            }

            &.delete:hover {
              background: #ffebee;
              color: var(--nonveg-red);
            }
          }
        }

        .no-data {
          text-align: center;
          padding: 2.5rem 1.5rem;
          color: var(--text-muted);

          .empty-ing-box {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;

            .material-symbols-outlined {
              font-size: 40px;
              color: var(--accent-gold, #c59b43);
            }

            p {
              font-size: 0.88rem;
              color: var(--text-secondary);
              margin: 0 0 0.25rem;
            }
          }
        }
      }
    }

    /* Cooking Instructions Box matching Figma Screen 5 */
    .cooking-instructions-box {
      background: var(--bg-card-subtle);
      border: 1px solid var(--border-card);
      border-radius: var(--radius-sm);
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 1.25rem;

      h4 {
        font-size: 0.95rem;
        font-weight: 700;
        color: var(--primary-maroon);
        border-bottom: 1px solid var(--border-subtle);
        padding-bottom: 0.5rem;
      }

      .ordered-steps {
        padding-left: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
        font-size: 0.85rem;
        color: var(--text-secondary);
        line-height: 1.45;

        .no-step {
          color: var(--text-muted);
        }
      }

      .cooking-time-badge {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        background: #ffffff;
        border: 1px solid var(--border-card);
        padding: 0.65rem 0.9rem;
        border-radius: var(--radius-sm);

        .clock-icon {
          font-size: 28px;
          color: var(--accent-gold);
        }

        .time-texts {
          display: flex;
          flex-direction: column;

          .label {
            font-size: 0.75rem;
            color: var(--text-muted);
          }

          strong {
            font-size: 0.95rem;
            color: var(--primary-maroon);
          }
        }
      }
    }

    /* Steps Full View */
    .steps-full-wrap {
      grid-column: 1 / -1;

      .steps-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;

        .step-card-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: var(--bg-card-subtle);
          border: 1px solid var(--border-card);
          padding: 0.85rem 1.1rem;
          border-radius: var(--radius-sm);

          .step-num-circle {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: var(--primary-maroon);
            color: #ffffff;
            font-size: 0.85rem;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .step-text {
            flex: 1;
            font-size: 0.88rem;
            color: var(--text-primary);
          }
        }
      }
    }

    /* Recipe Images */
    .recipe-images-grid {
      grid-column: 1 / -1;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 1rem;

      .recipe-img-item {
        height: 140px;
        border-radius: var(--radius-sm);
        overflow: hidden;
        border: 1px solid var(--border-card);

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }

    /* Modals */
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
      max-width: 480px;
      overflow: hidden;

      .modal-head {
        padding: 1.1rem 1.3rem;
        border-bottom: 1px solid var(--border-subtle);
        display: flex;
        align-items: center;
        justify-content: space-between;

        h3 {
          font-family: var(--font-display);
          font-size: 1.1rem;
          color: var(--primary-maroon);
        }
      }

      .modal-body {
        padding: 1.3rem;
      }

      .grid-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }

      .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        margin-top: 1.25rem;
      }
    }
  `]
})
export class AdminRecipesComponent implements OnInit {
  private recipeService = inject(RecipeService);
  private dishService = inject(DishService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  allDishes = signal<Dish[]>([]);
  selectedDishId = signal<string>('');
  currentDish = signal<Dish | null>(null);
  currentRecipe = signal<Recipe | null>(null);

  // Search Autocomplete State
  dishSearchQuery = signal<string>('');
  dishDropdownOpen = signal<boolean>(false);
  highlightedDishIndex = signal<number>(-1);

  filteredDishes = computed(() => {
    const q = this.dishSearchQuery().trim().toLowerCase();
    const dishes = this.allDishes();
    if (!q) return dishes;
    return dishes.filter(d => 
      d.name.toLowerCase().includes(q) || 
      (d.category_name && d.category_name.toLowerCase().includes(q)) ||
      (d.food_type && d.food_type.toLowerCase().includes(q))
    );
  });

  @HostListener('document:click')
  onDocumentClick() {
    this.dishDropdownOpen.set(false);
  }

  openDishDropdown() {
    this.dishDropdownOpen.set(true);
    this.highlightedDishIndex.set(-1);
  }

  toggleDishDropdown(e: Event) {
    e.stopPropagation();
    this.dishDropdownOpen.update(v => !v);
  }

  clearDishSearch(e: Event) {
    e.stopPropagation();
    this.dishSearchQuery.set('');
    this.dishDropdownOpen.set(true);
  }

  onDishSearchChange(query: string) {
    this.dishSearchQuery.set(query);
    this.dishDropdownOpen.set(true);
    this.highlightedDishIndex.set(0);
  }

  selectDishFromAutocomplete(dish: Dish) {
    this.onSelectDish(dish.id);
    this.dishSearchQuery.set(dish.name);
    this.dishDropdownOpen.set(false);
  }

  onDishKeydown(e: KeyboardEvent) {
    const list = this.filteredDishes();
    if (!this.dishDropdownOpen()) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        this.dishDropdownOpen.set(true);
        e.preventDefault();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.highlightedDishIndex.update(idx => Math.min(idx + 1, list.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.highlightedDishIndex.update(idx => Math.max(idx - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const currentIdx = this.highlightedDishIndex();
      if (currentIdx >= 0 && currentIdx < list.length) {
        this.selectDishFromAutocomplete(list[currentIdx]);
      }
    } else if (e.key === 'Escape') {
      this.dishDropdownOpen.set(false);
    }
  }

  ingredients = signal<RecipeIngredient[]>([]);
  steps = signal<RecipeStep[]>([]);
  activeTab = signal<'ingredients' | 'steps' | 'images'>('ingredients');

  showIngredientModal = signal<boolean>(false);
  newIngredientName = '';
  newIngredientQty = 100;
  newIngredientUnit = 'g';
  newIngredientNotes = '';

  showStepModal = signal<boolean>(false);
  newStepInstruction = '';

  ngOnInit() {
    this.dishService.getDishes({ limit: 50 }).subscribe({
      next: (res) => {
        if (res.success && res.dishes.length > 0) {
          this.allDishes.set(res.dishes);

          // Check if dishId passed in query
          const qDishId = this.route.snapshot.queryParamMap.get('dishId');
          const targetId = qDishId || res.dishes[0].id;
          this.onSelectDish(targetId);
        }
      }
    });
  }

  onSelectDish(dishId: string) {
    this.selectedDishId.set(dishId);
    const dish = this.allDishes().find(d => d.id === dishId) || null;
    this.currentDish.set(dish);
    if (dish && !this.dishDropdownOpen()) {
      this.dishSearchQuery.set(dish.name);
    }

    this.recipeService.getRecipeByDishId(dishId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.currentRecipe.set(res.data);
          this.ingredients.set(res.data.ingredients || []);
          this.steps.set(res.data.steps || []);
        } else {
          this.currentRecipe.set(null);
          this.ingredients.set([]);
          this.steps.set([]);
        }
      },
      error: () => {
        // Recipe not yet created for this dish; initialize empty
        this.currentRecipe.set(null);
        this.ingredients.set([]);
        this.steps.set([]);
      }
    });
  }

  openAddIngredient() {
    this.newIngredientName = '';
    this.newIngredientQty = 100;
    this.newIngredientUnit = 'g';
    this.newIngredientNotes = '';
    this.showIngredientModal.set(true);
  }

  editIngredient(ing: RecipeIngredient) {
    this.newIngredientName = ing.name;
    this.newIngredientQty = ing.quantity;
    this.newIngredientUnit = ing.unit;
    this.newIngredientNotes = ing.notes || '';
    this.showIngredientModal.set(true);
  }

  removeIngredient(ing: RecipeIngredient) {
    this.ingredients.update(list => list.filter(i => i !== ing));
    this.saveFullRecipe();
  }

  saveIngredient() {
    if (!this.newIngredientName) return;
    const newIng: RecipeIngredient = {
      id: 'temp_' + Date.now(),
      recipe_id: this.currentRecipe()?.id || '',
      name: this.newIngredientName,
      quantity: Number(this.newIngredientQty),
      unit: this.newIngredientUnit,
      notes: this.newIngredientNotes || null,
      display_order: this.ingredients().length + 1
    };

    this.ingredients.update(list => [...list, newIng]);
    this.showIngredientModal.set(false);
    this.saveFullRecipe();
  }

  openAddStep() {
    this.newStepInstruction = '';
    this.showStepModal.set(true);
  }

  removeStep(index: number) {
    this.steps.update(list => list.filter((_, i) => i !== index));
    this.saveFullRecipe();
  }

  saveStep() {
    if (!this.newStepInstruction) return;
    const newStp: RecipeStep = {
      id: 'step_' + Date.now(),
      recipe_id: this.currentRecipe()?.id || '',
      step_number: this.steps().length + 1,
      instruction: this.newStepInstruction
    };

    this.steps.update(list => [...list, newStp]);
    this.showStepModal.set(false);
    this.saveFullRecipe();
  }

  saveFullRecipe() {
    const dishId = this.selectedDishId();
    if (!dishId) return;

    const payload = {
      dish_id: dishId,
      title: `${this.currentDish()?.name} Recipe`,
      cooking_time: this.currentRecipe()?.cooking_time || 30,
      prep_time: 15,
      servings: 10,
      ingredients: this.ingredients().map(i => ({
        name: i.name,
        quantity: i.quantity,
        unit: i.unit,
        notes: i.notes || undefined
      })),
      steps: this.steps().map((s, idx) => ({
        step_number: idx + 1,
        instruction: s.instruction
      }))
    };

    this.recipeService.saveRecipe(payload).subscribe({
      next: (res) => {
        if (res.success) {
          this.currentRecipe.set(res.data);
          this.toastService.success('Recipe updated in database.');
        }
      },
      error: () => this.toastService.error('Failed to save recipe')
    });
  }

  deleteSelectedDish() {
    const dish = this.currentDish();
    if (!dish) return;
    if (confirm(`Are you sure you want to delete "${dish.name}"? This will remove the dish and its recipe.`)) {
      this.dishService.deleteDish(dish.id).subscribe({
        next: () => {
          this.toastService.success(`Dish "${dish.name}" deleted successfully.`);
          const remaining = this.allDishes().filter(d => d.id !== dish.id);
          this.allDishes.set(remaining);
          if (remaining.length > 0) {
            this.onSelectDish(remaining[0].id);
          } else {
            this.router.navigate(['/admin/dishes']);
          }
        },
        error: () => this.toastService.error('Failed to delete dish.')
      });
    }
  }

  onImgError(event: any) {
    event.target.src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80';
  }
}
