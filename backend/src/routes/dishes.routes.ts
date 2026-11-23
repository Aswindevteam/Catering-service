import { Hono } from 'hono';
import { Env } from '../types';
import { DishRepository } from '../repositories/dish.repository';
import { R2StorageService } from '../services/r2-storage';
import { adminAuthMiddleware } from '../middleware/auth';

const dishesApp = new Hono<{ Bindings: Env; Variables: { user: any } }>();

// Public endpoint for browsing dishes
dishesApp.get('/', async (c) => {
  const repo = new DishRepository(c.env.DB);
  const search = c.req.query('search');
  const category_id = c.req.query('category_id');
  const food_type = c.req.query('food_type');
  const availabilityParam = c.req.query('availability');
  const availability = availabilityParam !== undefined && availabilityParam !== '' ? Number(availabilityParam) : undefined;
  const page = Number(c.req.query('page') || '1');
  const limit = Number(c.req.query('limit') || '20');

  const result = await repo.getAll({
    search,
    category_id,
    food_type,
    availability,
    page,
    limit,
  });

  return c.json({ success: true, ...result });
});

dishesApp.get('/:id', async (c) => {
  const repo = new DishRepository(c.env.DB);
  const id = c.req.param('id') || '';
  const dish = await repo.getById(id);
  if (!dish) {
    return c.json({ success: false, error: 'Dish not found' }, 404);
  }
  return c.json({ success: true, data: dish });
});

// Admin endpoints
dishesApp.post('/', adminAuthMiddleware, async (c) => {
  try {
    const body = await c.req.json();
    if (!body.name || !body.category_id || body.price_per_person === undefined) {
      return c.json({ success: false, error: 'Name, category_id, and price_per_person are required' }, 400);
    }
    const repo = new DishRepository(c.env.DB);
    const dish = await repo.create(body);
    return c.json({ success: true, data: dish }, 201);
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

dishesApp.put('/:id', adminAuthMiddleware, async (c) => {
  try {
    const id = c.req.param('id') || '';
    const body = await c.req.json();
    const repo = new DishRepository(c.env.DB);
    const updated = await repo.update(id, body);
    if (!updated) {
      return c.json({ success: false, error: 'Dish not found' }, 404);
    }
    return c.json({ success: true, data: updated });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

dishesApp.delete('/:id', adminAuthMiddleware, async (c) => {
  try {
    const id = c.req.param('id') || '';
    const repo = new DishRepository(c.env.DB);
    const success = await repo.delete(id);
    if (!success) {
      return c.json({ success: false, error: 'Dish not found or could not be deleted' }, 404);
    }
    return c.json({ success: true, message: 'Dish deleted successfully' });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// Dish image upload to R2
dishesApp.post('/:id/images', adminAuthMiddleware, async (c) => {
  try {
    const dishId = c.req.param('id') || '';
    const repo = new DishRepository(c.env.DB);
    const dish = await repo.getById(dishId);
    if (!dish) {
      return c.json({ success: false, error: 'Dish not found' }, 404);
    }

    const formData = await c.req.parseBody();
    const file = formData['file'];
    const isPrimary = formData['is_primary'] === 'true' || formData['is_primary'] === '1' ? 1 : 0;

    if (!file || !(file instanceof File)) {
      return c.json({ success: false, error: 'File is required in multipart/form-data' }, 400);
    }

    const arrayBuffer = await file.arrayBuffer();
    const r2Service = new R2StorageService(c.env);
    const uploadResult = await r2Service.uploadImage(arrayBuffer, {
      folder: 'dishes',
      originalFileName: file.name,
      contentType: file.type,
    });

    const newImage = await repo.addImage(dishId, {
      image_r2_key: uploadResult.key,
      image_url: uploadResult.url,
      is_primary: isPrimary,
      file_name: file.name,
      file_size: uploadResult.size,
      mime_type: uploadResult.mimeType,
    });

    return c.json({ success: true, data: newImage }, 201);
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// Delete specific dish image
dishesApp.delete('/:id/images/:imageId', adminAuthMiddleware, async (c) => {
  try {
    const dishId = c.req.param('id') || '';
    const imageId = c.req.param('imageId') || '';
    const repo = new DishRepository(c.env.DB);
    const result = await repo.deleteImage(dishId, imageId);

    if (!result.success) {
      return c.json({ success: false, error: 'Image not found' }, 404);
    }

    if (result.imageKey) {
      const r2Service = new R2StorageService(c.env);
      await r2Service.deleteImage(result.imageKey);
    }

    return c.json({ success: true, message: 'Image deleted successfully' });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// Upload a general image for dishes without yet binding to a dish ID
dishesApp.post('/upload-image', adminAuthMiddleware, async (c) => {
  try {
    const formData = await c.req.parseBody();
    const file = formData['file'];
    if (!file || !(file instanceof File)) {
      return c.json({ success: false, error: 'File is required in multipart/form-data' }, 400);
    }

    const arrayBuffer = await file.arrayBuffer();
    const r2Service = new R2StorageService(c.env);
    const uploadResult = await r2Service.uploadImage(arrayBuffer, {
      folder: 'dishes',
      originalFileName: file.name,
      contentType: file.type,
    });

    return c.json({ success: true, data: uploadResult }, 201);
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

export default dishesApp;
