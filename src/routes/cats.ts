import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../types';
import { CatService } from '../services/catService';
import { authMiddleware, getUserId } from '../middleware/auth';
import { errorToResponse } from '../utils/errors';

const schema = z.object({ name: z.string().min(1), gender: z.enum(['M', 'F']).optional(), breed: z.string().optional(), dateOfBirth: z.string().optional(), weightKg: z.number().positive().optional(), healthStatus: z.enum(['normal', 'treating', 'caution']).optional(), microchipId: z.string().optional(), chronicDiseases: z.string().optional(), drugAllergies: z.string().optional(), forbiddenFoods: z.string().optional() });

export const catRoutes = new Hono<{ Bindings: Env }>();
catRoutes.use('*', authMiddleware);

catRoutes.post('/cats', async (c) => {
  try {
    const parsed = schema.safeParse(await c.req.json());
    if (!parsed.success) return c.json({ success: false, error: parsed.error.errors[0]?.message ?? 'ข้อมูลไม่ถูกต้อง' }, 400);
    return c.json({ success: true, data: await CatService.createCat(getUserId(c), parsed.data, c.env) }, 201);
  } catch (error) { const { statusCode, body } = errorToResponse(error as Error); return c.json(body, statusCode as 400 | 401 | 404 | 500); }
});

catRoutes.get('/cats', async (c) => {
  try { const cats = await CatService.getCatsByUserId(getUserId(c), c.env); return c.json({ success: true, data: { total: cats.length, cats } }); }
  catch (error) { const { statusCode, body } = errorToResponse(error as Error); return c.json(body, statusCode as 401 | 500); }
});

catRoutes.get('/cats/:catId', async (c) => {
  try { return c.json({ success: true, data: await CatService.getCatById(c.req.param('catId'), getUserId(c), c.env) }); }
  catch (error) { const { statusCode, body } = errorToResponse(error as Error); return c.json(body, statusCode as 401 | 404 | 500); }
});

catRoutes.put('/cats/:catId', async (c) => {
  try { return c.json({ success: true, data: await CatService.updateCat(c.req.param('catId'), getUserId(c), await c.req.json() as Parameters<typeof CatService.updateCat>[2], c.env) }); }
  catch (error) { const { statusCode, body } = errorToResponse(error as Error); return c.json(body, statusCode as 400 | 401 | 404 | 500); }
});

catRoutes.delete('/cats/:catId', async (c) => {
  try { await CatService.deleteCat(c.req.param('catId'), getUserId(c), c.env); return c.json({ success: true, message: 'ลบข้อมูลแมวสำเร็จ' }); }
  catch (error) { const { statusCode, body } = errorToResponse(error as Error); return c.json(body, statusCode as 401 | 404 | 500); }
});
