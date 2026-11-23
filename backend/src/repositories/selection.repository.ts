import { CustomerSelection, CustomerSelectionItem, WeddingEvent } from '../types';
import { generateUUID } from '../utils/crypto';
import { calculateEstimation, CalculationInputDish } from '../utils/calculator';
import { PricingRepository } from './pricing.repository';

export interface CreateEventInput {
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  event_name: string;
  event_type: string;
  event_date: string;
  venue: string;
  guest_count: number;
  notes?: string;
}

export interface CreateSelectionInput {
  event: CreateEventInput;
  selected_dishes: {
    dish_id: string;
    quantity_per_person?: number;
  }[];
  special_requests?: string;
}

export class SelectionRepository {
  private pricingRepo: PricingRepository;

  constructor(private db: D1Database) {
    this.pricingRepo = new PricingRepository(db);
  }

  async createEvent(input: CreateEventInput): Promise<WeddingEvent> {
    const id = generateUUID();
    const sql = `
      INSERT INTO events (id, customer_name, customer_phone, customer_email, event_name, event_type, event_date, venue, guest_count, status, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, datetime('now'), datetime('now'))
    `;
    await this.db.prepare(sql).bind(
      id,
      input.customer_name,
      input.customer_phone,
      input.customer_email,
      input.event_name,
      input.event_type,
      input.event_date,
      input.venue,
      input.guest_count,
      input.notes || null
    ).run();

    const created = await this.db.prepare('SELECT * FROM events WHERE id = ?').bind(id).first<WeddingEvent>();
    if (!created) throw new Error('Failed to retrieve newly created event');
    return created;
  }

  async createSelection(input: CreateSelectionInput): Promise<CustomerSelection> {
    // 1. Fetch active pricing settings from DB
    const settings = await this.pricingRepo.getSettings();

    // 2. Fetch all selected dishes from DB to ensure prices and metadata cannot be spoofed
    const dishIds = input.selected_dishes.map(d => d.dish_id);
    if (dishIds.length === 0) {
      throw new Error('At least one dish must be selected');
    }

    const placeholders = dishIds.map(() => '?').join(',');
    const dishesSql = `
      SELECT d.*, c.name as category_name
      FROM dishes d
      LEFT JOIN food_categories c ON c.id = d.category_id
      WHERE d.id IN (${placeholders}) AND d.is_deleted = 0
    `;
    const dishesRes = await this.db.prepare(dishesSql).bind(...dishIds).all<any>();
    const dbDishes = dishesRes.results || [];

    if (dbDishes.length === 0) {
      throw new Error('Selected dishes not found');
    }

    const dishMap = new Map(dbDishes.map(d => [d.id, d]));

    // Build calculation input
    const calculationInput: CalculationInputDish[] = input.selected_dishes.map(sel => {
      const dbDish = dishMap.get(sel.dish_id);
      if (!dbDish) throw new Error(`Dish ID ${sel.dish_id} not found`);
      return {
        dish_id: dbDish.id,
        name: dbDish.name,
        category_id: dbDish.category_id,
        category_name: dbDish.category_name || 'General',
        food_type: dbDish.food_type,
        price_per_person: dbDish.price_per_person,
        base_quantity_per_person: dbDish.quantity_per_person || 1,
        quantity_per_person: sel.quantity_per_person || dbDish.quantity_per_person,
        serving_unit: dbDish.serving_unit,
      };
    });

    // 3. Compute exact totals on backend using integer paise
    const calc = calculateEstimation(calculationInput, input.event.guest_count, settings);

    // 4. Create Event
    const event = await this.createEvent(input.event);

    // 5. Create Selection
    const selectionId = generateUUID();
    const selectionSql = `
      INSERT INTO customer_selections (
        id, event_id, subtotal, service_charge, transportation_charge,
        gst_amount, grand_total, cost_per_guest, status, special_requests,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'submitted', ?, datetime('now'), datetime('now'))
    `;

    await this.db.prepare(selectionSql).bind(
      selectionId,
      event.id,
      calc.subtotal,
      calc.service_charge,
      calc.transportation_charge,
      calc.gst_amount,
      calc.grand_total,
      calc.cost_per_guest,
      input.special_requests || null
    ).run();

    // 6. Insert Selection Items
    for (const item of calc.items) {
      const itemId = generateUUID();
      const itemSql = `
        INSERT INTO customer_selection_items (
          id, selection_id, dish_id, dish_name, category_name,
          price_per_person, quantity_per_person, serving_unit,
          total_guest_count, total_calculated_quantity, total_dish_cost,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `;
      await this.db.prepare(itemSql).bind(
        itemId,
        selectionId,
        item.dish_id,
        item.dish_name,
        item.category_name,
        item.price_per_person,
        item.quantity_per_person,
        item.serving_unit,
        calc.guest_count,
        item.total_dish_quantity,
        item.dish_cost
      ).run();
    }

    const createdSelection = await this.getSelectionById(selectionId);
    if (!createdSelection) throw new Error('Failed to retrieve created selection');
    return createdSelection;
  }

  async getSelectionById(id: string): Promise<CustomerSelection | null> {
    const selectionSql = `SELECT * FROM customer_selections WHERE id = ?`;
    const selection = await this.db.prepare(selectionSql).bind(id).first<CustomerSelection>();
    if (!selection) return null;

    // Get Event
    const eventSql = `SELECT * FROM events WHERE id = ?`;
    const event = await this.db.prepare(eventSql).bind(selection.event_id).first<WeddingEvent>();
    selection.event = event || undefined;

    // Get Items
    const itemsSql = `SELECT * FROM customer_selection_items WHERE selection_id = ? ORDER BY category_name ASC, dish_name ASC`;
    const itemsRes = await this.db.prepare(itemsSql).bind(id).all<CustomerSelectionItem>();
    selection.items = itemsRes.results || [];

    return selection;
  }

  async getAllSelections(): Promise<CustomerSelection[]> {
    const sql = `
      SELECT cs.*, e.customer_name, e.event_name, e.event_date, e.guest_count, e.event_type
      FROM customer_selections cs
      JOIN events e ON e.id = cs.event_id
      ORDER BY cs.created_at DESC
    `;
    const res = await this.db.prepare(sql).all<any>();
    const list = res.results || [];

    return list.map(row => ({
      id: row.id,
      event_id: row.event_id,
      subtotal: row.subtotal,
      service_charge: row.service_charge,
      transportation_charge: row.transportation_charge,
      gst_amount: row.gst_amount,
      grand_total: row.grand_total,
      cost_per_guest: row.cost_per_guest,
      status: row.status,
      special_requests: row.special_requests,
      created_at: row.created_at,
      updated_at: row.updated_at,
      event: {
        id: row.event_id,
        customer_name: row.customer_name,
        customer_phone: '',
        customer_email: '',
        event_name: row.event_name,
        event_type: row.event_type,
        event_date: row.event_date,
        venue: '',
        guest_count: row.guest_count,
        status: row.status,
        notes: null,
        created_at: row.created_at,
        updated_at: row.updated_at
      }
    }));
  }
}
