import { FoodCategory } from '../types';
import { generateUUID } from '../utils/crypto';

export class CategoryRepository {
  constructor(private db: D1Database) {}

  async getAll(includeInactive = true): Promise<FoodCategory[]> {
    let query = `
      SELECT c.*, 
        (SELECT COUNT(*) FROM dishes d WHERE d.category_id = c.id AND d.is_deleted = 0) as dish_count
      FROM food_categories c
      WHERE c.is_deleted = 0
    `;
    if (!includeInactive) {
      query += ` AND c.status = 'active'`;
    }
    query += ` ORDER BY c.display_order ASC, c.name ASC`;

    const result = await this.db.prepare(query).all<FoodCategory>();
    return result.results || [];
  }

  async getById(id: string): Promise<FoodCategory | null> {
    const query = `
      SELECT c.*, 
        (SELECT COUNT(*) FROM dishes d WHERE d.category_id = c.id AND d.is_deleted = 0) as dish_count
      FROM food_categories c
      WHERE c.id = ? AND c.is_deleted = 0
    `;
    const result = await this.db.prepare(query).bind(id).first<FoodCategory>();
    return result || null;
  }

  async create(data: {
    name: string;
    description?: string;
    image_url?: string;
    image_r2_key?: string;
    display_order?: number;
    status?: 'active' | 'inactive';
  }): Promise<FoodCategory> {
    const id = generateUUID();
    const query = `
      INSERT INTO food_categories (id, name, description, image_url, image_r2_key, display_order, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `;
    await this.db.prepare(query).bind(
      id,
      data.name,
      data.description || null,
      data.image_url || null,
      data.image_r2_key || null,
      data.display_order ?? 0,
      data.status || 'active'
    ).run();

    const created = await this.getById(id);
    if (!created) throw new Error('Failed to retrieve newly created category');
    return created;
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      description: string;
      image_url: string;
      image_r2_key: string;
      display_order: number;
      status: 'active' | 'inactive';
    }>
  ): Promise<FoodCategory | null> {
    const current = await this.getById(id);
    if (!current) return null;

    const fields: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      values.push(data.description);
    }
    if (data.image_url !== undefined) {
      fields.push('image_url = ?');
      values.push(data.image_url);
    }
    if (data.image_r2_key !== undefined) {
      fields.push('image_r2_key = ?');
      values.push(data.image_r2_key);
    }
    if (data.display_order !== undefined) {
      fields.push('display_order = ?');
      values.push(data.display_order);
    }
    if (data.status !== undefined) {
      fields.push('status = ?');
      values.push(data.status);
    }

    if (fields.length === 0) return current;

    fields.push("updated_at = datetime('now')");
    values.push(id);

    const query = `UPDATE food_categories SET ${fields.join(', ')} WHERE id = ?`;
    await this.db.prepare(query).bind(...values).run();

    return await this.getById(id);
  }

  async delete(id: string): Promise<boolean> {
    const query = `UPDATE food_categories SET is_deleted = 1, updated_at = datetime('now') WHERE id = ?`;
    const res = await this.db.prepare(query).bind(id).run();
    return (res.meta?.changes ?? 0) > 0;
  }
}
