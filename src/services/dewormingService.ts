import { v4 as uuidv4 } from 'uuid';
import type { Env } from '../types';
import { query, queryOne, execute } from '../utils/db';
import { CatService } from './catService';
import { NOT_FOUND } from '../utils/errors';

export interface Deworming {
  id: string; catId: string; dewormingDate: string; nextDueDate?: string;
  productName?: string; dose?: string; weightAtTime?: number;
  clinicName?: string; veterinarianName?: string; notes?: string; createdAt: string;
}

interface DewormingRow {
  id: string; cat_id: string; deworming_date: string; next_due_date: string | null;
  product_name: string | null; dose: string | null; weight_at_time: number | null;
  clinic_name: string | null; veterinarian_name: string | null; notes: string | null; created_at: string;
}

function rowTo(r: DewormingRow): Deworming {
  return { id: r.id, catId: r.cat_id, dewormingDate: r.deworming_date, nextDueDate: r.next_due_date ?? undefined, productName: r.product_name ?? undefined, dose: r.dose ?? undefined, weightAtTime: r.weight_at_time ?? undefined, clinicName: r.clinic_name ?? undefined, veterinarianName: r.veterinarian_name ?? undefined, notes: r.notes ?? undefined, createdAt: r.created_at };
}

export class DewormingService {
  static async add(catId: string, userId: string, data: Partial<Deworming>, env: Env): Promise<Deworming> {
    await CatService.getCatById(catId, userId, env);
    const id = uuidv4(); const now = new Date().toISOString();
    await execute(env.DB, `INSERT INTO dewormings (id, cat_id, deworming_date, next_due_date, product_name, dose, weight_at_time, clinic_name, veterinarian_name, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, catId, data.dewormingDate ?? now.slice(0, 10), data.nextDueDate ?? null, data.productName ?? null, data.dose ?? null, data.weightAtTime ?? null, data.clinicName ?? null, data.veterinarianName ?? null, data.notes ?? null, now]);

    if (data.nextDueDate) {
      const cat = await CatService.getCatById(catId, userId, env);
      const SEP = '━━━━━━━━━━━━━━━━━━━━';
      const labels: Record<number, string> = { 30: 'อีก 30 วัน', 15: 'อีก 15 วัน', 7: 'อีก 7 วัน', 5: 'อีก 5 วัน', 2: 'อีก 2 วัน', 1: 'พรุ่งนี้', 0: 'วันนี้' };
      const productLine = data.productName ? `\n💊 ยา: ${data.productName}` : '';
      for (const days of [30, 15, 7, 5, 2, 1, 0]) {
        const scheduled = new Date(data.nextDueDate);
        scheduled.setDate(scheduled.getDate() - days);
        scheduled.setUTCHours(2, 0, 0, 0);
        if (scheduled.getTime() < Date.now()) continue;
        const scheduledDay = scheduled.toISOString().slice(0, 10);
        const exists = await query<{ id: string }>(env.DB,
          `SELECT id FROM notifications WHERE user_id = ? AND cat_id = ? AND type = 'reminder' AND date(scheduled_date) = ? AND title LIKE ?`,
          [userId, catId, scheduledDay, `%${cat.name}%ถ่ายพยาธิ%`]);
        if (exists.length > 0) continue;
        const label = labels[days];
        const title = days === 0 ? `⚠️ ${cat.name} · ถ่ายพยาธิ · วันนี้!` : `🐛 ${cat.name} · ถ่ายพยาธิ · ${label}`;
        const message = days === 0
          ? `⚠️ วันนัดถ่ายพยาธิมาถึงแล้ว!\n${SEP}\n🐱 แมว: ${cat.name}${productLine}\n📅 วันนัด: วันนี้ (${data.nextDueDate})\n${SEP}\nกรุณานัดหมายคลินิกวันนี้ 🏥`
          : `🐛 แจ้งเตือนถ่ายพยาธิ\n${SEP}\n🐱 แมว: ${cat.name}${productLine}\n📅 วันนัด: ${data.nextDueDate}\n⏰ ${label}\n${SEP}\nกรุณานัดหมายคลินิกล่วงหน้า 🏥`;
        await execute(env.DB, `INSERT INTO notifications (id, user_id, cat_id, type, title, message, status, scheduled_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [uuidv4(), userId, catId, 'reminder', title, message, 'pending', scheduled.toISOString(), now]);
      }
    }
    return rowTo((await queryOne<DewormingRow>(env.DB, 'SELECT * FROM dewormings WHERE id = ?', [id]))!);
  }

  static async getByCatId(catId: string, userId: string, env: Env): Promise<Deworming[]> {
    await CatService.getCatById(catId, userId, env);
    return (await query<DewormingRow>(env.DB, 'SELECT * FROM dewormings WHERE cat_id = ? ORDER BY deworming_date DESC', [catId])).map(rowTo);
  }

  static async delete(id: string, catId: string, userId: string, env: Env): Promise<void> {
    await CatService.getCatById(catId, userId, env);
    if (!await queryOne<{ id: string }>(env.DB, 'SELECT id FROM dewormings WHERE id = ? AND cat_id = ?', [id, catId])) throw NOT_FOUND;
    await execute(env.DB, 'DELETE FROM dewormings WHERE id = ? AND cat_id = ?', [id, catId]);
  }
}
