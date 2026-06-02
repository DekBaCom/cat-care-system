import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../types';
import { ExpenseService } from '../services/expenseService';
import { authMiddleware, getUserId } from '../middleware/auth';
import { errorToResponse } from '../utils/errors';

const schema = z.object({
  amount: z.number().positive('จำนวนเงินต้องมากกว่า 0'),
  category: z.enum(['medical', 'vaccine', 'medication', 'food', 'accessories', 'grooming', 'insurance', 'other']),
  description: z.string().optional(),
  expenseDate: z.string().min(1),
});

export const expenseRoutes = new Hono<{ Bindings: Env }>();
expenseRoutes.use('*', authMiddleware);

expenseRoutes.post('/cats/:catId/expenses', async (c) => {
  try {
    const parsed = schema.safeParse(await c.req.json());
    if (!parsed.success) return c.json({ success: false, error: parsed.error.errors[0]?.message ?? 'ข้อมูลไม่ถูกต้อง' }, 400);
    const expense = await ExpenseService.addExpense(c.req.param('catId'), getUserId(c), parsed.data, c.env);
    return c.json({ success: true, data: expense }, 201);
  } catch (error) { const { statusCode, body } = errorToResponse(error as Error); return c.json(body, statusCode as 400 | 401 | 404 | 500); }
});

expenseRoutes.get('/cats/:catId/expenses', async (c) => {
  try {
    const expenses = await ExpenseService.getExpenses(c.req.param('catId'), getUserId(c), c.env);
    return c.json({ success: true, data: { total: expenses.length, expenses } });
  } catch (error) { const { statusCode, body } = errorToResponse(error as Error); return c.json(body, statusCode as 401 | 404 | 500); }
});

expenseRoutes.delete('/cats/:catId/expenses/:expenseId', async (c) => {
  try {
    await ExpenseService.deleteExpense(c.req.param('expenseId'), c.req.param('catId'), getUserId(c), c.env);
    return c.json({ success: true, message: 'ลบสำเร็จ' });
  } catch (error) { const { statusCode, body } = errorToResponse(error as Error); return c.json(body, statusCode as 400 | 401 | 404 | 500); }
});
