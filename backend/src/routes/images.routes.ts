import { Hono } from 'hono';
import { Env } from '../types';
import { R2StorageService } from '../services/r2-storage';

const imagesApp = new Hono<{ Bindings: Env }>();

imagesApp.get('/*', async (c) => {
  const path = c.req.path.replace(/^\/api\/images\//, '');
  if (!path) {
    return c.json({ success: false, error: 'Image path required' }, 400);
  }

  const r2Service = new R2StorageService(c.env);
  const object = await r2Service.getImage(path);

  if (!object) {
    return c.json({ success: false, error: 'Image not found in R2' }, 404);
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('Cache-Control', 'public, max-age=86400, immutable');

  return new Response(object.body, {
    headers,
  });
});

export default imagesApp;
