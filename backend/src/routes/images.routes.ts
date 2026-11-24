import { Hono } from 'hono';
import { Env } from '../types';
import { R2StorageService } from '../services/r2-storage';

const imagesApp = new Hono<{ Bindings: Env }>();

imagesApp.options('/*', () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    },
  });
});

imagesApp.get('/*', async (c) => {
  let path = c.req.path.replace(/^\/api\/images\/?/, '');
  try {
    path = decodeURIComponent(path);
  } catch {}

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
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');

  if (!headers.get('content-type')) {
    if (path.endsWith('.png')) headers.set('content-type', 'image/png');
    else if (path.endsWith('.webp')) headers.set('content-type', 'image/webp');
    else if (path.endsWith('.avif')) headers.set('content-type', 'image/avif');
    else headers.set('content-type', 'image/jpeg');
  }

  if (c.req.header('if-none-match') === object.httpEtag) {
    return new Response(null, { status: 304, headers });
  }

  return new Response(object.body, {
    headers,
  });
});

export default imagesApp;
