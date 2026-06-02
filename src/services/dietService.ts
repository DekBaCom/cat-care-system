import { v4 as uuidv4 } from 'uuid';
import type { DietInfo, Env, FeedingSchedule } from '../types';
import { query, queryOne, execute } from '../utils/db';
import { CatService } from './catService';

interface DietRow { id: string; cat_id: string; food_name: string; food_type: string; portion_size: number | null; unit: string | null; frequency_per_day: number | null; is_main_food: number; created_at: string; }
interface FeedRow { id: string; cat_id: string; time_of_day: string; diet_id: string | null; is_enabled: number; notification_enabled: number; created_at: string; updated_at: string; }

function rowToDiet(r: DietRow): DietInfo { return { id: r.id, catId: r.cat_id, foodName: r.food_name, foodType: r.food_type as DietInfo['foodType'], portionSize: r.portion_size ?? undefined, unit: (r.unit as DietInfo['unit']) ?? undefined, frequencyPerDay: r.frequency_per_day ?? undefined, isMainFood: r.is_main_food === 1, createdAt: r.created_at }; }
function rowToSchedule(r: FeedRow): FeedingSchedule { return { id: r.id, catId: r.cat_id, timeOfDay: r.time_of_day, dietId: r.diet_id ?? undefined, isEnabled: r.is_enabled === 1, notificationEnabled: r.notification_enabled === 1, createdAt: r.created_at, updatedAt: r.updated_at }; }

export class DietService {
  static async setDietInfo(catId: string, userId: string, data: Partial<DietInfo>, env: Env): Promise<DietInfo> {
    await CatService.getCatById(catId, userId, env);
    const id = uuidv4(); const now = new Date().toISOString();
    await execute(env.DB, `INSERT INTO diet_info (id, cat_id, food_name, food_type, portion_size, unit, frequency_per_day, is_main_food, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [id, catId, data.foodName ?? '', data.foodType ?? 'dry', data.portionSize ?? null, data.unit ?? null, data.frequencyPerDay ?? null, data.isMainFood ? 1 : 0, now]);
    return rowToDiet((await queryOne<DietRow>(env.DB, 'SELECT * FROM diet_info WHERE id = ?', [id]))!);
  }

  static async getDietInfo(catId: string, userId: string, env: Env): Promise<{ mainFood: DietInfo | null; supplements: DietInfo[] }> {
    await CatService.getCatById(catId, userId, env);
    const diets = (await query<DietRow>(env.DB, 'SELECT * FROM diet_info WHERE cat_id = ? ORDER BY is_main_food DESC', [catId])).map(rowToDiet);
    return { mainFood: diets.find((d) => d.isMainFood) ?? null, supplements: diets.filter((d) => !d.isMainFood) };
  }

  static async setFeedingSchedule(catId: string, userId: string, schedules: Array<{ timeOfDay: string; dietId?: string; notificationEnabled?: boolean }>, env: Env): Promise<FeedingSchedule[]> {
    await CatService.getCatById(catId, userId, env);
    const now = new Date().toISOString();
    await execute(env.DB, 'DELETE FROM feeding_schedule WHERE cat_id = ?', [catId]);
    for (const s of schedules) await execute(env.DB, `INSERT INTO feeding_schedule (id, cat_id, time_of_day, diet_id, is_enabled, notification_enabled, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [uuidv4(), catId, s.timeOfDay, s.dietId ?? null, 1, s.notificationEnabled ? 1 : 0, now, now]);
    return DietService.getFeedingSchedule(catId, userId, env);
  }

  static async getFeedingSchedule(catId: string, userId: string, env: Env): Promise<FeedingSchedule[]> {
    await CatService.getCatById(catId, userId, env);
    return (await query<FeedRow>(env.DB, 'SELECT * FROM feeding_schedule WHERE cat_id = ? ORDER BY time_of_day ASC', [catId])).map(rowToSchedule);
  }
}
