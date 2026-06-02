import { Hono } from 'hono';
import type { Env } from '../types';
import { LineService } from '../services/lineService';

export const lineWebhook = new Hono<{ Bindings: Env }>();

lineWebhook.post('/', async (c) => {
  try {
    const signature = c.req.header('X-Line-Signature');
    const rawBody = await c.req.text();
    if (!signature) return c.json({ error: 'Missing signature' }, 403);
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(c.env.LINE_CHANNEL_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(rawBody));
    if (btoa(String.fromCharCode(...new Uint8Array(sig))) !== signature) return c.json({ error: 'Invalid signature' }, 403);
    const body = JSON.parse(rawBody) as { events: Array<{ type: string; source: { userId: string }; message: { text: string } }> };
    for (const event of body.events) {
      if (event.type === 'message') {
        await LineService.handleLineMessage(event, c.env);
      } else if (event.type === 'follow') {
        const uid = event.source.userId;
        await LineService.sendMessage(uid, `🐱 ยินดีต้อนรับสู่ Cat Care System!\n\n📋 LINE User ID ของคุณ:\n${uid}\n\nนำ User ID นี้ไปกรอกที่แอป:\n⚙️ ตั้งค่า → LINE User ID\n\nหรือส่งโค้ด 6 หลักจากแอปมาที่นี่ก็ได้\n\nพิมพ์ /help เพื่อดูคำสั่งทั้งหมด`, c.env);
      }
    }
    return c.json({ status: 'ok' }, 200);
  } catch (error) { console.error('[LINE Webhook]', error); return c.json({ status: 'ok' }, 200); }
});
