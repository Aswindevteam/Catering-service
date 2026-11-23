import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminSidebarComponent } from './admin-sidebar.component';
import { AdminHeaderComponent } from './admin-header.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminSidebarComponent, AdminHeaderComponent],
  template: `
    <div class="admin-wrapper">
      <app-admin-sidebar 
        [(mobileOpen)]="mobileOpen"
      ></app-admin-sidebar>

      <div class="admin-main">
        <app-admin-header 
          (toggleSidebar)="mobileOpen.set(!mobileOpen())"
        ></app-admin-header>

        <main class="admin-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .admin-wrapper {
      display: flex;
      min-height: 100vh;
      background-color: var(--bg-ivory, #FAF8F5);
    }

    .admin-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      overflow-x: hidden;
    }

    .admin-content {
      flex: 1;
      padding: 1.5rem 1.75rem;
      max-width: 1680px;
      margin: 0 auto;
      width: 100%;
      box-sizing: border-box;

      @media (max-width: 768px) {
        padding: 1rem 0.85rem;
      }
    }
  `]
})
export class AdminLayoutComponent {
  mobileOpen = signal(false);
}