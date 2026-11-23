import { Context, Next } from 'hono';
import { verifyJwt } from '../utils/crypto';
import { Env } from '../types';

export async function adminAuthMiddleware(c: Context<{ Bindings: Env; Variables: { user: any } }>, next: Next) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'Unauthorized: missing or invalid Authorization header' }, 401);
  }

  const token = authHeader.substring(7);
  const secret = c.env.JWT_SECRET || 'wedding-feast-super-secret-key-2026';
  const user = await verifyJwt(token, secret);

  if (!user) {
    return c.json({ success: false, error: 'Unauthorized: invalid or expired session token' }, 401);
  }

  c.set('user', user);
  await next();
}
