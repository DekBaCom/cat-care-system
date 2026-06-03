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
    if (text === '/myid') {
      reply = `📋 LINE User ID ของคุณ:\n${lineUserId}\n\nนำ User ID นี้ไปกรอกที่แอป ⚙️ ตั้งค่า LINE`;
    } else if (text === '/my_cats') {
      const cats = await query<{ name: string }>(env.DB, 'SELECT name FROM cats', []);
      reply = cats.length > 0 ? `🐱 แมวทั้งหมด:\n${cats.map((c, i) => `${i + 1}. ${c.name}`).join('\n')}` : 'ยังไม่มีข้อมูลแมว';
    } else if (text === '/vaccines_due') {
      const rows = await query<{ vaccine_name: string; expiration_date: string; cat_name: string }>(env.DB, `SELECT v.vaccine_name, v.expiration_date, c.name AS cat_name FROM vaccinations v JOIN cats c ON v.cat_id = c.id WHERE v.expiration_date IS NOT NULL AND date(v.expiration_date) >= date('now', '-15 days') AND date(v.expiration_date) <= date('now', '+7 days') AND v.id = (SELECT v2.id FROM vaccinations v2 WHERE v2.cat_id = v.cat_id AND v2.vaccine_name = v.vaccine_name ORDER BY v2.vaccination_date DESC, v2.created_at DESC LIMIT 1) ORDER BY v.expiration_date ASC`, []);
      reply = rows.length > 0 ? `💉 วัคซีนใกล้ถึงกำหนด/เลยกำหนด:\n${rows.map((r) => `• ${r.cat_name}: ${r.vaccine_name}\n  นัดฉีด: ${r.expiration_date}`).join('\n')}` : 'ไม่มีวัคซีนที่ใกล้ถึงกำหนดหรือเลยกำหนด';
    } else if (text === '/medications') {
      const rows = await query<{ medicine_name: string; cat_name: string }>(env.DB, `SELECT m.medicine_name, c.name AS cat_name FROM medications m JOIN cats c ON m.cat_id = c.id WHERE m.is_active = 1`, []);
      reply = rows.length > 0 ? `💊 ยาที่ต้องให้:\n${rows.map((r) => `• ${r.cat_name}: ${r.medicine_name}`).join('\n')}` : 'ไม่มียาที่ต้องให้ในขณะนี้';
    } else if (text === '/dewormings_due') {
      const rows = await query<{ product_name: string | null; next_due_date: string; cat_name: string }>(env.DB, `SELECT d.product_name, d.next_due_date, c.name AS cat_name FROM dewormings d JOIN cats c ON d.cat_id = c.id WHERE d.next_due_date IS NOT NULL AND date(d.next_due_date) <= date('now', '+7 days') AND d.id = (SELECT d2.id FROM dewormings d2 WHERE d2.cat_id = d.cat_id ORDER BY d2.deworming_date DESC, d2.created_at DESC LIMIT 1) ORDER BY d.next_due_date ASC`, []);
      reply = rows.length > 0 ? `🐛 การถ่ายพยาธิใกล้ถึงกำหนด/เลยกำหนด:\n${rows.map((r) => `• ${r.cat_name}${r.product_name ? ': ' + r.product_name : ''}\n  นัดถ่ายพยาธิ: ${r.next_due_date}`).join('\n')}` : 'ไม่มีการถ่ายพยาธิที่ใกล้ถึงกำหนดหรือเลยกำหนด';
    } else if (text === '/weights') {
      const rows = await query<{ cat_name: string; weight_kg: number; logged_date: string }>(env.DB, `SELECT c.name AS cat_name, w.weight_kg, w.logged_date FROM weight_logs w JOIN cats c ON w.cat_id = c.id WHERE w.id IN (SELECT id FROM weight_logs w2 WHERE w2.cat_id = w.cat_id ORDER BY logged_date DESC, created_at DESC LIMIT 1) ORDER BY c.name ASC`, []);
      reply = rows.length > 0 ? `⚖️ น้ำหนักล่าสุด:\n${rows.map((r) => `• ${r.cat_name}: ${r.weight_kg} kg (${r.logged_date})`).join('\n')}` : 'ยังไม่มีข้อมูลน้ำหนัก';
    } else if (text === '/status') {
      const [cats, vaccines, meds, dewormings] = await Promise.all([
        query<{ name: string }>(env.DB, `SELECT name FROM cats`, []),
        query<{ count: number }>(env.DB, `SELECT COUNT(*) AS count FROM vaccinations WHERE date(expiration_date) <= date('now', '+7 days') AND date(expiration_date) >= date('now')`, []),
        query<{ count: number }>(env.DB, `SELECT COUNT(*) AS count FROM medications WHERE is_active = 1`, []),
        query<{ count: number }>(env.DB, `SELECT COUNT(*) AS count FROM dewormings WHERE date(next_due_date) <= date('now', '+7 days') AND date(next_due_date) >= date('now')`, []),
      ]);
      reply = `📊 สรุปสุขภาพแมว\n🐱 แมวทั้งหมด: ${cats.length} ตัว\n💉 วัคซีนใกล้ถึงกำหนด: ${vaccines[0]?.count ?? 0} รายการ\n💊 ยาที่ต้องให้: ${meds[0]?.count ?? 0} รายการ\n🐛 ถ่ายพยาธิใกล้ถึงกำหนด: ${dewormings[0]?.count ?? 0} รายการ`;
    } else if (text === '/help') {
      reply = '📋 คำสั่งที่ใช้ได้:\n/my_cats - รายชื่อแมว\n/vaccines_due - วัคซีนใกล้หมดอายุ\n/medications - ยาที่ต้องให้\n/dewormings_due - ถ่ายพยาธิใกล้ถึงกำหนด\n/weights - น้ำหนักล่าสุดของแมว\n/status - สรุปสุขภาพทั้งหมด\n/myid - แสดง LINE User ID\n/help - คำสั่งทั้งหมด';
    } else {
      reply = 'ไม่เข้าใจคำสั่ง พิมพ์ /help เพื่อดูคำสั่งทั้งหมด';
    }
    await LineService.sendMessage(lineUserId, reply, env);
  }
}
