import { EstimationSettings } from '../types';
import { generateUUID } from '../utils/crypto';

export class PricingRepository {
  constructor(private db: D1Database) {}

  async getSettings(): Promise<EstimationSettings> {
    const sql = `SELECT * FROM estimation_settings WHERE is_active = 1 LIMIT 1`;
    const settings = await this.db.prepare(sql).first<EstimationSettings>();
    if (settings) return settings;

    // Fallback if table is empty
    const id = generateUUID();
    const insertSql = `
      INSERT INTO estimation_settings (
        id, setting_key, default_serving_quantity, currency, currency_symbol,
        service_charge_rate, service_charge_enabled,
        transportation_charge, transportation_enabled,
        gst_rate, gst_enabled, min_guests, is_active, updated_at
      ) VALUES (?, 'default', 100, 'INR', '₹', 5.0, 1, 200000, 1, 5.0, 1, 50, 1, datetime('now'))
    `;
    await this.db.prepare(insertSql).bind(id).run();
    const created = await this.db.prepare(sql).first<EstimationSettings>();
    return created!;
  }

  async updateSettings(data: Partial<{
    default_serving_quantity: number;
    currency: string;
    currency_symbol: string;
    service_charge_rate: number;
    service_charge_enabled: number;
    transportation_charge: number;
    transportation_enabled: number;
    gst_rate: number;
    gst_enabled: number;
    min_guests: number;
  }>): Promise<EstimationSettings> {
    const current = await this.getSettings();

    const fields: string[] = [];
    const values: any[] = [];

    if (data.default_serving_quantity !== undefined) {
      fields.push('default_serving_quantity = ?');
      values.push(data.default_serving_quantity);
    }
    if (data.currency !== undefined) {
      fields.push('currency = ?');
      values.push(data.currency);
    }
    if (data.currency_symbol !== undefined) {
      fields.push('currency_symbol = ?');
      values.push(data.currency_symbol);
    }
    if (data.service_charge_rate !== undefined) {
      fields.push('service_charge_rate = ?');
      values.push(data.service_charge_rate);
    }
    if (data.service_charge_enabled !== undefined) {
      fields.push('service_charge_enabled = ?');
      values.push(data.service_charge_enabled);
    }
    if (data.transportation_charge !== undefined) {
      fields.push('transportation_charge = ?');
      values.push(data.transportation_charge);
    }
    if (data.transportation_enabled !== undefined) {
      fields.push('transportation_enabled = ?');
      values.push(data.transportation_enabled);
    }
    if (data.gst_rate !== undefined) {
      fields.push('gst_rate = ?');
      values.push(data.gst_rate);
    }
    if (data.gst_enabled !== undefined) {
      fields.push('gst_enabled = ?');
      values.push(data.gst_enabled);
    }
    if (data.min_guests !== undefined) {
      fields.push('min_guests = ?');
      values.push(data.min_guests);
    }

    if (fields.length > 0) {
      fields.push("updated_at = datetime('now')");
      values.push(current.id);
      const sql = `UPDATE estimation_settings SET ${fields.join(', ')} WHERE id = ?`;
      await this.db.prepare(sql).bind(...values).run();
    }

    return await this.getSettings();
  }
}
