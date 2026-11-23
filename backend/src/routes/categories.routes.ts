import { Hono } from 'hono';
import { Env } from '../types';
import { CategoryRepository } from '../repositories/category.repository';
import { R2StorageService } from '../services/r2-storage';
import { adminAuthMiddleware } from '../middleware/auth';

const categoriesApp = new Hono<{ Bindings: Env; Variables: { user: any } }>();

// Public endpoint for listing categories
categoriesApp.get('/', async (c) => {
  const repo = new CategoryRepository(c.env.DB);
  const activeOnly = c.req.query('active_only') === 'true';
  const categories = await repo.getAll(!activeOnly);
  return c.json({ success: true, data: categories });
});

categoriesApp.get('/:id', async (c) => {
  const repo = new CategoryRepository(c.env.DB);
  const id = c.req.param('id') || '';
  const category = await repo.getById(id);
  if (!category) {
    return c.json({ success: false, error: 'Category not found' }, 404);
  }
  return c.json({ success: true, data: category });
});

// Admin endpoints
categoriesApp.post('/', adminAuthMiddleware, async (c) => {
  try {
    const body = await c.req.json();
    if (!body.name) {
      return c.json({ success: false, error: 'Category name is required' }, 400);
    }
    const repo = new CategoryRepository(c.env.DB);
    const category = await repo.create(body);
    return c.json({ success: true, data: category }, 201);
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

categoriesApp.put('/:id', adminAuthMiddleware, async (c) => {
  try {
    const id = c.req.param('id') || '';
    const body = await c.req.json();
    const repo = new CategoryRepository(c.env.DB);
    const updated = await repo.update(id, body);
    if (!updated) {
      return c.json({ success: false, error: 'Category not found' }, 404);
    }
    return c.json({ success: true, data: updated });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

categoriesApp.delete('/:id', adminAuthMiddleware, async (c) => {
  try {
    const id = c.req.param('id') || '';
    const repo = new CategoryRepository(c.env.DB);
    const success = await repo.delete(id);
    if (!success) {
      return c.json({ success: false, error: 'Category not found or could not be deleted' }, 404);
    }
    return c.json({ success: true, message: 'Category deleted successfully' });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// Category image upload to R2
categoriesApp.post('/:id/image', adminAuthMiddleware, async (c) => {
  try {
    const id = c.req.param('id') || '';
    const repo = new CategoryRepository(c.env.DB);
    const category = await repo.getById(id);
    if (!category) {
      return c.json({ success: false, error: 'Category not found' }, 404);
    }

    const formData = await c.req.parseBody();
    const file = formData['file'];
    if (!file || !(file instanceof File)) {
      return c.json({ success: false, error: 'File is required in multipart/form-data' }, 400);
    }

    const arrayBuffer = await file.arrayBuffer();
    const r2Service = new R2StorageService(c.env);
    const uploadResult = await r2Service.uploadImage(arrayBuffer, {
      folder: 'categories',
      originalFileName: file.name,
      contentType: file.type,
    });

    // Delete old image from R2 if present
    if (category.image_r2_key) {
      await r2Service.deleteImage(category.image_r2_key);
    }

    const updated = await repo.update(id, {
      image_r2_key: uploadResult.key,
      image_url: uploadResult.url,
    });

    return c.json({ success: true, data: updated });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

export default categoriesApp;
