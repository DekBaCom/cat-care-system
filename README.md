# Cat Care Management System

A full-featured cat health management system built on Cloudflare Workers. Tracks vaccinations, medications, medical history, diet, weight, expenses, dewormings, and sends reminders via LINE.

**Live:** https://cat-care.ilikeit.info

## Stack

| Layer | Technology |
|---|---|
| Runtime | Cloudflare Workers (TypeScript) |
| Framework | Hono |
| Database | Cloudflare D1 (SQLite) |
| Storage | Cloudflare R2 (photos) |
| Cache | Cloudflare KV |
| Auth | JWT + PBKDF2, Google OAuth |
| Notifications | LINE Messaging API |

## Features

- **Cat profiles** — photo upload, shareable public profile page
- **Vaccinations** — record & upcoming reminder (7-day window)
- **Medical history** — illness / injury / checkup / surgery with treating/recovered status
- **Medications** — active medication tracking
- **Dewormings** — deworming records
- **Diet & feeding schedule** — diet plans and meal scheduling
- **Weight logs** — weight history tracking
- **Expenses** — cost tracking per cat
- **Timeline** — unified activity feed
- **Dashboard** — summary overview
- **LINE Bot** — real-time chatbot commands + push notifications
- **Scheduled notifications** — cron jobs at 09:00, 18:00, and hourly

## Quick Start

```bash
npm install
cp .env.example .dev.vars   # fill in secrets
npm run db:migrate           # apply all migrations
npm run dev                  # http://localhost:8787
```

## Environment Variables

Set in `.dev.vars` for local dev, or `wrangler secret put <KEY>` for production:

| Variable | Description |
|---|---|
| `JWT_SECRET` | Secret key for signing JWTs |
| `LINE_CHANNEL_ID` | LINE Messaging API channel ID |
| `LINE_CHANNEL_SECRET` | LINE channel secret (webhook signature) |
| `LINE_CHANNEL_ACCESS_TOKEN` | LINE channel access token (push messages) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID (optional) |

## Database Migrations

```bash
# Local
wrangler d1 execute cat-care-db --file=migrations/001_init.sql
wrangler d1 execute cat-care-db --file=migrations/002_weight_logs.sql
wrangler d1 execute cat-care-db --file=migrations/003_expenses.sql
wrangler d1 execute cat-care-db --file=migrations/004_notifications_read.sql
wrangler d1 execute cat-care-db --file=migrations/005_cat_share_token.sql
wrangler d1 execute cat-care-db --file=migrations/006_dewormings.sql
wrangler d1 execute cat-care-db --file=migrations/007_medical_status.sql

# Remote (production)
wrangler d1 execute cat-care-db --remote --file=migrations/<file>.sql
```

## Deploy

```bash
wrangler secret put JWT_SECRET
wrangler secret put LINE_CHANNEL_SECRET
wrangler secret put LINE_CHANNEL_ACCESS_TOKEN
npm run deploy
# then run all migrations with --remote flag
```

## API Reference

All authenticated endpoints require `Authorization: Bearer <token>`.

### Auth

| Method | Path | Auth |
|---|---|---|
| POST | `/api/auth/register` | — |
| POST | `/api/auth/login` | — |
| POST | `/api/auth/line/connect` | ✓ |

### Cats

| Method | Path | Auth |
|---|---|---|
| GET | `/api/cats` | ✓ |
| POST | `/api/cats` | ✓ |
| GET | `/api/cats/:id` | ✓ |
| PUT | `/api/cats/:id` | ✓ |
| DELETE | `/api/cats/:id` | ✓ |
| GET | `/api/cats/:id/share` | ✓ |
| POST | `/api/cats/:id/share` | ✓ |
| DELETE | `/api/cats/:id/share` | ✓ |
| GET | `/share/:token` | — (public) |

### Vaccinations

| Method | Path | Auth |
|---|---|---|
| GET | `/api/cats/:id/vaccinations` | ✓ |
| POST | `/api/cats/:id/vaccinations` | ✓ |
| GET | `/api/vaccinations/upcoming` | ✓ |

### Medical History & Medications

| Method | Path | Auth |
|---|---|---|
| GET | `/api/cats/:catId/medical-history` | ✓ |
| POST | `/api/cats/:catId/medical-history` | ✓ |
| PATCH | `/api/cats/:catId/medical-history/:id/status` | ✓ |
| GET | `/api/cats/:catId/medications` | ✓ |
| POST | `/api/cats/:catId/medications` | ✓ |
| PUT | `/api/cats/:catId/medications/:medId` | ✓ |

### Dewormings

| Method | Path | Auth |
|---|---|---|
| GET | `/api/cats/:catId/dewormings` | ✓ |
| POST | `/api/cats/:catId/dewormings` | ✓ |

### Diet & Feeding

| Method | Path | Auth |
|---|---|---|
| GET | `/api/cats/:id/diet` | ✓ |
| POST | `/api/cats/:id/diet` | ✓ |
| GET | `/api/cats/:id/feeding-schedule` | ✓ |
| POST | `/api/cats/:id/feeding-schedule` | ✓ |

### Weights

| Method | Path | Auth |
|---|---|---|
| GET | `/api/cats/:catId/weights` | ✓ |
| POST | `/api/cats/:catId/weights` | ✓ |

### Expenses

| Method | Path | Auth |
|---|---|---|
| GET | `/api/cats/:catId/expenses` | ✓ |
| POST | `/api/cats/:catId/expenses` | ✓ |

### Timeline & Dashboard

| Method | Path | Auth |
|---|---|---|
| GET | `/api/cats/:catId/timeline` | ✓ |
| GET | `/api/dashboard` | ✓ |

### Notifications

| Method | Path | Auth |
|---|---|---|
| GET | `/api/notifications` | ✓ |
| POST | `/api/notifications/read-all` | ✓ |

### Photos

| Method | Path | Auth |
|---|---|---|
| POST | `/api/upload` | ✓ |
| GET | `/photos/:key` | — (public) |

### System

| Method | Path |
|---|---|
| GET | `/health` |
| GET | `/api` |
| GET | `/api/config` |

## LINE Bot Commands

Connect your LINE account via **Settings → LINE** in the app (enter the 6-digit code), then use these commands in the LINE chat:

| Command | Description |
|---|---|
| `/my_cats` | List all your cats |
| `/vaccines_due` | Vaccines due within the next 7 days |
| `/medications` | Currently active medications |
| `/myid` | Show your LINE User ID |
| `/help` | Show all available commands |

## Scripts

```bash
npm run dev          # local dev server
npm run deploy       # deploy to Cloudflare Workers
npm run test         # run jest tests
npm run lint         # ESLint
npm run lint:fix     # ESLint with auto-fix
npm run type-check   # TypeScript check (no emit)
```
