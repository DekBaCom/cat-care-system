import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../types';
import { MedicalService } from '../services/medicalService';
import { authMiddleware, getUserId } from '../middleware/auth';
import { errorToResponse } from '../utils/errors';

const historySchema = z.object({ recordDate: z.string().min(1), type: z.enum(['illness', 'injury', 'checkup', 'surgery']), symptoms: z.string().optional(), diagnosis: z.string().optional(), clinicName: z.string().optional(), veterinarianName: z.string().optional(), treatmentDate: z.string().optional(), cost: z.number().optional(), treatmentResult: z.string().optional() });
const medSchema = z.object({ medicineName: z.string().min(1), dosage: z.string().optional(), frequency: z.string().optional(), route: z.enum(['oral', 'liquid', 'topical', 'injection']).optional(), startDate: z.string().min(1), endDate: z.string().optional(), purpose: z.string().optional(), sideEffects: z.string().optional() });

export const medicalRoutes = new Hono<{ Bindings: Env }>();
medicalRoutes.use('*', authMiddleware);

medicalRoutes.post('/cats/:catId/medical-history', async (c) => {
  try {
    const parsed = historySchema.safeParse(await c.req.json());
    if (!parsed.success) return c.json({ success: false, error: parsed.error.errors[0]?.message ?? 'ข้อมูลไม่ถูกต้อง' }, 400);
    return c.json({ success: true, data: await MedicalService.addMedicalRecord(c.req.param('catId'), getUserId(c), parsed.data, c.env) }, 201);
  } catch (error) { const { statusCode, body } = errorToResponse(error as Error); return c.json(body, statusCode as 400 | 401 | 404 | 500); }
});

medicalRoutes.get('/cats/:catId/medical-history', async (c) => {
  try { const r = await MedicalService.getMedicalHistory(c.req.param('catId'), getUserId(c), c.env); return c.json({ success: true, data: { total: r.length, records: r } }); }
  catch (error) { const { statusCode, body } = errorToResponse(error as Error); return c.json(body, statusCode as 401 | 404 | 500); }
});

medicalRoutes.post('/cats/:catId/medications', async (c) => {
  try {
    const parsed = medSchema.safeParse(await c.req.json());
    if (!parsed.success) return c.json({ success: false, error: parsed.error.errors[0]?.message ?? 'ข้อมูลไม่ถูกต้อง' }, 400);
    return c.json({ success: true, data: await MedicalService.addMedication(c.req.param('catId'), getUserId(c), parsed.data, c.env) }, 201);
  } catch (error) { const { statusCode, body } = errorToResponse(error as Error); return c.json(body, statusCode as 400 | 401 | 404 | 500); }
});

medicalRoutes.get('/cats/:catId/medications', async (c) => {
  try { const m = await MedicalService.getActiveMedications(c.req.param('catId'), getUserId(c), c.env); return c.json({ success: true, data: { total: m.length, medications: m } }); }
  catch (error) { const { statusCode, body } = errorToResponse(error as Error); return c.json(body, statusCode as 401 | 404 | 500); }
});

medicalRoutes.patch('/cats/:catId/medical-history/:id/status', async (c) => {
  try {
    const { status } = await c.req.json() as { status: string };
    if (!['treating', 'recovered'].includes(status)) return c.json({ success: false, error: 'status ต้องเป็น treating หรือ recovered' }, 400);
    await MedicalService.updateStatus(c.req.param('id'), c.req.param('catId'), getUserId(c), status, c.env);
    return c.json({ success: true });
  } catch (error) { const { statusCode, body } = errorToResponse(error as Error); return c.json(body, statusCode as 401 | 404 | 500); }
});

medicalRoutes.put('/cats/:catId/medications/:medId', async (c) => {
  try { return c.json({ success: true, data: await MedicalService.completeMedication(c.req.param('medId'), c.req.param('catId'), getUserId(c), c.env) }); }
  catch (error) { const { statusCode, body } = errorToResponse(error as Error); return c.json(body, statusCode as 401 | 404 | 500); }
});
