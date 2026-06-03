import { v4 as uuidv4 } from 'uuid';
import type { Env, Notification } from '../types';
import { query, execute } from '../utils/db';
import { LineService } from './lineService';

interface NotifRow { id: string; user_id: string; cat_id: string | null; type: string; title: string; message: string; status: string; scheduled_date: string; sent_date: string | null; created_at: string; }

// Schedule notifications at 9am UTC+7 = 02:00 UTC
const NOTIFY_HOUR_UTC = 2;

function scheduledAt(dateStr: string, daysBefore: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - daysBefore);
  d.setUTCHours(NOTIFY_HOUR_UTC, 0, 0, 0);
  return d.toISOString();
}

export class NotificationService {
  static async sendDueNotifications(env: Env): Promise<void> {
    const rows = await query<NotifRow>(env.DB, `SELECT * FROM notifications WHERE status = 'pending' AND scheduled_date <= ? LIMIT 50`, [new Date().toISOString()]);
    for (const row of rows) {
      const n: Notification = { id: row.id, userId: row.user_id, catId: row.cat_id ?? undefined, type: row.type as Notification['type'], title: row.title, message: row.message, status: row.status as Notification['status'], scheduledDate: row.scheduled_date, sentDate: row.sent_date ?? undefined, createdAt: row.created_at };
      try { await LineService.sendNotification(n, env); } catch { await execute(env.DB, 'UPDATE notifications SET status = ? WHERE id = ?', ['failed', row.id]); }
    }
  }

