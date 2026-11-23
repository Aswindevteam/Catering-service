import { Hono } from 'hono';
import { Env, WeddingEvent } from '../types';
import { SelectionRepository } from '../repositories/selection.repository';
import { adminAuthMiddleware } from '../middleware/auth';

const eventsApp = new Hono<{ Bindings: Env; Variables: { user: any } }>();

eventsApp.post('/', async (c) => {
  try {
    const body = await c.req.json();
    if (!body.customer_name || !body.event_name || !body.event_date || !body.guest_count) {
      return c.json({ success: false, error: 'Customer name, event name, date, and guest count are required' }, 400);
    }
    const repo = new SelectionRepository(c.env.DB);
    const event = await repo.createEvent(body);
    return c.json({ success: true, data: event }, 201);
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

eventsApp.get('/:id', async (c) => {
  const id = c.req.param('id');
  const event = await c.env.DB.prepare('SELECT * FROM events WHERE id = ?').bind(id).first<WeddingEvent>();
  if (!event) {
    return c.json({ success: false, error: 'Event not found' }, 404);
  }
  return c.json({ success: true, data: event });
});

eventsApp.get('/', adminAuthMiddleware, async (c) => {
  const res = await c.env.DB.prepare('SELECT * FROM events ORDER BY created_at DESC').all<WeddingEvent>();
  return c.json({ success: true, data: res.results || [] });
});

export default eventsApp;
