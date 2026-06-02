import { v4 as uuidv4 } from 'uuid';
import type { Env, MedicalHistory, Medication } from '../types';
import { query, queryOne, execute } from '../utils/db';
import { CatService } from './catService';
import { NOT_FOUND } from '../utils/errors';

interface MedRow { id: string; cat_id: string; record_date: string; type: string; symptoms: string | null; diagnosis: string | null; clinic_name: string | null; veterinarian_name: string | null; treatment_date: string | null; cost: number | null; treatment_result: string | null; created_at: string; }
interface MedRxRow { id: string; cat_id: string; medicine_name: string; dosage: string | null; frequency: string | null; route: string | null; start_date: string; end_date: string | null; purpose: string | null; side_effects: string | null; is_active: number; created_at: string; }

function rowToHistory(r: MedRow): MedicalHistory { return { id: r.id, catId: r.cat_id, recordDate: r.record_date, type: r.type as MedicalHistory['type'], symptoms: r.symptoms ?? undefined, diagnosis: r.diagnosis ?? undefined, clinicName: r.clinic_name ?? undefined, veterinarianName: r.veterinarian_name ?? undefined, treatmentDate: r.treatment_date ?? undefined, cost: r.cost ?? undefined, treatmentResult: r.treatment_result ?? undefined, createdAt: r.created_at }; }
function rowToMedication(r: MedRxRow): Medication { return { id: r.id, catId: r.cat_id, medicineName: r.medicine_name, dosage: r.dosage ?? undefined, frequency: r.frequency ?? undefined, route: (r.route as Medication['route']) ?? undefined, startDate: r.start_date, endDate: r.end_date ?? undefined, purpose: r.purpose ?? undefined, sideEffects: r.side_effects ?? undefined, isActive: r.is_active === 1, createdAt: r.created_at }; }

export class MedicalService {
  static async addMedicalRecord(catId: string, userId: string, data: Partial<MedicalHistory>, env: Env): Promise<MedicalHistory> {
    await CatService.getCatById(catId, userId, env);
    const id = uuidv4(); const now = new Date().toISOString();
    await execute(env.DB, `INSERT INTO medical_history (id, cat_id, record_date, type, symptoms, diagnosis, clinic_name, veterinarian_name, treatment_date, cost, treatment_result, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [id, catId, data.recordDate ?? now.slice(0, 10), data.type ?? 'checkup', data.symptoms ?? null, data.diagnosis ?? null, data.clinicName ?? null, data.veterinarianName ?? null, data.treatmentDate ?? null, data.cost ?? null, data.treatmentResult ?? null, now]);
    return rowToHistory((await queryOne<MedRow>(env.DB, 'SELECT * FROM medical_history WHERE id = ?', [id]))!);
  }

  static async getMedicalHistory(catId: string, userId: string, env: Env): Promise<MedicalHistory[]> {
    await CatService.getCatById(catId, userId, env);
    return (await query<MedRow>(env.DB, 'SELECT * FROM medical_history WHERE cat_id = ? ORDER BY record_date DESC', [catId])).map(rowToHistory);
  }

  static async addMedication(catId: string, userId: string, data: Partial<Medication>, env: Env): Promise<Medication> {
    await CatService.getCatById(catId, userId, env);
    const id = uuidv4(); const now = new Date().toISOString();
    await execute(env.DB, `INSERT INTO medications (id, cat_id, medicine_name, dosage, frequency, route, start_date, end_date, purpose, side_effects, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [id, catId, data.medicineName ?? '', data.dosage ?? null, data.frequency ?? null, data.route ?? null, data.startDate ?? now.slice(0, 10), data.endDate ?? null, data.purpose ?? null, data.sideEffects ?? null, 1, now]);
    return rowToMedication((await queryOne<MedRxRow>(env.DB, 'SELECT * FROM medications WHERE id = ?', [id]))!);
  }

  static async getActiveMedications(catId: string, userId: string, env: Env): Promise<Medication[]> {
    await CatService.getCatById(catId, userId, env);
    return (await query<MedRxRow>(env.DB, 'SELECT * FROM medications WHERE cat_id = ? AND is_active = 1 ORDER BY created_at DESC', [catId])).map(rowToMedication);
  }

  static async completeMedication(medId: string, catId: string, userId: string, env: Env): Promise<Medication> {
    await CatService.getCatById(catId, userId, env);
    if (!await queryOne<{ id: string }>(env.DB, 'SELECT id FROM medications WHERE id = ? AND cat_id = ?', [medId, catId])) throw NOT_FOUND;
    await execute(env.DB, 'UPDATE medications SET is_active = 0 WHERE id = ? AND cat_id = ?', [medId, catId]);
    return rowToMedication((await queryOne<MedRxRow>(env.DB, 'SELECT * FROM medications WHERE id = ?', [medId]))!);
  }
}
