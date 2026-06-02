import type { Env, Notification } from '../types';
import { queryOne, query, execute } from '../utils/db';

export class LineService {
  static async sendMessage(userId: string, message: string, env: Env): Promise<boolean> {
    const user = await queryOne<{ line_user_id: string | null }>(env.DB, 'SELECT line_user_id FROM users WHERE id = ?', [userId]);
    if (!user?.line_user_id) return false;
    const res = await fetch('https://api.line.me/v2/bot/message/push', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}` }, body: JSON.stringify({ to: user.line_user_id, messages: [{ type: 'text', text: message }] }) });
    return res.ok;
  }

  static async sendNotification(notification: Notification, env: Env): Promise<void> {
    const message = LineService.formatNotificationMessage(notification);
    const success = await LineService.sendMessage(notification.userId, message, env);
    await execute(env.DB, 'UPDATE notifications SET status = ?, sent_date = ? WHERE id = ?', [success ? 'sent' : 'failed', new Date().toISOString(), notification.id]);
  }

  static formatNotificationMessage(n: Notification): string {
    const icons: Record<string, string> = { vaccine: '💉', medication: '💊', checkup: '🏥', diet: '🍽️', reminder: '🔔' };
    return `${icons[n.type] ?? '🔔'} ${n.title}\n${n.message}`;
  }

  static async handleLineMessage(event: { type: string; source: { userId: string }; message: { text: string } }, env: Env): Promise<void> {
    if (event.type !== 'message') return;
    const lineUserId = event.source.userId;
    const text = event.message.text.trim();
    const user = await queryOne<{ id: string }>(env.DB, 'SELECT id FROM users WHERE line_user_id = ?', [lineUserId]);
    if (!user) { await LineService.pushMessage(lineUserId, 'ยังไม่ได้เชื่อมต่อบัญชี กรุณาเชื่อมต่อผ่านแอปก่อน', env); return; }
    let reply = '';
    if (text === '/my_cats') {
      const cats = await query<{ name: string }>(env.DB, 'SELECT name FROM cats WHERE user_id = ?', [user.id]);
      reply = cats.length > 0 ? `🐱 แมวของคุณ:\n${cats.map((c, i) => `${i + 1}. ${c.name}`).join('\n')}` : 'ยังไม่มีข้อมูลแมว';
    } else if (text === '/vaccines_due') {
      const rows = await query<{ vaccine_name: string; expiration_date: string; cat_name: string }>(env.DB, `SELECT v.vaccine_name, v.expiration_date, c.name AS cat_name FROM vaccinations v JOIN cats c ON v.cat_id = c.id WHERE c.user_id = ? AND date(v.expiration_date) <= date('now', '+7 days') AND date(v.expiration_date) >= date('now') ORDER BY v.expiration_date ASC`, [user.id]);
      reply = rows.length > 0 ? `💉 วัคซีนใกล้หมดอายุ:\n${rows.map((r) => `• ${r.cat_name}: ${r.vaccine_name} (${r.expiration_date})`).join('\n')}` : 'ไม่มีวัคซีนใกล้หมดอายุ';
    } else if (text === '/medications') {
      const rows = await query<{ medicine_name: string; cat_name: string }>(env.DB, `SELECT m.medicine_name, c.name AS cat_name FROM medications m JOIN cats c ON m.cat_id = c.id WHERE c.user_id = ? AND m.is_active = 1`, [user.id]);
      reply = rows.length > 0 ? `💊 ยาที่ต้องให้:\n${rows.map((r) => `• ${r.cat_name}: ${r.medicine_name}`).join('\n')}` : 'ไม่มียาที่ต้องให้ในขณะนี้';
    } else if (text === '/help') {
      reply = '📋 คำสั่งที่ใช้ได้:\n/my_cats - รายชื่อแมว\n/vaccines_due - วัคซีนใกล้หมดอายุ\n/medications - ยาที่ต้องให้\n/help - คำสั่งทั้งหมด';
    } else { reply = 'ไม่เข้าใจคำสั่ง พิมพ์ /help เพื่อดูคำสั่งทั้งหมด'; }
    await LineService.pushMessage(lineUserId, reply, env);
  }

  private static async pushMessage(to: string, text: string, env: Env): Promise<void> {
    await fetch('https://api.line.me/v2/bot/message/push', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}` }, body: JSON.stringify({ to, messages: [{ type: 'text', text }] }) });
  }
}
