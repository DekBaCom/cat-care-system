import { Hono } from 'hono';
import type { Env } from '../types';
import { query, queryOne } from '../utils/db';
import { authMiddleware, getUserId } from '../middleware/auth';
import { errorToResponse } from '../utils/errors';

export const dashboardRoutes = new Hono<{ Bindings: Env }>();
dashboardRoutes.use('*', authMiddleware);

dashboardRoutes.get('/dashboard', async (c) => {
  try {
    getUserId(c);
    const [totalCats, catsInTreatment, vaccinesExpiringSoon, activeMedications] = await Promise.all([
      queryOne<{ count: number }>(c.env.DB, 'SELECT COUNT(*) AS count FROM cats', []),
      queryOne<{ count: number }>(c.env.DB, "SELECT COUNT(*) AS count FROM cats WHERE health_status = 'treating'", []),
      queryOne<{ count: number }>(c.env.DB, `SELECT COUNT(*) AS count FROM vaccinations WHERE date(expiration_date) <= date('now', '+7 days') AND date(expiration_date) >= date('now')`, []),
      queryOne<{ count: number }>(c.env.DB, `SELECT COUNT(*) AS count FROM medications WHERE is_active = 1`, []),
    ]);
    const [vaccinesDue, upcomingEvents] = await Promise.all([
      query<{ cat_name: string; vaccine_name: string; expiration_date: string; clinic_name: string | null }>(c.env.DB, `SELECT c.name AS cat_name, v.vaccine_name, v.expiration_date, v.clinic_name FROM vaccinations v JOIN cats c ON v.cat_id = c.id WHERE date(v.expiration_date) >= date('now') AND date(v.expiration_date) <= date('now', '+30 days') ORDER BY v.expiration_date ASC`, []),
      query<{ type: string; title: string; scheduled_date: string }>(c.env.DB, `SELECT type, title, scheduled_date FROM notifications WHERE status = 'pending' AND date(scheduled_date) BETWEEN date('now') AND date('now', '+7 days') ORDER BY scheduled_date ASC LIMIT 20`, []),
    ]);
    return c.json({ success: true, data: { summary: { totalCats: totalCats?.count ?? 0, catsInTreatment: catsInTreatment?.count ?? 0, vaccinesExpiringSoon: vaccinesExpiringSoon?.count ?? 0, activeMedications: activeMedications?.count ?? 0 }, vaccines_due: vaccinesDue, upcoming_events: upcomingEvents } });
  } catch (error) { const { statusCode, body } = errorToResponse(error as Error); return c.json(body, statusCode as 401 | 500); }
});
