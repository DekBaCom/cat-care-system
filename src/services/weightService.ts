import { v4 as uuidv4 } from 'uuid';
import type { Env } from '../types';
import { query, queryOne, execute } from '../utils/db';
import { CatService } from './catService';
import { NOT_FOUND } from '../utils/errors';

export interface WeightLog {
  id: string;
  catId: string;
  weightKg: number;
  loggedDate: string;
  notes?: string;
  createdAt: string;
}

interface WeightLogRow {
  id: string;
  cat_id: string;
  weight_kg: number;
  logged_date: string;
  notes: string | null;
  created_at: string;
}

function rowToLog(r: WeightLogRow): WeightLog {
  return { id: r.id, catId: r.cat_id, weightKg: r.weight_kg, loggedDate: r.logged_date, notes: r.notes ?? undefined, createdAt: r.created_at };
}

export class WeightService {
  static async addWeightLog(catId: string, userId: string, weightKg: number, loggedDate: string, notes: string | undefined, env: Env): Promise<WeightLog> {
    await CatService.getCatById(catId, userId, env);
    const id = uuidv4();
    const now = new Date().toISOString();
    await execute(env.DB, 'INSERT INTO weight_logs (id, cat_id, weight_kg, logged_date, notes, created_at) VALUES (?, ?, ?, ?, ?, ?)', [id, catId, weightKg, loggedDate, notes ?? null, now]);
    await execute(env.DB, 'UPDATE cats SET weight_kg = ?, updated_at = ? WHERE id = ?', [weightKg, now, catId]);
    return rowToLog((await queryOne<WeightLogRow>(env.DB, 'SELECT * FROM weight_logs WHERE id = ?', [id]))!);
  }

  static async getWeightHistory(catId: string, userId: string, env: Env): Promise<WeightLog[]> {
    await CatService.getCatById(catId, userId, env);
    return (await query<WeightLogRow>(env.DB, 'SELECT * FROM weight_logs WHERE cat_id = ? ORDER BY logged_date ASC, created_at ASC', [catId])).map(rowToLog);
  }

  static async deleteWeightLog(logId: string, catId: string, userId: string, env: Env): Promise<void> {
    await CatService.getCatById(catId, userId, env);
    const existing = await queryOne<{ id: string }>(env.DB, 'SELECT id FROM weight_logs WHERE id = ? AND cat_id = ?', [logId, catId]);
    if (!existing) throw NOT_FOUND;
    await execute(env.DB, 'DELETE FROM weight_logs WHERE id = ? AND cat_id = ?', [logId, catId]);
  }
}
