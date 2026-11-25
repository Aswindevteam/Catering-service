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
  const sql = `
    SELECT e.*, 
           cs.id as selection_id, cs.subtotal, cs.service_charge, cs.transportation_charge,
           cs.gst_amount, cs.grand_total, cs.cost_per_guest, cs.status as selection_status,
           cs.special_requests
    FROM events e
    LEFT JOIN customer_selections cs ON cs.event_id = e.id
    ORDER BY e.event_date ASC, e.created_at DESC
  `;
  const res = await c.env.DB.prepare(sql).all<any>();
  return c.json({ success: true, data: res.results || [] });
});

eventsApp.put('/:id', adminAuthMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const existing = await c.env.DB.prepare('SELECT * FROM events WHERE id = ?').bind(id).first<WeddingEvent>();
    if (!existing) {
      return c.json({ success: false, error: 'Event not found' }, 404);
    }

    const customer_name = body.customer_name ?? existing.customer_name;
    const customer_phone = body.customer_phone ?? existing.customer_phone;
    const customer_email = body.customer_email ?? existing.customer_email;
    const event_name = body.event_name ?? existing.event_name;
    const event_type = body.event_type ?? existing.event_type;
    const event_date = body.event_date ?? existing.event_date;
    const venue = body.venue ?? existing.venue;
    const guest_count = Number(body.guest_count ?? existing.guest_count);
    const status = body.status ?? existing.status;
    const notes = body.notes !== undefined ? (typeof body.notes === 'string' ? body.notes : JSON.stringify(body.notes)) : existing.notes;

    const sql = `
      UPDATE events
      SET customer_name = ?, customer_phone = ?, customer_email = ?, event_name = ?,
          event_type = ?, event_date = ?, venue = ?, guest_count = ?, status = ?,
          notes = ?, updated_at = datetime('now')
      WHERE id = ?
    `;

    await c.env.DB.prepare(sql).bind(
      customer_name,
      customer_phone,
      customer_email,
      event_name,
      event_type,
      event_date,
      venue,
      guest_count,
      status,
      notes,
      id
    ).run();

    // If this event has an associated customer_selections record, sync updated financials too
    if (notes) {
      try {
        const parsedNotes = JSON.parse(notes);
        const fin = parsedNotes?.financials;
        if (fin) {
          const subtotalPaise = fin.foodSubtotalPaise ?? Math.round((fin.foodSubtotal || 0) * 100);
          const servicePaise = fin.serviceChargePaise ?? Math.round((fin.serviceCharge || 0) * 100);
          const transportPaise = fin.transportFeePaise ?? Math.round((fin.transportFee || 0) * 100);
          const gstPaise = fin.gstAmountPaise ?? Math.round((fin.gstAmount || 0) * 100);
          const grandPaise = fin.grandTotalPaise ?? Math.round((fin.grandTotal || 0) * 100);
          const perGuestPaise = fin.perHeadPaise ?? Math.round((fin.perPax || 0) * 100);

          if (grandPaise > 0) {
            await c.env.DB.prepare(`
              UPDATE customer_selections
              SET subtotal = ?, service_charge = ?, transportation_charge = ?,
                  gst_amount = ?, grand_total = ?, cost_per_guest = ?, updated_at = datetime('now')
              WHERE event_id = ?
            `).bind(subtotalPaise, servicePaise, transportPaise, gstPaise, grandPaise, perGuestPaise, id).run();
          }
        }
      } catch {
        // Ignore non-JSON notes
      }
    }

    const result = await c.env.DB.prepare('SELECT * FROM events WHERE id = ?').bind(id).first<WeddingEvent>();
    return c.json({ success: true, data: result });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

eventsApp.delete('/:id', adminAuthMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    await c.env.DB.prepare('DELETE FROM customer_selection_items WHERE selection_id IN (SELECT id FROM customer_selections WHERE event_id = ?)').bind(id).run();
    await c.env.DB.prepare('DELETE FROM customer_selections WHERE event_id = ?').bind(id).run();
    await c.env.DB.prepare('DELETE FROM events WHERE id = ?').bind(id).run();
    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

export default eventsApp;
