import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectionService } from '../../../core/services/selection.service';
import { DishService } from '../../../core/services/dish.service';
import { CategoryService } from '../../../core/services/category.service';
import { ToastService } from '../../../core/services/toast.service';
import { WeddingEvent, Dish, FoodCategory, CustomerSelectionItem } from '../../../core/models';

export interface BookingDishItem {
  dish_id: string;
  name: string;
  category_name: string;
  serving_quantity: number;
  serving_unit: string;
  price_per_person: number; // in paise
  original_price_per_person?: number; // base catalog rate in paise
  offer_price_per_person?: number; // admin custom offer rate in paise
  is_offer_applied?: boolean;
  image_url?: string;
}

export interface BookingSession {
  id: string;
  name: string;
  shortName: string;
  timeSlot: string;
  guest_count: number;
  dishes: BookingDishItem[];
}

export interface UnifiedBooking {
  id: string;
  source: 'admin' | 'user';
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  event_name: string;
  event_type: string;
  event_date: string;
  venue: string;
  guest_count: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  subtotal: number;
  service_charge: number;
  transportation_charge: number;
  gst_amount: number;
  grand_total: number;
  cost_per_guest: number;
  sessions: BookingSession[];
  raw_notes?: string;
  selection_id?: string;
}

@Component({
  selector: 'app-admin-selections',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-selections.component.html',
  styleUrl: './admin-selections.component.scss'
})
export class AdminSelectionsComponent implements OnInit {
  private selectionService = inject(SelectionService);
  private dishService = inject(DishService);
  private categoryService = inject(CategoryService);
  private toastService = inject(ToastService);

  readonly defaultDishImage = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80';

  // Data signals
  isLoading = signal(false);
  bookings = signal<UnifiedBooking[]>([]);
  allDishes = signal<Dish[]>([]);
  categories = signal<FoodCategory[]>([]);

  // Filter signals
  filterEventSource = signal<'all' | 'admin' | 'user'>('all');
  filterStatus = signal<string>('all');
  searchQuery = signal<string>('');

  // Selected for BEO report
  selectedBookingForBEO = signal<UnifiedBooking | null>(null);

  // Edit / Schedule Modal state
  isModalOpen = signal(false);
  isEditing = signal(false);
  editingBookingId = signal<string | null>(null);
  editingBookingSource = signal<'admin' | 'user'>('admin');
  currentStep = signal<number>(1); // 1 = Basics, 2 = Sessions & Dishes, 3 = Pricing & Custom Rates
  modalActiveSessionId = signal<string>('morning');
  modalDishSearch = signal<string>('');
  modalSelectedCategory = signal<string>('all');
  isSubmitting = signal(false);

  // Form model
  bookingForm = {
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    event_name: '',
    event_type: 'Traditional Hindu Wedding',
    event_date: '',
    venue: 'No. 73, Mandhaikaara Street, Tirukoilur',
    guest_count: 600,
    status: 'confirmed' as 'pending' | 'confirmed' | 'completed' | 'cancelled'
  };

  // Modal Sessions state
  modalSessions = signal<BookingSession[]>([]);

  // Computed metrics
  metrics = computed(() => {
    const list = this.bookings();
    const adminCount = list.filter(b => b.source === 'admin').length;
    const userCount = list.filter(b => b.source === 'user').length;
    const totalRev = list.reduce((sum, b) => sum + (b.grand_total || 0), 0);
    return {
      total: list.length,
      adminCount,
      userCount,
      totalRevenue: totalRev
    };
  });

  // Filtered bookings
  filteredBookings = computed(() => {
    const creator = this.filterEventSource();
    const status = this.filterStatus();
    const query = this.searchQuery().toLowerCase().trim();

    return this.bookings().filter(b => {
      // Creator filter
      if (creator !== 'all' && b.source !== creator) return false;
      // Status filter
      if (status !== 'all' && b.status !== status) return false;
      // Search query
      if (query) {
        const matchesName = (b.customer_name || '').toLowerCase().includes(query);
        const matchesPhone = (b.customer_phone || '').toLowerCase().includes(query);
        const matchesEvent = (b.event_name || '').toLowerCase().includes(query);
        const matchesVenue = (b.venue || '').toLowerCase().includes(query);
        if (!matchesName && !matchesPhone && !matchesEvent && !matchesVenue) return false;
      }
      return true;
    });
  });

