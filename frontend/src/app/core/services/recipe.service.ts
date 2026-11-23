import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Recipe } from '../models';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/recipes`;

  getRecipes(): Observable<{ success: boolean; data: Recipe[] }> {
    return this.http.get<{ success: boolean; data: Recipe[] }>(this.apiUrl);
  }

  getRecipeByDishId(dishId: string): Observable<{ success: boolean; data: Recipe }> {
    return this.http.get<{ success: boolean; data: Recipe }>(`${this.apiUrl}/dish/${dishId}`);
  }

  getRecipe(id: string): Observable<{ success: boolean; data: Recipe }> {
    return this.http.get<{ success: boolean; data: Recipe }>(`${this.apiUrl}/${id}`);
  }

  saveRecipe(data: any): Observable<{ success: boolean; data: Recipe }> {
    return this.http.post<{ success: boolean; data: Recipe }>(
      this.apiUrl,
      data,
      { headers: this.auth.getAuthHeaders() }
    );
  }

  updateRecipe(id: string, data: any): Observable<{ success: boolean; data: Recipe }> {
    return this.http.put<{ success: boolean; data: Recipe }>(
      `${this.apiUrl}/${id}`,
      data,
      { headers: this.auth.getAuthHeaders() }
    );
  }

  deleteRecipe(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/${id}`,
      { headers: this.auth.getAuthHeaders() }
    );
  }
}
