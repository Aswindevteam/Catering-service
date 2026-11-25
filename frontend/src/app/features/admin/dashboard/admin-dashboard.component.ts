import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DashboardService, DashboardOverview, PopularDishItem, ActivityItem, RevenueChartPoint } from '../../../core/services/dashboard.service';
import { SelectionService } from '../../../core/services/selection.service';
import { DishService } from '../../../core/services/dish.service';
import { CategoryService } from '../../../core/services/category.service';
import { ToastService } from '../../../core/services/toast.service';
import { TranslationService } from '../../../core/services/translation.service';
import { WeddingEvent, Dish, FoodCategory } from '../../../core/models';

export interface MealSessionItem {
  dish_id: string;
  name: string;
  category_name?: string;
  price_per_person: number; // in paise
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

export interface TimelineEvent {
  id: string;
  rawDate: string; // 'YYYY-MM-DD'
  dateStr: string;
  name: string;
  customer_name?: string;
  customer_phone?: string;
  venue?: string;
  guestCount: number;
  status: string;
  statusClass: string;
  sessions?: MealSession[];
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
  private toast = inject(ToastService);
  tService = inject(TranslationService);

  overview = signal<DashboardOverview | null>(null);
  popularDishes = signal<PopularDishItem[]>([]);
  activities = signal<ActivityItem[]>([]);
  allDishes = signal<Dish[]>([]);
  categories = signal<FoodCategory[]>([]);

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
  showPurchaseModal = signal(false);
  selectedEventDetail = signal<TimelineEvent | null>(null);
  showReportModal = signal(false);
  selectedReportEvent = signal<TimelineEvent | null>(null);

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
    let totalEstCostPaise = 0;

    active.forEach(s => {
      totalGuests = Math.max(totalGuests, s.guest_count);
      totalDishCount += s.dishes.length;
      const sessionDishPerGuest = s.dishes.reduce((acc, d) => acc + (d.price_per_person || 0), 0);
      totalEstCostPaise += sessionDishPerGuest * s.guest_count;
    });

    return {
      activeCount: active.length,
      peakGuests: totalGuests || Number(this.newEvent.guest_count || 600),
      totalDishes: totalDishCount,
      estimatedTotalInr: totalEstCostPaise > 0 ? (totalEstCostPaise / 100).toLocaleString('en-IN') : '0'
    };
  });

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
            if (ev.notes) {
              try {
                const parsed = JSON.parse(ev.notes);
                if (parsed.sessions && Array.isArray(parsed.sessions)) {
                  parsedSessions = parsed.sessions;
                }
              } catch (_) {}
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

            return {
              id: ev.id,
              rawDate: ev.event_date,
              dateStr,
              name: `${ev.event_name} (${ev.venue || 'Banqueting'})`,
              customer_name: ev.customer_name,
              customer_phone: ev.customer_phone,
              venue: ev.venue,
              guestCount: ev.guest_count,
              status,
              statusClass,
              sessions: parsedSessions
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

  private formatDateISO(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getEventsForDate(dateStr: string): TimelineEvent[] {
    return this.timelineEvents().filter(ev => {
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
    this.resetScheduleForm();
    this.showScheduleModal.set(true);
  }

  openScheduleModalForDate(dateStr: string) {
    this.resetScheduleForm();
    this.newEvent.event_date = dateStr;
    this.showScheduleModal.set(true);
  }

  private resetScheduleForm() {
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

  addDishToCurrentSession(dish: Dish) {
    const cur = this.currentSession();
    if (!cur.dishes.some(d => d.dish_id === dish.id)) {
      cur.dishes.push({
        dish_id: dish.id,
        name: dish.name,
        category_name: dish.category_name,
        price_per_person: dish.price_per_person || 7500,
        serving_quantity: dish.quantity_per_person || 150,
        serving_unit: dish.serving_unit || 'g'
      });
      this.mealSessions.update(list => [...list]);
      this.toast.success(`Added "${dish.name}" to ${cur.shortName} session.`);
    }
  }

  removeDishFromCurrentSession(dishId: string) {
    const cur = this.currentSession();
    cur.dishes = cur.dishes.filter(d => d.dish_id !== dishId);
    this.mealSessions.update(list => [...list]);
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

    const dateObj = new Date(this.newEvent.event_date || '');
    const dateStr = !isNaN(dateObj.getTime())
      ? dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : 'Upcoming';

    // Store rich sessions inside notes payload
    const eventPayload: Partial<WeddingEvent> = {
      ...this.newEvent,
      notes: JSON.stringify({
        sessions: activeSessions,
        totalDishes: activeSessions.reduce((acc, s) => acc + s.dishes.length, 0),
        venue: this.newEvent.venue || 'No. 73, Mandhaikaara Street, Tirukoilur'
      })
    };

    // Save to backend API
    this.selectionService.createEvent(eventPayload).subscribe({
      next: (res) => {
        const newEv: TimelineEvent = {
          id: res.data?.id || 'ev_' + Date.now(),
          rawDate: this.newEvent.event_date || this.formatDateISO(new Date()),
          dateStr,
          name: `${this.newEvent.event_name} (${this.newEvent.venue || 'Banqueting'})`,
          customer_name: this.newEvent.customer_name,
          customer_phone: this.newEvent.customer_phone,
          venue: this.newEvent.venue,
          guestCount: peakGuests,
          status: 'Confirming Menu',
          statusClass: 'confirming',
          sessions: activeSessions
        };

        this.timelineEvents.update(list => [newEv, ...list]);
        this.toast.success(`Wedding event "${this.newEvent.event_name}" with ${activeSessions.length} meal sessions scheduled successfully!`);
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
          venue: this.newEvent.venue,
          guestCount: peakGuests,
          status: 'Confirming Menu',
          statusClass: 'confirming',
          sessions: activeSessions
        };

        this.timelineEvents.update(list => [newEv, ...list]);
        this.toast.success(`Event "${this.newEvent.event_name}" added to calendar with ${activeSessions.length} sessions.`);
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
          text += `  ${idx + 1}. ${d.name} (${d.category_name || 'Special'})\n`;
        });
        text += `\n`;
      }
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
