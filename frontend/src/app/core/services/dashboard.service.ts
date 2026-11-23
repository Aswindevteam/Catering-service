import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

export interface DashboardOverview {
  total_dishes: number;
  total_categories: number;
  total_events: number;
  customer_selections: number;
  estimated_revenue: number;
  growth: {
    dishes: string;
    events: string;
    selections: string;
    revenue: string;
  };
}

export interface PopularDishItem {
  id: string;
  name: string;
  category_name: string;
  image_url: string;
  selection_count: number;
  percentage: number;
}

export interface RevenueChartPoint {
  month: string;
  revenue: number;
  formatted_revenue: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  time_ago: string;
  type: 'event' | 'dish' | 'selection';
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/dashboard`;

  getOverview(): Observable<{ success: boolean; data: DashboardOverview }> {
    return this.http.get<{ success: boolean; data: DashboardOverview }>(
      `${this.apiUrl}/overview`,
      { headers: this.auth.getAuthHeaders() }
    );
  }

  getPopularDishes(): Observable<{ success: boolean; data: PopularDishItem[] }> {
    return this.http.get<{ success: boolean; data: PopularDishItem[] }>(
      `${this.apiUrl}/popular-dishes`,
      { headers: this.auth.getAuthHeaders() }
    );
  }

  getRevenueChart(): Observable<{ success: boolean; data: RevenueChartPoint[] }> {
    return this.http.get<{ success: boolean; data: RevenueChartPoint[] }>(
      `${this.apiUrl}/revenue`,
      { headers: this.auth.getAuthHeaders() }
    );
  }

  getActivities(): Observable<{ success: boolean; data: ActivityItem[] }> {
    return this.http.get<{ success: boolean; data: ActivityItem[] }>(
      `${this.apiUrl}/activities`,
      { headers: this.auth.getAuthHeaders() }
    );
  }
}
