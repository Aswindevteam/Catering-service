import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Dish, DishImage } from '../models';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

export interface DishFilterParams {
  search?: string;
  category_id?: string;
  food_type?: string;
  availability?: number;
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root'
})
export class DishService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/dishes`;

  getDishes(params: DishFilterParams = {}): Observable<{ success: boolean; dishes: Dish[]; total: number; page: number; limit: number }> {
    let httpParams = new HttpParams();
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.category_id && params.category_id !== 'all') httpParams = httpParams.set('category_id', params.category_id);
    if (params.food_type && params.food_type !== 'all') httpParams = httpParams.set('food_type', params.food_type);
    if (params.availability !== undefined) httpParams = httpParams.set('availability', params.availability.toString());
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());

    return this.http.get<any>(this.apiUrl, { params: httpParams });
  }

  getDish(id: string): Observable<{ success: boolean; data: Dish }> {
    return this.http.get<{ success: boolean; data: Dish }>(`${this.apiUrl}/${id}`);
  }

  createDish(data: Partial<Dish>): Observable<{ success: boolean; data: Dish }> {
    return this.http.post<{ success: boolean; data: Dish }>(
      this.apiUrl,
      data,
      { headers: this.auth.getAuthHeaders() }
    );
  }

  updateDish(id: string, data: Partial<Dish>): Observable<{ success: boolean; data: Dish }> {
    return this.http.put<{ success: boolean; data: Dish }>(
      `${this.apiUrl}/${id}`,
      data,
      { headers: this.auth.getAuthHeaders() }
    );
  }

  deleteDish(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/${id}`,
      { headers: this.auth.getAuthHeaders() }
    );
  }

  uploadDishImage(dishId: string, file: File, isPrimary = false): Observable<{ success: boolean; data: DishImage }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('is_primary', isPrimary ? '1' : '0');

    return this.http.post<{ success: boolean; data: DishImage }>(
      `${this.apiUrl}/${dishId}/images`,
      formData,
      { headers: this.auth.getAuthHeaders() }
    );
  }

  deleteDishImage(dishId: string, imageId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/${dishId}/images/${imageId}`,
      { headers: this.auth.getAuthHeaders() }
    );
  }
}
