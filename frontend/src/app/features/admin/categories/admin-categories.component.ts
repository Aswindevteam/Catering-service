import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CategoryService } from '../../../core/services/category.service';
import { ToastService } from '../../../core/services/toast.service';
import { TranslationService } from '../../../core/services/translation.service';
import { FoodCategory } from '../../../core/models';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="categories-page">
      <!-- Page Header -->
      <div class="page-head">
        <div class="head-text">
          <h1>Food Categories</h1>
          <p>Manage your food categories, organize dishes and real-time menu courses.</p>
        </div>
        <button class="wf-btn primary" (click)="openAddModal()">
          <span class="material-symbols-outlined">add</span>
          <span>Add Category</span>
        </button>
      </div>

      <!-- Real-time Debounced Filter Toolbar -->
      <div class="category-filter-toolbar">
        <div class="search-box">
          <span class="material-symbols-outlined search-icon">search</span>
          <input 
            type="text" 
            [ngModel]="rawSearchInput" 
            (ngModelChange)="onSearchInput($event)" 
            placeholder="Filter categories (e.g. Starters, Tiffin, Rice, Desserts)..." 
            class="category-search-input"
          />
          @if (rawSearchInput) {
            <button type="button" class="clear-search-btn" (click)="clearSearch()" title="Clear filter">
              <span class="material-symbols-outlined">close</span>
            </button>
          }
        </div>

        <div class="filter-controls-row">
          <div class="status-pills">
            <button 
              type="button" 
              class="filter-pill" 
              [class.active]="statusFilter() === 'all'" 
              (click)="statusFilter.set('all')"
            >
              All ({{ categories().length }})
            </button>
            <button 
              type="button" 
              class="filter-pill" 
              [class.active]="statusFilter() === 'active'" 
              (click)="statusFilter.set('active')"
            >
              Active ({{ activeCount() }})
            </button>
            <button 
              type="button" 
              class="filter-pill" 
              [class.active]="statusFilter() === 'inactive'" 
              (click)="statusFilter.set('inactive')"
            >
              Inactive ({{ inactiveCount() }})
            </button>
          </div>

          <span class="showing-count">Showing {{ filteredCategories().length }} of {{ categories().length }} categories</span>
        </div>
      </div>

      <!-- Categories Grid matching Figma -->
      <div class="categories-grid">
        @for (cat of filteredCategories(); track cat.id) {
          <div class="category-card" [class.inactive]="cat.status === 'inactive'">
            <div class="card-image-wrap">
              <img [src]="cat.image_url || 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=600&q=80'" [alt]="cat.name" class="cat-img" />
              <div class="card-actions">
                <button class="action-btn edit" (click)="openEditModal(cat)" title="Edit Category">
                  <span class="material-symbols-outlined">edit</span>
                </button>
                <button class="action-btn delete" (click)="confirmDelete(cat)" title="Delete Category">
                  <span class="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>

            <div class="card-footer">
              <div class="footer-info">
                <h3 class="cat-name">{{ cat.name }}</h3>
                <span class="dish-count">{{ cat.dish_count || 0 }} Dishes</span>
              </div>
              <label class="wf-toggle" title="Toggle Category Status">
                <input 
                  type="checkbox" 
                  [checked]="cat.status === 'active'" 
                  (change)="toggleStatus(cat, $event)" 
                />
                <span class="slider"></span>
              </label>
            </div>

            <!-- Dedicated Visible Action Bar with Edit & Delete Buttons -->
            <div class="card-action-bar">
              <button type="button" class="btn-card-action edit" (click)="openEditModal(cat)" title="Edit Category Details">
                <span class="material-symbols-outlined">edit</span>
                <span>Edit</span>
              </button>
              <button type="button" class="btn-card-action delete" (click)="confirmDelete(cat)" title="Delete Category">
                <span class="material-symbols-outlined">delete</span>
                <span>Delete</span>
              </button>
              <a [routerLink]="['/admin/dishes']" [queryParams]="{category: cat.id}" class="btn-card-action dishes" title="View Dishes in this Category">
                <span class="material-symbols-outlined">restaurant_menu</span>
                <span>Dishes</span>
              </a>
            </div>
          </div>
        } @empty {
          <div class="empty-categories-card">
            <span class="material-symbols-outlined empty-icon">category</span>
            <h3>No categories found</h3>
            <p>No food categories match your filter "{{ rawSearchInput }}".</p>
            <button type="button" class="wf-btn secondary sm" (click)="clearSearch()">Reset Filter</button>
          </div>
        }
      </div>

      <!-- Add / Edit Category Modal -->
      @if (showModal()) {
        <div class="modal-backdrop" (click)="closeModal()">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>{{ isEditing() ? tService.t('admin.cat.edit') : tService.t('admin.cat.addNew') }}</h2>
              <button class="close-btn" (click)="closeModal()">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <form [formGroup]="categoryForm" (ngSubmit)="saveCategory()" class="modal-form">
              <div class="wf-form-group">
                <label for="cat-name">{{ tService.t('admin.cat.name') }} <span class="required">*</span></label>
                <input id="cat-name" type="text" formControlName="name" placeholder="e.g. Starters, Main Course" />
              </div>

              <div class="wf-form-group">
                <label for="cat-desc">{{ tService.t('admin.cat.desc') }}</label>
                <textarea id="cat-desc" formControlName="description" placeholder="Brief description of this food category"></textarea>
              </div>

              <div class="grid-2">
                <div class="wf-form-group">
                  <label for="cat-order">{{ tService.t('admin.cat.order') }}</label>
                  <input id="cat-order" type="number" formControlName="display_order" />
                </div>
                <div class="wf-form-group">
                  <label for="cat-status">{{ tService.t('admin.story.status') }}</label>
                  <select id="cat-status" formControlName="status">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <!-- Image Upload to Cloudflare R2 -->
              <div class="wf-form-group">
                <label>{{ tService.t('admin.cat.image') }}</label>
                <div class="image-uploader">
                  @if (selectedImagePreview()) {
                    <div class="preview-wrap">
                      <img [src]="selectedImagePreview()" alt="Preview" class="preview-img" />
                      <button type="button" class="remove-img-btn" (click)="removeSelectedImage()">
                        <span class="material-symbols-outlined">close</span>
                      </button>
                    </div>
                  } @else {
                    <label class="drop-zone">
                      <input type="file" accept="image/*" (change)="onFileSelected($event)" hidden />
                      <span class="material-symbols-outlined upload-icon">cloud_upload</span>
                      <span class="upload-text">Click to upload image or drag and drop</span>
                      <span class="upload-sub">PNG, JPG, WEBP up to 5MB</span>
                    </label>
                  }
                </div>
              </div>

              <div class="modal-actions">
                <button type="button" class="wf-btn secondary" (click)="closeModal()">Cancel</button>
                <button type="submit" class="wf-btn primary" [disabled]="categoryForm.invalid || saving()">
                  @if (saving()) {
                    <span>Saving to R2 & D1...</span>
                  } @else {
                    <span>{{ isEditing() ? tService.t('admin.cat.update') : tService.t('admin.cat.create') }}</span>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .categories-page {
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

    /* Filter Toolbar */
    .category-filter-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 0.5rem;
      flex-wrap: wrap;

      .search-box {
        position: relative;
        flex: 1;
        min-width: 260px;
        display: flex;
        align-items: center;

        .search-icon {
          position: absolute;
          left: 0.85rem;
          color: var(--text-muted);
          font-size: 20px;
          pointer-events: none;
        }

        .category-search-input {
          width: 100%;
          padding: 0.65rem 2.2rem 0.65rem 2.5rem;
          background: #ffffff;
          border: 1px solid var(--border-card, #e5dec9);
          border-radius: var(--radius-sm, 8px);
          font-size: 0.88rem;
          color: var(--text-primary);
          outline: none;
          transition: all 0.2s;

          &:focus {
            border-color: var(--accent-gold);
            box-shadow: 0 0 0 3px rgba(197, 155, 67, 0.15);
          }
        }

        .clear-search-btn {
          position: absolute;
          right: 0.65rem;
          color: var(--text-muted);
          background: transparent;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          &:hover { color: var(--text-primary); }
          .material-symbols-outlined { font-size: 18px; }
        }
      }

      .filter-controls-row {
        display: flex;
        align-items: center;
        gap: 1rem;
        flex-wrap: wrap;

        .status-pills {
          display: flex;
          gap: 0.35rem;

          .filter-pill {
            padding: 0.4rem 0.85rem;
            border-radius: 20px;
            border: 1px solid var(--border-card, #e5dec9);
            background: #ffffff;
            font-size: 0.78rem;
            font-weight: 600;
            color: var(--text-secondary);
            cursor: pointer;
            transition: all 0.2s;

            &:hover {
              color: var(--primary-maroon);
              border-color: var(--accent-gold);
            }

            &.active {
              background: var(--primary-maroon);
              color: #ffffff;
              border-color: var(--primary-maroon);
            }
          }
        }

        .showing-count {
          font-size: 0.78rem;
          color: var(--text-muted);
          font-weight: 600;
        }
      }
    }

    /* Categories Grid matching Figma Screen 2 */
    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1.25rem;
    }

    .category-card {
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
        opacity: 0.65;
      }

      .card-image-wrap {
        height: 160px;
        position: relative;
        overflow: hidden;
        background-color: var(--bg-cream);

        .cat-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }

        &:hover .cat-img {
          transform: scale(1.04);
        }

        .card-actions {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          display: flex;
          gap: 0.35rem;
          opacity: 1;
          transition: opacity 0.2s;

          .action-btn {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.95);
            color: var(--text-primary);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 6px rgba(0,0,0,0.15);

            .material-symbols-outlined {
              font-size: 16px;
            }

            &.edit:hover {
              background: var(--accent-gold);
              color: #ffffff;
            }

            &.delete:hover {
              background: var(--nonveg-red);
              color: #ffffff;
            }
          }
        }
      }

      .card-footer {
        padding: 0.85rem 1rem 0.5rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #ffffff;

        .footer-info {
          display: flex;
          flex-direction: column;

          .cat-name {
            font-size: 0.95rem;
            font-weight: 700;
            color: var(--text-primary);
          }

          .dish-count {
            font-size: 0.78rem;
            color: var(--text-muted);
            margin-top: 0.1rem;
          }
        }
      }

      /* Prominent Always-Visible Actions */
      .card-action-bar {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        border-top: 1px solid var(--border-hairline, #e5dec9);
        background: #FAF8F5;
        margin-top: auto;

        .btn-card-action {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.3rem;
          padding: 0.55rem 0.4rem;
          font-size: 0.76rem;
          font-weight: 600;
          color: var(--text-secondary);
          background: transparent;
          border: none;
          border-right: 1px solid var(--border-hairline, #e5dec9);
          cursor: pointer;
          transition: all 0.15s ease;
          text-decoration: none;

          &:last-child {
            border-right: none;
          }

          .material-symbols-outlined {
            font-size: 15px;
          }

          &.edit:hover {
            background: #F5EFE6;
            color: var(--accent-gold-dark, #9e7626);
          }

          &.delete:hover {
            background: #FEE2E2;
            color: #DC2626;
          }

          &.dishes:hover {
            background: #F7EFF1;
            color: var(--primary-maroon, #5b1a24);
          }
        }
      }
    }

    .empty-categories-card {
      grid-column: 1 / -1;
      background: #ffffff;
      border: 1px dashed var(--border-gold, #c59b43);
      border-radius: var(--radius-md);
      padding: 3rem 1.5rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.65rem;

      .empty-icon {
        font-size: 40px;
        color: var(--accent-gold, #c59b43);
      }

      h3 {
        font-family: var(--font-serif);
        font-size: 1.25rem;
        color: var(--primary-maroon);
        margin: 0;
      }

      p {
        font-size: 0.85rem;
        color: var(--text-secondary);
        margin: 0 0 0.5rem;
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
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-gold);
      box-shadow: var(--shadow-lg);
      width: 100%;
      max-width: 520px;
      overflow: hidden;
      animation: modalScale 0.2s ease-out;

      .modal-header {
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid var(--border-subtle);
        display: flex;
        align-items: center;
        justify-content: space-between;

        h2 {
          font-family: var(--font-display);
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--primary-maroon);
        }

        .close-btn {
          color: var(--text-muted);
          &:hover { color: var(--text-primary); }
        }
      }

      .modal-form {
        padding: 1.5rem;
      }

      .wf-form-group {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        margin-bottom: 1.15rem;

        label {
          font-size: 0.82rem;
          font-weight: 600;
          color: #4A3E39;
          .required { color: #A32D2D; }
        }

        input, textarea, select {
          width: 100%;
          box-sizing: border-box;
          padding: 0.65rem 0.85rem;
          border-radius: 6px;
          border: 1px solid #E5DEC9;
          background: #FAF8F5;
          font-size: 0.88rem;
          color: #2F0B12;
          font-family: inherit;
          outline: none;

          &:focus {
            background: #FFFFFF;
            border-color: #C59B43;
            box-shadow: 0 0 0 3px rgba(197, 155, 67, 0.15);
          }
        }

        textarea {
          min-height: 75px;
          resize: vertical;
        }
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
        margin-top: 1.5rem;
      }
    }

    .image-uploader {
      border: 1px dashed var(--border-card);
      border-radius: var(--radius-sm);
      overflow: hidden;

      .drop-zone {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 1.5rem;
        cursor: pointer;
        background: var(--bg-card-subtle);
        transition: background 0.2s;

        &:hover {
          background: var(--accent-gold-subtle);
        }

        .upload-icon {
          font-size: 32px;
          color: var(--accent-gold);
          margin-bottom: 0.4rem;
        }

        .upload-text {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .upload-sub {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 0.2rem;
        }
      }

      .preview-wrap {
        position: relative;
        height: 140px;

        .preview-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .remove-img-btn {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.65);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;

          .material-symbols-outlined {
            font-size: 16px;
          }
        }
      }
    }

    @keyframes modalScale {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `]
})
export class AdminCategoriesComponent implements OnInit, OnDestroy {
  private categoryService = inject(CategoryService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  tService = inject(TranslationService);

  categories = signal<FoodCategory[]>([]);
  showModal = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  editingId = signal<string | null>(null);
  saving = signal<boolean>(false);
  selectedImageFile: File | null = null;
  selectedImagePreview = signal<string | null>(null);

  // Real-time Debounced Search & Filter State
  searchQuery = signal<string>('');
  rawSearchInput = '';
  statusFilter = signal<'all' | 'active' | 'inactive'>('all');
  private searchSubject = new Subject<string>();
  private searchSub?: Subscription;
  private queryParamsSub?: Subscription;

  activeCount = computed(() => this.categories().filter(c => c.status === 'active').length);
  inactiveCount = computed(() => this.categories().filter(c => c.status === 'inactive').length);

  filteredCategories = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const status = this.statusFilter();
    return this.categories().filter(cat => {
      const matchesText = !q || 
        cat.name.toLowerCase().includes(q) || 
        (cat.description && cat.description.toLowerCase().includes(q));
      const matchesStatus = status === 'all' || cat.status === status;
      return matchesText && matchesStatus;
    });
  });

  categoryForm = this.fb.group({
    name: ['', [Validators.required]],
    description: [''],
    display_order: [0],
    status: ['active', [Validators.required]]
  });

  ngOnInit() {
    this.loadCategories();

    // Debounce search keystrokes by 250ms
    this.searchSub = this.searchSubject.pipe(
      debounceTime(250),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchQuery.set(query);
    });

    // Check if search was passed via top search bar query param
    this.queryParamsSub = this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.rawSearchInput = params['search'];
        this.searchQuery.set(params['search']);
      }
    });
  }

  ngOnDestroy() {
    this.searchSub?.unsubscribe();
    this.queryParamsSub?.unsubscribe();
  }

  onSearchInput(val: string) {
    this.rawSearchInput = val;
    this.searchSubject.next(val);
  }

  clearSearch() {
    this.rawSearchInput = '';
    this.searchQuery.set('');
    this.searchSubject.next('');
  }

  loadCategories() {
    this.categoryService.getCategories(false).subscribe({
      next: (res) => {
        if (res.success) {
          this.categories.set(res.data);
        }
      },
      error: () => this.toastService.error('Failed to load food categories')
    });
  }

  openAddModal() {
    this.isEditing.set(false);
    this.editingId.set(null);
    this.selectedImageFile = null;
    this.selectedImagePreview.set(null);
    this.categoryForm.reset({
      name: '',
      description: '',
      display_order: this.categories().length + 1,
      status: 'active'
    });
    this.showModal.set(true);
  }

  openEditModal(cat: FoodCategory) {
    this.isEditing.set(true);
    this.editingId.set(cat.id);
    this.selectedImageFile = null;
    this.selectedImagePreview.set(cat.image_url || null);
    this.categoryForm.patchValue({
      name: cat.name,
      description: cat.description || '',
      display_order: cat.display_order,
      status: cat.status
    });
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      this.selectedImageFile = file;
      const reader = new FileReader();
      reader.onload = () => this.selectedImagePreview.set(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  removeSelectedImage() {
    this.selectedImageFile = null;
    this.selectedImagePreview.set(null);
  }

  toggleStatus(cat: FoodCategory, event: any) {
    const newStatus = event.target.checked ? 'active' : 'inactive';
    this.categoryService.updateCategory(cat.id, { status: newStatus }).subscribe({
      next: () => {
        this.toastService.success(`Category "${cat.name}" status updated to ${newStatus}`);
        this.loadCategories();
      },
      error: () => this.toastService.error('Failed to update category status')
    });
  }

  confirmDelete(cat: FoodCategory) {
    if (confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
      this.categoryService.deleteCategory(cat.id).subscribe({
        next: () => {
          this.toastService.success(`Category "${cat.name}" deleted.`);
          this.loadCategories();
        },
        error: () => this.toastService.error('Could not delete category.')
      });
    }
  }

  saveCategory() {
    if (this.categoryForm.invalid) return;

    this.saving.set(true);
    const formVal = this.categoryForm.value;

    const payload: Partial<FoodCategory> = {
      name: formVal.name!,
      description: formVal.description || undefined,
      display_order: Number(formVal.display_order || 0),
      status: formVal.status as 'active' | 'inactive',
    };

    if (this.isEditing() && this.editingId()) {
      const id = this.editingId()!;
      this.categoryService.updateCategory(id, payload).subscribe({
        next: (res) => {
          if (this.selectedImageFile) {
            this.categoryService.uploadImage(id, this.selectedImageFile).subscribe({
              next: () => {
                this.saving.set(false);
                this.toastService.success('Category and image updated successfully');
                this.closeModal();
                this.loadCategories();
              },
              error: () => {
                this.saving.set(false);
                this.toastService.error('Category updated, but image upload failed');
                this.closeModal();
                this.loadCategories();
              }
            });
          } else {
            this.saving.set(false);
            this.toastService.success('Category updated successfully');
            this.closeModal();
            this.loadCategories();
          }
        },
        error: () => {
          this.saving.set(false);
          this.toastService.error('Failed to update category');
        }
      });
    } else {
      this.categoryService.createCategory(payload).subscribe({
        next: (res) => {
          const newId = res.data.id;
          if (this.selectedImageFile) {
            this.categoryService.uploadImage(newId, this.selectedImageFile).subscribe({
              next: () => {
                this.saving.set(false);
                this.toastService.success('Category created with R2 image');
                this.closeModal();
                this.loadCategories();
              },
              error: () => {
                this.saving.set(false);
                this.toastService.error('Category created, but image upload failed');
                this.closeModal();
                this.loadCategories();
              }
            });
          } else {
            this.saving.set(false);
            this.toastService.success('Category created successfully');
            this.closeModal();
            this.loadCategories();
          }
        },
        error: () => {
          this.saving.set(false);
          this.toastService.error('Failed to create category');
        }
      });
    }
  }
}
