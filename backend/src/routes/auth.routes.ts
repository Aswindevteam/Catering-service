import { Hono } from 'hono';
import { Env, AdminUserSafe } from '../types';
import { hashPassword, createJwt } from '../utils/crypto';
import { adminAuthMiddleware } from '../middleware/auth';

const authApp = new Hono<{ Bindings: Env; Variables: { user: any } }>();

authApp.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    const { username, password } = body;

    if (!username || !password) {
      return c.json({ success: false, error: 'Username and password are required' }, 400);
    }

    const user = await c.env.DB.prepare(
      'SELECT * FROM admin_users WHERE (username = ? OR email = ?) AND is_active = 1'
    ).bind(username, username).first<any>();

    if (!user) {
      return c.json({ success: false, error: 'Invalid username or password' }, 401);
    }

    const hashedInput = await hashPassword(password);
    if (hashedInput.toLowerCase() !== user.password_hash.toLowerCase()) {
      return c.json({ success: false, error: 'Invalid username or password' }, 401);
    }

    const secret = c.env.JWT_SECRET || 'wedding-feast-super-secret-key-2026';
    const token = await createJwt({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    }, secret);

    const safeUser: AdminUserSafe = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
    };

    return c.json({
      success: true,
      data: {
        token,
        user: safeUser,
      },
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || 'Login failed' }, 500);
  }
});

authApp.get('/me', adminAuthMiddleware, async (c) => {
  const tokenUser = c.get('user');
  const user = await c.env.DB.prepare(
    'SELECT id, username, email, role, full_name, avatar_url FROM admin_users WHERE id = ?'
  ).bind(tokenUser.id).first<AdminUserSafe>();

  if (!user) {
    return c.json({ success: false, error: 'User not found' }, 404);
  }

  return c.json({ success: true, data: user });
});

export default authApp;
