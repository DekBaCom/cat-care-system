import { v4 as uuidv4 } from 'uuid';
import type { Env } from '../types';
import { query, queryOne, execute } from '../utils/db';
import { CatService } from './catService';
import { NOT_FOUND } from '../utils/errors';

export type ExpenseCategory = 'medical' | 'vaccine' | 'medication' | 'food' | 'accessories' | 'grooming' | 'insurance' | 'other';

export interface Expense {
  id: string;
  catId: string;
  amount: number;
  category: ExpenseCategory;
  description?: string;
  expenseDate: string;
  source: 'manual' | 'medical';
  createdAt: string;
}

interface ExpenseRow {
  id: string; cat_id: string; amount: number; category: string;
  description: string | null; expense_date: string; created_at: string;
}

interface MedicalCostRow {
  id: string; cat_id: string; cost: number; record_date: string;
  type: string; diagnosis: string | null; symptoms: string | null;
  clinic_name: string | null; created_at: string;
}

function rowToExpense(r: ExpenseRow): Expense {
  return {
    id: r.id, catId: r.cat_id, amount: r.amount,
    category: r.category as ExpenseCategory,
    description: r.description ?? undefined,
    expenseDate: r.expense_date, source: 'manual', createdAt: r.created_at,
  };
}

function medicalRowToExpense(r: MedicalCostRow): Expense {
  const typeLabel = ({ illness: 'เจ็บป่วย', injury: 'บาดเจ็บ', checkup: 'ตรวจสุขภาพ', surgery: 'ผ่าตัด' } as Record<string, string>)[r.type] ?? r.type;
  const parts = [typeLabel, r.diagnosis, r.clinic_name].filter(Boolean);
  return {
    id: 'medical-' + r.id, catId: r.cat_id, amount: r.cost,
    category: 'medical', description: parts.join(' · ') || undefined,
    expenseDate: r.record_date, source: 'medical', createdAt: r.created_at,
  };
}

export class ExpenseService {
  static async addExpense(catId: string, userId: string, data: { amount: number; category: ExpenseCategory; description?: string; expenseDate: string }, env: Env): Promise<Expense> {
    await CatService.getCatById(catId, userId, env);
    const id = uuidv4();
    const now = new Date().toISOString();
    await execute(env.DB,
      'INSERT INTO expenses (id, cat_id, amount, category, description, expense_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, catId, data.amount, data.category, data.description ?? null, data.expenseDate, now],
    );
    return rowToExpense((await queryOne<ExpenseRow>(env.DB, 'SELECT * FROM expenses WHERE id = ?', [id]))!);
  }

  static async getExpenses(catId: string, userId: string, env: Env): Promise<Expense[]> {
    await CatService.getCatById(catId, userId, env);
    const [manual, medical] = await Promise.all([
      query<ExpenseRow>(env.DB, 'SELECT * FROM expenses WHERE cat_id = ? ORDER BY expense_date DESC', [catId]),
      query<MedicalCostRow>(env.DB, 'SELECT id, cat_id, cost, record_date, type, diagnosis, symptoms, clinic_name, created_at FROM medical_history WHERE cat_id = ? AND cost IS NOT NULL AND cost > 0', [catId]),
    ]);
    const all = [...manual.map(rowToExpense), ...medical.map(medicalRowToExpense)];
    all.sort((a, b) => b.expenseDate.localeCompare(a.expenseDate));
    return all;
  }

  static async deleteExpense(expenseId: string, catId: string, userId: string, env: Env): Promise<void> {
    await CatService.getCatById(catId, userId, env);
    if (expenseId.startsWith('medical-')) {
      throw new Error('ค่ารักษาพยาบาลต้องแก้ไขจากแท็บประวัติการรักษา');
    }
    const existing = await queryOne<{ id: string }>(env.DB, 'SELECT id FROM expenses WHERE id = ? AND cat_id = ?', [expenseId, catId]);
    if (!existing) throw NOT_FOUND;
    await execute(env.DB, 'DELETE FROM expenses WHERE id = ? AND cat_id = ?', [expenseId, catId]);
  }
}
