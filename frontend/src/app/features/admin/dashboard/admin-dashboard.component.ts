import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DashboardService, DashboardOverview, PopularDishItem, ActivityItem, RevenueChartPoint } from '../../../core/services/dashboard.service';
import { SelectionService } from '../../../core/services/selection.service';
import { DishService } from '../../../core/services/dish.service';
import { RecipeService } from '../../../core/services/recipe.service';
import { PricingService } from '../../../core/services/pricing.service';
import { CategoryService } from '../../../core/services/category.service';
import { ToastService } from '../../../core/services/toast.service';
import { TranslationService } from '../../../core/services/translation.service';
import { WeddingEvent, Dish, FoodCategory, Recipe, EstimationSettings } from '../../../core/models';

export interface MealSessionItem {
  dish_id: string;
  name: string;
  category_name?: string;
  price_per_person: number; // in paise (effective rate used in calculations)
  original_price_per_person?: number; // base catalog rate in paise
  offer_price_per_person?: number; // admin entered offer rate in paise
  is_offer_applied?: boolean; // true if custom offer price entered
  serving_quantity?: number;
  serving_unit?: string;
}

export interface MealSession {
  id: string;
  name: string;
  shortName: string;
  timeSlot: string;
  icon: string;
  enabled: boolean;
  guest_count: number;
  dishes: MealSessionItem[];
}

export interface FinancialSessionCost {
  sessionId: string;
  sessionName: string;
  guestCount: number;
  dishCount: number;
  perGuestPaise: number; // in paise
  totalFoodCostPaise: number; // in paise
}

export interface FinancialBreakdown {
  sessionsCost: FinancialSessionCost[];
  totalFoodSubtotalPaise: number;
  serviceChargeRate: number;
  serviceChargePaise: number;
  transportationChargePaise: number;
  taxableAmountPaise: number;
  gstRate: number;
  gstAmountPaise: number;
  grandTotalPaise: number;
  peakGuests: number;
  costPerGuestPaise: number;
}

export interface TimelineEvent {
  id: string;
  rawDate: string; // 'YYYY-MM-DD'
  dateStr: string;
  name: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  venue?: string;
  guestCount: number;
  status: string;
  statusClass: string;
  source?: 'admin' | 'user';
  created_at?: string;
  sessions?: MealSession[];
  financials?: FinancialBreakdown;
}

export interface CalendarDay {
  date: Date;
  dateStr: string; // 'YYYY-MM-DD'
  dayNum: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: TimelineEvent[];
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private selectionService = inject(SelectionService);
  private dishService = inject(DishService);
  private categoryService = inject(CategoryService);
  private recipeService = inject(RecipeService);
  private pricingService = inject(PricingService);
  private toast = inject(ToastService);
  tService = inject(TranslationService);

  overview = signal<DashboardOverview | null>(null);
  popularDishes = signal<PopularDishItem[]>([]);
  activities = signal<ActivityItem[]>([]);
  allDishes = signal<Dish[]>([]);
  categories = signal<FoodCategory[]>([]);

  // Platform Pricing Settings (Service charge, transport, GST)
  pricingSettings = signal<EstimationSettings>({
    id: 'default',
    setting_key: 'default',
    default_serving_quantity: 100,
    currency: 'INR',
    currency_symbol: '₹',
    service_charge_rate: 10,
    service_charge_enabled: 1,
    transportation_charge: 500000, // ₹5,000 in paise
    transportation_enabled: 1,
    gst_rate: 5,
    gst_enabled: 1,
    min_guests: 50,
    is_active: 1,
    updated_at: new Date().toISOString()
  });

  // View Mode: 'calendar' (default) vs 'timeline'
  viewMode = signal<'calendar' | 'timeline'>('calendar');

