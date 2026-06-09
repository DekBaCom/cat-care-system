import { v4 as uuidv4 } from 'uuid';
import type { Env, Notification } from '../types';
import { query, execute } from '../utils/db';
import { LineService } from './lineService';

interface NotifRow { id: string; user_id: string; cat_id: string | null; type: string; title: string; message: string; status: string; scheduled_date: string; sent_date: string | null; created_at: string; }

const NOTIFY_HOUR_UTC = 2;
const SEP = '━━━━━━━━━━━━━━━━━━━━';

function scheduledAt(dateStr: string, daysBefore: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - daysBefore);
  d.setUTCHours(NOTIFY_HOUR_UTC, 0, 0, 0);
  return d.toISOString();
}

export class NotificationService {
  static async sendDueNotifications(env: Env): Promise<void> {
    const now = new Date().toISOString();
    // Atomically claim and mark as sent to prevent concurrent invocations from sending duplicates
    const result = await env.DB
      .prepare(
        `UPDATE notifications SET status = 'sent', sent_date = ? WHERE id IN (
          SELECT id FROM notifications WHERE status = 'pending' AND scheduled_date <= ? LIMIT 50
        ) RETURNING id, user_id, cat_id, type, title, message, status, scheduled_date, sent_date, created_at`
      )
      .bind(now, now)
      .all<NotifRow>();

    for (const row of result.results) {
      const n: Notification = { id: row.id, userId: row.user_id, catId: row.cat_id ?? undefined, type: row.type as Notification['type'], title: row.title, message: row.message, status: 'sent', scheduledDate: row.scheduled_date, sentDate: row.sent_date ?? undefined, createdAt: row.created_at };
      try {
        await LineService.broadcastToAllUsers(LineService.formatNotificationMessage(n), env);
      } catch {
        await execute(env.DB, `UPDATE notifications SET status = 'failed' WHERE id = ?`, [row.id]);
      }
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
         AND date(v.expiration_date) >= date('now', '+7 hours')
         AND date(v.expiration_date) <= date('now', '+7 hours', '+31 days')`,
      []
    );

    const now = new Date().toISOString();

    for (const row of rows) {
      const checkpoints = [
        { daysBefore: 30, label: 'อีก 30 วัน' },
        { daysBefore: 15, label: 'อีก 15 วัน' },
        { daysBefore: 7, label: 'อีก 7 วัน' },
        { daysBefore: 5, label: 'อีก 5 วัน' },
        { daysBefore: 2, label: 'อีก 2 วัน' },
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
          ? `⚠️ ${row.cat_name} · ${row.vaccine_name} · วันนี้!`
          : `💉 ${row.cat_name} · ${row.vaccine_name} · ${label}`;

        const message = daysBefore === 0
          ? `⚠️ วันนัดฉีดวัคซีนมาถึงแล้ว!\n${SEP}\n🐱 แมว: ${row.cat_name}\n📌 วัคซีน: ${row.vaccine_name}\n📅 วันนัด: วันนี้ (${row.expiration_date})\n${SEP}\nกรุณานัดหมายคลินิกวันนี้ 🏥`
          : `💉 แจ้งเตือนวัคซีน\n${SEP}\n🐱 แมว: ${row.cat_name}\n📌 วัคซีน: ${row.vaccine_name}\n📅 วันนัดฉีด: ${row.expiration_date}\n⏰ ${label}\n${SEP}\nกรุณานัดหมายคลินิกล่วงหน้า 🏥`;

        await execute(env.DB,
          `INSERT INTO notifications (id, user_id, cat_id, type, title, message, status, scheduled_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [uuidv4(), row.user_id, row.cat_id, 'vaccine', title, message, 'pending', scheduledDateIso, now]
        );
      }
    }
  }

  static async checkDewormingsDue(env: Env): Promise<void> {
    const rows = await query<{ user_id: string; cat_id: string; cat_name: string; next_due_date: string; product_name: string | null }>(
      env.DB,
      `SELECT c.user_id, d.cat_id, c.name AS cat_name, d.next_due_date, d.product_name
       FROM dewormings d
       JOIN cats c ON d.cat_id = c.id
       WHERE d.next_due_date IS NOT NULL
         AND date(d.next_due_date) >= date('now', '+7 hours')
         AND date(d.next_due_date) <= date('now', '+7 hours', '+31 days')
         AND d.id = (
           SELECT d2.id FROM dewormings d2
           WHERE d2.cat_id = d.cat_id
           ORDER BY d2.deworming_date DESC, d2.created_at DESC LIMIT 1
         )`,
      []
    );

    const now = new Date().toISOString();

    for (const row of rows) {
      const checkpoints = [
        { daysBefore: 30, label: 'อีก 30 วัน' },
        { daysBefore: 15, label: 'อีก 15 วัน' },
        { daysBefore: 7, label: 'อีก 7 วัน' },
        { daysBefore: 5, label: 'อีก 5 วัน' },
        { daysBefore: 2, label: 'อีก 2 วัน' },
        { daysBefore: 1, label: 'พรุ่งนี้' },
        { daysBefore: 0, label: 'วันนี้' },
      ];

      for (const { daysBefore, label } of checkpoints) {
        const scheduledDateIso = scheduledAt(row.next_due_date, daysBefore);

        const scheduledMs = new Date(scheduledDateIso).getTime();
        if (scheduledMs < Date.now() - 86400000) continue;

        const scheduledDay = scheduledDateIso.slice(0, 10);
        const exists = await query<{ id: string }>(
          env.DB,
          `SELECT id FROM notifications WHERE user_id = ? AND cat_id = ? AND type = 'reminder' AND date(scheduled_date) = ? AND title LIKE ?`,
          [row.user_id, row.cat_id, scheduledDay, `%${row.cat_name}%ถ่ายพยาธิ%`]
        );
        if (exists.length > 0) continue;

        const productLine = row.product_name ? `\n💊 ยา: ${row.product_name}` : '';
        const title = daysBefore === 0
          ? `⚠️ ${row.cat_name} · ถ่ายพยาธิ · วันนี้!`
          : `🐛 ${row.cat_name} · ถ่ายพยาธิ · ${label}`;

        const message = daysBefore === 0
          ? `⚠️ วันนัดถ่ายพยาธิมาถึงแล้ว!\n${SEP}\n🐱 แมว: ${row.cat_name}${productLine}\n📅 วันนัด: วันนี้ (${row.next_due_date})\n${SEP}\nกรุณานัดหมายคลินิกวันนี้ 🏥`
          : `🐛 แจ้งเตือนถ่ายพยาธิ\n${SEP}\n🐱 แมว: ${row.cat_name}${productLine}\n📅 วันนัด: ${row.next_due_date}\n⏰ ${label}\n${SEP}\nกรุณานัดหมายคลินิกล่วงหน้า 🏥`;

        await execute(env.DB,
          `INSERT INTO notifications (id, user_id, cat_id, type, title, message, status, scheduled_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [uuidv4(), row.user_id, row.cat_id, 'reminder', title, message, 'pending', scheduledDateIso, now]
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
         AND date(v.expiration_date) < date('now', '+7 hours')
         AND v.id = (
           SELECT v2.id FROM vaccinations v2
           WHERE v2.cat_id = v.cat_id AND v2.vaccine_name = v.vaccine_name
           ORDER BY v2.vaccination_date DESC, v2.created_at DESC LIMIT 1
         )`,
      []
    );

    const today = new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 10);
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
         `🚨 ${row.cat_name} · ${row.vaccine_name} · เลยกำหนด!`,
         `🚨 วัคซีนเลยกำหนดแล้ว!\n${SEP}\n🐱 แมว: ${row.cat_name}\n📌 วัคซีน: ${row.vaccine_name}\n📅 ครบกำหนด: ${row.expiration_date}\n❗ ยังไม่ได้ฉีด!\n${SEP}\nกรุณานัดหมายคลินิกโดยด่วน 🏥`,
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
         AND date(d.next_due_date) < date('now', '+7 hours')
         AND d.id = (
           SELECT d2.id FROM dewormings d2
           WHERE d2.cat_id = d.cat_id
           ORDER BY d2.deworming_date DESC, d2.created_at DESC LIMIT 1
         )`,
      []
    );

    const today = new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 10);
    const now = new Date().toISOString();

    for (const row of rows) {
      const exists = await query<{ id: string }>(env.DB,
        `SELECT id FROM notifications WHERE user_id = ? AND cat_id = ? AND type = 'reminder' AND date(scheduled_date) = ? AND title LIKE ?`,
        [row.user_id, row.cat_id, today, `%${row.cat_name}%ถ่ายพยาธิ%เลยกำหนด%`]
      );
      if (exists.length > 0) continue;

      const overdueProductLine = row.product_name ? `\n💊 ยา: ${row.product_name}` : '';
      await execute(env.DB,
        `INSERT INTO notifications (id, user_id, cat_id, type, title, message, status, scheduled_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [uuidv4(), row.user_id, row.cat_id, 'reminder',
         `🚨 ${row.cat_name} · ถ่ายพยาธิ · เลยกำหนด!`,
         `🚨 ถ่ายพยาธิเลยกำหนดแล้ว!\n${SEP}\n🐱 แมว: ${row.cat_name}${overdueProductLine}\n📅 ครบกำหนด: ${row.next_due_date}\n❗ ยังไม่ได้ถ่ายพยาธิ!\n${SEP}\nกรุณานัดหมายคลินิกโดยด่วน 🏥`,
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

    const today = new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 10);
    const now = new Date().toISOString();

    for (const row of rows) {
      const exists = await query<{ id: string }>(env.DB,
        `SELECT id FROM notifications WHERE user_id = ? AND cat_id = ? AND type = 'medication' AND date(scheduled_date) = ? AND title LIKE ?`,
        [row.user_id, row.cat_id, today, `%${row.medicine_name}%`]
      );
      if (exists.length > 0) continue;

      const scheduledToday = new Date();
      scheduledToday.setUTCHours(NOTIFY_HOUR_UTC, 0, 0, 0);

      const dosageLine = row.dosage ? `\n📋 ขนาด: ${row.dosage}` : '';
      await execute(env.DB,
        `INSERT INTO notifications (id, user_id, cat_id, type, title, message, status, scheduled_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [uuidv4(), row.user_id, row.cat_id, 'medication',
         `💊 ${row.cat_name} · ${row.medicine_name}`,
         `💊 ถึงเวลาให้ยา\n${SEP}\n🐱 แมว: ${row.cat_name}\n💊 ยา: ${row.medicine_name}${dosageLine}\n${SEP}\nอย่าลืมให้ยาตามเวลา ✅`,
         'pending', scheduledToday.toISOString(), now]
      );
    }
  }
}
