import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../types';
import { AuthService } from '../services/authService';
import { authMiddleware, getUserId } from '../middleware/auth';
import { errorToResponse } from '../utils/errors';

const registerSchema = z.object({ email: z.string().email('อีเมลไม่ถูกต้อง'), password: z.string().min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'), name: z.string().min(2, 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร') });
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

export const authRoutes = new Hono<{ Bindings: Env }>();

authRoutes.post('/register', async (c) => {
  try {
    const parsed = registerSchema.safeParse(await c.req.json());
    if (!parsed.success) return c.json({ success: false, error: parsed.error.errors[0]?.message ?? 'ข้อมูลไม่ถูกต้อง' }, 400);
    return c.json({ success: true, data: await AuthService.register(parsed.data.email, parsed.data.password, parsed.data.name, c.env) }, 201);
  } catch (error) { const { statusCode, body } = errorToResponse(error as Error); return c.json(body, statusCode as 400 | 401 | 409 | 500); }
});

authRoutes.post('/login', async (c) => {
  try {
    const parsed = loginSchema.safeParse(await c.req.json());
    if (!parsed.success) return c.json({ success: false, error: 'ข้อมูลไม่ถูกต้อง' }, 400);
    return c.json({ success: true, data: await AuthService.login(parsed.data.email, parsed.data.password, c.env) });
  } catch (error) { const { statusCode, body } = errorToResponse(error as Error); return c.json(body, statusCode as 400 | 401 | 500); }
});

authRoutes.post('/line/connect', authMiddleware, async (c) => {
  try {
    const { lineUserId } = await c.req.json() as { lineUserId: string };
    return c.json({ success: true, data: await AuthService.connectLineAccount(getUserId(c), lineUserId, c.env) });
  } catch (error) { const { statusCode, body } = errorToResponse(error as Error); return c.json(body, statusCode as 400 | 401 | 500); }
});