  // Current session in modal
  currentModalSession = computed(() => {
    const list = this.modalSessions();
    const activeId = this.modalActiveSessionId();
    return list.find(s => s.id === activeId) || list[0] || null;
  });

  // Filtered dishes for modal dish picker
  filteredCatalogDishes = computed(() => {
    const cat = this.modalSelectedCategory();
    const search = this.modalDishSearch().toLowerCase().trim();
    let result = this.allDishes();

    if (cat !== 'all') {
      result = result.filter(d => d.category_id === cat);
    }
    if (search) {
      result = result.filter(d =>
        (d.name || '').toLowerCase().includes(search) ||
        (d.description || '').toLowerCase().includes(search)
      );
    }
    return result;
  });

  // Financials computed for the modal
  modalFinancials = computed(() => {
    const sessions = this.modalSessions();
    let subtotalPaise = 0;
    let totalGuestsServed = 0;

    for (const s of sessions) {
      const g = s.guest_count || this.bookingForm.guest_count || 1;
      totalGuestsServed = Math.max(totalGuestsServed, g);
      for (const d of s.dishes) {
        const effPrice = (d.is_offer_applied && d.offer_price_per_person)
          ? d.offer_price_per_person
          : (d.price_per_person || 7500);
        subtotalPaise += (effPrice * g);
      }
    }

    const serviceChargePaise = Math.round(subtotalPaise * 0.10);
    const transportPaise = 5000 * 100; // Flat ₹5,000
    const gstPaise = Math.round((subtotalPaise + serviceChargePaise + transportPaise) * 0.05);
    const grandTotalPaise = subtotalPaise + serviceChargePaise + transportPaise + gstPaise;
    const perPaxPaise = totalGuestsServed > 0 ? Math.round(grandTotalPaise / totalGuestsServed) : 0;

    return {
      subtotal: subtotalPaise / 100,
      serviceCharge: serviceChargePaise / 100,
      transportationCharge: transportPaise / 100,
      gstAmount: gstPaise / 100,
      grandTotal: grandTotalPaise / 100,
      perPax: perPaxPaise / 100
    };
  });

  ngOnInit() {
    this.loadData();
    this.loadCatalogDishes();
    this.loadCategories();
  }

