import { v4 as uuidv4 } from 'uuid';
import type { Env, Notification } from '../types';
import { query, execute } from '../utils/db';
import { LineService } from './lineService';

interface NotifRow { id: string; user_id: string; cat_id: string | null; type: string; title: string; message: string; status: string; scheduled_date: string; sent_date: string | null; created_at: string; }

export class NotificationService {
  static async sendDueNotifications(env: Env): Promise<void> {
    const rows = await query<NotifRow>(env.DB, `SELECT * FROM notifications WHERE status = 'pending' AND scheduled_date <= ? LIMIT 50`, [new Date().toISOString()]);
    for (const row of rows) {
      const n: Notification = { id: row.id, userId: row.user_id, catId: row.cat_id ?? undefined, type: row.type as Notification['type'], title: row.title, message: row.message, status: row.status as Notification['status'], scheduledDate: row.scheduled_date, sentDate: row.sent_date ?? undefined, createdAt: row.created_at };
      try { await LineService.sendNotification(n, env); } catch { await execute(env.DB, 'UPDATE notifications SET status = ? WHERE id = ?', ['failed', row.id]); }
    }
  }

  static async checkVaccinationsDue(env: Env): Promise<void> {
    const rows = await query<{ user_id: string; cat_id: string; cat_name: string; vaccine_name: string; expiration_date: string }>(env.DB, `SELECT c.user_id, v.cat_id, c.name AS cat_name, v.vaccine_name, v.expiration_date FROM vaccinations v JOIN cats c ON v.cat_id = c.id WHERE v.expiration_date IS NOT NULL AND date(v.expiration_date) <= date('now', '+7 days') AND date(v.expiration_date) >= date('now')`, []);
    const today = new Date().toISOString().slice(0, 10); const now = new Date().toISOString();
    for (const row of rows) {
      const exists = await query<{ id: string }>(env.DB, `SELECT id FROM notifications WHERE user_id = ? AND cat_id = ? AND type = 'vaccine' AND date(created_at) = ? AND message LIKE ?`, [row.user_id, row.cat_id, today, `%${row.vaccine_name}%`]);
      if (exists.length > 0) continue;
      await execute(env.DB, `INSERT INTO notifications (id, user_id, cat_id, type, title, message, status, scheduled_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [uuidv4(), row.user_id, row.cat_id, 'vaccine', `วัคซีน ${row.vaccine_name} ของ ${row.cat_name} ใกล้หมดอายุ`, `วัคซีน ${row.vaccine_name} ของ ${row.cat_name} จะหมดอายุวันที่ ${row.expiration_date}`, 'pending', now, now]);
    }
  }

  static async checkMedicationsDue(env: Env): Promise<void> {
    const rows = await query<{ user_id: string; cat_id: string; cat_name: string; medicine_name: string; dosage: string | null }>(env.DB, `SELECT c.user_id, m.cat_id, c.name AS cat_name, m.medicine_name, m.dosage FROM medications m JOIN cats c ON m.cat_id = c.id WHERE m.is_active = 1`, []);
    const today = new Date().toISOString().slice(0, 10); const now = new Date().toISOString();
    for (const row of rows) {
      const exists = await query<{ id: string }>(env.DB, `SELECT id FROM notifications WHERE user_id = ? AND cat_id = ? AND type = 'medication' AND date(created_at) = ? AND message LIKE ?`, [row.user_id, row.cat_id, today, `%${row.medicine_name}%`]);
      if (exists.length > 0) continue;
      await execute(env.DB, `INSERT INTO notifications (id, user_id, cat_id, type, title, message, status, scheduled_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [uuidv4(), row.user_id, row.cat_id, 'medication', `ให้ยา ${row.medicine_name} กับ ${row.cat_name}`, `ถึงเวลาให้ยา${row.dosage ? ` ${row.dosage}` : ''} แก่ ${row.cat_name}`, 'pending', now, now]);
    }
  }
}
