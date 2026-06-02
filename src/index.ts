import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import type { Env } from './types';
import { authRoutes } from './routes/auth';
import { catRoutes } from './routes/cats';
import { vaccinationRoutes } from './routes/vaccinations';
import { medicalRoutes } from './routes/medical';
import { dietRoutes } from './routes/diet';
import { dashboardRoutes } from './routes/dashboard';
import { lineWebhook } from './webhooks/line';
import { handleScheduled } from './scheduled/notifications';
import { errorToResponse } from './utils/errors';

const app = new Hono<{ Bindings: Env }>();

app.use('*', logger());
app.use('/api/*', cors({ origin: ['https://catcare.example.com', 'http://localhost:3000'], allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], allowHeaders: ['Content-Type', 'Authorization'], maxAge: 86400 }));
app.onError((err, c) => { const { statusCode, body } = errorToResponse(err); return c.json(body, statusCode as 500); });

app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString(), environment: c.env.ENVIRONMENT }));
app.route('/webhook/line', lineWebhook);
app.route('/api/auth', authRoutes);
app.route('/api', catRoutes);
app.route('/api', vaccinationRoutes);
app.route('/api', medicalRoutes);
app.route('/api', dietRoutes);
app.route('/api', dashboardRoutes);
app.notFound((c) => c.json({ success: false, error: 'Not Found' }, 404));

export default { fetch: app.fetch, scheduled: handleScheduled };
