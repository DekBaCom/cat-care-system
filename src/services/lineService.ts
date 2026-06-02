import type { Env, Notification } from '../types';
import { queryOne, query, execute } from '../utils/db';

export class LineService {
  static async sendMessage(lineUserId: string, message: string, env: Env): Promise<boolean> {
    const res = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}` },
      body: JSON.stringify({ to: lineUserId, messages: [{ type: 'text', text: message }] }),
    });
    return res.ok;
  }

  static async broadcastToAllUsers(message: string, env: Env): Promise<void> {
    const users = await query<{ line_user_id: string }>(env.DB, 'SELECT line_user_id FROM users WHERE line_user_id IS NOT NULL', []);
    await Promise.allSettled(users.map(u => LineService.sendMessage(u.line_user_id, message, env)));
  }

  static async sendNotification(notification: Notification, env: Env): Promise<void> {
    const message = LineService.formatNotificationMessage(notification);
    await LineService.broadcastToAllUsers(message, env);
    await execute(env.DB, 'UPDATE notifications SET status = ?, sent_date = ? WHERE id = ?', ['sent', new Date().toISOString(), notification.id]);
  }

  static formatNotificationMessage(n: Notification): string {
    const icons: Record<string, string> = { vaccine: '💉', medication: '💊', checkup: '🏥', diet: '🍽️', reminder: '🔔' };
    return `${icons[n.type] ?? '🔔'} ${n.title}\n${n.message}`;
  }

  static async handleLineMessage(event: { type: string; source: { userId: string }; message: { text: string } }, env: Env): Promise<void> {
    if (event.type !== 'message') return;
    const lineUserId = event.source.userId;
    const text = event.message.text.trim();

    // Handle LINE connect code (6-digit number)
    if (/^\d{6}$/.test(text)) {
      const userId = await env.KV_CACHE.get(`LINE_CONNECT_CODE:${text}`);
      if (userId) {
        await execute(env.DB, 'UPDATE users SET line_user_id = ?, updated_at = ? WHERE id = ?', [lineUserId, new Date().toISOString(), userId]);
        await env.KV_CACHE.delete(`LINE_CONNECT_CODE:${text}`);
        await LineService.sendMessage(lineUserId, '✅ เชื่อมต่อบัญชีสำเร็จ! คุณจะได้รับการแจ้งเตือนผ่าน LINE แล้ว 🎉', env);
        return;
      }
    }

    const user = await queryOne<{ id: string }>(env.DB, 'SELECT id FROM users WHERE line_user_id = ?', [lineUserId]);
    if (!user) {
      await LineService.sendMessage(lineUserId, '⚠️ ยังไม่ได้เชื่อมต่อบัญชี\n\nไปที่แอป → ⚙️ ตั้งค่า → เชื่อมต่อ LINE → รับโค้ด 6 หลัก แล้วส่งมาที่นี่', env);
      return;
    }

    let reply = '';
    if (text === '/my_cats') {
      const cats = await query<{ name: string }>(env.DB, 'SELECT name FROM cats', []);
      reply = cats.length > 0 ? `🐱 แมวทั้งหมด:\n${cats.map((c, i) => `${i + 1}. ${c.name}`).join('\n')}` : 'ยังไม่มีข้อมูลแมว';
    } else if (text === '/vaccines_due') {
      const rows = await query<{ vaccine_name: string; expiration_date: string; cat_name: string }>(env.DB, `SELECT v.vaccine_name, v.expiration_date, c.name AS cat_name FROM vaccinations v JOIN cats c ON v.cat_id = c.id WHERE date(v.expiration_date) <= date('now', '+7 days') AND date(v.expiration_date) >= date('now') ORDER BY v.expiration_date ASC`, []);
      reply = rows.length > 0 ? `💉 วัคซีนใกล้หมดอายุ:\n${rows.map((r) => `• ${r.cat_name}: ${r.vaccine_name} (${r.expiration_date})`).join('\n')}` : 'ไม่มีวัคซีนใกล้หมดอายุ';
    } else if (text === '/medications') {
      const rows = await query<{ medicine_name: string; cat_name: string }>(env.DB, `SELECT m.medicine_name, c.name AS cat_name FROM medications m JOIN cats c ON m.cat_id = c.id WHERE m.is_active = 1`, []);
      reply = rows.length > 0 ? `💊 ยาที่ต้องให้:\n${rows.map((r) => `• ${r.cat_name}: ${r.medicine_name}`).join('\n')}` : 'ไม่มียาที่ต้องให้ในขณะนี้';
    } else if (text === '/help') {
      reply = '📋 คำสั่งที่ใช้ได้:\n/my_cats - รายชื่อแมว\n/vaccines_due - วัคซีนใกล้หมดอายุ\n/medications - ยาที่ต้องให้\n/help - คำสั่งทั้งหมด';
    } else {
      reply = 'ไม่เข้าใจคำสั่ง พิมพ์ /help เพื่อดูคำสั่งทั้งหมด';
    }
    await LineService.sendMessage(lineUserId, reply, env);
  }
}
