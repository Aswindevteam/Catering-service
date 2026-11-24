import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { FoodCategory } from '../models';
import { AuthService } from './auth.service';
import { ImageService } from './image.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private imageService = inject(ImageService);
  private apiUrl = `${environment.apiUrl}/categories`;

  private resolveCat(cat: FoodCategory): FoodCategory {
    if (!cat) return cat;
    if (cat.image_url) {
      cat.image_url = this.imageService.resolveUrl(cat.image_url, 'category');
    }
    return cat;
  }

  getCategories(activeOnly = false): Observable<{ success: boolean; data: FoodCategory[] }> {
    return this.http.get<{ success: boolean; data: FoodCategory[] }>(
      `${this.apiUrl}${activeOnly ? '?active_only=true' : ''}`
    ).pipe(
      map(res => {
        if (res && res.data && Array.isArray(res.data)) {
          res.data = res.data.map(c => this.resolveCat(c));
        }
        return res;
      })
    );
  }

  getCategory(id: string): Observable<{ success: boolean; data: FoodCategory }> {
    return this.http.get<{ success: boolean; data: FoodCategory }>(`${this.apiUrl}/${id}`).pipe(
      map(res => {
        if (res && res.data) {
          res.data = this.resolveCat(res.data);
        }
        return res;
      })
    );
  }

  createCategory(data: Partial<FoodCategory>): Observable<{ success: boolean; data: FoodCategory }> {
    return this.http.post<{ success: boolean; data: FoodCategory }>(
      this.apiUrl,
      data,
      { headers: this.auth.getAuthHeaders() }
    ).pipe(
      map(res => {
        if (res && res.data) {
          res.data = this.resolveCat(res.data);
        }
        return res;
      })
    );
  }

  updateCategory(id: string, data: Partial<FoodCategory>): Observable<{ success: boolean; data: FoodCategory }> {
    return this.http.put<{ success: boolean; data: FoodCategory }>(
      `${this.apiUrl}/${id}`,
      data,
      { headers: this.auth.getAuthHeaders() }
    ).pipe(
      map(res => {
        if (res && res.data) {
          res.data = this.resolveCat(res.data);
        }
        return res;
      })
    );
  }

  deleteCategory(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/${id}`,
      { headers: this.auth.getAuthHeaders() }
    );
  }

  uploadImage(id: string, file: File): Observable<{ success: boolean; data: FoodCategory }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ success: boolean; data: FoodCategory }>(
      `${this.apiUrl}/${id}/image`,
      formData,
      { headers: this.auth.getAuthHeaders() }
    ).pipe(
      map(res => {
        if (res && res.data) {
          res.data = this.resolveCat(res.data);
        }
        return res;
      })
    );
  }
}