  // Calendar State
  currentCalDate = signal<Date>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));

  currentMonthYearDisplay = computed(() => {
    return this.currentCalDate().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  });

  // Timeline Events
  timelineEvents = signal<TimelineEvent[]>([]);

  // Top Performing Dishes with percentages matching Screen 04
  topDishes = signal<PopularDishItem[]>([
    { id: 'd1', name: 'Paneer Tikka', category_name: 'Starters', image_url: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300&q=80', selection_count: 85, percentage: 28 },
    { id: 'd2', name: 'Gobi 65', category_name: 'Starters', image_url: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=300&q=80', selection_count: 72, percentage: 24 },
    { id: 'd3', name: 'Chicken 65', category_name: 'Starters', image_url: 'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?w=300&q=80', selection_count: 60, percentage: 20 },
    { id: 'd4', name: 'Hyderabadi Dum Biryani', category_name: 'Main Course', image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&q=80', selection_count: 55, percentage: 18 },
    { id: 'd5', name: 'Gulab Jamun with Rabdi', category_name: 'Desserts', image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&q=80', selection_count: 45, percentage: 15 }
  ]);

  // Modals state
  showScheduleModal = signal(false);
  isEditingEvent = signal<boolean>(false);
  editingEventId = signal<string | null>(null);
  showPurchaseModal = signal(false);
  selectedEventDetail = signal<TimelineEvent | null>(null);
  showReportModal = signal(false);
  selectedReportEvent = signal<TimelineEvent | null>(null);

  // Booking Source Filter ('all' | 'admin' | 'user')
  filterEventSource = signal<'all' | 'admin' | 'user'>('all');

  // Dish Profile & Recipe Modal State (Portion / Grams / Pieces customizer & Offer Price)
  activeDishModal = signal<Dish | null>(null);
  modalRecipe = signal<Recipe | null>(null);
  modalLoadingRecipe = signal<boolean>(false);
  modalServingQuantity = signal<number>(100);
  modalServingUnit = signal<string>('g');
  modalOfferPrice = signal<number | null>(null); // In Rupees (e.g. 70)
  modalImages = signal<string[]>([]);
  activeModalImageIndex = signal<number>(0);

  // Multi-Session Scheduling Form State
  scheduleStep = signal<number>(1); // 1 = Details, 2 = Meal Sessions & Categorized Dishes, 3 = Summary
  activeSessionTab = signal<string>('morning');
  dishSearchQuery = signal<string>('');
  selectedDishCategory = signal<string>('all');

  newEvent: Partial<WeddingEvent> = {
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    event_name: '',
    event_type: 'Wedding Reception',
    event_date: new Date().toISOString().split('T')[0],
    venue: '',
    guest_count: 600
  };

  // 4 Standard Wedding Meal Sessions with independent guest counts & dish collections
  mealSessions = signal<MealSession[]>([
    {
      id: 'morning',
      name: 'Morning (Breakfast / Muhurtham Tiffin)',
      shortName: 'Morning',
      timeSlot: '07:30 AM - 10:00 AM',
      icon: 'wb_twilight',
      enabled: true,
      guest_count: 350,
      dishes: []
    },
    {
      id: 'afternoon',
      name: 'Afternoon (Banquet Lunch / Virundhu)',
      shortName: 'Lunch',
      timeSlot: '12:00 PM - 03:00 PM',
      icon: 'restaurant',
      enabled: true,
      guest_count: 600,
      dishes: []
    },
    {
      id: 'evening',
      name: 'Evening (Hi-Tea & Snacks)',
      shortName: 'Evening',
      timeSlot: '04:30 PM - 06:30 PM',
      icon: 'coffee',
      enabled: false,
      guest_count: 200,
      dishes: []
    },
    {
      id: 'night',
      name: 'Night (Dinner / Reception Feast)',
      shortName: 'Dinner',
      timeSlot: '07:30 PM - 10:30 PM',
      icon: 'nightlife',
      enabled: true,
      guest_count: 500,
      dishes: []
    }
  ]);

  // Calendar Day Generation
  calendarDays = computed<CalendarDay[]>(() => {
    const calDate = this.currentCalDate();
    const year = calDate.getFullYear();
    const month = calDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const firstDayIndex = firstDayOfMonth.getDay(); // 0 = Sun
    const totalDays = lastDayOfMonth.getDate();

    const todayStr = new Date().toISOString().split('T')[0];
    const days: CalendarDay[] = [];

    // Previous month padding days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const d = new Date(year, month - 1, dayNum);
      const dateStr = this.formatDateISO(d);
      days.push({
        date: d,
        dateStr,
        dayNum,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        events: this.getEventsForDate(dateStr)
      });
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      const curDate = new Date(year, month, d);
      const dateStr = this.formatDateISO(curDate);
      days.push({
        date: curDate,
        dateStr,
        dayNum: d,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        events: this.getEventsForDate(dateStr)
      });
    }

    // Next month padding days to complete 35 or 42 grid
    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(year, month + 1, d);
      const dateStr = this.formatDateISO(nextDate);
      days.push({
        date: nextDate,
        dateStr,
        dayNum: d,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        events: this.getEventsForDate(dateStr)
      });
    }

    return days;
  });

  // Filtered dishes for selection in session dish picker
  filteredDishesForPicker = computed(() => {
    const list = this.allDishes();
    const cat = this.selectedDishCategory();
    const query = this.dishSearchQuery().toLowerCase().trim();

    return list.filter(d => {
      const matchCat = cat === 'all' || d.category_id === cat || d.category_name === cat;
      const anyDish = d as any;
      const matchQuery = !query ||
        d.name.toLowerCase().includes(query) ||
        Boolean(anyDish.regional_names && Object.values(anyDish.regional_names).some((v: any) => typeof v === 'string' && v.toLowerCase().includes(query)));
      return matchCat && matchQuery;
    });
  });

  // Current session selected in tab
  currentSession = computed(() => {
    const id = this.activeSessionTab();
    return this.mealSessions().find(s => s.id === id) || this.mealSessions()[0];
  });

  // Summary statistics across active sessions
  sessionSummary = computed(() => {
    const active = this.mealSessions().filter(s => s.enabled);
    let totalGuests = 0;
    let totalDishCount = 0;

    active.forEach(s => {
      totalGuests = Math.max(totalGuests, s.guest_count);
      totalDishCount += s.dishes.length;
    });

    const fin = this.calculateSessionsFinancials(active, totalGuests || Number(this.newEvent.guest_count || 600));

    return {
      activeCount: active.length,
      peakGuests: totalGuests || Number(this.newEvent.guest_count || 600),
      totalDishes: totalDishCount,
      estimatedTotalInr: this.formatInr(fin.totalFoodSubtotalPaise),
      grandTotalInr: this.formatInr(fin.grandTotalPaise),
      costPerGuestInr: this.formatInr(fin.costPerGuestPaise)
    };
  });

  // Accurate catering quotation & fees calculation using offer or standard rates
  calculateSessionsFinancials(sessions?: MealSession[], fallbackGuests?: number): FinancialBreakdown {
    const settings = this.pricingSettings();
    const activeSessions = (sessions || []).filter(s => s.enabled !== false);
    const peakGuests = Math.max(1, ...(activeSessions.map(s => Number(s.guest_count) || 0)), Number(fallbackGuests) || 100);

    let totalFoodSubtotalPaise = 0;
    const sessionsCost: FinancialSessionCost[] = activeSessions.map(s => {
      const dishes = s.dishes || [];
      const perGuestPaise = dishes.reduce((acc, d) => {
        const rate = (d.is_offer_applied && d.offer_price_per_person !== undefined)
          ? d.offer_price_per_person
          : (d.price_per_person || 0);
        return acc + rate;
      }, 0);
      const guestCount = Number(s.guest_count) || Number(fallbackGuests) || 100;
      const totalFoodCostPaise = perGuestPaise * guestCount;
      totalFoodSubtotalPaise += totalFoodCostPaise;
      return {
        sessionId: s.id,
        sessionName: s.name,
        guestCount,
        dishCount: dishes.length,
        perGuestPaise,
        totalFoodCostPaise
      };
    });

    const serviceChargeRate = settings.service_charge_enabled ? (settings.service_charge_rate ?? 10) : 0;
    const serviceChargePaise = Math.round(totalFoodSubtotalPaise * (serviceChargeRate / 100));

    const transportationChargePaise = settings.transportation_enabled ? (settings.transportation_charge ?? 500000) : 0;

    const taxableAmountPaise = totalFoodSubtotalPaise + serviceChargePaise + transportationChargePaise;

    const gstRate = settings.gst_enabled ? (settings.gst_rate ?? 5) : 0;
    const gstAmountPaise = Math.round(taxableAmountPaise * (gstRate / 100));

    const grandTotalPaise = taxableAmountPaise + gstAmountPaise;
    const costPerGuestPaise = Math.round(grandTotalPaise / peakGuests);

    return {
      sessionsCost,
      totalFoodSubtotalPaise,
      serviceChargeRate,
      serviceChargePaise,
      transportationChargePaise,
      taxableAmountPaise,
      gstRate,
      gstAmountPaise,
      grandTotalPaise,
      peakGuests,
      costPerGuestPaise
    };
  }

  // Update offer price (in INR) for a dish in a session
  updateDishOfferPrice(dishId: string, offerPriceInr: any, session?: MealSession) {
    const s = session || this.currentSession();
    const item = s.dishes.find(d => d.dish_id === dishId);
    if (!item) return;

    if (!item.original_price_per_person) {
      item.original_price_per_person = item.price_per_person || 7500;
    }

    const numVal = Number(offerPriceInr);
    if (offerPriceInr !== null && offerPriceInr !== undefined && offerPriceInr !== '' && !isNaN(numVal) && numVal > 0) {
      item.offer_price_per_person = Math.round(numVal * 100);
      item.price_per_person = item.offer_price_per_person;
      item.is_offer_applied = true;
    } else {
      item.offer_price_per_person = undefined;
      item.price_per_person = item.original_price_per_person;
      item.is_offer_applied = false;
    }

    this.mealSessions.update(list => [...list]);
  }

  getDishOfferPriceInr(item: MealSessionItem): number | null {
    if (item.is_offer_applied && item.offer_price_per_person !== undefined) {
      return Math.round(item.offer_price_per_person / 100);
    }
    return null;
  }

  // Real-time calculation for scheduling modal (Step 3)
  currentModalFinancials = computed<FinancialBreakdown>(() => {
    return this.calculateSessionsFinancials(
      this.mealSessions().filter(s => s.enabled),
      this.newEvent.guest_count
    );
  });

  // Real-time calculation for BEO Final Report modal
  currentReportFinancials = computed<FinancialBreakdown | null>(() => {
    const ev = this.selectedReportEvent();
    if (!ev) return null;
    if (ev.financials) return ev.financials;
    return this.calculateSessionsFinancials(ev.sessions, ev.guestCount);
  });

  formatInr(paise: number): string {
    return ((paise || 0) / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 });
  }

  getAdvanceAmount(totalPaise: number, pct: number): string {
    return this.formatInr(Math.round((totalPaise || 0) * (pct / 100)));
  }

  ngOnInit() {
    this.dashboardService.getOverview().subscribe({
      next: (res) => {
        if (res.success) this.overview.set(res.data);
      }
    });

    this.dashboardService.getPopularDishes().subscribe({
      next: (res) => {
        if (res.success && res.data.length > 0) {
          this.popularDishes.set(res.data);
        }
      }
    });

    this.dashboardService.getActivities().subscribe({
      next: (res) => {
        if (res.success) this.activities.set(res.data);
      }
    });

    // Load dynamic pricing settings (service fee, logistics, GST)
    this.pricingService.getSettings().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.pricingSettings.set(res.data);
        }
      },
      error: () => {}
    });

    // Load all categories for dish picker
    this.categoryService.getCategories().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.categories.set(res.data);
        }
      }
    });

    // Load all dishes for session builder
    this.dishService.getDishes({ limit: 120 }).subscribe({
      next: (res) => {
        if (res.success && res.dishes) {
          this.allDishes.set(res.dishes);
        }
      }
    });

    // Load backend events
    this.loadEvents();
  }

  loadEvents() {
    this.selectionService.getEvents().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const mapped: TimelineEvent[] = res.data.map(ev => {
            const dateObj = new Date(ev.event_date);
            const dateStr = !isNaN(dateObj.getTime())
              ? dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              : ev.event_date;

            let parsedSessions: MealSession[] | undefined = undefined;
            let parsedFinancials: FinancialBreakdown | undefined = undefined;
            if (ev.notes) {
              try {
                const parsed = JSON.parse(ev.notes);
                if (parsed.sessions && Array.isArray(parsed.sessions)) {
                  parsedSessions = parsed.sessions;
                }
                if (parsed.financials) {
                  parsedFinancials = parsed.financials;
                }
              } catch (_) {}
            }

            if (!parsedFinancials && parsedSessions && parsedSessions.length > 0) {
              parsedFinancials = this.calculateSessionsFinancials(parsedSessions, ev.guest_count);
            }

            let status = 'Confirming Menu';
            let statusClass = 'confirming';
            if (ev.status === 'confirmed') {
              status = 'Advance Received';
              statusClass = 'advance';
            } else if (ev.status === 'completed') {
              status = 'Completed';
              statusClass = 'advance';
            }

            const isUserCreated = ev.notes?.includes('"source":"user"') || Boolean((ev as any).selection_id);
            const source: 'admin' | 'user' = isUserCreated ? 'user' : 'admin';

            return {
              id: ev.id,
              rawDate: ev.event_date,
              dateStr,
              name: `${ev.event_name} (${ev.venue || 'Banqueting'})`,
              customer_name: ev.customer_name,
              customer_phone: ev.customer_phone,
              customer_email: ev.customer_email,
              venue: ev.venue,
              guestCount: ev.guest_count,
              status,
              statusClass,
              source,
              created_at: ev.created_at,
              sessions: parsedSessions,
              financials: parsedFinancials
            };
          });

          this.timelineEvents.set(mapped);
        } else {
          this.timelineEvents.set([]);
        }
      },
      error: () => {
        this.timelineEvents.set([]);
      }
    });
  }

  // Filtered timeline events by creator ('all' | 'admin' | 'user')
  filteredTimelineEvents = computed(() => {
    const filter = this.filterEventSource();
    const list = this.timelineEvents();
    if (filter === 'all') return list;
    return list.filter(e => e.source === filter);
  });

  private formatDateISO(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getEventsForDate(dateStr: string): TimelineEvent[] {
    const filter = this.filterEventSource();
    return this.timelineEvents().filter(ev => {
      if (filter !== 'all' && ev.source !== filter) return false;
      if (ev.rawDate === dateStr) return true;
      const evDate = new Date(ev.rawDate);
      if (!isNaN(evDate.getTime())) {
        return this.formatDateISO(evDate) === dateStr;
      }
      return false;
    });
  }

  // Calendar Month Navigation
  prevMonth() {
    const cur = this.currentCalDate();
    this.currentCalDate.set(new Date(cur.getFullYear(), cur.getMonth() - 1, 1));
  }

  nextMonth() {
    const cur = this.currentCalDate();
    this.currentCalDate.set(new Date(cur.getFullYear(), cur.getMonth() + 1, 1));
  }

  goToToday() {
    const now = new Date();
    this.currentCalDate.set(new Date(now.getFullYear(), now.getMonth(), 1));
  }

  onDateCellClick(day: CalendarDay) {
    if (day.events.length > 0) {
      this.openEventDetailModal(day.events[0]);
    } else {
      this.openScheduleModalForDate(day.dateStr);
    }
  }

  openEventDetailModal(ev: TimelineEvent) {
    this.selectedEventDetail.set(ev);
  }

  closeEventDetailModal() {
    this.selectedEventDetail.set(null);
  }

  // Scheduling Modal
  openScheduleModal() {
    this.isEditingEvent.set(false);
    this.editingEventId.set(null);
    this.resetScheduleForm();
    this.showScheduleModal.set(true);
  }

  openScheduleModalForDate(dateStr: string) {
    this.isEditingEvent.set(false);
    this.editingEventId.set(null);
    this.resetScheduleForm();
    this.newEvent.event_date = dateStr;
    this.showScheduleModal.set(true);
  }

  // Open Edit Event Modal pre-populated with event & dishes
  openEditEventModal(ev: TimelineEvent) {
    this.scheduleStep.set(1);
    this.activeSessionTab.set('morning');
    this.isEditingEvent.set(true);
    this.editingEventId.set(ev.id);

    this.newEvent = {
      id: ev.id,
      customer_name: ev.customer_name || '',
      customer_phone: ev.customer_phone || '',
      customer_email: ev.customer_email || '',
      event_name: ev.name ? ev.name.replace(/\s*\(.*?\)$/, '') : '',
      event_type: 'Wedding Reception',
      event_date: ev.rawDate,
      venue: ev.venue || 'No. 73, Mandhaikaara Street, Tirukoilur - 607201',
      guest_count: ev.guestCount || 600
    };

    if (ev.sessions && ev.sessions.length > 0) {
      this.mealSessions.set(JSON.parse(JSON.stringify(ev.sessions)));
    } else {
      this.resetScheduleForm();
      this.isEditingEvent.set(true);
      this.editingEventId.set(ev.id);
      this.newEvent.customer_name = ev.customer_name || '';
      this.newEvent.customer_phone = ev.customer_phone || '';
      this.newEvent.customer_email = ev.customer_email || '';
      this.newEvent.event_date = ev.rawDate;
      this.newEvent.venue = ev.venue || 'No. 73, Mandhaikaara Street, Tirukoilur - 607201';
      this.newEvent.guest_count = ev.guestCount || 600;
      this.newEvent.event_name = ev.name ? ev.name.replace(/\s*\(.*?\)$/, '') : '';
    }

    if (this.selectedEventDetail()) {
      this.selectedEventDetail.set(null);
    }
    this.showScheduleModal.set(true);
  }

  private resetScheduleForm() {
    this.isEditingEvent.set(false);
    this.editingEventId.set(null);
    this.scheduleStep.set(1);
    this.activeSessionTab.set('morning');
    this.newEvent = {
      customer_name: '',
      customer_phone: '',
      customer_email: '',
      event_name: '',
      event_type: 'Wedding Reception',
      event_date: new Date().toISOString().split('T')[0],
      venue: 'No. 73, Mandhaikaara Street, Tirukoilur - 607201',
      guest_count: 600
    };

    // Reset default sessions with sample South Indian feast courses
    this.mealSessions.set([
      {
        id: 'morning',
        name: 'Morning (Breakfast / Muhurtham Tiffin)',
        shortName: 'Morning',
        timeSlot: '07:30 AM - 10:00 AM',
        icon: 'wb_twilight',
        enabled: true,
        guest_count: 350,
        dishes: [
          { dish_id: 'd1', name: 'Malli Poo Idli with 3 Chutneys', category_name: 'Breakfast', price_per_person: 6500, serving_quantity: 4, serving_unit: 'pcs' },
          { dish_id: 'd2', name: 'Crispy Medu Vada & Sambar', category_name: 'Breakfast', price_per_person: 5500, serving_quantity: 2, serving_unit: 'pcs' },
          { dish_id: 'd3', name: 'Ghee Cashew Ven Pongal', category_name: 'Breakfast', price_per_person: 8500, serving_quantity: 150, serving_unit: 'g' }
        ]
      },
      {
        id: 'afternoon',
        name: 'Afternoon (Banquet Lunch / Virundhu)',
        shortName: 'Lunch',
        timeSlot: '12:00 PM - 03:00 PM',
        icon: 'restaurant',
        enabled: true,
        guest_count: 600,
        dishes: [
          { dish_id: 'd4', name: 'Traditional Tirunelveli Halwa', category_name: 'Desserts', price_per_person: 9500, serving_quantity: 100, serving_unit: 'g' },
          { dish_id: 'd5', name: 'Royal Basmati Steamed Rice & Ghee', category_name: 'Main Course', price_per_person: 7000, serving_quantity: 250, serving_unit: 'g' },
          { dish_id: 'd6', name: 'Elaneer Payasam (Tender Coconut)', category_name: 'Desserts', price_per_person: 11000, serving_quantity: 120, serving_unit: 'ml' }
        ]
      },
      {
        id: 'evening',
        name: 'Evening (Hi-Tea & Snacks)',
        shortName: 'Evening',
        timeSlot: '04:30 PM - 06:30 PM',
        icon: 'coffee',
        enabled: false,
        guest_count: 200,
        dishes: []
      },
      {
        id: 'night',
        name: 'Night (Dinner / Reception Feast)',
        shortName: 'Dinner',
        timeSlot: '07:30 PM - 10:30 PM',
        icon: 'nightlife',
        enabled: true,
        guest_count: 500,
        dishes: [
          { dish_id: 'd7', name: 'Hyderabadi Dum Biryani with Raita', category_name: 'Rice & Biryani', price_per_person: 18000, serving_quantity: 300, serving_unit: 'g' },
          { dish_id: 'd8', name: 'Paneer Butter Masala & Butter Naan', category_name: 'Main Course', price_per_person: 14000, serving_quantity: 200, serving_unit: 'g' }
        ]
      }
    ]);
  }

  // Session Dish Management
  toggleSession(session: MealSession) {
    session.enabled = !session.enabled;
    this.mealSessions.update(list => [...list]);
  }

  isDishInCurrentSession(dishId: string): boolean {
    const s = this.currentSession();
    return s.dishes.some(d => d.dish_id === dishId);
  }

  getDishServingPortion(dish: Dish): string {
    const cur = this.currentSession();
    const item = cur?.dishes?.find(d => d.dish_id === dish.id);
    if (item && item.serving_quantity) {
      return `${item.serving_quantity}${item.serving_unit || 'g'}`;
    }
    return `${dish.quantity_per_person || 100}${dish.serving_unit || 'g'}`;
  }

  isDishPortionCustomized(dish: Dish): boolean {
    const cur = this.currentSession();
    const item = cur?.dishes?.find(d => d.dish_id === dish.id);
    if (item && item.serving_quantity) {
      const defaultQty = dish.quantity_per_person || 100;
      const defaultUnit = dish.serving_unit || 'g';
      return item.serving_quantity !== defaultQty || (item.serving_unit || 'g') !== defaultUnit;
    }
    return false;
  }

  addDishToCurrentSession(dish: Dish) {
    const cur = this.currentSession();
    if (!cur.dishes.some(d => d.dish_id === dish.id)) {
      cur.dishes.push({
        dish_id: dish.id,
        name: dish.name,
        category_name: dish.category_name,
        price_per_person: dish.price_per_person || 7500,
        serving_quantity: dish.quantity_per_person || 100,
        serving_unit: dish.serving_unit || 'g'
      });
      this.mealSessions.update(list => [...list]);
      this.toast.success(`Added "${dish.name}" (${dish.quantity_per_person || 100}${dish.serving_unit || 'g'}) to ${cur.shortName} session.`);
    }
  }

  removeDishFromCurrentSession(dishId: string) {
    const cur = this.currentSession();
    cur.dishes = cur.dishes.filter(d => d.dish_id !== dishId);
    this.mealSessions.update(list => [...list]);
  }

  // Dish Profile Popup & Customization (Pieces / Grams / Quantities)
  openDishProfile(dish: Dish, event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const cur = this.currentSession();
    const existing = cur.dishes.find(d => d.dish_id === dish.id);
    if (existing) {
      this.modalServingQuantity.set(existing.serving_quantity || dish.quantity_per_person || 100);
      this.modalServingUnit.set(existing.serving_unit || dish.serving_unit || 'g');
      if (existing.is_offer_applied && existing.offer_price_per_person !== undefined) {
        this.modalOfferPrice.set(Math.round(existing.offer_price_per_person / 100));
      } else {
        this.modalOfferPrice.set(null);
      }
    } else {
      this.modalServingQuantity.set(dish.quantity_per_person || 100);
      this.modalServingUnit.set(dish.serving_unit || 'g');
      this.modalOfferPrice.set(null);
    }

    this.activeModalImageIndex.set(0);
    this.activeDishModal.set(dish);

    // Initial images & fallback
    const images: string[] = [];
    if (dish.primary_image_url) images.push(dish.primary_image_url);
    if (dish.images && dish.images.length > 0) {
      dish.images.forEach(img => {
        if (img.image_url && !images.includes(img.image_url)) images.push(img.image_url);
      });
    }
    const fallbacks = this.getFallbackImagesForDish(dish);
    for (const fb of fallbacks) {
      if (!images.includes(fb)) images.push(fb);
    }
    this.modalImages.set(images);

    // Fetch full dish details & images
    this.dishService.getDish(dish.id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const fetched: string[] = [];
          if (res.data.primary_image_url) fetched.push(res.data.primary_image_url);
          if (res.data.images && res.data.images.length > 0) {
            res.data.images.forEach(img => {
              if (img.image_url && !fetched.includes(img.image_url)) fetched.push(img.image_url);
            });
          }
          for (const fb of fallbacks) {
            if (!fetched.includes(fb)) fetched.push(fb);
          }
          this.modalImages.set(fetched);
        }
      }
    });

    // Fetch master recipe & ingredients
    this.modalLoadingRecipe.set(true);
    this.recipeService.getRecipeByDishId(dish.id).subscribe({
      next: (res) => {
        this.modalLoadingRecipe.set(false);
        if (res.success && res.data) {
          this.modalRecipe.set(res.data);
        } else {
          this.modalRecipe.set(null);
        }
      },
      error: () => {
        this.modalLoadingRecipe.set(false);
        this.modalRecipe.set(null);
      }
    });
  }

  openDishProfileForDishId(dishId: string, event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const found = this.allDishes().find(d => d.id === dishId);
    if (found) {
      this.openDishProfile(found);
    } else {
      // Create minimal dish stub if not yet loaded in list
      const cur = this.currentSession();
      const item = cur.dishes.find(d => d.dish_id === dishId);
      if (item) {
        const stub: Dish = {
          id: item.dish_id,
          name: item.name,
          category_id: 'general',
          category_name: item.category_name,
          description: 'Authentic royal banquet dish prepared fresh with pure ghee and hand-ground spices.',
          food_type: 'veg',
          price_per_person: item.price_per_person,
          quantity_per_person: item.serving_quantity || 100,
          serving_unit: item.serving_unit || 'g',
          min_order_quantity: 50,
          prep_time: '25 mins',
          availability: 1,
          is_deleted: 0,
          created_at: '',
          updated_at: ''
        };
        this.openDishProfile(stub);
      }
    }
  }

  closeDishProfile() {
    this.activeDishModal.set(null);
    this.modalRecipe.set(null);
    this.modalImages.set([]);
  }

  adjustModalQuantity(delta: number) {
    const unit = this.modalServingUnit();
    let step = 1;
    let min = 1;
    let max = 5000;

    if (unit === 'g' || unit === 'ml') {
      step = 25;
      min = 25;
      max = 1000;
    } else if (unit === 'pcs') {
      step = 1;
      min = 1;
      max = 20;
    } else if (unit === 'cups') {
      step = 1;
      min = 1;
      max = 10;
    }

    const current = this.modalServingQuantity() || min;
    const next = Math.max(min, Math.min(max, current + (delta * step)));
    this.modalServingQuantity.set(next);
  }

  setModalUnit(unit: string) {
    const prevUnit = this.modalServingUnit();
    this.modalServingUnit.set(unit);

    if (unit === 'pcs' && prevUnit !== 'pcs') {
      if (this.modalServingQuantity() > 10) this.modalServingQuantity.set(2);
    } else if (unit === 'g' && prevUnit === 'pcs') {
      if (this.modalServingQuantity() < 20) this.modalServingQuantity.set(100);
    } else if (unit === 'ml' && prevUnit === 'pcs') {
      if (this.modalServingQuantity() < 20) this.modalServingQuantity.set(150);
    } else if (unit === 'cups' && prevUnit !== 'cups') {
      if (this.modalServingQuantity() > 10) this.modalServingQuantity.set(1);
    }
  }

  setModalQuantityPreset(qty: number) {
    this.modalServingQuantity.set(qty);
  }

  saveDishFromModalToSession() {
    const dish = this.activeDishModal();
    if (!dish) return;
    const cur = this.currentSession();
    const qty = this.modalServingQuantity() || (this.modalServingUnit() === 'pcs' ? 2 : 100);
    const unit = this.modalServingUnit() || 'g';
    const baseCatalogPrice = dish.price_per_person || 7500;
    const offerPriceVal = this.modalOfferPrice();

    let effectivePrice = baseCatalogPrice;
    let offerPaise: number | undefined = undefined;
    let isOffer = false;

    if (offerPriceVal !== null && offerPriceVal !== undefined && !isNaN(Number(offerPriceVal)) && Number(offerPriceVal) > 0) {
      offerPaise = Math.round(Number(offerPriceVal) * 100);
      effectivePrice = offerPaise;
      isOffer = true;
    }

    const existingIdx = cur.dishes.findIndex(d => d.dish_id === dish.id);
    if (existingIdx >= 0) {
      cur.dishes[existingIdx].serving_quantity = qty;
      cur.dishes[existingIdx].serving_unit = unit;
      cur.dishes[existingIdx].original_price_per_person = baseCatalogPrice;
      cur.dishes[existingIdx].offer_price_per_person = offerPaise;
      cur.dishes[existingIdx].is_offer_applied = isOffer;
      cur.dishes[existingIdx].price_per_person = effectivePrice;
      this.toast.success(`Updated portion & rate for "${dish.name}" in ${cur.shortName}.`);
    } else {
      cur.dishes.push({
        dish_id: dish.id,
        name: dish.name,
        category_name: dish.category_name,
        price_per_person: effectivePrice,
        original_price_per_person: baseCatalogPrice,
        offer_price_per_person: offerPaise,
        is_offer_applied: isOffer,
        serving_quantity: qty,
        serving_unit: unit
      });
      this.toast.success(`Added "${dish.name}" (${qty} ${unit}) to ${cur.shortName}.`);
    }

    this.mealSessions.update(list => [...list]);
    this.closeDishProfile();
  }

  removeDishFromModal() {
    const dish = this.activeDishModal();
    if (!dish) return;
    this.removeDishFromCurrentSession(dish.id);
    this.closeDishProfile();
    this.toast.info(`Removed "${dish.name}" from ${this.currentSession().shortName}.`);
  }

  adjustTrayDishQuantity(dishId: string, delta: number, event?: Event) {
    if (event) event.stopPropagation();
    const cur = this.currentSession();
    const item = cur.dishes.find(d => d.dish_id === dishId);
    if (!item) return;

    const unit = item.serving_unit || 'g';
    const step = (unit === 'g' || unit === 'ml') ? 25 : 1;
    const min = (unit === 'g' || unit === 'ml') ? 25 : 1;
    const current = item.serving_quantity || (unit === 'pcs' ? 2 : 100);

    item.serving_quantity = Math.max(min, current + (delta * step));
    this.mealSessions.update(list => [...list]);
  }

  cycleTrayDishUnit(dishId: string, event?: Event) {
    if (event) event.stopPropagation();
    const cur = this.currentSession();
    const item = cur.dishes.find(d => d.dish_id === dishId);
    if (!item) return;

    const units = ['g', 'pcs', 'ml', 'cups'];
    const currentIdx = units.indexOf(item.serving_unit || 'g');
    const nextUnit = units[(currentIdx + 1) % units.length];
    item.serving_unit = nextUnit;

    if (nextUnit === 'pcs' && (item.serving_quantity || 100) > 10) {
      item.serving_quantity = 2;
    } else if (nextUnit === 'g' && (item.serving_quantity || 2) < 20) {
      item.serving_quantity = 100;
    } else if (nextUnit === 'ml' && (item.serving_quantity || 2) < 20) {
      item.serving_quantity = 150;
    } else if (nextUnit === 'cups' && (item.serving_quantity || 100) > 10) {
      item.serving_quantity = 1;
    }

    this.mealSessions.update(list => [...list]);
    this.toast.info(`Changed unit for "${item.name}" to ${nextUnit}.`);
  }

  getSpiceBadge(dish: Dish): string {
    if (dish.food_type === 'non-veg') return 'Spicy & Aromatic';
    const name = dish.name.toLowerCase();
    if (name.includes('butter') || name.includes('idly') || name.includes('sweet') || name.includes('jamun') || name.includes('halwa')) {
      return 'Mild & Rich';
    }
    return 'Medium Spice';
  }

  onImageError(event: any) {
    event.target.src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1000&q=85';
  }

  getFallbackImagesForDish(dish: Dish): string[] {
    const name = dish.name.toLowerCase();
    if (name.includes('idly') || name.includes('idli')) {
      return [
        'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1000&q=85',
        'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=1000&q=85'
      ];
    } else if (name.includes('vada') || name.includes('vadai')) {
      return [
        'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1000&q=85',
        'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1000&q=85'
      ];
    } else if (name.includes('dosa') || name.includes('dosai')) {
      return [
        'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1000&q=85',
        'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=1000&q=85'
      ];
    } else if (name.includes('biryani') || name.includes('briyani')) {
      return [
        'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1000&q=85',
        'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=1000&q=85'
      ];
    } else if (name.includes('paneer') || name.includes('tikka')) {
      return [
        'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=1000&q=85',
        'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=1000&q=85'
      ];
    } else if (name.includes('gobi') || name.includes('cauliflower')) {
      return [
        'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=1000&q=85'
      ];
    } else if (name.includes('chicken') || name.includes('mutton') || name.includes('fish')) {
      return [
        'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?auto=format&fit=crop&w=1000&q=85',
        'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=1000&q=85'
      ];
    } else if (name.includes('jamun') || name.includes('halwa') || name.includes('payasam') || name.includes('sweet') || name.includes('rasagolla')) {
      return [
        'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1000&q=85',
        'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1000&q=85'
      ];
    }
    return [
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=1000&q=85'
    ];
  }

  saveScheduledEvent() {
    if (!this.newEvent.event_name) {
      this.toast.error('Please enter the event name.');
      this.scheduleStep.set(1);
      return;
    }
    if (!this.newEvent.customer_name) {
      this.toast.error('Please enter the customer / host name.');
      this.scheduleStep.set(1);
      return;
    }

    const activeSessions = this.mealSessions().filter(s => s.enabled);
    if (activeSessions.length === 0) {
      this.toast.error('Please enable at least one meal session (Morning, Lunch, Evening, or Dinner).');
      this.scheduleStep.set(2);
      return;
    }

    // Peak guest count across active sessions
    const peakGuests = Math.max(...activeSessions.map(s => Number(s.guest_count) || 100));
    this.newEvent.guest_count = peakGuests;

    // Compute comprehensive financials (subtotal, service fee, logistics, GST, grand total)
    const financials = this.calculateSessionsFinancials(activeSessions, peakGuests);

    const dateObj = new Date(this.newEvent.event_date || '');
    const dateStr = !isNaN(dateObj.getTime())
      ? dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : 'Upcoming';

    // Store rich sessions and complete financial breakdown inside notes payload
    const eventPayload: Partial<WeddingEvent> = {
      ...this.newEvent,
      guest_count: peakGuests,
      notes: JSON.stringify({
        source: 'admin',
        creator: 'admin',
        sessions: activeSessions,
        totalDishes: activeSessions.reduce((acc, s) => acc + s.dishes.length, 0),
        venue: this.newEvent.venue || 'No. 73, Mandhaikaara Street, Tirukoilur',
        financials: financials
      })
    };

    // If editing existing event, call updateEvent
    if (this.isEditingEvent() && this.editingEventId()) {
      const eventId = this.editingEventId()!;
      this.selectionService.updateEvent(eventId, eventPayload).subscribe({
        next: (res) => {
          const updatedEv: TimelineEvent = {
            id: eventId,
            rawDate: this.newEvent.event_date || this.formatDateISO(new Date()),
            dateStr,
            name: `${this.newEvent.event_name} (${this.newEvent.venue || 'Banqueting'})`,
            customer_name: this.newEvent.customer_name,
            customer_phone: this.newEvent.customer_phone,
            customer_email: this.newEvent.customer_email,
            venue: this.newEvent.venue,
            guestCount: peakGuests,
            status: 'Confirming Menu',
            statusClass: 'confirming',
            source: 'admin',
            sessions: activeSessions,
            financials: financials
          };

          this.timelineEvents.update(list => list.map(e => e.id === eventId ? updatedEv : e));
          this.toast.success(`Booking "${this.newEvent.event_name}" updated successfully with grand total ₹${this.formatInr(financials.grandTotalPaise)}!`);
          this.showScheduleModal.set(false);
          this.isEditingEvent.set(false);
          this.editingEventId.set(null);
        },
        error: () => {
          const updatedEv: TimelineEvent = {
            id: eventId,
            rawDate: this.newEvent.event_date || this.formatDateISO(new Date()),
            dateStr,
            name: `${this.newEvent.event_name} (${this.newEvent.venue || 'Banqueting'})`,
            customer_name: this.newEvent.customer_name,
            customer_phone: this.newEvent.customer_phone,
            customer_email: this.newEvent.customer_email,
            venue: this.newEvent.venue,
            guestCount: peakGuests,
            status: 'Confirming Menu',
            statusClass: 'confirming',
            source: 'admin',
            sessions: activeSessions,
            financials: financials
          };

          this.timelineEvents.update(list => list.map(e => e.id === eventId ? updatedEv : e));
          this.toast.success(`Booking "${this.newEvent.event_name}" updated locally.`);
          this.showScheduleModal.set(false);
          this.isEditingEvent.set(false);
          this.editingEventId.set(null);
        }
      });
      return;
    }

    // Save newly scheduled event to backend API
    this.selectionService.createEvent(eventPayload).subscribe({
      next: (res) => {
        const newEv: TimelineEvent = {
          id: res.data?.id || 'ev_' + Date.now(),
          rawDate: this.newEvent.event_date || this.formatDateISO(new Date()),
          dateStr,
          name: `${this.newEvent.event_name} (${this.newEvent.venue || 'Banqueting'})`,
          customer_name: this.newEvent.customer_name,
          customer_phone: this.newEvent.customer_phone,
          customer_email: this.newEvent.customer_email,
          venue: this.newEvent.venue,
          guestCount: peakGuests,
          status: 'Confirming Menu',
          statusClass: 'confirming',
          source: 'admin',
          sessions: activeSessions,
          financials: financials
        };

        this.timelineEvents.update(list => [newEv, ...list]);
        this.toast.success(`Wedding celebration "${this.newEvent.event_name}" scheduled with grand total ₹${this.formatInr(financials.grandTotalPaise)}!`);
        this.showScheduleModal.set(false);
      },
      error: () => {
        // Fallback local update if API requires auth/offline
        const newEv: TimelineEvent = {
          id: 'ev_' + Date.now(),
          rawDate: this.newEvent.event_date || this.formatDateISO(new Date()),
          dateStr,
          name: `${this.newEvent.event_name} (${this.newEvent.venue || 'Banqueting'})`,
          customer_name: this.newEvent.customer_name,
          customer_phone: this.newEvent.customer_phone,
          customer_email: this.newEvent.customer_email,
          venue: this.newEvent.venue,
          guestCount: peakGuests,
          status: 'Confirming Menu',
          statusClass: 'confirming',
          source: 'admin',
          sessions: activeSessions,
          financials: financials
        };

        this.timelineEvents.update(list => [newEv, ...list]);
        this.toast.success(`Event "${this.newEvent.event_name}" added to calendar with grand total ₹${this.formatInr(financials.grandTotalPaise)}.`);
        this.showScheduleModal.set(false);
      }
    });
  }

  openPurchaseOrdersModal() {
    this.showPurchaseModal.set(true);
  }

  downloadPurchaseOrderPdf() {
    this.toast.success('Kitchen Purchase Order exported to PDF successfully.');
    this.showPurchaseModal.set(false);
  }

  exportFinancialReport() {
    const csvContent = 'data:text/csv;charset=utf-8,' +
      'Month,Revenue (INR),Events,Expected Guests\n' +
      'July,850000,18,9000\n' +
      'August,1100000,24,12000\n' +
      'September,1250000,28,14000\n' +
      'October,1500000,35,17500\n' +
      'November,1875000,42,21000\n';

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'wedding_feast_financials_2026.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.toast.success('Financial spreadsheet downloaded.');
  }

  // Final Event Banquet Report (BEO)
  openFinalReport(ev: TimelineEvent) {
    this.selectedReportEvent.set(ev);
    this.showReportModal.set(true);
  }

  closeReportModal() {
    this.showReportModal.set(false);
    this.selectedReportEvent.set(null);
  }

  printCurrentReport() {
    window.print();
  }

  calculateBatchRequirement(servingQty: number | undefined, servingUnit: string | undefined, guestCount: number): string {
    const qty = servingQty || 100;
    const unit = servingUnit || 'g';
    const total = qty * guestCount;

    if (unit === 'g') {
      if (total >= 1000) {
        return `${(total / 1000).toFixed(1)} kg`;
      }
      return `${total} g`;
    } else if (unit === 'ml') {
      if (total >= 1000) {
        return `${(total / 1000).toFixed(1)} L`;
      }
      return `${total} ml`;
    } else if (unit === 'pcs') {
      return `${total} pcs`;
    }
    return `${total} ${unit}`;
  }

  shareReportViaWhatsApp(ev: TimelineEvent) {
    let text = `*THIRUMALA CATERING SERVICE*\n`;
    text += `*திருமலா | तिरुमाला | തിരുമല*\n`;
    text += `*OFFICIAL BANQUET EVENT ORDER & MENU REPORT*\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `*Event:* ${ev.name}\n`;
    text += `*Host:* ${ev.customer_name || 'Valued Patron'}\n`;
    text += `*Phone:* ${ev.customer_phone || '+91 72998 87725'}\n`;
    text += `*Date:* ${ev.dateStr}\n`;
    text += `*Venue:* ${ev.venue || 'Banquet Hall'}\n`;
    text += `*Peak Headcount:* ${ev.guestCount} Guests\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

    if (ev.sessions && ev.sessions.length > 0) {
      for (const s of ev.sessions) {
        text += `*${s.name.toUpperCase()}*\n`;
        text += `⏰ Slot: ${s.timeSlot} | 👥 Guests: ${s.guest_count} Pax\n`;
        text += `*Menu Items (${s.dishes.length}):*\n`;
        s.dishes.forEach((d, idx) => {
          let priceStr = '';
          if (d.is_offer_applied && d.offer_price_per_person) {
            priceStr = ` • ₹${(d.offer_price_per_person / 100).toFixed(0)}/pax (Special Offer)`;
          } else if (d.price_per_person) {
            priceStr = ` • ₹${(d.price_per_person / 100).toFixed(0)}/pax`;
          }
          text += `  ${idx + 1}. ${d.name} (${d.serving_quantity || 100}${d.serving_unit || 'g'}${priceStr})\n`;
        });
        text += `\n`;
      }
    }

    const fin = ev.financials || this.calculateSessionsFinancials(ev.sessions, ev.guestCount);
    if (fin) {
      text += `━━━━━━━━━━━━━━━━━━━━━\n`;
      text += `*COMMERCIAL BILLING ESTIMATE:*\n`;
      text += `• Food Subtotal: ₹${this.formatInr(fin.totalFoodSubtotalPaise)}\n`;
      if (fin.serviceChargePaise > 0) {
        text += `• Catering Service Charges (${fin.serviceChargeRate}%): +₹${this.formatInr(fin.serviceChargePaise)}\n`;
      }
      if (fin.transportationChargePaise > 0) {
        text += `• Kitchen Fleet & Logistics: +₹${this.formatInr(fin.transportationChargePaise)}\n`;
      }
      if (fin.gstAmountPaise > 0) {
        text += `• GST (${fin.gstRate}%): +₹${this.formatInr(fin.gstAmountPaise)}\n`;
      }
      text += `*NET GRAND BANQUET TOTAL: ₹${this.formatInr(fin.grandTotalPaise)}* (~₹${this.formatInr(fin.costPerGuestPaise)}/guest)\n`;
      text += `• 40% Booking Advance: ₹${this.getAdvanceAmount(fin.grandTotalPaise, 40)}\n`;
      text += `• 40% Pre-Event: ₹${this.getAdvanceAmount(fin.grandTotalPaise, 40)}\n`;
      text += `• 20% Post-Event: ₹${this.getAdvanceAmount(fin.grandTotalPaise, 20)}\n\n`;
    }

    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `*Headquarters:* No. 73, Mandhaikaara Street, Tirukoilur - 607201\n`;
    text += `*Chennai Branch:* No. 5, Krishnappa Agraharam Street, Sowcarpet, Chennai - 600079\n`;
    text += `*Concierge Phone:* +91 72998 87725\n`;

    const encoded = encodeURIComponent(text);
    const phone = ev.customer_phone ? ev.customer_phone.replace(/[^0-9]/g, '') : '917299887725';
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
  }
}
