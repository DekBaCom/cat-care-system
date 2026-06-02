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
import { uploadRoutes } from './routes/upload';
import { weightRoutes } from './routes/weights';
import { timelineRoutes } from './routes/timeline';
import { expenseRoutes } from './routes/expenses';
import { lineWebhook } from './webhooks/line';
import { handleScheduled } from './scheduled/notifications';
import { errorToResponse } from './utils/errors';
import { appHtml } from './pages/app';

const app = new Hono<{ Bindings: Env }>();

app.use('*', logger());
app.use('/api/*', cors({
  origin: [
    'https://cat-care.ilikeit.info',
    'https://cat-care-system.abdulloh-eg.workers.dev',
    'http://localhost:3000',
    'http://127.0.0.1:8787',
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}));
app.onError((err, c) => { const { statusCode, body } = errorToResponse(err); return c.json(body, statusCode as 500); });

app.get('/', (c) => c.html(appHtml));

app.get('/api', (c) => c.json({
  name: 'Cat Care Management System',
  version: '1.0.0',
  status: 'ok',
  environment: c.env.ENVIRONMENT,
  endpoints: {
    health: 'GET /health',
    auth: ['POST /api/auth/register', 'POST /api/auth/login', 'POST /api/auth/line/connect'],
    cats: ['GET /api/cats', 'POST /api/cats', 'GET /api/cats/:id', 'PUT /api/cats/:id', 'DELETE /api/cats/:id'],
    vaccinations: ['GET /api/cats/:id/vaccinations', 'POST /api/cats/:id/vaccinations', 'GET /api/vaccinations/upcoming'],
    medical: ['GET /api/cats/:id/medical-history', 'POST /api/cats/:id/medical-history', 'GET /api/cats/:id/medications', 'POST /api/cats/:id/medications'],
    diet: ['GET /api/cats/:id/diet', 'POST /api/cats/:id/diet', 'GET /api/cats/:id/feeding-schedule', 'POST /api/cats/:id/feeding-schedule'],
    dashboard: 'GET /api/dashboard',
    webhook: 'POST /webhook/line',
  },
}));

app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString(), environment: c.env.ENVIRONMENT }));

app.get('/api/config', (c) => c.json({
  googleClientId: c.env.GOOGLE_CLIENT_ID || '',
  environment: c.env.ENVIRONMENT,
}));

app.get('/photos/*', async (c) => {
  const key = c.req.path.slice('/photos/'.length);
  const obj = await c.env.IMAGES.get(key);
  if (!obj) return c.notFound();
  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set('etag', obj.httpEtag);
  headers.set('cache-control', 'public, max-age=31536000, immutable');
  return new Response(obj.body, { headers });
});

app.route('/webhook/line', lineWebhook);
app.route('/api/auth', authRoutes);
app.route('/api', catRoutes);
app.route('/api', vaccinationRoutes);
app.route('/api', medicalRoutes);
app.route('/api', dietRoutes);
app.route('/api', dashboardRoutes);
app.route('/api', uploadRoutes);
app.route('/api', weightRoutes);
app.route('/api', timelineRoutes);
app.route('/api', expenseRoutes);
app.notFound((c) => c.json({ success: false, error: 'Not Found' }, 404));

export default { fetch: app.fetch, scheduled: handleScheduled };
