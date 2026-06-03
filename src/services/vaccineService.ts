import { v4 as uuidv4 } from 'uuid';
import type { Env, Vaccination } from '../types';
import { query, queryOne, execute } from '../utils/db';
import { CatService } from './catService';
import { NOT_FOUND } from '../utils/errors';

interface VaccinationRow { id: string; cat_id: string; vaccine_name: string; vaccination_date: string; expiration_date: string | null; clinic_name: string | null; veterinarian_name: string | null; lot_number: string | null; notes: string | null; created_at: string; }

function rowToVaccination(r: VaccinationRow): Vaccination {
  return { id: r.id, catId: r.cat_id, vaccineName: r.vaccine_name, vaccinationDate: r.vaccination_date, expirationDate: r.expiration_date ?? undefined, clinicName: r.clinic_name ?? undefined, veterinarianName: r.veterinarian_name ?? undefined, lotNumber: r.lot_number ?? undefined, notes: r.notes ?? undefined, createdAt: r.created_at };
}

export class VaccineService {
  static async addVaccination(catId: string, userId: string, data: Partial<Vaccination>, env: Env): Promise<Vaccination> {
    const cat = await CatService.getCatById(catId, userId, env);
    const id = uuidv4(); const now = new Date().toISOString();
    await execute(env.DB, `INSERT INTO vaccinations (id, cat_id, vaccine_name, vaccination_date, expiration_date, clinic_name, veterinarian_name, lot_number, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [id, catId, data.vaccineName ?? '', data.vaccinationDate ?? now.slice(0, 10), data.expirationDate ?? null, data.clinicName ?? null, data.veterinarianName ?? null, data.lotNumber ?? null, data.notes ?? null, now]);
    if (data.expirationDate) {
      for (const days of [7, 1]) {
        const scheduled = new Date(data.expirationDate); scheduled.setDate(scheduled.getDate() - days);
        await execute(env.DB, `INSERT INTO notifications (id, user_id, cat_id, type, title, message, status, scheduled_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [uuidv4(), userId, catId, 'vaccine', `วัคซีน ${data.vaccineName ?? ''} ของ ${cat.name} ใกล้หมดอายุ`, `วัคซีน ${data.vaccineName ?? ''} จะหมดอายุใน ${days} วัน (${data.expirationDate})`, 'pending', scheduled.toISOString(), now]);
      }
    }
    return rowToVaccination((await queryOne<VaccinationRow>(env.DB, 'SELECT * FROM vaccinations WHERE id = ?', [id]))!);
  }

  static async getVaccinationsByCatId(catId: string, userId: string, env: Env): Promise<Vaccination[]> {
    await CatService.getCatById(catId, userId, env);
    return (await query<VaccinationRow>(env.DB, 'SELECT * FROM vaccinations WHERE cat_id = ? ORDER BY vaccination_date DESC', [catId])).map(rowToVaccination);
  }

  static async getUpcomingVaccinations(_userId: string, env: Env): Promise<(Vaccination & { catName: string })[]> {
    const rows = await query<VaccinationRow & { cat_name: string }>(env.DB, `SELECT v.*, c.name AS cat_name FROM vaccinations v JOIN cats c ON v.cat_id = c.id WHERE v.expiration_date IS NOT NULL AND date(v.expiration_date) <= date('now', '+30 days') AND v.id = (SELECT v2.id FROM vaccinations v2 WHERE v2.cat_id = v.cat_id AND v2.vaccine_name = v.vaccine_name ORDER BY v2.vaccination_date DESC, v2.created_at DESC LIMIT 1) ORDER BY v.expiration_date ASC`, []);
    return rows.map((r) => ({ ...rowToVaccination(r), catName: r.cat_name }));
  }

  static async updateVaccination(vacId: string, catId: string, userId: string, updates: Partial<Vaccination>, env: Env): Promise<Vaccination> {
    await CatService.getCatById(catId, userId, env);
    if (!await queryOne<{ id: string }>(env.DB, 'SELECT id FROM vaccinations WHERE id = ? AND cat_id = ?', [vacId, catId])) throw NOT_FOUND;
    const fieldMap: Record<string, string> = { vaccineName: 'vaccine_name', vaccinationDate: 'vaccination_date', expirationDate: 'expiration_date', clinicName: 'clinic_name', veterinarianName: 'veterinarian_name', lotNumber: 'lot_number', notes: 'notes' };
    const setClauses: string[] = []; const values: unknown[] = [];
    for (const [key, col] of Object.entries(fieldMap)) { const val = updates[key as keyof Vaccination]; if (val !== undefined) { setClauses.push(`${col} = ?`); values.push(val); } }
    if (setClauses.length > 0) { values.push(vacId, catId); await execute(env.DB, `UPDATE vaccinations SET ${setClauses.join(', ')} WHERE id = ? AND cat_id = ?`, values); }
    return rowToVaccination((await queryOne<VaccinationRow>(env.DB, 'SELECT * FROM vaccinations WHERE id = ?', [vacId]))!);
  }

  static async deleteVaccination(vacId: string, catId: string, userId: string, env: Env): Promise<void> {
    await CatService.getCatById(catId, userId, env);
    if (!await queryOne<{ id: string }>(env.DB, 'SELECT id FROM vaccinations WHERE id = ? AND cat_id = ?', [vacId, catId])) throw NOT_FOUND;
    await execute(env.DB, 'DELETE FROM vaccinations WHERE id = ? AND cat_id = ?', [vacId, catId]);
  }
}
