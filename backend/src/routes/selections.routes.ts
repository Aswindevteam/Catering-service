import { Hono } from 'hono';
import { Env } from '../types';
import { SelectionRepository } from '../repositories/selection.repository';
import { PricingRepository } from '../repositories/pricing.repository';
import { calculateEstimation, CalculationInputDish } from '../utils/calculator';
import { adminAuthMiddleware } from '../middleware/auth';

const selectionsApp = new Hono<{ Bindings: Env; Variables: { user: any } }>();

// Real-time calculation without saving
selectionsApp.post('/calculate', async (c) => {
  try {
    const body = await c.req.json();
    const guestCount = Number(body.guest_count || 100);
    const dishSelections: { dish_id: string; quantity_per_person?: number }[] = body.dish_selections || [];

    const pricingRepo = new PricingRepository(c.env.DB);
    const settings = await pricingRepo.getSettings();

    if (dishSelections.length === 0) {
      return c.json({
        success: true,
        data: {
          guest_count: guestCount,
          items: [],
          subtotal: 0,
          service_charge: 0,
          service_charge_rate: settings.service_charge_rate,
          service_charge_enabled: Boolean(settings.service_charge_enabled),
          transportation_charge: settings.transportation_enabled ? settings.transportation_charge : 0,
          transportation_enabled: Boolean(settings.transportation_enabled),
          taxable_amount: 0,
          gst_amount: 0,
          gst_rate: settings.gst_rate,
          gst_enabled: Boolean(settings.gst_enabled),
          grand_total: 0,
          cost_per_guest: 0,
        },
      });
    }

    const dishIds = dishSelections.map((d) => d.dish_id);
    const placeholders = dishIds.map(() => '?').join(',');
    const dishesSql = `
      SELECT d.*, c.name as category_name
      FROM dishes d
      LEFT JOIN food_categories c ON c.id = d.category_id
      WHERE d.id IN (${placeholders}) AND d.is_deleted = 0
    `;
    const dishesRes = await c.env.DB.prepare(dishesSql).bind(...dishIds).all<any>();
    const dbDishes = dishesRes.results || [];
    const dishMap = new Map(dbDishes.map((d) => [d.id, d]));

    const calculationInput: CalculationInputDish[] = dishSelections
      .map((sel): CalculationInputDish | null => {
        const d = dishMap.get(sel.dish_id);
        if (!d) return null;
        return {
          dish_id: d.id,
          name: d.name,
          category_id: d.category_id,
          category_name: d.category_name || 'General',
          food_type: d.food_type,
          price_per_person: d.price_per_person,
          base_quantity_per_person: d.quantity_per_person || 1,
          quantity_per_person: sel.quantity_per_person || d.quantity_per_person,
          serving_unit: d.serving_unit,
        };
      })
      .filter((x): x is CalculationInputDish => x !== null);

    const result = calculateEstimation(calculationInput, guestCount, settings);

    return c.json({ success: true, data: result });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// Save customer selection
selectionsApp.post('/', async (c) => {
  try {
    const body = await c.req.json();
    if (!body.event || !body.selected_dishes || body.selected_dishes.length === 0) {
      return c.json({ success: false, error: 'Event information and at least one dish are required' }, 400);
    }

    const repo = new SelectionRepository(c.env.DB);
    const selection = await repo.createSelection(body);

    return c.json({ success: true, data: selection }, 201);
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// Get selection by ID
selectionsApp.get('/:id', async (c) => {
  const id = c.req.param('id');
  const repo = new SelectionRepository(c.env.DB);
  const selection = await repo.getSelectionById(id);
  if (!selection) {
    return c.json({ success: false, error: 'Selection not found' }, 404);
  }
  return c.json({ success: true, data: selection });
});

// List all selections (admin only)
selectionsApp.get('/', adminAuthMiddleware, async (c) => {
  const repo = new SelectionRepository(c.env.DB);
  const list = await repo.getAllSelections();
  return c.json({ success: true, data: list });
});

export default selectionsApp;
