import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../types';
import { FleaTreatmentService } from '../services/fleaTreatmentService';
import { authMiddleware, getUserId } from '../middleware/auth';
import { errorToResponse } from '../utils/errors';

const schema = z.object({
  treatmentDate: z.string().min(1),
  nextDueDate: z.string().optional(),
  productName: z.string().optional(),
  dose: z.string().optional(),
  weightAtTime: z.number().optional(),
  notes: z.string().optional(),
});

export const fleaTreatmentRoutes = new Hono<{ Bindings: Env }>();
fleaTreatmentRoutes.use('*', authMiddleware);

fleaTreatmentRoutes.post('/cats/:catId/flea-treatments', async (c) => {
  try {
    const parsed = schema.safeParse(await c.req.json());
    if (!parsed.success) return c.json({ success: false, error: parsed.error.errors[0]?.message ?? 'ข้อมูลไม่ถูกต้อง' }, 400);
    return c.json({ success: true, data: await FleaTreatmentService.add(c.req.param('catId'), getUserId(c), parsed.data, c.env) }, 201);
  } catch (error) { const { statusCode, body } = errorToResponse(error as Error); return c.json(body, statusCode as 400 | 401 | 404 | 500); }
});

fleaTreatmentRoutes.get('/cats/:catId/flea-treatments', async (c) => {
  try {
    const list = await FleaTreatmentService.getByCatId(c.req.param('catId'), getUserId(c), c.env);
    return c.json({ success: true, data: { total: list.length, fleaTreatments: list } });
  } catch (error) { const { statusCode, body } = errorToResponse(error as Error); return c.json(body, statusCode as 401 | 404 | 500); }
});

fleaTreatmentRoutes.delete('/cats/:catId/flea-treatments/:id', async (c) => {
  try {
    await FleaTreatmentService.delete(c.req.param('id'), c.req.param('catId'), getUserId(c), c.env);
    return c.json({ success: true, message: 'ลบบันทึกหยอดหลังสำเร็จ' });
  } catch (error) { const { statusCode, body } = errorToResponse(error as Error); return c.json(body, statusCode as 401 | 404 | 500); }
});
