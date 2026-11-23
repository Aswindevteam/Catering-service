import { Hono } from 'hono';
import { Env } from '../types';
import { PricingRepository } from '../repositories/pricing.repository';
import { adminAuthMiddleware } from '../middleware/auth';
import { calculateEstimation, CalculationInputDish } from '../utils/calculator';

const pricingApp = new Hono<{ Bindings: Env; Variables: { user: any } }>();

// Get estimation settings (public / customer & admin)
pricingApp.get('/', async (c) => {
  const repo = new PricingRepository(c.env.DB);
  const settings = await repo.getSettings();
  return c.json({ success: true, data: settings });
});

// Admin update settings
pricingApp.put('/', adminAuthMiddleware, async (c) => {
  try {
    const body = await c.req.json();
    const repo = new PricingRepository(c.env.DB);
    const updated = await repo.updateSettings(body);
    return c.json({ success: true, data: updated });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// Preview calculation based on hypothetical or customized parameters
pricingApp.post('/preview', async (c) => {
  try {
    const body = await c.req.json();
    const repo = new PricingRepository(c.env.DB);
    const currentSettings = await repo.getSettings();

    // Use passed settings or current settings
    const settings = {
      ...currentSettings,
      ...(body.settings || {}),
    };

    const sampleDishes: CalculationInputDish[] = body.dishes || [
      {
        dish_id: 'sample_1',
        name: 'Paneer Butter Masala',
        category_id: 'cat_main',
        category_name: 'Main Course',
        food_type: 'veg',
        price_per_person: 12000,
        quantity_per_person: 100,
        serving_unit: 'g',
      },
    ];

    const guestCount = Number(body.guest_count || 100);
    const result = calculateEstimation(sampleDishes, guestCount, settings);

    return c.json({ success: true, data: result });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

export default pricingApp;
