import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../types';
import { VaccineService } from '../services/vaccineService';
import { authMiddleware, getUserId } from '../middleware/auth';
import { errorToResponse } from '../utils/errors';

const schema = z.object({ vaccineName: z.string().min(1), vaccinationDate: z.string().min(1), expirationDate: z.string().optional(), clinicName: z.string().optional(), veterinarianName: z.string().optional(), lotNumber: z.string().optional(), notes: z.string().optional() });

export const vaccinationRoutes = new Hono<{ Bindings: Env }>();
vaccinationRoutes.use('*', authMiddleware);

vaccinationRoutes.post('/cats/:catId/vaccinations', async (c) => {
  try {
    const parsed = schema.safeParse(await c.req.json());
    if (!parsed.success) return c.json({ success: false, error: parsed.error.errors[0]?.message ?? 'ข้อมูลไม่ถูกต้อง' }, 400);
    return c.json({ success: true, data: await VaccineService.addVaccination(c.req.param('catId'), getUserId(c), parsed.data, c.env) }, 201);
  } catch (error) { const { statusCode, body } = errorToResponse(error as Error); return c.json(body, statusCode as 400 | 401 | 404 | 500); }
});

vaccinationRoutes.get('/cats/:catId/vaccinations', async (c) => {
  try { const v = await VaccineService.getVaccinationsByCatId(c.req.param('catId'), getUserId(c), c.env); return c.json({ success: true, data: { total: v.length, vaccinations: v } }); }
  catch (error) { const { statusCode, body } = errorToResponse(error as Error); return c.json(body, statusCode as 401 | 404 | 500); }
});

vaccinationRoutes.get('/vaccinations/upcoming', async (c) => {
  try { const v = await VaccineService.getUpcomingVaccinations(getUserId(c), c.env); return c.json({ success: true, data: { total: v.length, vaccinations: v } }); }
  catch (error) { const { statusCode, body } = errorToResponse(error as Error); return c.json(body, statusCode as 401 | 500); }
});

vaccinationRoutes.put('/cats/:catId/vaccinations/:vacId', async (c) => {
  try { return c.json({ success: true, data: await VaccineService.updateVaccination(c.req.param('vacId'), c.req.param('catId'), getUserId(c), await c.req.json() as Parameters<typeof VaccineService.updateVaccination>[3], c.env) }); }
  catch (error) { const { statusCode, body } = errorToResponse(error as Error); return c.json(body, statusCode as 400 | 401 | 404 | 500); }
});

vaccinationRoutes.delete('/cats/:catId/vaccinations/:vacId', async (c) => {
  try { await VaccineService.deleteVaccination(c.req.param('vacId'), c.req.param('catId'), getUserId(c), c.env); return c.json({ success: true, message: 'ลบข้อมูลวัคซีนสำเร็จ' }); }
  catch (error) { const { statusCode, body } = errorToResponse(error as Error); return c.json(body, statusCode as 401 | 404 | 500); }
});
