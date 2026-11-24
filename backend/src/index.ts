import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Env } from './types';
import authApp from './routes/auth.routes';
import categoriesApp from './routes/categories.routes';
import dishesApp from './routes/dishes.routes';
import recipesApp from './routes/recipes.routes';
import pricingApp from './routes/pricing.routes';
import eventsApp from './routes/events.routes';
import selectionsApp from './routes/selections.routes';
import dashboardApp from './routes/dashboard.routes';
import imagesApp from './routes/images.routes';

const app = new Hono<{ Bindings: Env }>();

// Global CORS Middleware
app.use(
  '/api/*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposeHeaders: ['Content-Length', 'ETag'],
    maxAge: 86400,
  })
);

// Health check endpoint
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'Thirumala Catering Service Platform API',
    environment: c.env.ENVIRONMENT || 'development',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.route('/api/auth', authApp);
app.route('/api/categories', categoriesApp);
app.route('/api/dishes', dishesApp);
app.route('/api/recipes', recipesApp);
app.route('/api/pricing-settings', pricingApp);
app.route('/api/events', eventsApp);
app.route('/api/selections', selectionsApp);
app.route('/api/dashboard', dashboardApp);
app.route('/api/images', imagesApp);

// 404 handler
app.notFound((c) => {
  return c.json({ success: false, error: 'Endpoint not found' }, 404);
});

// Global Error Handler
app.onError((err, c) => {
  console.error('Unhandled Worker error:', err);
  return c.json({
    success: false,
    error: err.message || 'Internal Server Error',
  }, 500);
});

export default app;
