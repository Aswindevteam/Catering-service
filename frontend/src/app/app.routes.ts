import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { CustomerLayoutComponent } from './layouts/customer-layout/customer-layout.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { MenuSelectionComponent } from './features/customer/menu-selection/menu-selection.component';
import { MenuReviewComponent } from './features/customer/menu-review/menu-review.component';
import { AdminLoginComponent } from './features/admin/login/admin-login.component';
import { AdminDashboardComponent } from './features/admin/dashboard/admin-dashboard.component';
import { AdminCategoriesComponent } from './features/admin/categories/admin-categories.component';
import { AdminDishesComponent } from './features/admin/dishes/admin-dishes.component';
import { DishFormComponent } from './features/admin/dishes/dish-form.component';
import { AdminRecipesComponent } from './features/admin/recipes/admin-recipes.component';
import { AdminPricingComponent } from './features/admin/pricing/admin-pricing.component';
import { AdminSelectionsComponent } from './features/admin/selections/admin-selections.component';

export const routes: Routes = [
  // Customer Website Routes
  {
    path: '',
    component: CustomerLayoutComponent,
    children: [
      { path: '', redirectTo: 'menu', pathMatch: 'full' },
      { path: 'menu', component: MenuSelectionComponent },
      { path: 'menu-review', component: MenuReviewComponent }
    ]
  },

  // Admin Auth Route
  {
    path: 'admin/login',
    component: AdminLoginComponent
  },

  // Protected Admin Routes
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'categories', component: AdminCategoriesComponent },
      { path: 'dishes', component: AdminDishesComponent },
      { path: 'dishes/new', component: DishFormComponent },
      { path: 'dishes/:id/edit', component: DishFormComponent },
      { path: 'recipes', component: AdminRecipesComponent },
      { path: 'pricing', component: AdminPricingComponent },
      { path: 'selections', component: AdminSelectionsComponent },
      { path: 'settings', redirectTo: 'pricing', pathMatch: 'full' }
    ]
  },

  // Wildcard Fallback
  {
    path: '**',
    redirectTo: ''
  }
];
