import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { FoodCategory } from '../models';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/categories`;

  getCategories(activeOnly = false): Observable<{ success: boolean; data: FoodCategory[] }> {
    return this.http.get<{ success: boolean; data: FoodCategory[] }>(
      `${this.apiUrl}${activeOnly ? '?active_only=true' : ''}`
    );
  }

  getCategory(id: string): Observable<{ success: boolean; data: FoodCategory }> {
    return this.http.get<{ success: boolean; data: FoodCategory }>(`${this.apiUrl}/${id}`);
  }

  createCategory(data: Partial<FoodCategory>): Observable<{ success: boolean; data: FoodCategory }> {
    return this.http.post<{ success: boolean; data: FoodCategory }>(
      this.apiUrl,
      data,
      { headers: this.auth.getAuthHeaders() }
    );
  }

  updateCategory(id: string, data: Partial<FoodCategory>): Observable<{ success: boolean; data: FoodCategory }> {
    return this.http.put<{ success: boolean; data: FoodCategory }>(
      `${this.apiUrl}/${id}`,
      data,
      { headers: this.auth.getAuthHeaders() }
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
    );
  }
}
