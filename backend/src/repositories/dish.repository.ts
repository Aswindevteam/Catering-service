import { Dish, DishImage } from '../types';
import { generateUUID } from '../utils/crypto';

export interface DishQueryParams {
  search?: string;
  category_id?: string;
  food_type?: string;
  availability?: number;
  page?: number;
  limit?: number;
}

export class DishRepository {
  constructor(private db: D1Database) {}

  async getAll(params: DishQueryParams = {}): Promise<{ dishes: Dish[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 20));
    const offset = (page - 1) * limit;

    const conditions: string[] = ['d.is_deleted = 0'];
    const bindings: any[] = [];

    if (params.search) {
      conditions.push('(d.name LIKE ? OR d.description LIKE ?)');
      bindings.push(`%${params.search}%`, `%${params.search}%`);
    }
    if (params.category_id && params.category_id !== 'all') {
      conditions.push('d.category_id = ?');
      bindings.push(params.category_id);
    }
    if (params.food_type && params.food_type !== 'all') {
      conditions.push('d.food_type = ?');
      bindings.push(params.food_type);
    }
    if (params.availability !== undefined && params.availability !== null) {
      conditions.push('d.availability = ?');
      bindings.push(params.availability);
    }

    const whereClause = conditions.join(' AND ');

    // Count query
    const countSql = `SELECT COUNT(*) as total FROM dishes d WHERE ${whereClause}`;
    const countRes = await this.db.prepare(countSql).bind(...bindings).first<{ total: number }>();
    const total = countRes?.total || 0;

