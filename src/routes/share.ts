import { Hono } from 'hono';
import { v4 as uuidv4 } from 'uuid';
import type { Env } from '../types';
import { queryOne, execute } from '../utils/db';
import { authMiddleware } from '../middleware/auth';
import { errorToResponse, NOT_FOUND } from '../utils/errors';

export const shareRoutes = new Hono<{ Bindings: Env }>();

function shareUrl(env: Env, token: string): string {
  const base = env.ENVIRONMENT === 'production' ? 'https://cat-care.ilikeit.info' : 'http://localhost:8787';
  return `${base}/share/${token}`;
}

shareRoutes.get('/cats/:id/share', authMiddleware, async (c) => {
  try {
    const cat = await queryOne<{ share_token: string | null }>(c.env.DB, 'SELECT share_token FROM cats WHERE id = ?', [c.req.param('id')]);
    if (!cat) throw NOT_FOUND;
    return c.json({ success: true, data: { active: !!cat.share_token, url: cat.share_token ? shareUrl(c.env, cat.share_token) : null, token: cat.share_token } });
  } catch (error) { const { statusCode, body } = errorToResponse(error as Error); return c.json(body, statusCode as 404 | 500); }
});

shareRoutes.post('/cats/:id/share', authMiddleware, async (c) => {
  try {
    const catId = c.req.param('id');
    const cat = await queryOne<{ share_token: string | null }>(c.env.DB, 'SELECT share_token FROM cats WHERE id = ?', [catId]);
    if (!cat) throw NOT_FOUND;
    const token = cat.share_token ?? uuidv4().replace(/-/g, '').slice(0, 16);
    if (!cat.share_token) await execute(c.env.DB, 'UPDATE cats SET share_token = ? WHERE id = ?', [token, catId]);
    return c.json({ success: true, data: { token, url: shareUrl(c.env, token) } });
  } catch (error) { const { statusCode, body } = errorToResponse(error as Error); return c.json(body, statusCode as 404 | 500); }
});

shareRoutes.delete('/cats/:id/share', authMiddleware, async (c) => {
  try {
    const catId = c.req.param('id');
    if (!await queryOne<{ id: string }>(c.env.DB, 'SELECT id FROM cats WHERE id = ?', [catId])) throw NOT_FOUND;
    await execute(c.env.DB, 'UPDATE cats SET share_token = NULL WHERE id = ?', [catId]);
    return c.json({ success: true });
  } catch (error) { const { statusCode, body } = errorToResponse(error as Error); return c.json(body, statusCode as 404 | 500); }
});
