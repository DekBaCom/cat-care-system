import { Hono } from 'hono';
import type { Env } from '../types';
import { TimelineService } from '../services/timelineService';
import { authMiddleware, getUserId } from '../middleware/auth';
import { errorToResponse } from '../utils/errors';

export const timelineRoutes = new Hono<{ Bindings: Env }>();
timelineRoutes.use('*', authMiddleware);

timelineRoutes.get('/cats/:catId/timeline', async (c) => {
  try {
    const events = await TimelineService.getTimeline(c.req.param('catId'), getUserId(c), c.env);
    return c.json({ success: true, data: { total: events.length, events } });
  } catch (error) {
    const { statusCode, body } = errorToResponse(error as Error);
    return c.json(body, statusCode as 401 | 404 | 500);
  }
});
