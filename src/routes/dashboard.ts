import { Hono } from 'hono';
import type { Env } from '../types';
import { query, queryOne } from '../utils/db';
import { authMiddleware, getUserId } from '../middleware/auth';
import { errorToResponse } from '../utils/errors';

export const dashboardRoutes = new Hono<{ Bindings: Env }>();
dashboardRoutes.use('*', authMiddleware);

dashboardRoutes.get('/dashboard', async (c) => {
  try {
    const userId = getUserId(c);
    const [totalCats, catsInTreatment, vaccinesExpiringSoon, activeMedications] = await Promise.all([
      queryOne<{ count: number }>(c.env.DB, 'SELECT COUNT(*) AS count FROM cats WHERE user_id = ?', [userId]),
      queryOne<{ count: number }>(c.env.DB, "SELECT COUNT(*) AS count FROM cats WHERE user_id = ? AND health_status = 'treating'", [userId]),
      queryOne<{ count: number }>(c.env.DB, `SELECT COUNT(*) AS count FROM vaccinations v JOIN cats c ON v.cat_id = c.id WHERE c.user_id = ? AND date(v.expiration_date) <= date('now', '+7 days') AND date(v.expiration_date) >= date('now')`, [userId]),
      queryOne<{ count: number }>(c.env.DB, `SELECT COUNT(*) AS count FROM medications m JOIN cats c ON m.cat_id = c.id WHERE c.user_id = ? AND m.is_active = 1`, [userId]),
    ]);
    const [urgentTasks, upcomingEvents] = await Promise.all([
      query<{ cat_name: string; vaccine_name: string; expiration_date: string }>(c.env.DB, `SELECT c.name AS cat_name, v.vaccine_name, v.expiration_date FROM vaccinations v JOIN cats c ON v.cat_id = c.id WHERE c.user_id = ? AND date(v.expiration_date) <= date('now', '+3 days') AND date(v.expiration_date) >= date('now') ORDER BY v.expiration_date ASC`, [userId]),
      query<{ type: string; title: string; scheduled_date: string }>(c.env.DB, `SELECT type, title, scheduled_date FROM notifications WHERE user_id = ? AND status = 'pending' AND date(scheduled_date) BETWEEN date('now') AND date('now', '+7 days') ORDER BY scheduled_date ASC LIMIT 20`, [userId]),
    ]);
    return c.json({ success: true, data: { summary: { totalCats: totalCats?.count ?? 0, catsInTreatment: catsInTreatment?.count ?? 0, vaccinesExpiringSoon: vaccinesExpiringSoon?.count ?? 0, activeMedications: activeMedications?.count ?? 0 }, urgent_tasks: urgentTasks, upcoming_events: upcomingEvents } });
  } catch (error) { const { statusCode, body } = errorToResponse(error as Error); return c.json(body, statusCode as 401 | 500); }
});
