import type { Context, Next } from 'hono';
import type { Env } from '../types';
import { parseAuthHeader, verifyToken } from '../utils/jwt';
import { UNAUTHORIZED } from '../utils/errors';

export async function authMiddleware(c: Context<{ Bindings: Env }>, next: Next): Promise<Response | void> {
  const token = parseAuthHeader(c.req.header('Authorization'));
  if (!token) return c.json({ success: false, error: UNAUTHORIZED.message, code: UNAUTHORIZED.code }, 401);
  try {
    const payload = await verifyToken(token, c.env.JWT_SECRET);
    c.set('userId', payload.id);
    c.set('user', payload);
    await next();
  } catch {
    return c.json({ success: false, error: UNAUTHORIZED.message, code: UNAUTHORIZED.code }, 401);
  }
}

export function getUserId(c: Context): string {
  const userId = c.get('userId') as string | undefined;
  if (!userId) throw UNAUTHORIZED;
  return userId;
}
