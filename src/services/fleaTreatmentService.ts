import { v4 as uuidv4 } from 'uuid';
import type { Env } from '../types';
import { query, queryOne, execute } from '../utils/db';
import { CatService } from './catService';
import { NOT_FOUND } from '../utils/errors';

export interface FleaTreatment {
  id: string; catId: string; treatmentDate: string; nextDueDate?: string;
  productName?: string; dose?: string; weightAtTime?: number;
  notes?: string; createdAt: string;
}

interface FleaTreatmentRow {
  id: string; cat_id: string; treatment_date: string; next_due_date: string | null;
  product_name: string | null; dose: string | null; weight_at_time: number | null;
  notes: string | null; created_at: string;
}

function rowTo(r: FleaTreatmentRow): FleaTreatment {
  return { id: r.id, catId: r.cat_id, treatmentDate: r.treatment_date, nextDueDate: r.next_due_date ?? undefined, productName: r.product_name ?? undefined, dose: r.dose ?? undefined, weightAtTime: r.weight_at_time ?? undefined, notes: r.notes ?? undefined, createdAt: r.created_at };
}

export class FleaTreatmentService {
  static async add(catId: string, userId: string, data: Partial<FleaTreatment>, env: Env): Promise<FleaTreatment> {
    await CatService.getCatById(catId, userId, env);
    const id = uuidv4(); const now = new Date().toISOString();
    await execute(env.DB, `INSERT INTO flea_treatments (id, cat_id, treatment_date, next_due_date, product_name, dose, weight_at_time, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, catId, data.treatmentDate ?? now.slice(0, 10), data.nextDueDate ?? null, data.productName ?? null, data.dose ?? null, data.weightAtTime ?? null, data.notes ?? null, now]);

    if (data.nextDueDate) {
      const cat = await CatService.getCatById(catId, userId, env);
      const SEP = '━━━━━━━━━━━━━━━━━━━━';
      // Cancel old pending flea treatment notifications for this cat before creating new ones
      await execute(env.DB,
        `DELETE FROM notifications WHERE user_id = ? AND cat_id = ? AND type = 'reminder' AND status = 'pending' AND title LIKE ?`,
        [userId, catId, `%หยอดหลัง%`]);
      const labels: Record<number, string> = { 30: 'อีก 30 วัน', 15: 'อีก 15 วัน', 7: 'อีก 7 วัน', 5: 'อีก 5 วัน', 2: 'อีก 2 วัน', 1: 'พรุ่งนี้', 0: 'วันนี้' };
      const productLine = data.productName ? `\n💊 ยา: ${data.productName}` : '';
      for (const days of [30, 15, 7, 5, 2, 1, 0]) {
        const scheduled = new Date(data.nextDueDate);
        scheduled.setDate(scheduled.getDate() - days);
        scheduled.setUTCHours(2, 0, 0, 0);
        if (scheduled.getTime() < Date.now()) continue;
        const label = labels[days];
        const title = days === 0 ? `⚠️ ${cat.name} · หยอดหลัง · วันนี้!` : `🐾 ${cat.name} · หยอดหลัง · ${label}`;
        const message = days === 0
          ? `⚠️ วันนัดหยอดหลังมาถึงแล้ว!\n${SEP}\n🐱 แมว: ${cat.name}${productLine}\n📅 วันนัด: วันนี้ (${data.nextDueDate})\n${SEP}\nกรุณานัดหมายคลินิกวันนี้ 🏥`
          : `🐾 แจ้งเตือนหยอดหลัง\n${SEP}\n🐱 แมว: ${cat.name}${productLine}\n📅 วันนัด: ${data.nextDueDate}\n⏰ ${label}\n${SEP}\nกรุณานัดหมายคลินิกล่วงหน้า 🏥`;
        await execute(env.DB, `INSERT INTO notifications (id, user_id, cat_id, type, title, message, status, scheduled_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [uuidv4(), userId, catId, 'reminder', title, message, 'pending', scheduled.toISOString(), now]);
      }
    }
    return rowTo((await queryOne<FleaTreatmentRow>(env.DB, 'SELECT * FROM flea_treatments WHERE id = ?', [id]))!);
  }

  static async getByCatId(catId: string, userId: string, env: Env): Promise<FleaTreatment[]> {
    await CatService.getCatById(catId, userId, env);
    return (await query<FleaTreatmentRow>(env.DB, 'SELECT * FROM flea_treatments WHERE cat_id = ? ORDER BY treatment_date DESC', [catId])).map(rowTo);
  }

  static async delete(id: string, catId: string, userId: string, env: Env): Promise<void> {
    await CatService.getCatById(catId, userId, env);
    if (!await queryOne<{ id: string }>(env.DB, 'SELECT id FROM flea_treatments WHERE id = ? AND cat_id = ?', [id, catId])) throw NOT_FOUND;
    await execute(env.DB, 'DELETE FROM flea_treatments WHERE id = ? AND cat_id = ?', [id, catId]);
  }
}
