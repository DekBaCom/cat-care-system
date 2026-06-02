import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../types';
import { AuthService } from '../services/authService';
import { loginOrRegisterGoogleUser } from '../services/googleAuth';
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

authRoutes.post('/google', async (c) => {
  try {
    const { idToken } = await c.req.json() as { idToken: string };
    if (!idToken) return c.json({ success: false, error: 'Missing idToken' }, 400);
    const result = await loginOrRegisterGoogleUser(idToken, c.env);
    return c.json({ success: true, data: result });
  } catch (error) {
    console.error('[google auth]', error);
    return c.json({ success: false, error: (error as Error).message || 'Google authentication failed' }, 401);
  }
});

authRoutes.post('/line/connect', authMiddleware, async (c) => {
  try {
    const { lineUserId } = await c.req.json() as { lineUserId: string };
    return c.json({ success: true, data: await AuthService.connectLineAccount(getUserId(c), lineUserId, c.env) });
  } catch (error) { const { statusCode, body } = errorToResponse(error as Error); return c.json(body, statusCode as 400 | 401 | 500); }
});

authRoutes.post('/line/generate-code', authMiddleware, async (c) => {
  try {
    const userId = getUserId(c);
    const code = String(Math.floor(100000 + Math.random() * 900000));
    await c.env.KV_CACHE.put(`LINE_CONNECT_CODE:${code}`, userId, { expirationTtl: 600 });
    return c.json({ success: true, data: { code } });
  } catch (error) { const { statusCode, body } = errorToResponse(error as Error); return c.json(body, statusCode as 401 | 500); }
});

authRoutes.delete('/line/disconnect', authMiddleware, async (c) => {
  try {
    await AuthService.disconnectLine(getUserId(c), c.env);
    return c.json({ success: true });
  } catch (error) { const { statusCode, body } = errorToResponse(error as Error); return c.json(body, statusCode as 401 | 500); }
});

authRoutes.get('/line/status', authMiddleware, async (c) => {
  try {
    return c.json({ success: true, data: await AuthService.getLineStatus(getUserId(c), c.env) });
  } catch (error) { const { statusCode, body } = errorToResponse(error as Error); return c.json(body, statusCode as 401 | 500); }
});

authRoutes.post('/line/connect-uuid', authMiddleware, async (c) => {
  try {
    const { lineUserId } = await c.req.json() as { lineUserId: string };
    if (!lineUserId || !/^U[0-9a-f]{32}$/i.test(lineUserId.trim())) {
      return c.json({ success: false, error: 'LINE User ID ไม่ถูกต้อง (ต้องขึ้นต้นด้วย U ตามด้วยตัวเลข/ตัวอักษร 32 ตัว)' }, 400);
    }
    return c.json({ success: true, data: await AuthService.connectLineAccount(getUserId(c), lineUserId.trim(), c.env) });
  } catch (error) { const { statusCode, body } = errorToResponse(error as Error); return c.json(body, statusCode as 400 | 401 | 500); }
});

authRoutes.post('/line/test', authMiddleware, async (c) => {
  try {
    const status = await AuthService.getLineStatus(getUserId(c), c.env);
    if (!status.connected || !status.lineUserId) {
      return c.json({ success: false, error: 'ยังไม่ได้เชื่อมต่อ LINE' }, 400);
    }
    const res = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${c.env.LINE_CHANNEL_ACCESS_TOKEN}` },
      body: JSON.stringify({ to: status.lineUserId, messages: [{ type: 'text', text: '✅ Cat Care System\nทดสอบการแจ้งเตือนผ่าน LINE สำเร็จ! 🐱\nคุณจะได้รับการแจ้งเตือนวัคซีนและยาผ่านช่องนี้' }] }),
    });
    if (!res.ok) {
      const err = await res.json() as { message?: string };
      return c.json({ success: false, error: `LINE API error: ${err.message ?? res.status}` }, 400);
    }
    return c.json({ success: true, message: 'ส่งข้อความทดสอบสำเร็จ' });
  } catch (error) { const { statusCode, body } = errorToResponse(error as Error); return c.json(body, statusCode as 401 | 500); }
});
