import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../types';
import { WeightService } from '../services/weightService';
import { authMiddleware, getUserId } from '../middleware/auth';
import { errorToResponse } from '../utils/errors';

const schema = z.object({
  weightKg: z.number().positive('น้ำหนักต้องมากกว่า 0'),
  loggedDate: z.string().optional(),
  notes: z.string().optional(),
});

export const weightRoutes = new Hono<{ Bindings: Env }>();
weightRoutes.use('*', authMiddleware);

weightRoutes.post('/cats/:catId/weights', async (c) => {
  try {
    const parsed = schema.safeParse(await c.req.json());
    if (!parsed.success) return c.json({ success: false, error: parsed.error.errors[0]?.message ?? 'ข้อมูลไม่ถูกต้อง' }, 400);
    const log = await WeightService.addWeightLog(
      c.req.param('catId'), getUserId(c),
      parsed.data.weightKg,
      parsed.data.loggedDate ?? new Date().toISOString().slice(0, 10),
      parsed.data.notes, c.env,
    );
    return c.json({ success: true, data: log }, 201);
  } catch (error) { const { statusCode, body } = errorToResponse(error as Error); return c.json(body, statusCode as 400 | 401 | 404 | 500); }
});

weightRoutes.get('/cats/:catId/weights', async (c) => {
  try {
    const logs = await WeightService.getWeightHistory(c.req.param('catId'), getUserId(c), c.env);
    return c.json({ success: true, data: { total: logs.length, logs } });
  } catch (error) { const { statusCode, body } = errorToResponse(error as Error); return c.json(body, statusCode as 401 | 404 | 500); }
});

weightRoutes.delete('/cats/:catId/weights/:logId', async (c) => {
  try {
    await WeightService.deleteWeightLog(c.req.param('logId'), c.req.param('catId'), getUserId(c), c.env);
    return c.json({ success: true, message: 'ลบสำเร็จ' });
  } catch (error) { const { statusCode, body } = errorToResponse(error as Error); return c.json(body, statusCode as 401 | 404 | 500); }
});
