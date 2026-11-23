import { Hono } from 'hono';
import { Env } from '../types';
import { DashboardRepository } from '../repositories/dashboard.repository';
import { adminAuthMiddleware } from '../middleware/auth';

const dashboardApp = new Hono<{ Bindings: Env; Variables: { user: any } }>();

dashboardApp.use('*', adminAuthMiddleware);

dashboardApp.get('/overview', async (c) => {
  const repo = new DashboardRepository(c.env.DB);
  const data = await repo.getOverview();
  return c.json({ success: true, data });
});

dashboardApp.get('/popular-dishes', async (c) => {
  const repo = new DashboardRepository(c.env.DB);
  const data = await repo.getPopularDishes();
  return c.json({ success: true, data });
});

dashboardApp.get('/revenue', async (c) => {
  const repo = new DashboardRepository(c.env.DB);
  const data = await repo.getRevenueChart();
  return c.json({ success: true, data });
});

dashboardApp.get('/activities', async (c) => {
  const repo = new DashboardRepository(c.env.DB);
  const data = await repo.getRecentActivities();
  return c.json({ success: true, data });
});

export default dashboardApp;
