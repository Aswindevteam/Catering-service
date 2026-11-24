import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Dish, DishImage } from '../models';
import { AuthService } from './auth.service';
import { ImageService } from './image.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
  private imageService = inject(ImageService);
  private apiUrl = `${environment.apiUrl}/dishes`;

  private resolveDish(dish: Dish): Dish {
    if (!dish) return dish;
    if (dish.primary_image_url) {
      dish.primary_image_url = this.imageService.resolveUrl(dish.primary_image_url);
    }
    if (dish.images && Array.isArray(dish.images)) {
      dish.images = dish.images.map(img => ({
        ...img,
        image_url: this.imageService.resolveUrl(img.image_url)
      }));
    }
    return dish;
  }

  getDishes(params: DishFilterParams = {}): Observable<{ success: boolean; dishes: Dish[]; total: number; page: number; limit: number }> {
    let httpParams = new HttpParams();
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.category_id && params.category_id !== 'all') httpParams = httpParams.set('category_id', params.category_id);
    if (params.food_type && params.food_type !== 'all') httpParams = httpParams.set('food_type', params.food_type);
    if (params.availability !== undefined) httpParams = httpParams.set('availability', params.availability.toString());
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());

    return this.http.get<any>(this.apiUrl, { params: httpParams }).pipe(
      map(res => {
        if (res && res.dishes && Array.isArray(res.dishes)) {
          res.dishes = res.dishes.map((d: Dish) => this.resolveDish(d));
        }
        return res;
      })
    );
  }

  getDish(id: string): Observable<{ success: boolean; data: Dish }> {
    return this.http.get<{ success: boolean; data: Dish }>(`${this.apiUrl}/${id}`).pipe(
      map(res => {
        if (res && res.data) {
          res.data = this.resolveDish(res.data);
        }
        return res;
      })
    );
  }

  createDish(data: Partial<Dish>): Observable<{ success: boolean; data: Dish }> {
    return this.http.post<{ success: boolean; data: Dish }>(
      this.apiUrl,
      data,
      { headers: this.auth.getAuthHeaders() }
    ).pipe(
      map(res => {
        if (res && res.data) {
          res.data = this.resolveDish(res.data);
        }
        return res;
      })
    );
  }

  updateDish(id: string, data: Partial<Dish>): Observable<{ success: boolean; data: Dish }> {
    return this.http.put<{ success: boolean; data: Dish }>(
      `${this.apiUrl}/${id}`,
      data,
      { headers: this.auth.getAuthHeaders() }
    ).pipe(
      map(res => {
        if (res && res.data) {
          res.data = this.resolveDish(res.data);
        }
        return res;
      })
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
    ).pipe(
      map(res => {
        if (res && res.data) {
          res.data.image_url = this.imageService.resolveUrl(res.data.image_url);
        }
        return res;
      })
    );
  }

  deleteDishImage(dishId: string, imageId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/${dishId}/images/${imageId}`,
      { headers: this.auth.getAuthHeaders() }
    );
  }

  setPrimaryDishImage(dishId: string, imageId: string): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(
      `${this.apiUrl}/${dishId}/images/${imageId}/primary`,
      {},
      { headers: this.auth.getAuthHeaders() }
    );
  }
}
