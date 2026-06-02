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

app.get('/', (c) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Cat Care Management System</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);min-height:100vh;color:#333;padding:2rem 1rem}
  .container{max-width:900px;margin:0 auto}
  .hero{background:white;border-radius:16px;padding:2.5rem;text-align:center;box-shadow:0 10px 40px rgba(0,0,0,.15);margin-bottom:1.5rem}
  .emoji{font-size:4rem;margin-bottom:1rem}
  h1{font-size:2.2rem;color:#2d3748;margin-bottom:.5rem}
  .subtitle{color:#718096;font-size:1.05rem;margin-bottom:1.5rem}
  .badges{display:flex;justify-content:center;gap:.6rem;flex-wrap:wrap}
  .badge{padding:.35rem .8rem;border-radius:999px;font-size:.85rem;font-weight:600}
  .badge-ok{background:#c6f6d5;color:#22543d}
  .badge-env{background:#bee3f8;color:#2a4365}
  .badge-ver{background:#fed7d7;color:#742a2a}
  .section{background:white;border-radius:16px;padding:2rem;margin-bottom:1.5rem;box-shadow:0 4px 20px rgba(0,0,0,.08)}
  .section h2{color:#2d3748;margin-bottom:1.2rem;display:flex;align-items:center;gap:.5rem;font-size:1.3rem}
  .group{margin-bottom:1.5rem}
  .group:last-child{margin-bottom:0}
  .group-title{font-size:.85rem;font-weight:700;color:#667eea;text-transform:uppercase;letter-spacing:.05em;margin-bottom:.6rem}
  .endpoint{display:flex;align-items:center;gap:.7rem;padding:.65rem .9rem;background:#f7fafc;border-radius:8px;margin-bottom:.4rem;font-family:'Monaco',monospace;font-size:.88rem}
  .method{font-weight:700;padding:.2rem .55rem;border-radius:4px;font-size:.75rem;min-width:55px;text-align:center;color:white}
  .method.GET{background:#48bb78}
  .method.POST{background:#4299e1}
  .method.PUT{background:#ed8936}
  .method.DELETE{background:#f56565}
  .path{color:#2d3748;flex:1}
  .lock{color:#a0aec0;font-size:.8rem}
  .footer{text-align:center;color:white;padding:1rem;font-size:.85rem;opacity:.9}
  .footer a{color:white;text-decoration:underline}
  code{background:#edf2f7;padding:.15rem .4rem;border-radius:4px;font-size:.85rem}
</style>
</head>
<body>
<div class="container">
  <div class="hero">
    <div class="emoji">🐱</div>
    <h1>Cat Care Management System</h1>
    <p class="subtitle">REST API for managing your cats' health, vaccines, medications & diet</p>
    <div class="badges">
      <span class="badge badge-ok">● Status: OK</span>
      <span class="badge badge-env">${c.env.ENVIRONMENT}</span>
      <span class="badge badge-ver">v1.0.0</span>
    </div>
  </div>

  <div class="section">
    <h2>📡 API Endpoints</h2>

    <div class="group">
      <div class="group-title">🔓 Public</div>
      <div class="endpoint"><span class="method GET">GET</span><span class="path">/health</span></div>
      <div class="endpoint"><span class="method POST">POST</span><span class="path">/api/auth/register</span></div>
      <div class="endpoint"><span class="method POST">POST</span><span class="path">/api/auth/login</span></div>
      <div class="endpoint"><span class="method POST">POST</span><span class="path">/webhook/line</span></div>
    </div>

    <div class="group">
      <div class="group-title">🐈 Cats <span class="lock">🔒 Auth required</span></div>
      <div class="endpoint"><span class="method GET">GET</span><span class="path">/api/cats</span></div>
      <div class="endpoint"><span class="method POST">POST</span><span class="path">/api/cats</span></div>
      <div class="endpoint"><span class="method GET">GET</span><span class="path">/api/cats/:id</span></div>
      <div class="endpoint"><span class="method PUT">PUT</span><span class="path">/api/cats/:id</span></div>
      <div class="endpoint"><span class="method DELETE">DELETE</span><span class="path">/api/cats/:id</span></div>
    </div>

    <div class="group">
      <div class="group-title">💉 Vaccinations <span class="lock">🔒</span></div>
      <div class="endpoint"><span class="method GET">GET</span><span class="path">/api/cats/:id/vaccinations</span></div>
      <div class="endpoint"><span class="method POST">POST</span><span class="path">/api/cats/:id/vaccinations</span></div>
      <div class="endpoint"><span class="method GET">GET</span><span class="path">/api/vaccinations/upcoming</span></div>
    </div>

    <div class="group">
      <div class="group-title">🏥 Medical & Medications <span class="lock">🔒</span></div>
      <div class="endpoint"><span class="method GET">GET</span><span class="path">/api/cats/:id/medical-history</span></div>
      <div class="endpoint"><span class="method POST">POST</span><span class="path">/api/cats/:id/medical-history</span></div>
      <div class="endpoint"><span class="method GET">GET</span><span class="path">/api/cats/:id/medications</span></div>
      <div class="endpoint"><span class="method POST">POST</span><span class="path">/api/cats/:id/medications</span></div>
    </div>

    <div class="group">
      <div class="group-title">🍽️ Diet & Feeding <span class="lock">🔒</span></div>
      <div class="endpoint"><span class="method GET">GET</span><span class="path">/api/cats/:id/diet</span></div>
      <div class="endpoint"><span class="method POST">POST</span><span class="path">/api/cats/:id/diet</span></div>
      <div class="endpoint"><span class="method GET">GET</span><span class="path">/api/cats/:id/feeding-schedule</span></div>
      <div class="endpoint"><span class="method POST">POST</span><span class="path">/api/cats/:id/feeding-schedule</span></div>
    </div>

    <div class="group">
      <div class="group-title">📊 Dashboard <span class="lock">🔒</span></div>
      <div class="endpoint"><span class="method GET">GET</span><span class="path">/api/dashboard</span></div>
    </div>
  </div>

  <div class="section">
    <h2>🚀 Quick Start</h2>
    <p style="color:#4a5568;line-height:1.7">Register a new account, then use the returned token as <code>Authorization: Bearer &lt;token&gt;</code> for protected routes.</p>
    <p style="margin-top:.8rem;color:#4a5568;line-height:1.7">For JSON API discovery, visit <code><a href="/api">/api</a></code>.</p>
  </div>

  <div class="footer">
    Powered by Cloudflare Workers · Hono · D1 · R2 · KV<br>
    <a href="https://github.com/DekBaCom/cat-care-system" target="_blank">GitHub Repository</a>
  </div>
</div>
</body>
</html>`;
  return c.html(html);
});

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
app.route('/webhook/line', lineWebhook);
app.route('/api/auth', authRoutes);
app.route('/api', catRoutes);
app.route('/api', vaccinationRoutes);
app.route('/api', medicalRoutes);
app.route('/api', dietRoutes);
app.route('/api', dashboardRoutes);
app.notFound((c) => c.json({ success: false, error: 'Not Found' }, 404));

export default { fetch: app.fetch, scheduled: handleScheduled };
