import type { Env } from '../types';
import { query } from '../utils/db';
import { CatService } from './catService';

export interface TimelineEvent {
  id: string;
  type: 'vaccine' | 'medication' | 'medical' | 'weight';
  date: string;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export class TimelineService {
  static async getTimeline(catId: string, userId: string, env: Env): Promise<TimelineEvent[]> {
    await CatService.getCatById(catId, userId, env);

    const [vaccines, meds, medical, weights] = await Promise.all([
      query<{ id: string; vaccine_name: string; vaccination_date: string; expiration_date: string | null; clinic_name: string | null; veterinarian_name: string | null }>(
        env.DB,
        'SELECT id, vaccine_name, vaccination_date, expiration_date, clinic_name, veterinarian_name FROM vaccinations WHERE cat_id = ?',
        [catId],
      ),
      query<{ id: string; medicine_name: string; dosage: string | null; frequency: string | null; start_date: string; end_date: string | null; purpose: string | null; is_active: number }>(
        env.DB,
        'SELECT id, medicine_name, dosage, frequency, start_date, end_date, purpose, is_active FROM medications WHERE cat_id = ?',
        [catId],
      ),
      query<{ id: string; record_date: string; type: string; symptoms: string | null; diagnosis: string | null; clinic_name: string | null; cost: number | null }>(
        env.DB,
        'SELECT id, record_date, type, symptoms, diagnosis, clinic_name, cost FROM medical_history WHERE cat_id = ?',
        [catId],
      ),
      query<{ id: string; weight_kg: number; logged_date: string; notes: string | null }>(
        env.DB,
        'SELECT id, weight_kg, logged_date, notes FROM weight_logs WHERE cat_id = ?',
        [catId],
      ),
    ]);

    const events: TimelineEvent[] = [];

    for (const v of vaccines) {
      events.push({
        id: 'vacc-' + v.id,
        type: 'vaccine',
        date: v.vaccination_date,
        title: 'ฉีดวัคซีน ' + v.vaccine_name,
        description: [
          v.expiration_date ? 'หมดอายุ ' + v.expiration_date : null,
          v.clinic_name,
          v.veterinarian_name ? 'โดย ' + v.veterinarian_name : null,
        ].filter(Boolean).join(' · ') || undefined,
        metadata: v,
      });
    }

    for (const m of meds) {
      events.push({
        id: 'med-' + m.id,
        type: 'medication',
        date: m.start_date,
        title: (m.is_active ? '🟢 เริ่มให้ยา ' : 'ให้ยา ') + m.medicine_name,
        description: [
          m.dosage,
          m.frequency,
          m.purpose,
          m.end_date ? 'ถึง ' + m.end_date : null,
        ].filter(Boolean).join(' · ') || undefined,
        metadata: m,
      });

      if (m.end_date && !m.is_active) {
        events.push({
          id: 'med-end-' + m.id,
          type: 'medication',
          date: m.end_date,
          title: 'สิ้นสุดการให้ยา ' + m.medicine_name,
          metadata: m,
        });
      }
    }

    for (const h of medical) {
      const typeLabel = ({ illness: 'เจ็บป่วย', injury: 'บาดเจ็บ', checkup: 'ตรวจสุขภาพ', surgery: 'ผ่าตัด' } as Record<string, string>)[h.type] ?? h.type;
      events.push({
        id: 'medical-' + h.id,
        type: 'medical',
        date: h.record_date,
        title: typeLabel,
        description: [
          h.diagnosis,
          h.symptoms ? 'อาการ: ' + h.symptoms : null,
          h.clinic_name,
          h.cost ? '฿' + h.cost.toLocaleString() : null,
        ].filter(Boolean).join(' · ') || undefined,
        metadata: h,
      });
    }

    for (const w of weights) {
      events.push({
        id: 'weight-' + w.id,
        type: 'weight',
        date: w.logged_date,
        title: 'ชั่งน้ำหนัก ' + w.weight_kg + ' kg',
        description: w.notes ?? undefined,
        metadata: w,
      });
    }

    events.sort((a, b) => b.date.localeCompare(a.date));
    return events;
  }
}
