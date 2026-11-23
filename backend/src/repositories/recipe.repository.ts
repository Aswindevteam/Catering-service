import { Recipe, RecipeIngredient, RecipeStep } from '../types';
import { generateUUID } from '../utils/crypto';

export class RecipeRepository {
  constructor(private db: D1Database) {}

  async getAll(): Promise<Recipe[]> {
    const sql = `
      SELECT r.*, d.name as dish_name, d.food_type, d.price_per_person, d.prep_time as dish_prep_time,
        (
          SELECT di.image_url 
          FROM dish_images di 
          WHERE di.dish_id = d.id 
          ORDER BY di.is_primary DESC, di.display_order ASC 
          LIMIT 1
        ) as primary_image_url
      FROM recipes r
      JOIN dishes d ON d.id = r.dish_id
      WHERE d.is_deleted = 0
      ORDER BY r.created_at DESC
    `;
    const res = await this.db.prepare(sql).all<Recipe>();
    const recipes = res.results || [];

    for (const recipe of recipes) {
      recipe.ingredients = await this.getIngredients(recipe.id);
      recipe.steps = await this.getSteps(recipe.id);
    }

    return recipes;
  }

  async getByDishId(dishId: string): Promise<Recipe | null> {
    const sql = `
      SELECT r.*, d.name as dish_name, d.food_type, d.price_per_person, d.prep_time as dish_prep_time,
        (
          SELECT di.image_url 
          FROM dish_images di 
          WHERE di.dish_id = d.id 
          ORDER BY di.is_primary DESC, di.display_order ASC 
          LIMIT 1
        ) as primary_image_url
      FROM recipes r
      JOIN dishes d ON d.id = r.dish_id
      WHERE r.dish_id = ? AND d.is_deleted = 0
    `;
    const recipe = await this.db.prepare(sql).bind(dishId).first<Recipe>();
    if (!recipe) return null;

    recipe.ingredients = await this.getIngredients(recipe.id);
    recipe.steps = await this.getSteps(recipe.id);
    return recipe;
  }

  async getById(id: string): Promise<Recipe | null> {
    const sql = `
      SELECT r.*, d.name as dish_name, d.food_type, d.price_per_person, d.prep_time as dish_prep_time,
        (
          SELECT di.image_url 
          FROM dish_images di 
          WHERE di.dish_id = d.id 
          ORDER BY di.is_primary DESC, di.display_order ASC 
          LIMIT 1
        ) as primary_image_url
      FROM recipes r
      JOIN dishes d ON d.id = r.dish_id
      WHERE r.id = ? AND d.is_deleted = 0
    `;
    const recipe = await this.db.prepare(sql).bind(id).first<Recipe>();
    if (!recipe) return null;

    recipe.ingredients = await this.getIngredients(recipe.id);
    recipe.steps = await this.getSteps(recipe.id);
    return recipe;
  }

  async getIngredients(recipeId: string): Promise<RecipeIngredient[]> {
    const sql = `SELECT * FROM recipe_ingredients WHERE recipe_id = ? ORDER BY display_order ASC, created_at ASC`;
    const res = await this.db.prepare(sql).bind(recipeId).all<RecipeIngredient>();
    return res.results || [];
  }

  async getSteps(recipeId: string): Promise<RecipeStep[]> {
    const sql = `SELECT * FROM recipe_steps WHERE recipe_id = ? ORDER BY step_number ASC`;
    const res = await this.db.prepare(sql).bind(recipeId).all<RecipeStep>();
    return res.results || [];
  }

  async saveOrUpdate(data: {
    dish_id: string;
    title?: string;
    description?: string;
    cooking_time?: number;
    prep_time?: number;
    servings?: number;
    ingredients?: { name: string; quantity: number; unit: string; notes?: string }[];
    steps?: { step_number: number; instruction: string }[];
  }): Promise<Recipe> {
    let recipe = await this.getByDishId(data.dish_id);
    const recipeId = recipe?.id || generateUUID();

    if (!recipe) {
      // Insert new
      const insertSql = `
        INSERT INTO recipes (id, dish_id, title, description, cooking_time, prep_time, servings, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `;
      await this.db.prepare(insertSql).bind(
        recipeId,
        data.dish_id,
        data.title || null,
        data.description || null,
        data.cooking_time ?? 30,
        data.prep_time ?? 15,
        data.servings ?? 10
      ).run();
    } else {
      // Update
      const updateSql = `
        UPDATE recipes 
        SET title = ?, description = ?, cooking_time = ?, prep_time = ?, servings = ?, updated_at = datetime('now')
        WHERE id = ?
      `;
      await this.db.prepare(updateSql).bind(
        data.title ?? recipe.title,
        data.description ?? recipe.description,
        data.cooking_time ?? recipe.cooking_time,
        data.prep_time ?? recipe.prep_time,
        data.servings ?? recipe.servings,
        recipeId
      ).run();
    }

    // Replace ingredients if provided
    if (data.ingredients !== undefined) {
      await this.db.prepare('DELETE FROM recipe_ingredients WHERE recipe_id = ?').bind(recipeId).run();
      for (let i = 0; i < data.ingredients.length; i++) {
        const ing = data.ingredients[i];
        const ingId = generateUUID();
        await this.db.prepare(`
          INSERT INTO recipe_ingredients (id, recipe_id, name, quantity, unit, notes, display_order, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
        `).bind(
          ingId,
          recipeId,
          ing.name,
          ing.quantity,
          ing.unit || 'g',
          ing.notes || null,
          i + 1
        ).run();
      }
    }

    // Replace steps if provided
    if (data.steps !== undefined) {
      await this.db.prepare('DELETE FROM recipe_steps WHERE recipe_id = ?').bind(recipeId).run();
      for (let i = 0; i < data.steps.length; i++) {
        const step = data.steps[i];
        const stepId = generateUUID();
        await this.db.prepare(`
          INSERT INTO recipe_steps (id, recipe_id, step_number, instruction, created_at)
          VALUES (?, ?, ?, ?, datetime('now'))
        `).bind(
          stepId,
          recipeId,
          step.step_number || (i + 1),
          step.instruction
        ).run();
      }
    }

    const saved = await this.getById(recipeId);
    if (!saved) throw new Error('Failed to retrieve saved recipe');
    return saved;
  }

  async delete(id: string): Promise<boolean> {
    const res = await this.db.prepare('DELETE FROM recipes WHERE id = ?').bind(id).run();
    return (res.meta?.changes ?? 0) > 0;
  }
}