    // Data query with category join and primary image join
    const dataSql = `
      SELECT 
        d.*,
        c.name as category_name,
        (
          SELECT di.image_url 
          FROM dish_images di 
          WHERE di.dish_id = d.id 
          ORDER BY di.is_primary DESC, di.display_order ASC 
          LIMIT 1
        ) as primary_image_url
      FROM dishes d
      LEFT JOIN food_categories c ON c.id = d.category_id
      WHERE ${whereClause}
      ORDER BY d.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const dataRes = await this.db.prepare(dataSql).bind(...bindings, limit, offset).all<Dish>();
    const dishes = dataRes.results || [];

    return { dishes, total, page, limit };
  }

  async getById(id: string): Promise<Dish | null> {
    const sql = `
      SELECT 
        d.*,
        c.name as category_name,
        (
          SELECT di.image_url 
          FROM dish_images di 
          WHERE di.dish_id = d.id 
          ORDER BY di.is_primary DESC, di.display_order ASC 
          LIMIT 1
        ) as primary_image_url
      FROM dishes d
      LEFT JOIN food_categories c ON c.id = d.category_id
      WHERE d.id = ? AND d.is_deleted = 0
    `;
    const dish = await this.db.prepare(sql).bind(id).first<Dish>();
    if (!dish) return null;

    // Get images
    const imagesSql = `
      SELECT * FROM dish_images 
      WHERE dish_id = ? 
      ORDER BY is_primary DESC, display_order ASC
    `;
    const imagesRes = await this.db.prepare(imagesSql).bind(id).all<DishImage>();
    dish.images = imagesRes.results || [];

    return dish;
  }

  async create(data: {
    name: string;
    category_id: string;
    description?: string;
    food_type?: 'veg' | 'non-veg' | 'vegan';
    price_per_person: number;
    quantity_per_person?: number;
    serving_unit?: string;
    min_order_quantity?: number;
    prep_time?: string;
    availability?: number;
    images?: { image_r2_key: string; image_url: string; is_primary?: number }[];
  }): Promise<Dish> {
    const id = generateUUID();
    const insertSql = `
      INSERT INTO dishes (
        id, name, category_id, description, food_type,
        price_per_person, quantity_per_person, serving_unit,
        min_order_quantity, prep_time, availability,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `;

    await this.db.prepare(insertSql).bind(
      id,
      data.name,
      data.category_id,
      data.description || null,
      data.food_type || 'veg',
      data.price_per_person,
      data.quantity_per_person ?? 100,
      data.serving_unit || 'g',
      data.min_order_quantity ?? 50,
      data.prep_time || '20 mins',
      data.availability ?? 1
    ).run();

    // Insert images if provided
    if (data.images && data.images.length > 0) {
      for (let i = 0; i < data.images.length; i++) {
        const img = data.images[i];
        await this.addImage(id, {
          image_r2_key: img.image_r2_key,
          image_url: img.image_url,
          is_primary: img.is_primary !== undefined ? img.is_primary : (i === 0 ? 1 : 0),
          display_order: i + 1,
        });
      }
    }

    const created = await this.getById(id);
    if (!created) throw new Error('Failed to retrieve newly created dish');
    return created;
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      category_id: string;
      description: string;
      food_type: 'veg' | 'non-veg' | 'vegan';
      price_per_person: number;
      quantity_per_person: number;
      serving_unit: string;
      min_order_quantity: number;
      prep_time: string;
      availability: number;
    }>
  ): Promise<Dish | null> {
    const current = await this.getById(id);
    if (!current) return null;

    const fields: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.category_id !== undefined) {
      fields.push('category_id = ?');
      values.push(data.category_id);
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      values.push(data.description);
    }
    if (data.food_type !== undefined) {
      fields.push('food_type = ?');
      values.push(data.food_type);
    }
    if (data.price_per_person !== undefined) {
      fields.push('price_per_person = ?');
      values.push(data.price_per_person);
    }
    if (data.quantity_per_person !== undefined) {
      fields.push('quantity_per_person = ?');
      values.push(data.quantity_per_person);
    }
    if (data.serving_unit !== undefined) {
      fields.push('serving_unit = ?');
      values.push(data.serving_unit);
    }
    if (data.min_order_quantity !== undefined) {
      fields.push('min_order_quantity = ?');
      values.push(data.min_order_quantity);
    }
    if (data.prep_time !== undefined) {
      fields.push('prep_time = ?');
      values.push(data.prep_time);
    }
    if (data.availability !== undefined) {
      fields.push('availability = ?');
      values.push(data.availability);
    }

    if (fields.length > 0) {
      fields.push("updated_at = datetime('now')");
      values.push(id);
      const sql = `UPDATE dishes SET ${fields.join(', ')} WHERE id = ?`;
      await this.db.prepare(sql).bind(...values).run();
    }

    return await this.getById(id);
  }

  async delete(id: string): Promise<boolean> {
    const sql = `UPDATE dishes SET is_deleted = 1, updated_at = datetime('now') WHERE id = ?`;
    const res = await this.db.prepare(sql).bind(id).run();
    return (res.meta?.changes ?? 0) > 0;
  }

  async addImage(
    dishId: string,
    data: {
      image_r2_key: string;
      image_url: string;
      is_primary?: number;
      display_order?: number;
      file_name?: string;
      file_size?: number;
      mime_type?: string;
    }
  ): Promise<DishImage> {
    const id = generateUUID();

    // If marked primary, unset other primaries
    if (data.is_primary === 1) {
      await this.db.prepare('UPDATE dish_images SET is_primary = 0 WHERE dish_id = ?').bind(dishId).run();
    }

    const sql = `
      INSERT INTO dish_images (
        id, dish_id, image_r2_key, image_url, is_primary, display_order, file_name, file_size, mime_type, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `;

    await this.db.prepare(sql).bind(
      id,
      dishId,
      data.image_r2_key,
      data.image_url,
      data.is_primary ?? 0,
      data.display_order ?? 0,
      data.file_name || null,
      data.file_size || null,
      data.mime_type || null
    ).run();

    const created = await this.db.prepare('SELECT * FROM dish_images WHERE id = ?').bind(id).first<DishImage>();
    if (!created) throw new Error('Failed to retrieve newly added image');
    return created;
  }

  async deleteImage(dishId: string, imageId: string): Promise<{ success: boolean; imageKey?: string }> {
    const img = await this.db.prepare('SELECT * FROM dish_images WHERE id = ? AND dish_id = ?')
      .bind(imageId, dishId).first<DishImage>();
    if (!img) return { success: false };

    await this.db.prepare('DELETE FROM dish_images WHERE id = ?').bind(imageId).run();

    // If was primary, promote next available
    if (img.is_primary) {
      await this.db.prepare(`
        UPDATE dish_images 
        SET is_primary = 1 
        WHERE id = (SELECT id FROM dish_images WHERE dish_id = ? ORDER BY display_order ASC LIMIT 1)
      `).bind(dishId).run();
    }

    return { success: true, imageKey: img.image_r2_key };
  }
}
