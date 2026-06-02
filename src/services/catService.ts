import { v4 as uuidv4 } from 'uuid';
import type { Cat, Env } from '../types';
import { query, queryOne, execute } from '../utils/db';
import { NOT_FOUND } from '../utils/errors';

interface CatRow { id: string; user_id: string; name: string; gender: 'M' | 'F' | null; breed: string | null; date_of_birth: string | null; weight_kg: number | null; health_status: 'normal' | 'treating' | 'caution'; microchip_id: string | null; photo_url: string | null; chronic_diseases: string | null; drug_allergies: string | null; forbidden_foods: string | null; created_at: string; updated_at: string; }

function rowToCat(r: CatRow): Cat {
  return { id: r.id, userId: r.user_id, name: r.name, gender: r.gender ?? undefined, breed: r.breed ?? undefined, dateOfBirth: r.date_of_birth ?? undefined, weightKg: r.weight_kg ?? undefined, healthStatus: r.health_status, microchipId: r.microchip_id ?? undefined, photoUrl: r.photo_url ?? undefined, chronicDiseases: r.chronic_diseases ?? undefined, drugAllergies: r.drug_allergies ?? undefined, forbiddenFoods: r.forbidden_foods ?? undefined, createdAt: r.created_at, updatedAt: r.updated_at };
}

export class CatService {
  static async createCat(userId: string, data: Partial<Cat>, env: Env): Promise<Cat> {
    const id = uuidv4(); const now = new Date().toISOString();
    await execute(env.DB, `INSERT INTO cats (id, user_id, name, gender, breed, date_of_birth, weight_kg, health_status, microchip_id, photo_url, chronic_diseases, drug_allergies, forbidden_foods, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [id, userId, data.name ?? '', data.gender ?? null, data.breed ?? null, data.dateOfBirth ?? null, data.weightKg ?? null, data.healthStatus ?? 'normal', data.microchipId ?? null, data.photoUrl ?? null, data.chronicDiseases ?? null, data.drugAllergies ?? null, data.forbiddenFoods ?? null, now, now]);
    return rowToCat((await queryOne<CatRow>(env.DB, 'SELECT * FROM cats WHERE id = ?', [id]))!);
  }

  // Shared workspace: all authenticated users see and manage the same cats.
  // userId is kept for "created_by" tracking but no longer filters queries.
  static async getCatsByUserId(_userId: string, env: Env): Promise<Cat[]> {
    return (await query<CatRow>(env.DB, 'SELECT * FROM cats ORDER BY created_at DESC')).map(rowToCat);
  }

  static async getCatById(catId: string, _userId: string, env: Env): Promise<Cat> {
    const row = await queryOne<CatRow>(env.DB, 'SELECT * FROM cats WHERE id = ?', [catId]);
    if (!row) throw NOT_FOUND;
    return rowToCat(row);
  }

  static async updateCat(catId: string, userId: string, updates: Partial<Cat>, env: Env): Promise<Cat> {
    await CatService.getCatById(catId, userId, env);
    const fieldMap: Record<string, string> = { name: 'name', gender: 'gender', breed: 'breed', dateOfBirth: 'date_of_birth', weightKg: 'weight_kg', healthStatus: 'health_status', microchipId: 'microchip_id', photoUrl: 'photo_url', chronicDiseases: 'chronic_diseases', drugAllergies: 'drug_allergies', forbiddenFoods: 'forbidden_foods' };
    const setClauses: string[] = []; const values: unknown[] = [];
    for (const [key, col] of Object.entries(fieldMap)) { const val = updates[key as keyof Cat]; if (val !== undefined) { setClauses.push(`${col} = ?`); values.push(val); } }
    if (setClauses.length > 0) { setClauses.push('updated_at = ?'); values.push(new Date().toISOString(), catId); await execute(env.DB, `UPDATE cats SET ${setClauses.join(', ')} WHERE id = ?`, values); }
    return CatService.getCatById(catId, userId, env);
  }

  static async deleteCat(catId: string, userId: string, env: Env): Promise<void> {
    await CatService.getCatById(catId, userId, env);
    await execute(env.DB, 'DELETE FROM cats WHERE id = ?', [catId]);
  }
}
