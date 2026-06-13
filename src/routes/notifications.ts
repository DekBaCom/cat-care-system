import { Hono } from 'hono';
import { v4 as uuidv4 } from 'uuid';
import type { Env } from '../types';
import { query, execute } from '../utils/db';
import { authMiddleware } from '../middleware/auth';
import { errorToResponse } from '../utils/errors';
import { LineService } from '../services/lineService';

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

notificationRoutes.post('/notifications/test', async (c) => {
  const SEP = '━━━━━━━━━━━━━━━━━━━━';
  try {
    const cats = await query<{ id: string; name: string; user_id: string }>(c.env.DB, `SELECT id, name, user_id FROM cats LIMIT 1`, []);
    const catName = cats[0]?.name ?? 'แมวทดสอบ';
    const catId = cats[0]?.id ?? null;
    const userId = cats[0]?.user_id ?? 'test';
    const testDate = new Date(Date.now() + 7 * 3600000 + 2 * 86400000).toISOString().slice(0, 10);
    const title = `💉 ทดสอบ · Bayovac · อีก 2 วัน`;
    const message = `💉 แจ้งเตือน : Bayovac\n${SEP}\n🐱 แมว: ${catName}\n📌 วัคซีน: Bayovac\n📅 วันนัดฉีด: ${testDate}\n⏰ อีก : 2 วัน\n${SEP}\nกรุณานัดหมายคลินิกล่วงหน้า 🏥`;
    const now = new Date().toISOString();
    await execute(c.env.DB,
      `INSERT INTO notifications (id, user_id, cat_id, type, title, message, status, scheduled_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), userId, catId, 'vaccine', title, message, 'sent', now, now]
    );
    await LineService.broadcastToAllUsers(message, c.env);
    return c.json({ success: true, message: 'ส่ง test notification สำเร็จ', preview: message });
  } catch (error) { const { statusCode, body } = errorToResponse(error as Error); return c.json(body, statusCode as 500); }
});
