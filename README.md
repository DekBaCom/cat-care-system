# Cat Care Management System

Cloudflare Workers REST API for managing cat health records, vaccinations, medications, diet, and LINE notifications.

## Stack
- **Runtime**: Cloudflare Workers (TypeScript) · **Framework**: Hono
- **Database**: Cloudflare D1 · **Storage**: R2 · **Cache**: KV
- **Notifications**: LINE Messaging API · **Auth**: JWT + PBKDF2

## Quick Start
```bash
npm install
cp .env.example .dev.vars   # fill in secrets
npm run db:migrate
npm run dev
```

## Deploy
```bash
wrangler secret put JWT_SECRET
npm run deploy
npm run db:migrate:remote
```

## API
| Method | Path | Auth |
|--------|------|------|
| POST | `/api/auth/register` | — |
| POST | `/api/auth/login` | — |
| GET/POST | `/api/cats` | ✓ |
| GET/PUT/DELETE | `/api/cats/:id` | ✓ |
| GET/POST | `/api/cats/:id/vaccinations` | ✓ |
| GET | `/api/vaccinations/upcoming` | ✓ |
| GET/POST | `/api/cats/:id/medical-history` | ✓ |
| GET/POST | `/api/cats/:id/medications` | ✓ |
| GET/POST | `/api/cats/:id/diet` | ✓ |
| GET/POST | `/api/cats/:id/feeding-schedule` | ✓ |
| GET | `/api/dashboard` | ✓ |
| POST | `/webhook/line` | — |
| GET | `/health` | — |

## LINE Bot Commands
`/my_cats` · `/vaccines_due` · `/medications` · `/help`
