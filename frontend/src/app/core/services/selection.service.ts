import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Dish, WeddingEvent, CustomerSelection, CalculationResult } from '../models';
import { ToastService } from './toast.service';
import { AuthService } from './auth.service';
import { Observable, debounceTime, Subject, switchMap, tap } from 'rxjs';

export interface SelectedDishItem {
  dish: Dish;
  quantity_per_person: number;
}

@Injectable({
  providedIn: 'root'
})
export class SelectionService {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private auth = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/selections`;

  // Reactive state
  eventDetails = signal<WeddingEvent>({
    id: '',
    customer_name: 'Radhika & Arjun',
    customer_phone: '+91 72998 87725',
    customer_email: 'arjun.radhika@example.com',
    event_name: 'Grand Wedding Reception',
    event_type: 'Wedding',
    event_date: '2026-12-15',
    venue: 'No. 73, Mandhaikaara Street, Tirukoilur - 607201',
    guest_count: 250,
    status: 'pending',
    notes: null,
    created_at: new Date().toISOString()
  });

  selectedDishes = signal<Map<string, SelectedDishItem>>(new Map());
  calculation = signal<CalculationResult | null>(null);
  loadingCalculation = signal<boolean>(false);

  private recalculateSubject = new Subject<void>();

  constructor() {
    // Debounced automatic live recalculation stream
    this.recalculateSubject.pipe(
      debounceTime(150),
      switchMap(() => {
        this.loadingCalculation.set(true);
        const dishes = Array.from(this.selectedDishes().values()).map(it => ({
          dish_id: it.dish.id,
          quantity_per_person: it.quantity_per_person
        }));
        return this.http.post<{ success: boolean; data: CalculationResult }>(
          `${this.apiUrl}/calculate`,
          {
            guest_count: this.eventDetails().guest_count,
            dish_selections: dishes
          }
        );
      })
    ).subscribe({
      next: (res) => {
        this.loadingCalculation.set(false);
        if (res.success) {
          this.calculation.set(res.data);
        }
      },
      error: (err) => {
        this.loadingCalculation.set(false);
        console.error('Calculation error:', err);
      }
    });
  }

  setEventDetails(details: Partial<WeddingEvent>) {
    this.eventDetails.update(current => ({ ...current, ...details }));
    this.triggerRecalculate();
  }

  setGuestCount(count: number) {
    const safeCount = Math.max(1, count);
    this.eventDetails.update(current => ({ ...current, guest_count: safeCount }));
    this.triggerRecalculate();
  }

  addDish(dish: Dish, quantity?: number) {
    this.selectedDishes.update(current => {
      const updated = new Map(current);
      const existing = updated.get(dish.id);
      if (existing) {
        updated.set(dish.id, {
          dish,
          quantity_per_person: quantity !== undefined ? quantity : existing.quantity_per_person
        });
      } else {
        updated.set(dish.id, {
          dish,
          quantity_per_person: quantity || dish.quantity_per_person
        });
      }
      return updated;
    });
    const chosenQty = quantity || dish.quantity_per_person;
    const unit = dish.serving_unit || 'g';
    this.toast.success(`Added ${dish.name} (${chosenQty} ${unit}) to feast`);
    this.triggerRecalculate();
  }

  removeDish(dishId: string) {
    this.selectedDishes.update(current => {
      const updated = new Map(current);
      updated.delete(dishId);
      return updated;
    });
    this.triggerRecalculate();
  }

  updateDishQuantity(dishId: string, quantity: number) {
    this.selectedDishes.update(current => {
      const updated = new Map(current);
      const existing = updated.get(dishId);
      if (existing) {
        updated.set(dishId, {
          ...existing,
          quantity_per_person: Math.max(1, quantity)
        });
      }
      return updated;
    });
    this.triggerRecalculate();
  }

  isDishSelected(dishId: string): boolean {
    return this.selectedDishes().has(dishId);
  }

  getSelectedDish(dishId: string): SelectedDishItem | undefined {
    return this.selectedDishes().get(dishId);
  }

  clearSelection() {
    this.selectedDishes.set(new Map());
    this.triggerRecalculate();
  }

  triggerRecalculate() {
    this.recalculateSubject.next();
  }

  submitSelection(specialRequests?: string): Observable<{ success: boolean; data: CustomerSelection }> {
    const event = this.eventDetails();
    const selections = Array.from(this.selectedDishes().values()).map(it => ({
      dish_id: it.dish.id,
      quantity_per_person: it.quantity_per_person
    }));

    return this.http.post<{ success: boolean; data: CustomerSelection }>(this.apiUrl, {
      event: {
        customer_name: event.customer_name,
        customer_phone: event.customer_phone,
        customer_email: event.customer_email,
        event_name: event.event_name,
        event_type: event.event_type,
        event_date: event.event_date,
        venue: event.venue,
        guest_count: event.guest_count,
        notes: event.notes
      },
      selected_dishes: selections,
      special_requests: specialRequests
    });
  }

  getAllSelections(): Observable<{ success: boolean; data: CustomerSelection[] }> {
    return this.http.get<{ success: boolean; data: CustomerSelection[] }>(
      this.apiUrl,
      { headers: this.auth.getAuthHeaders() }
    );
  }

  getSelectionById(id: string): Observable<{ success: boolean; data: CustomerSelection }> {
    return this.http.get<{ success: boolean; data: CustomerSelection }>(`${this.apiUrl}/${id}`);
  }

  getEvents(): Observable<{ success: boolean; data: WeddingEvent[] }> {
    return this.http.get<{ success: boolean; data: WeddingEvent[] }>(
      `${environment.apiUrl}/events`,
      { headers: this.auth.getAuthHeaders() }
    );
  }

  createEvent(event: Partial<WeddingEvent>): Observable<{ success: boolean; data: WeddingEvent }> {
    return this.http.post<{ success: boolean; data: WeddingEvent }>(
      `${environment.apiUrl}/events`,
      event,
      { headers: this.auth.getAuthHeaders() }
    );
  }
}