  static async checkVaccinationsDue(env: Env): Promise<void> {
    // Look ahead 31 days to pre-create all notification points (30-day checkpoint needs +1 buffer)
    const rows = await query<{ user_id: string; cat_id: string; cat_name: string; vaccine_name: string; expiration_date: string }>(
      env.DB,
      `SELECT c.user_id, v.cat_id, c.name AS cat_name, v.vaccine_name, v.expiration_date
       FROM vaccinations v
       JOIN cats c ON v.cat_id = c.id
       WHERE v.expiration_date IS NOT NULL
         AND date(v.expiration_date) >= date('now')
         AND date(v.expiration_date) <= date('now', '+31 days')`,
      []
    );

    const now = new Date().toISOString();

    for (const row of rows) {
      const checkpoints = [
        { daysBefore: 30, label: 'อีก 30 วัน' },
        { daysBefore: 7, label: 'อีก 7 วัน' },
        { daysBefore: 3, label: 'อีก 3 วัน' },
        { daysBefore: 1, label: 'พรุ่งนี้' },
        { daysBefore: 0, label: 'วันนี้' },
      ];

      for (const { daysBefore, label } of checkpoints) {
        const scheduledDateIso = scheduledAt(row.expiration_date, daysBefore);

        // Skip if already past more than 1 day (notification missed entirely)
        const scheduledMs = new Date(scheduledDateIso).getTime();
        if (scheduledMs < Date.now() - 86400000) continue;

        // Dedup by (user_id, cat_id, type, scheduled_date date, vaccine_name)
        const scheduledDay = scheduledDateIso.slice(0, 10);
        const exists = await query<{ id: string }>(
          env.DB,
          `SELECT id FROM notifications WHERE user_id = ? AND cat_id = ? AND type = 'vaccine' AND date(scheduled_date) = ? AND title LIKE ?`,
          [row.user_id, row.cat_id, scheduledDay, `%${row.vaccine_name}%`]
        );
        if (exists.length > 0) continue;

        const title = daysBefore === 0
          ? `⚠️ ถึงเวลาฉีดวัคซีน ${row.vaccine_name} ให้ ${row.cat_name} แล้ว!`
          : `💉 ${row.cat_name} ต้องฉีดวัคซีน ${row.vaccine_name} ${label}`;

        const message = daysBefore === 0
          ? `วันนัดฉีดวัคซีน ${row.vaccine_name} ของ ${row.cat_name} คือวันนี้ (${row.expiration_date}) กรุณานัดหมายหมอ`
          : `วันนัดฉีดวัคซีน ${row.vaccine_name} ของ ${row.cat_name} คือ ${row.expiration_date}`;

        await execute(env.DB,
          `INSERT INTO notifications (id, user_id, cat_id, type, title, message, status, scheduled_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [uuidv4(), row.user_id, row.cat_id, 'vaccine', title, message, 'pending', scheduledDateIso, now]
        );
      }
    }
  }

  static async checkOverdueVaccinations(env: Env): Promise<void> {
    const rows = await query<{ user_id: string; cat_id: string; cat_name: string; vaccine_name: string; expiration_date: string }>(
      env.DB,
      `SELECT c.user_id, v.cat_id, c.name AS cat_name, v.vaccine_name, v.expiration_date
       FROM vaccinations v
       JOIN cats c ON v.cat_id = c.id
       WHERE v.expiration_date IS NOT NULL
         AND date(v.expiration_date) < date('now')
         AND v.id = (
           SELECT v2.id FROM vaccinations v2
           WHERE v2.cat_id = v.cat_id AND v2.vaccine_name = v.vaccine_name
           ORDER BY v2.vaccination_date DESC, v2.created_at DESC LIMIT 1
         )`,
      []
    );

    const today = new Date().toISOString().slice(0, 10);
    const now = new Date().toISOString();

    for (const row of rows) {
      const exists = await query<{ id: string }>(env.DB,
        `SELECT id FROM notifications WHERE user_id = ? AND cat_id = ? AND type = 'vaccine' AND date(scheduled_date) = ? AND title LIKE ?`,
        [row.user_id, row.cat_id, today, `%${row.vaccine_name}%เลยกำหนด%`]
      );
      if (exists.length > 0) continue;

      await execute(env.DB,
        `INSERT INTO notifications (id, user_id, cat_id, type, title, message, status, scheduled_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [uuidv4(), row.user_id, row.cat_id, 'vaccine',
         `⚠️ วัคซีน ${row.vaccine_name} ของ ${row.cat_name} เลยกำหนดแล้ว!`,
         `วัคซีน ${row.vaccine_name} ของ ${row.cat_name} ครบกำหนดฉีดตั้งแต่ ${row.expiration_date} แล้ว กรุณานัดหมายหมอ`,
         'pending', now, now]
      );
    }
  }

  static async checkOverdueDewormings(env: Env): Promise<void> {
    const rows = await query<{ user_id: string; cat_id: string; cat_name: string; next_due_date: string; product_name: string | null }>(
      env.DB,
      `SELECT c.user_id, d.cat_id, c.name AS cat_name, d.next_due_date, d.product_name
       FROM dewormings d
       JOIN cats c ON d.cat_id = c.id
       WHERE d.next_due_date IS NOT NULL
         AND date(d.next_due_date) < date('now')
         AND d.id = (
           SELECT d2.id FROM dewormings d2
           WHERE d2.cat_id = d.cat_id
           ORDER BY d2.deworming_date DESC, d2.created_at DESC LIMIT 1
         )`,
      []
    );

    const today = new Date().toISOString().slice(0, 10);
    const now = new Date().toISOString();

    for (const row of rows) {
      const exists = await query<{ id: string }>(env.DB,
        `SELECT id FROM notifications WHERE user_id = ? AND cat_id = ? AND type = 'reminder' AND date(scheduled_date) = ? AND title LIKE ?`,
        [row.user_id, row.cat_id, today, `%ถ่ายพยาธิ%${row.cat_name}%เลยกำหนด%`]
      );
      if (exists.length > 0) continue;

      await execute(env.DB,
        `INSERT INTO notifications (id, user_id, cat_id, type, title, message, status, scheduled_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [uuidv4(), row.user_id, row.cat_id, 'reminder',
         `⚠️ ถ่ายพยาธิ ${row.cat_name} เลยกำหนดแล้ว!`,
         `การถ่ายพยาธิของ ${row.cat_name} ครบกำหนดตั้งแต่ ${row.next_due_date} แล้ว${row.product_name ? ' (ยา: ' + row.product_name + ')' : ''} กรุณานัดหมายหมอ`,
         'pending', now, now]
      );
    }
  }

  static async checkMedicationsDue(env: Env): Promise<void> {
    const rows = await query<{ user_id: string; cat_id: string; cat_name: string; medicine_name: string; dosage: string | null }>(
      env.DB,
      `SELECT c.user_id, m.cat_id, c.name AS cat_name, m.medicine_name, m.dosage FROM medications m JOIN cats c ON m.cat_id = c.id WHERE m.is_active = 1`,
      []
    );

    const today = new Date().toISOString().slice(0, 10);
    const now = new Date().toISOString();

    for (const row of rows) {
      const exists = await query<{ id: string }>(env.DB,
        `SELECT id FROM notifications WHERE user_id = ? AND cat_id = ? AND type = 'medication' AND date(scheduled_date) = ? AND title LIKE ?`,
        [row.user_id, row.cat_id, today, `%${row.medicine_name}%`]
      );
      if (exists.length > 0) continue;

      const scheduledToday = new Date();
      scheduledToday.setUTCHours(NOTIFY_HOUR_UTC, 0, 0, 0);

      await execute(env.DB,
        `INSERT INTO notifications (id, user_id, cat_id, type, title, message, status, scheduled_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [uuidv4(), row.user_id, row.cat_id, 'medication', `💊 ให้ยา ${row.medicine_name} กับ ${row.cat_name}`, `ถึงเวลาให้ยา${row.dosage ? ` (${row.dosage})` : ''} แก่ ${row.cat_name}`, 'pending', scheduledToday.toISOString(), now]
      );
    }
  }
}
