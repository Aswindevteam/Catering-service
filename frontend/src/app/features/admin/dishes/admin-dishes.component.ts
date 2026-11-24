import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { DishService } from '../../../core/services/dish.service';
import { CategoryService } from '../../../core/services/category.service';
import { ToastService } from '../../../core/services/toast.service';
import { ImageService } from '../../../core/services/image.service';
import { Dish, FoodCategory } from '../../../core/models';

@Component({
  selector: 'app-admin-dishes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="dishes-page">
      <!-- Page Header matching Figma Screen 3 -->
      <div class="page-head">
        <div class="head-text">
          <h1>Manage Dishes</h1>
          <p>Add and manage your dishes with images and details.</p>
        </div>
        <a routerLink="/admin/dishes/new" class="wf-btn primary">
          <span class="material-symbols-outlined">add</span>
          <span>Add Dish</span>
        </a>
      </div>

      <!-- Filter Toolbar matching Figma Screen 3 -->
      <div class="filter-toolbar">
        <div class="search-box">
          <span class="material-symbols-outlined search-icon">search</span>
          <input 
            type="text" 
            [ngModel]="searchQuery" 
            (ngModelChange)="onSearchInput($event)" 
            placeholder="Search dishes by name or ingredients..." 
            class="dish-search-input"
          />
          @if (searchQuery) {
            <button type="button" class="clear-search-btn" (click)="clearSearch()" title="Clear filter">
              <span class="material-symbols-outlined">close</span>
            </button>
          }
        </div>

        <div class="filters-row">
          <!-- All Categories dropdown -->
          <div class="select-wrap">
            <select [(ngModel)]="selectedCategory" (ngModelChange)="onFilterChange()">
              <option value="all">All Categories</option>
              @for (cat of categories(); track cat.id) {
                <option [value]="cat.id">{{ cat.name }}</option>
              }
            </select>
          </div>

          <!-- All Types dropdown -->
          <div class="select-wrap">
            <select [(ngModel)]="selectedType" (ngModelChange)="onFilterChange()">
              <option value="all">All Types</option>
              <option value="veg">Veg</option>
              <option value="non-veg">Non-Veg</option>
              <option value="vegan">Vegan</option>
            </select>
          </div>

          <!-- All Status dropdown -->
          <div class="select-wrap">
            <select [(ngModel)]="selectedStatus" (ngModelChange)="onFilterChange()">
              <option value="all">All Status</option>
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>

          <!-- View toggles -->
          <div class="view-toggles">
            <button class="view-btn" [class.active]="viewMode() === 'grid'" (click)="viewMode.set('grid')" title="Grid View">
              <span class="material-symbols-outlined">grid_view</span>
            </button>
            <button class="view-btn" [class.active]="viewMode() === 'list'" (click)="viewMode.set('list')" title="List View">
              <span class="material-symbols-outlined">view_list</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Grid View matching Figma Screen 3 -->
      @if (viewMode() === 'grid') {
        <div class="dishes-grid">
          @for (dish of dishes(); track dish.id) {
            <div class="dish-card" [class.inactive]="!dish.availability">
              <div class="dish-thumb-wrap">
                <img 
                  [src]="dish.primary_image_url || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80'" 
                  [alt]="dish.name" 
                  class="dish-img" 
                  (error)="onImageError($event)"
                />
              </div>

              <div class="dish-body">
                <div class="dish-top">
                  <h3 class="dish-title">{{ dish.name }}</h3>
                  <div class="type-category-row">
                    <span class="food-type-badge" [ngClass]="dish.food_type">
                      <span class="dot"></span>
                    </span>
                    <span class="type-text">
                      {{ dish.food_type === 'veg' ? 'Veg' : dish.food_type === 'non-veg' ? 'Non-Veg' : 'Vegan' }} &bull; {{ dish.category_name || 'General' }}
                    </span>
                  </div>
                </div>

                <div class="dish-pricing">
                  <span class="price-val">₹{{ dish.price_per_person / 100 }}</span>
                  <span class="price-unit">/ person</span>
                </div>

                <div class="dish-card-footer">
                  <!-- Active status pill -->
                  <span class="status-pill" [class.active]="dish.availability" [class.inactive]="!dish.availability">
                    {{ dish.availability ? 'Active' : 'Inactive' }}
                  </span>

                  <!-- Actions matching Figma -->
                  <div class="card-actions">
                    <a [routerLink]="['/admin/dishes', dish.id, 'edit']" class="action-btn edit" title="Edit Dish & Pricing">
                      <span class="material-symbols-outlined">edit</span>
                      <span class="action-txt">Edit</span>
                    </a>
                    <a [routerLink]="['/admin/recipes']" [queryParams]="{dishId: dish.id}" class="action-btn recipe" title="Manage Recipe & Ingredients">
                      <span class="material-symbols-outlined">menu_book</span>
                      <span class="action-txt">Recipe</span>
                    </a>
                    <button type="button" class="action-btn delete" (click)="confirmDelete(dish)" title="Delete Dish">
                      <span class="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          } @empty {
            <div class="empty-state">
              <span class="material-symbols-outlined empty-icon">no_meals</span>
              <h3>No dishes found</h3>
              <p>Try adjusting your search query or filters.</p>
            </div>
          }
        </div>
      } @else {
        <!-- Professional Table View -->
        <div class="table-card">
          <table class="wf-table">
            <thead>
              <tr>
                <th>Dish</th>
                <th>Category</th>
                <th>Type</th>
                <th>Price / Person</th>
                <th>Serving</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (dish of dishes(); track dish.id) {
                <tr>
                  <td>
                    <div class="table-dish-cell">
                      <img [src]="dish.primary_image_url || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=120&q=80'" (error)="onImageError($event)" class="table-thumb" />
                      <div>
                        <strong>{{ dish.name }}</strong>
                        <div class="table-desc">{{ dish.description || '' }}</div>
                      </div>
                    </div>
                  </td>
                  <td>{{ dish.category_name || '-' }}</td>
                  <td>
                    <div class="type-cell">
                      <span class="food-type-badge" [ngClass]="dish.food_type"><span class="dot"></span></span>
                      <span>{{ dish.food_type }}</span>
                    </div>
                  </td>
                  <td><strong>₹{{ dish.price_per_person / 100 }}</strong></td>
                  <td>{{ dish.quantity_per_person }} {{ dish.serving_unit }}</td>
                  <td>
                    <span class="status-pill" [class.active]="dish.availability" [class.inactive]="!dish.availability">
                      {{ dish.availability ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td>
                    <div class="card-actions">
                      <button class="action-btn edit" [routerLink]="['/admin/dishes', dish.id, 'edit']" title="Edit">
                        <span class="material-symbols-outlined">edit</span>
                      </button>
                      <button class="action-btn recipe" [routerLink]="['/admin/recipes']" [queryParams]="{dishId: dish.id}" title="Recipe">
                        <span class="material-symbols-outlined">menu_book</span>
                      </button>
                      <button class="action-btn delete" (click)="confirmDelete(dish)" title="Delete">
                        <span class="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Pagination Footer matching Figma Screen 3 -->
      <div class="pagination-bar">
        <div class="pagination-info">
          Showing {{ ((currentPage() - 1) * limit) + 1 }} - {{ Math.min(currentPage() * limit, totalDishes()) }} of {{ totalDishes() }} dishes
        </div>
        <div class="pagination-controls">
          <button class="page-btn nav" [disabled]="currentPage() === 1" (click)="changePage(currentPage() - 1)">
            <span class="material-symbols-outlined">chevron_left</span>
          </button>
          @for (p of getPages(); track p) {
            <button class="page-btn num" [class.active]="p === currentPage()" (click)="changePage(p)">
              {{ p }}
            </button>
          }
          <button class="page-btn nav" [disabled]="currentPage() >= totalPages()" (click)="changePage(currentPage() + 1)">
            <span class="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dishes-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .page-head {
      display: flex;
      align-items: center;
      justify-content: space-between;

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

    /* Filter Toolbar matching Figma Screen 3 */
    .filter-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      background: #ffffff;
      padding: 0.85rem 1.25rem;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-card);
      flex-wrap: wrap;

      .search-box {
        position: relative;
        flex: 1;
        min-width: 260px;
        max-width: 440px;
        display: flex;
        align-items: center;

        .search-icon {
          position: absolute;
          left: 0.85rem;
          color: var(--text-muted, #9c8b7e);
          font-size: 20px;
          pointer-events: none;
        }

        .dish-search-input {
          width: 100%;
          padding: 0.62rem 2.2rem 0.62rem 2.5rem;
          background: #ffffff;
          border: 1px solid var(--border-card, #e5dec9);
          border-radius: var(--radius-sm, 8px);
          font-size: 0.88rem;
          color: var(--text-primary);
          outline: none;
          transition: all 0.2s;

          &:focus {
            border-color: var(--accent-gold, #c59b43);
            box-shadow: 0 0 0 3px rgba(197, 155, 67, 0.15);
          }

          &::placeholder {
            color: var(--text-muted, #9c8b7e);
            font-style: italic;
          }
        }

        .clear-search-btn {
          position: absolute;
          right: 0.65rem;
          color: var(--text-muted, #9c8b7e);
          background: transparent;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 2px;
          border-radius: 50%;
          transition: color 0.15s;

          &:hover { 
            color: var(--text-primary, #2f0b12); 
            background: rgba(0, 0, 0, 0.05);
          }

          .material-symbols-outlined { 
            font-size: 18px; 
          }
        }
      }

      .filters-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;

        .select-wrap select {
          padding: 0.5rem 0.85rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-card);
          background: #ffffff;
          font-size: 0.85rem;
          color: var(--text-secondary);
          font-weight: 500;
          cursor: pointer;

          &:focus {
            outline: none;
            border-color: var(--accent-gold);
          }
        }

        .view-toggles {
          display: flex;
          border: 1px solid var(--border-card);
          border-radius: var(--radius-sm);
          overflow: hidden;

          .view-btn {
            padding: 0.45rem 0.65rem;
            color: var(--text-muted);
            background: #ffffff;

            &.active {
              background: var(--bg-cream);
              color: var(--primary-maroon);
            }

            .material-symbols-outlined {
              font-size: 20px;
            }
          }
        }
      }
    }

    /* Dishes Grid matching Figma Screen 3 */
    .dishes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1.25rem;
    }

    .dish-card {
      background: #ffffff;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-card);
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(61, 9, 22, 0.04);
      transition: all 0.2s ease;
      display: flex;
      flex-direction: column;

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }

      &.inactive {
        opacity: 0.6;
      }

      .dish-thumb-wrap {
        height: 155px;
        background: var(--bg-cream);
        overflow: hidden;

        .dish-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }

        &:hover .dish-img {
          transform: scale(1.05);
        }
      }

      .dish-body {
        padding: 1rem 1.15rem;
        display: flex;
        flex-direction: column;
        flex: 1;
        justify-content: space-between;
        gap: 0.75rem;

        .dish-top {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;

          .dish-title {
            font-size: 0.95rem;
            font-weight: 700;
            color: var(--text-primary);
          }

          .type-category-row {
            display: flex;
            align-items: center;
            gap: 0.45rem;

            .type-text {
              font-size: 0.78rem;
              color: var(--text-secondary);
              font-weight: 500;
            }
          }
        }

        .dish-pricing {
          display: flex;
          align-items: baseline;
          gap: 0.25rem;

          .price-val {
            font-size: 1.05rem;
            font-weight: 800;
            color: var(--text-primary);
          }

          .price-unit {
            font-size: 0.8rem;
            color: var(--text-muted);
          }
        }

        .dish-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid var(--border-subtle);
          padding-top: 0.75rem;

          .status-pill {
            font-size: 0.72rem;
            font-weight: 700;
            padding: 0.2rem 0.55rem;
            border-radius: 12px;

            &.active {
              background: #e8f5e9;
              color: var(--veg-green);
            }

            &.inactive {
              background: #ffebee;
              color: var(--nonveg-red);
            }
          }
        }
      }
    }

    .card-actions {
      display: flex;
      align-items: center;
      gap: 0.35rem;

      .action-btn {
        min-height: 28px;
        padding: 0.2rem 0.55rem;
        border-radius: 4px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.25rem;
        color: var(--text-secondary);
        font-size: 0.76rem;
        font-weight: 600;
        text-decoration: none;
        transition: all 0.2s;
        border: 1px solid transparent;
        cursor: pointer;

        .material-symbols-outlined {
          font-size: 15px;
        }

        &.edit {
          background: #FAF8F5;
          border-color: #E5DEC9;
          color: var(--primary-maroon);

          &:hover {
            background: var(--bg-cream);
            color: var(--accent-gold-dark);
            border-color: var(--accent-gold);
          }
        }

        &.recipe {
          background: #FAF4E8;
          border-color: rgba(197, 155, 67, 0.35);
          color: var(--accent-gold-dark);

          &:hover {
            background: var(--primary-maroon-subtle);
            color: var(--primary-maroon);
          }
        }

        &.delete {
          background: #FEF2F2;
          border-color: #FECACA;
          color: var(--nonveg-red);
          padding: 0.2rem 0.4rem;

          &:hover {
            background: #FEE2E2;
            color: #DC2626;
          }
        }
      }
    }

    /* Table View */
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

      .table-dish-cell {
        display: flex;
        align-items: center;
        gap: 0.75rem;

        .table-thumb {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-sm);
          object-fit: cover;
        }

        .table-desc {
          font-size: 0.75rem;
          color: var(--text-muted);
          max-width: 250px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }

      .type-cell {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        text-transform: capitalize;
      }
    }

    /* Pagination */
    .pagination-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.5rem 0;

      .pagination-info {
        font-size: 0.85rem;
        color: var(--text-muted);
      }

      .pagination-controls {
        display: flex;
        align-items: center;
        gap: 0.35rem;

        .page-btn {
          min-width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-card);
          background: #ffffff;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);

          &:hover:not(:disabled) {
            border-color: var(--accent-gold);
            color: var(--primary-maroon);
          }

          &.active {
            background: var(--primary-maroon);
            border-color: var(--primary-maroon);
            color: #ffffff;
          }

          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        }
      }
    }

    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 3rem;
      background: #ffffff;
      border-radius: var(--radius-md);
      border: 1px dashed var(--border-card);

      .empty-icon {
        font-size: 48px;
        color: var(--accent-gold);
        margin-bottom: 0.5rem;
      }
    }
  `]
})
export class AdminDishesComponent implements OnInit, OnDestroy {
  private dishService = inject(DishService);
  private categoryService = inject(CategoryService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  imageService = inject(ImageService);

  private searchSubject = new Subject<string>();
  private searchSub?: Subscription;
  private routeSub?: Subscription;

  dishes = signal<Dish[]>([]);
  categories = signal<FoodCategory[]>([]);
  totalDishes = signal<number>(0);
  currentPage = signal<number>(1);
  limit = 8;
  viewMode = signal<'grid' | 'list'>('grid');

  searchQuery = '';
  selectedCategory = 'all';
  selectedType = 'all';
  selectedStatus = 'all';

  Math = Math;

  ngOnInit() {
    this.searchSub = this.searchSubject.pipe(
      debounceTime(250),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchQuery = term;
      this.currentPage.set(1);
      this.loadDishes();
    });

    this.routeSub = this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.searchQuery = params['search'];
      }
    });

    this.loadCategories();
    this.loadDishes();
  }

  onSearchInput(val: string) {
    this.searchQuery = val;
    this.searchSubject.next(val);
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchSubject.next('');
  }

  onImageError(e: Event) {
    this.imageService.handleImageError(e);
  }

  ngOnDestroy() {
    this.searchSub?.unsubscribe();
    this.routeSub?.unsubscribe();
  }

  loadCategories() {
    this.categoryService.getCategories(true).subscribe({
      next: (res) => { if (res.success) this.categories.set(res.data); }
    });
  }

  loadDishes() {
    this.dishService.getDishes({
      search: this.searchQuery || undefined,
      category_id: this.selectedCategory !== 'all' ? this.selectedCategory : undefined,
      food_type: this.selectedType !== 'all' ? this.selectedType : undefined,
      availability: this.selectedStatus !== 'all' ? Number(this.selectedStatus) : undefined,
      page: this.currentPage(),
      limit: this.limit
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.dishes.set(res.dishes);
          this.totalDishes.set(res.total);
        }
      },
      error: () => this.toastService.error('Failed to load dishes')
    });
  }

  onFilterChange() {
    this.currentPage.set(1);
    this.loadDishes();
  }

  changePage(p: number) {
    if (p < 1 || p > this.totalPages()) return;
    this.currentPage.set(p);
    this.loadDishes();
  }

  totalPages(): number {
    return Math.max(1, Math.ceil(this.totalDishes() / this.limit));
  }

  getPages(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    for (let i = 1; i <= Math.min(5, total); i++) {
      pages.push(i);
    }
    return pages;
  }

  confirmDelete(dish: Dish) {
    if (confirm(`Are you sure you want to delete dish "${dish.name}"?`)) {
      this.dishService.deleteDish(dish.id).subscribe({
        next: () => {
          this.toastService.success(`Dish "${dish.name}" deleted.`);
          this.loadDishes();
        },
        error: () => this.toastService.error('Could not delete dish.')
      });
    }
  }
}
