import { Hono } from 'hono';
import type { Env } from '../types';
import { query, execute } from '../utils/db';
import { authMiddleware } from '../middleware/auth';
import { errorToResponse } from '../utils/errors';

interface NotifRow { id: string; user_id: string; cat_id: string | null; type: string; title: string; message: string; status: string; scheduled_date: string; sent_date: string | null; read_at: string | null; created_at: string; }

export const notificationRoutes = new Hono<{ Bindings: Env }>();
notificationRoutes.use('*', authMiddleware);

notificationRoutes.get('/notifications', async (c) => {
  try {
    const rows = await query<NotifRow>(c.env.DB, `SELECT * FROM notifications ORDER BY created_at DESC LIMIT 30`, []);
    const unreadCount = rows.filter(r => !r.read_at).length;
    const notifications = rows.map(r => ({ id: r.id, type: r.type, title: r.title, message: r.message, status: r.status, isRead: !!r.read_at, createdAt: r.created_at }));
    return c.json({ success: true, data: { notifications, unreadCount } });
  } catch (error) { const { statusCode, body } = errorToResponse(error as Error); return c.json(body, statusCode as 500); }
});

notificationRoutes.post('/notifications/read-all', async (c) => {
  try {
    await execute(c.env.DB, `UPDATE notifications SET read_at = ? WHERE read_at IS NULL`, [new Date().toISOString()]);
    return c.json({ success: true });
  } catch (error) { const { statusCode, body } = errorToResponse(error as Error); return c.json(body, statusCode as 500); }
});
