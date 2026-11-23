import { Hono } from 'hono';
import { Env } from '../types';
import { RecipeRepository } from '../repositories/recipe.repository';
import { adminAuthMiddleware } from '../middleware/auth';

const recipesApp = new Hono<{ Bindings: Env; Variables: { user: any } }>();

// Get all recipes
recipesApp.get('/', async (c) => {
  const repo = new RecipeRepository(c.env.DB);
  const recipes = await repo.getAll();
  return c.json({ success: true, data: recipes });
});

// Get recipe by dish ID
recipesApp.get('/dish/:dishId', async (c) => {
  const repo = new RecipeRepository(c.env.DB);
  const dishId = c.req.param('dishId');
  const recipe = await repo.getByDishId(dishId);
  if (!recipe) {
    return c.json({ success: false, error: 'Recipe not found for this dish' }, 404);
  }
  return c.json({ success: true, data: recipe });
});

// Get recipe by recipe ID
recipesApp.get('/:id', async (c) => {
  const repo = new RecipeRepository(c.env.DB);
  const id = c.req.param('id') || '';
  const recipe = await repo.getById(id);
  if (!recipe) {
    return c.json({ success: false, error: 'Recipe not found' }, 404);
  }
  return c.json({ success: true, data: recipe });
});

// Admin create or update recipe
recipesApp.post('/', adminAuthMiddleware, async (c) => {
  try {
    const body = await c.req.json();
    if (!body.dish_id) {
      return c.json({ success: false, error: 'dish_id is required' }, 400);
    }
    const repo = new RecipeRepository(c.env.DB);
    const recipe = await repo.saveOrUpdate(body);
    return c.json({ success: true, data: recipe });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// Admin update recipe
recipesApp.put('/:id', adminAuthMiddleware, async (c) => {
  try {
    const id = c.req.param('id') || '';
    const body = await c.req.json();
    const repo = new RecipeRepository(c.env.DB);
    const existing = await repo.getById(id);
    if (!existing) {
      return c.json({ success: false, error: 'Recipe not found' }, 404);
    }
    const updated = await repo.saveOrUpdate({ ...body, dish_id: existing.dish_id });
    return c.json({ success: true, data: updated });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// Admin delete recipe
recipesApp.delete('/:id', adminAuthMiddleware, async (c) => {
  try {
    const id = c.req.param('id') || '';
    const repo = new RecipeRepository(c.env.DB);
    const success = await repo.delete(id);
    if (!success) {
      return c.json({ success: false, error: 'Recipe not found or could not be deleted' }, 404);
    }
    return c.json({ success: true, message: 'Recipe deleted successfully' });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

export default recipesApp;
