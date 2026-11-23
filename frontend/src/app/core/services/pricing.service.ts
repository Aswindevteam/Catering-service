import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { EstimationSettings, CalculationResult } from '../models';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PricingService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/pricing-settings`;

  getSettings(): Observable<{ success: boolean; data: EstimationSettings }> {
    return this.http.get<{ success: boolean; data: EstimationSettings }>(this.apiUrl);
  }

  updateSettings(data: Partial<EstimationSettings>): Observable<{ success: boolean; data: EstimationSettings }> {
    return this.http.put<{ success: boolean; data: EstimationSettings }>(
      this.apiUrl,
      data,
      { headers: this.auth.getAuthHeaders() }
    );
  }

  previewCalculation(params: {
    guest_count: number;
    settings?: Partial<EstimationSettings>;
    dishes?: any[];
  }): Observable<{ success: boolean; data: CalculationResult }> {
    return this.http.post<{ success: boolean; data: CalculationResult }>(
      `${this.apiUrl}/preview`,
      params
    );
  }
}