  loadData() {
    this.isLoading.set(true);
    this.selectionService.getEvents().subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          const parsed = res.data.map(ev => this.parseBooking(ev));
          this.bookings.set(parsed);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.toastService.error('Failed to load bookings and events');
      }
    });
  }

  loadCatalogDishes() {
    this.dishService.getDishes({ limit: 120 }).subscribe({
      next: (res) => {
        if (res.success && res.dishes) {
          this.allDishes.set(res.dishes);
        }
      }
    });
  }

  loadCategories() {
    this.categoryService.getCategories(true).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.categories.set(res.data);
        }
      }
    });
  }

  parseBooking(ev: any): UnifiedBooking {
    let source: 'admin' | 'user' = 'admin';
    if (ev.notes && typeof ev.notes === 'string' && ev.notes.includes('"source":"user"')) {
      source = 'user';
    } else if (ev.selection_id && (!ev.notes || !ev.notes.includes('"source":"admin"'))) {
      source = 'user';
    }

    let sessions: BookingSession[] = [];
    let parsedNotes: any = null;

    if (ev.notes) {
      try {
        parsedNotes = typeof ev.notes === 'string' ? JSON.parse(ev.notes) : ev.notes;
        if (parsedNotes && Array.isArray(parsedNotes.sessions)) {
          sessions = parsedNotes.sessions;
        }
      } catch (e) {
        // Not a JSON notes field
      }
    }

    let subtotal = Number(ev.subtotal || 0);
    let service_charge = Number(ev.service_charge || 0);
    let transportation_charge = Number(ev.transportation_charge || 0);
    let gst_amount = Number(ev.gst_amount || 0);
    let grand_total = Number(ev.grand_total || 0);
    let cost_per_guest = Number(ev.cost_per_guest || 0);

    // If financial totals were saved in notes.financials
    if (parsedNotes && parsedNotes.financials) {
      if (!subtotal) subtotal = (parsedNotes.financials.foodSubtotal || 0) * 100;
      if (!service_charge) service_charge = (parsedNotes.financials.serviceCharge || 0) * 100;
      if (!transportation_charge) transportation_charge = (parsedNotes.financials.transportFee || 0) * 100;
      if (!gst_amount) gst_amount = (parsedNotes.financials.gstAmount || 0) * 100;
      if (!grand_total) grand_total = (parsedNotes.financials.grandTotal || 0) * 100;
      if (!cost_per_guest) cost_per_guest = (parsedNotes.financials.perPax || 0) * 100;
    }

    // Recalculate accurately if sessions exist
    if (sessions.length > 0) {
      let computedSubtotal = 0;
      for (const s of sessions) {
        for (const d of s.dishes) {
          const effRate = (d.is_offer_applied && d.offer_price_per_person)
            ? d.offer_price_per_person
            : (d.price_per_person || 7500);
          computedSubtotal += (effRate * (s.guest_count || ev.guest_count || 1));
        }
      }
      if (computedSubtotal > 0) {
        subtotal = computedSubtotal;
        service_charge = Math.round(subtotal * 0.10);
        transportation_charge = 5000 * 100;
        gst_amount = Math.round((subtotal + service_charge + transportation_charge) * 0.05);
        grand_total = subtotal + service_charge + transportation_charge + gst_amount;
        cost_per_guest = ev.guest_count ? Math.round(grand_total / ev.guest_count) : 0;
      }
    }

    return {
      id: ev.id,
      source,
      customer_name: ev.customer_name || 'Customer',
      customer_phone: ev.customer_phone || '',
      customer_email: ev.customer_email || '',
      event_name: ev.event_name || 'Wedding Celebration',
      event_type: ev.event_type || 'Wedding',
      event_date: ev.event_date ? ev.event_date.split('T')[0] : '',
      venue: ev.venue || 'No. 73, Mandhaikaara Street, Tirukoilur',
      guest_count: Number(ev.guest_count || 600),
      status: (ev.status || 'confirmed') as any,
      subtotal,
      service_charge,
      transportation_charge,
      gst_amount,
      grand_total,
      cost_per_guest,
      sessions,
      raw_notes: ev.notes,
      selection_id: ev.selection_id
    };
  }

  // --- Modal Openers ---
  openCreateModal() {
    this.isEditing.set(false);
    this.editingBookingId.set(null);
    this.editingBookingSource.set('admin');
    this.currentStep.set(1);
    this.bookingForm = {
      customer_name: '',
      customer_phone: '',
      customer_email: '',
      event_name: '',
      event_type: 'Traditional Hindu Wedding',
      event_date: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
      venue: 'No. 73, Mandhaikaara Street, Tirukoilur',
      guest_count: 600,
      status: 'confirmed'
    };
    this.modalSessions.set(this.buildDefaultSessions(600));
    this.modalActiveSessionId.set('morning');
    this.isModalOpen.set(true);
  }

  openEditModal(booking: UnifiedBooking) {
    this.isEditing.set(true);
    this.editingBookingId.set(booking.id);
    this.editingBookingSource.set(booking.source || 'admin');
    this.currentStep.set(1);

    this.bookingForm = {
      customer_name: booking.customer_name,
      customer_phone: booking.customer_phone,
      customer_email: booking.customer_email,
      event_name: booking.event_name,
      event_type: booking.event_type,
      event_date: booking.event_date,
      venue: booking.venue,
      guest_count: booking.guest_count,
      status: booking.status
    };

    if (booking.sessions && booking.sessions.length > 0) {
      // Clone sessions deep copy and enrich missing dish images from catalog
      const cloned: BookingSession[] = JSON.parse(JSON.stringify(booking.sessions));
      for (const s of cloned) {
        for (const d of s.dishes) {
          if (!d.image_url) {
            d.image_url = this.getDishImage(d.dish_id);
          }
        }
      }
      this.modalSessions.set(cloned);
      this.modalActiveSessionId.set(cloned[0].id);
      this.isModalOpen.set(true);
    } else if (booking.selection_id) {
      // Fetch customer selection items and convert into session
      this.selectionService.getSelectionById(booking.selection_id).subscribe({
        next: (res) => {
          if (res.success && res.data && res.data.items) {
            const convertedDishes: BookingDishItem[] = res.data.items.map((it: CustomerSelectionItem) => ({
              dish_id: it.dish_id,
              name: it.dish_name,
              category_name: it.category_name || 'General',
              serving_quantity: it.quantity_per_person || 100,
              serving_unit: it.serving_unit || 'g',
              price_per_person: it.price_per_person || 7500,
              original_price_per_person: it.price_per_person || 7500,
              offer_price_per_person: it.price_per_person || 7500,
              is_offer_applied: false,
              image_url: this.getDishImage(it.dish_id)
            }));

            const initialSessions: BookingSession[] = [
              {
                id: 'lunch',
                name: 'Traditional Wedding Feast (மதிய விருந்து)',
                shortName: 'Muhurtham Feast',
                timeSlot: '11:30 AM - 02:30 PM',
                guest_count: booking.guest_count,
                dishes: convertedDishes
              }
            ];
            this.modalSessions.set(initialSessions);
            this.modalActiveSessionId.set('lunch');
          } else {
            this.modalSessions.set(this.buildDefaultSessions(booking.guest_count));
            this.modalActiveSessionId.set('morning');
          }
          this.isModalOpen.set(true);
        },
        error: () => {
          this.modalSessions.set(this.buildDefaultSessions(booking.guest_count));
          this.modalActiveSessionId.set('morning');
          this.isModalOpen.set(true);
        }
      });
    } else {
      this.modalSessions.set(this.buildDefaultSessions(booking.guest_count));
      this.modalActiveSessionId.set('morning');
      this.isModalOpen.set(true);
    }
  }

  buildDefaultSessions(guests: number): BookingSession[] {
    return [
      {
        id: 'morning',
        name: 'Morning Breakfast & Tiffin (காலை உணவு)',
        shortName: 'Breakfast',
        timeSlot: '07:30 AM - 10:00 AM',
        guest_count: guests,
        dishes: []
      },
      {
        id: 'lunch',
        name: 'Grand Muhurtham Wedding Feast (மதிய விருந்து)',
        shortName: 'Muhurtham Feast',
        timeSlot: '11:30 AM - 02:30 PM',
        guest_count: guests,
        dishes: []
      },
      {
        id: 'evening',
        name: 'High Tea & Traditional Sweets (மாலை சிற்றுண்டி)',
        shortName: 'High Tea',
        timeSlot: '04:30 PM - 06:30 PM',
        guest_count: Math.round(guests * 0.75),
        dishes: []
      },
      {
        id: 'dinner',
        name: 'Grand Reception Dinner (இரவு விருந்து)',
        shortName: 'Reception Dinner',
        timeSlot: '07:00 PM - 10:30 PM',
        guest_count: guests,
        dishes: []
      }
    ];
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  // Session Dish Management in Modal
  addDishToCurrentSession(dish: Dish) {
    const cur = this.currentModalSession();
    if (!cur) return;

    if (cur.dishes.some(d => d.dish_id === dish.id)) {
      this.toastService.info(`${dish.name} is already in ${cur.shortName}`);
      return;
    }

    const newItem: BookingDishItem = {
      dish_id: dish.id,
      name: dish.name,
      category_name: dish.category_name || 'General',
      serving_quantity: dish.quantity_per_person || 100,
      serving_unit: dish.serving_unit || 'g',
      price_per_person: dish.price_per_person || 7500,
      original_price_per_person: dish.price_per_person || 7500,
      offer_price_per_person: dish.price_per_person || 7500,
      is_offer_applied: false,
      image_url: dish.primary_image_url
    };

    cur.dishes.push(newItem);
    this.modalSessions.set([...this.modalSessions()]);
    this.toastService.success(`Added ${dish.name} to ${cur.shortName}`);
  }

  removeDishFromCurrentSession(dishId: string) {
    const cur = this.currentModalSession();
    if (!cur) return;
    cur.dishes = cur.dishes.filter(d => d.dish_id !== dishId);
    this.modalSessions.set([...this.modalSessions()]);
  }

  adjustDishPortion(dishId: string, delta: number, event?: Event) {
    if (event) event.stopPropagation();
    const cur = this.currentModalSession();
    if (!cur) return;
    const item = cur.dishes.find(d => d.dish_id === dishId);
    if (!item) return;

    const step = (item.serving_unit === 'pcs' || item.serving_unit === 'cups') ? 1 : 10;
    const currentVal = item.serving_quantity || 100;
    const newVal = Math.max(1, currentVal + (delta * step));
    item.serving_quantity = newVal;
    this.modalSessions.set([...this.modalSessions()]);
  }

  cycleDishUnit(dishId: string, event?: Event) {
    if (event) event.stopPropagation();
    const cur = this.currentModalSession();
    if (!cur) return;
    const item = cur.dishes.find(d => d.dish_id === dishId);
    if (!item) return;

    const units = ['g', 'pcs', 'ml', 'cups'];
    const curIdx = units.indexOf(item.serving_unit || 'g');
    item.serving_unit = units[(curIdx + 1) % units.length];
    this.modalSessions.set([...this.modalSessions()]);
  }

  // --- ADMIN OFFER PRICE PER DISH ---
  updateDishOfferPrice(dishId: string, offerPriceInr: any, session?: BookingSession) {
    const targetSession = session || this.currentModalSession();
    if (!targetSession) return;
    const item = targetSession.dishes.find(d => d.dish_id === dishId);
    if (!item) return;

    const numVal = offerPriceInr !== null && offerPriceInr !== undefined && offerPriceInr !== ''
      ? Number(offerPriceInr)
      : null;

    if (numVal !== null && !isNaN(numVal) && numVal > 0) {
      if (!item.original_price_per_person) {
        item.original_price_per_person = item.price_per_person;
      }
      const offerPaise = Math.round(numVal * 100);
      item.offer_price_per_person = offerPaise;
      item.price_per_person = offerPaise;
      item.is_offer_applied = true;
    } else {
      if (item.original_price_per_person) {
        item.price_per_person = item.original_price_per_person;
      }
      item.offer_price_per_person = undefined;
      item.is_offer_applied = false;
    }

    this.modalSessions.set([...this.modalSessions()]);
  }

  getDishOfferPriceInr(item: BookingDishItem): number | null {
    if (item.is_offer_applied && item.offer_price_per_person) {
      return item.offer_price_per_person / 100;
    }
    return null;
  }

  // Save / Update Booking
  saveBooking() {
    if (!this.bookingForm.customer_name || !this.bookingForm.event_name || !this.bookingForm.event_date) {
      this.toastService.error('Customer name, event name, and date are required.');
      return;
    }

    this.isSubmitting.set(true);
    const financials = this.modalFinancials();
    const source = this.isEditing() ? this.editingBookingSource() : 'admin';

    const notesPayload = {
      source,
      sessions: this.modalSessions(),
      financials: {
        foodSubtotal: financials.subtotal,
        serviceCharge: financials.serviceCharge,
        transportFee: financials.transportationCharge,
        gstAmount: financials.gstAmount,
        grandTotal: financials.grandTotal,
        perPax: financials.perPax
      }
    };

    const payload: Partial<WeddingEvent> = {
      customer_name: this.bookingForm.customer_name,
      customer_phone: this.bookingForm.customer_phone,
      customer_email: this.bookingForm.customer_email,
      event_name: this.bookingForm.event_name,
      event_type: this.bookingForm.event_type,
      event_date: this.bookingForm.event_date,
      venue: this.bookingForm.venue,
      guest_count: Number(this.bookingForm.guest_count),
      status: this.bookingForm.status,
      notes: JSON.stringify(notesPayload)
    };

    if (this.isEditing() && this.editingBookingId()) {
      this.selectionService.updateEvent(this.editingBookingId()!, payload).subscribe({
        next: (res) => {
          this.isSubmitting.set(false);
          if (res.success) {
            this.toastService.success('Wedding celebration booking updated successfully!');
            this.closeModal();
            this.loadData();
          } else {
            this.toastService.error('Failed to update booking');
          }
        },
        error: () => {
          this.isSubmitting.set(false);
          this.toastService.error('Server error updating booking');
        }
      });
    } else {
      this.selectionService.createEvent(payload).subscribe({
        next: (res) => {
          this.isSubmitting.set(false);
          if (res.success) {
            this.toastService.success('Wedding celebration scheduled successfully!');
            this.closeModal();
            this.loadData();
          } else {
            this.toastService.error('Failed to schedule event');
          }
        },
        error: () => {
          this.isSubmitting.set(false);
          this.toastService.error('Server error scheduling event');
        }
      });
    }
  }

  // Delete Booking
  deleteBooking(booking: UnifiedBooking, event?: Event) {
    if (event) event.stopPropagation();
    if (!confirm(`Are you sure you want to delete the celebration "${booking.event_name}" (${booking.customer_name})? This action cannot be undone.`)) {
      return;
    }

    this.selectionService.deleteEvent(booking.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastService.success('Celebration booking deleted successfully');
          this.loadData();
        } else {
          this.toastService.error('Failed to delete booking');
        }
      },
      error: () => this.toastService.error('Server error deleting booking')
    });
  }

  // --- BEO Spec Sheet Modal ---
  openBEOReport(booking: UnifiedBooking, event?: Event) {
    if (event) event.stopPropagation();
    this.selectedBookingForBEO.set(booking);
  }

  closeBEOReport() {
    this.selectedBookingForBEO.set(null);
  }

  printBEOReport() {
    window.print();
  }

  shareBEOViaWhatsApp(b: UnifiedBooking) {
    const rawPhone = b.customer_phone ? b.customer_phone.replace(/[^0-9]/g, '') : '917299887725';
    let text = `👑 *THIRUMALA CATERING SERVICE (திருமலா)*\n`;
    text += `*Authentic Pure Vegetarian Wedding Feast*\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `📍 *Official Venues:* Tirukoilur & Sowcarpet, Chennai\n`;
    text += `📞 *Concierge:* +91 72998 87725\n\n`;
    text += `📋 *BANQUET EVENT ORDER (BEO)*\n`;
    text += `• *Host:* ${b.customer_name}\n`;
    text += `• *Celebration:* ${b.event_name} (${b.event_type})\n`;
    text += `• *Date:* ${b.event_date}\n`;
    text += `• *Banquet Venue:* ${b.venue}\n`;
    text += `• *Headcount:* ${b.guest_count} Guests\n`;
    text += `• *Created By:* ${b.source === 'admin' ? '👑 Admin' : '🌐 Customer Website'}\n`;
    text += `• *Status:* ${b.status.toUpperCase()}\n\n`;

    if (b.sessions && b.sessions.length > 0) {
      text += `🍽️ *COURSE SESSIONS & MENU SPECIFICATION:*\n`;
      for (const s of b.sessions) {
        text += `\n*${s.shortName} (${s.timeSlot})* - ${s.guest_count} Guests\n`;
        s.dishes.forEach((d, idx) => {
          const batch = this.calculateBatchRequirement(d.serving_quantity, d.serving_unit, s.guest_count);
          let priceStr = `₹${((d.price_per_person || 7500) / 100).toFixed(0)}/pax`;
          if (d.is_offer_applied && d.original_price_per_person) {
            priceStr = `₹${((d.offer_price_per_person || d.price_per_person) / 100).toFixed(0)}/pax *(OFFER RATE)* ~₹${(d.original_price_per_person / 100).toFixed(0)}~`;
          }
          text += `  ${idx + 1}. ${d.name} (${d.serving_quantity || 100}${d.serving_unit || 'g'} - Batch: ${batch}) - ${priceStr}\n`;
        });
      }
    }

    text += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `💰 *COMMERCIAL ESTIMATE:*\n`;
    text += `• Food Subtotal: ₹${(b.subtotal / 100).toLocaleString('en-IN')}\n`;
    text += `• Service & Setup (10%): ₹${(b.service_charge / 100).toLocaleString('en-IN')}\n`;
    text += `• Banquet Logistics & Transport: ₹${(b.transportation_charge / 100).toLocaleString('en-IN')}\n`;
    text += `• GST (5%): ₹${(b.gst_amount / 100).toLocaleString('en-IN')}\n`;
    text += `• *GRAND TOTAL: ₹${(b.grand_total / 100).toLocaleString('en-IN')}*\n`;
    text += `• *Average Per Guest: ₹${(b.cost_per_guest / 100).toFixed(0)}*\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `_Thirumala Catering Service - Serving Divine Flavours with Traditional Grace_`;

    const url = `https://wa.me/${rawPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }

  calculateBatchRequirement(servingQty?: number, servingUnit?: string, guests?: number): string {
    const g = guests || 600;
    const qty = servingQty || 100;
    const unit = (servingUnit || 'g').toLowerCase().trim();

    if (unit === 'g' || unit === 'gram' || unit === 'grams') {
      const totalKg = (qty * g) / 1000;
      return `${totalKg % 1 === 0 ? totalKg : totalKg.toFixed(1)} kg`;
    }
    if (unit === 'ml' || unit === 'milli' || unit === 'milliliter') {
      const totalLtr = (qty * g) / 1000;
      return `${totalLtr % 1 === 0 ? totalLtr : totalLtr.toFixed(1)} L`;
    }
    if (unit === 'pcs' || unit === 'pc' || unit === 'piece' || unit === 'pieces') {
      return `${Math.round(qty * g).toLocaleString('en-IN')} pcs`;
    }
    if (unit === 'cup' || unit === 'cups') {
      return `${Math.round(qty * g).toLocaleString('en-IN')} cups`;
    }
    return `${(qty * g).toLocaleString('en-IN')} ${unit}`;
  }

  getFallbackImageForName(name: string): string {
    const n = (name || '').toLowerCase();
    if (n.includes('idly') || n.includes('idli')) {
      return 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=500&q=80';
    }
    if (n.includes('vada') || n.includes('vadai') || n.includes('bonda')) {
      return 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=500&q=80';
    }
    if (n.includes('dosa') || n.includes('dosai') || n.includes('uttapam')) {
      return 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=500&q=80';
    }
    if (n.includes('biryani') || n.includes('briyani') || n.includes('pulao') || n.includes('rice') || n.includes('pongal')) {
      return 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=500&q=80';
    }
    if (n.includes('paneer') || n.includes('tikka')) {
      return 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=500&q=80';
    }
    if (n.includes('gobi') || n.includes('cauliflower') || n.includes('65') || n.includes('manchurian')) {
      return 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=500&q=80';
    }
    if (n.includes('tea') || n.includes('coffee') || n.includes('juice') || n.includes('drink') || n.includes('milk') || n.includes('lassi')) {
      return 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=500&q=80';
    }
    return this.defaultDishImage;
  }

  getDishImage(dishId: string, fallbackUrl?: string, dishName?: string): string {
    if (fallbackUrl) return fallbackUrl;
    const found = this.allDishes().find(d => d.id === dishId);
    if (found?.primary_image_url) return found.primary_image_url;
    if (found?.images && found.images.length > 0) {
      const primary = found.images.find(img => img.is_primary === 1) || found.images[0];
      if (primary?.image_url) return primary.image_url;
    }
    return this.getFallbackImageForName(dishName || found?.name || '');
  }

  isDishInCurrentSession(dishId: string): boolean {
    const cur = this.currentModalSession();
    return cur ? cur.dishes.some(d => d.dish_id === dishId) : false;
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (img && img.src !== this.defaultDishImage) {
      img.src = this.defaultDishImage;
    }
  }
}
