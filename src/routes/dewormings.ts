import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../types';
import { DewormingService } from '../services/dewormingService';
import { authMiddleware, getUserId } from '../middleware/auth';
import { errorToResponse } from '../utils/errors';

const schema = z.object({
  dewormingDate: z.string().min(1),
  nextDueDate: z.string().optional(),
  productName: z.string().optional(),
  dose: z.string().optional(),
  weightAtTime: z.number().optional(),
  clinicName: z.string().optional(),
  veterinarianName: z.string().optional(),
  notes: z.string().optional(),
});

export const dewormingRoutes = new Hono<{ Bindings: Env }>();
dewormingRoutes.use('*', authMiddleware);

dewormingRoutes.post('/cats/:catId/dewormings', async (c) => {
  try {
    const parsed = schema.safeParse(await c.req.json());
    if (!parsed.success) return c.json({ success: false, error: parsed.error.errors[0]?.message ?? 'ข้อมูลไม่ถูกต้อง' }, 400);
    return c.json({ success: true, data: await DewormingService.add(c.req.param('catId'), getUserId(c), parsed.data, c.env) }, 201);
  } catch (error) { const { statusCode, body } = errorToResponse(error as Error); return c.json(body, statusCode as 400 | 401 | 404 | 500); }
});

dewormingRoutes.get('/cats/:catId/dewormings', async (c) => {
  try {
    const list = await DewormingService.getByCatId(c.req.param('catId'), getUserId(c), c.env);
    return c.json({ success: true, data: { total: list.length, dewormings: list } });
  } catch (error) { const { statusCode, body } = errorToResponse(error as Error); return c.json(body, statusCode as 401 | 404 | 500); }
});

dewormingRoutes.delete('/cats/:catId/dewormings/:id', async (c) => {
  try {
    await DewormingService.delete(c.req.param('id'), c.req.param('catId'), getUserId(c), c.env);
    return c.json({ success: true, message: 'ลบบันทึกถ่ายพยาธิสำเร็จ' });
  } catch (error) { const { statusCode, body } = errorToResponse(error as Error); return c.json(body, statusCode as 401 | 404 | 500); }
});
