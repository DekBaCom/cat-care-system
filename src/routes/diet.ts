import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../types';
import { DietService } from '../services/dietService';
import { authMiddleware, getUserId } from '../middleware/auth';
import { errorToResponse } from '../utils/errors';

const dietSchema = z.object({ foodName: z.string().min(1), foodType: z.enum(['dry', 'wet', 'mixed']), portionSize: z.number().positive().optional(), unit: z.enum(['g', 'ml', 'cup']).optional(), frequencyPerDay: z.number().int().positive().optional(), isMainFood: z.boolean().optional() });
const scheduleSchema = z.object({ schedules: z.array(z.object({ timeOfDay: z.string().min(1), dietId: z.string().optional(), notificationEnabled: z.boolean().optional() })).min(1) });

export const dietRoutes = new Hono<{ Bindings: Env }>();
dietRoutes.use('*', authMiddleware);

dietRoutes.post('/cats/:catId/diet', async (c) => {
  try {
    const parsed = dietSchema.safeParse(await c.req.json());
    if (!parsed.success) return c.json({ success: false, error: parsed.error.errors[0]?.message ?? 'ข้อมูลไม่ถูกต้อง' }, 400);
    return c.json({ success: true, data: await DietService.setDietInfo(c.req.param('catId'), getUserId(c), parsed.data, c.env) }, 201);
  } catch (error) { const { statusCode, body } = errorToResponse(error as Error); return c.json(body, statusCode as 400 | 401 | 404 | 500); }
});

dietRoutes.get('/cats/:catId/diet', async (c) => {
  try { return c.json({ success: true, data: await DietService.getDietInfo(c.req.param('catId'), getUserId(c), c.env) }); }
  catch (error) { const { statusCode, body } = errorToResponse(error as Error); return c.json(body, statusCode as 401 | 404 | 500); }
});

dietRoutes.post('/cats/:catId/feeding-schedule', async (c) => {
  try {
    const parsed = scheduleSchema.safeParse(await c.req.json());
    if (!parsed.success) return c.json({ success: false, error: parsed.error.errors[0]?.message ?? 'ข้อมูลไม่ถูกต้อง' }, 400);
    return c.json({ success: true, data: await DietService.setFeedingSchedule(c.req.param('catId'), getUserId(c), parsed.data.schedules, c.env) });
  } catch (error) { const { statusCode, body } = errorToResponse(error as Error); return c.json(body, statusCode as 400 | 401 | 404 | 500); }
});

dietRoutes.get('/cats/:catId/feeding-schedule', async (c) => {
  try { const s = await DietService.getFeedingSchedule(c.req.param('catId'), getUserId(c), c.env); return c.json({ success: true, data: { total: s.length, schedule: s } }); }
  catch (error) { const { statusCode, body } = errorToResponse(error as Error); return c.json(body, statusCode as 401 | 404 | 500); }
});
