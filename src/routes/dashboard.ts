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
      queryOne<{ count: number }>(c.env.DB, `SELECT COUNT(*) AS count FROM vaccinations v WHERE v.expiration_date IS NOT NULL AND date(v.expiration_date) <= date('now', '+7 hours', '+30 days') AND v.id = (SELECT v2.id FROM vaccinations v2 WHERE v2.cat_id = v.cat_id ORDER BY v2.vaccination_date DESC, v2.created_at DESC LIMIT 1)`, []),
      queryOne<{ count: number }>(c.env.DB, `SELECT COUNT(*) AS count FROM medications WHERE is_active = 1`, []),
    ]);
    const [vaccinesDue, upcomingEvents] = await Promise.all([
      query<{ cat_id: string; cat_name: string; vaccine_name: string; expiration_date: string; clinic_name: string | null }>(c.env.DB, `SELECT v.cat_id, c.name AS cat_name, v.vaccine_name, v.expiration_date, v.clinic_name FROM vaccinations v JOIN cats c ON v.cat_id = c.id WHERE v.expiration_date IS NOT NULL AND date(v.expiration_date) <= date('now', '+7 hours', '+30 days') AND v.id = (SELECT v2.id FROM vaccinations v2 WHERE v2.cat_id = v.cat_id ORDER BY v2.vaccination_date DESC, v2.created_at DESC LIMIT 1) ORDER BY v.expiration_date ASC`, []),
      query<{ type: string; title: string; scheduled_date: string }>(c.env.DB, `SELECT type, title, scheduled_date FROM notifications WHERE status = 'pending' AND date(scheduled_date) BETWEEN date('now', '+7 hours') AND date('now', '+7 hours', '+7 days') ORDER BY scheduled_date ASC LIMIT 20`, []),
    ]);
    return c.json({ success: true, data: { summary: { totalCats: totalCats?.count ?? 0, catsInTreatment: catsInTreatment?.count ?? 0, vaccinesExpiringSoon: vaccinesExpiringSoon?.count ?? 0, activeMedications: activeMedications?.count ?? 0 }, vaccines_due: vaccinesDue, upcoming_events: upcomingEvents } });
  } catch (error) { const { statusCode, body } = errorToResponse(error as Error); return c.json(body, statusCode as 401 | 500); }
});
