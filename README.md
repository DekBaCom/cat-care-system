# Cat Care Management System

A full-featured cat health management system built on Cloudflare Workers. Tracks vaccinations, medications, medical history, diet, weight, expenses, dewormings, spot-on flea treatments, and sends reminders via LINE and web notifications.

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
| Notifications | LINE Messaging API + Web (in-app bell) |

## Features

- **Cat profiles** — photo upload, shareable public profile page
- **Vaccinations** — record history, dashboard shows due within 30 days + overdue (latest record per vaccine)
- **Medical history** — illness / injury / checkup / surgery with treating/recovered status
- **Medications** — active medication tracking with daily reminders
- **Dewormings** — deworming records with due-date reminders
- **Spot-on flea treatments** — หยอดหลัง records with next-due tracking
- **Diet & feeding schedule** — diet plans and meal scheduling
- **Weight logs** — weight history tracking
- **Expenses** — cost tracking per cat
- **Timeline** — unified activity feed
- **Dashboard** — summary overview
- **LINE Bot** — real-time chatbot commands + push notifications
- **Web notifications** — in-app bell icon with unread badge, multi-line formatted messages
- **Scheduled notifications** — alerts at 30/15/7/5/2/1 days before due, on the day, and daily overdue reminders

## วิธีใช้งาน

### 1. สมัครสมาชิก / เข้าสู่ระบบ

เปิด https://cat-care.ilikeit.info แล้วสมัครด้วย Email หรือ Google Account

### 2. เพิ่มข้อมูลแมว

กด **"+ เพิ่มแมว"** ที่หน้าหลัก กรอกชื่อ สายพันธุ์ วันเกิด เพศ น้ำหนัก และอัปโหลดรูปภาพได้

### 3. บันทึกวัคซีน

เปิดโปรไฟล์แมว → แท็บ **💉 วัคซีน** → กรอกชื่อวัคซีน วันที่ฉีด และ **วันนัดฉีดครั้งต่อไป**
ระบบจะแจ้งเตือนอัตโนมัติที่ 30/15/7/5/2/1 วันก่อนถึงกำหนด

### 4. บันทึกการถ่ายพยาธิ

แท็บ **🐛 ถ่ายพยาธิ** → กรอกวันที่ถ่าย ชื่อยา และวันนัดครั้งถัดไป

### 5. บันทึกการหยอดหลัง (Spot-on)

แท็บ **🐾 หยอดหลัง** → กรอกวันที่หยอด ชื่อยา ขนาด และวันนัดครั้งถัดไป

### 6. บันทึกยาที่ต้องให้ประจำ

แท็บ **💊 ยา** → เพิ่มยา ระบุขนาดและสถานะ Active
ระบบจะแจ้งเตือนทุกวันเวลา 09:00 น.

### 7. บันทึกประวัติการรักษา

แท็บ **🏥 ประวัติสุขภาพ** → บันทึกอาการ การวินิจฉัย ชื่อสัตวแพทย์ และสถานะ (กำลังรักษา / หายแล้ว)

### 8. บันทึกน้ำหนัก

แท็บ **⚖️ น้ำหนัก** → บันทึกน้ำหนักพร้อมวันที่ เพื่อติดตามพัฒนาการ

### 9. บันทึกค่าใช้จ่าย

แท็บ **💰 ค่าใช้จ่าย** → บันทึกรายการค่าใช้จ่ายพร้อมหมวดหมู่และรายละเอียด

### 10. แชร์โปรไฟล์แมว

แท็บ **🔗 แชร์** → สร้าง Public Link เพื่อให้สัตวแพทย์หรือคนอื่นดูข้อมูลแมวโดยไม่ต้อง Login

### 11. เชื่อมต่อ LINE เพื่อรับการแจ้งเตือน

1. เปิด **⚙️ ตั้งค่า** → **เชื่อมต่อ LINE**
2. รับโค้ด 6 หลัก
3. ส่งโค้ดนั้นไปที่ LINE Bot ของระบบ
4. ระบบจะส่งแจ้งเตือนวัคซีน ถ่ายพยาธิ และยาเข้า LINE โดยอัตโนมัติ

### 12. ดู Dashboard

หน้าหลักแสดงสรุปภาพรวม: วัคซีนใกล้ถึงกำหนด, ยาที่กำลังให้, การถ่ายพยาธิที่ใกล้ครบ

### 13. ดูการแจ้งเตือนในเว็บ

กดไอคอน **🔔** มุมบนขวา เพื่อดูรายการแจ้งเตือนทั้งหมด

---

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

### Flea Treatments

| Method | Path | Auth |
|---|---|---|
| GET | `/api/cats/:catId/flea-treatments` | ✓ |
| POST | `/api/cats/:catId/flea-treatments` | ✓ |
| DELETE | `/api/cats/:catId/flea-treatments/:id` | ✓ |

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
| POST | `/api/notifications/test` | ✓ |

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
| `/vaccines_due` | Vaccines overdue up to 15 days ago or due within the next 7 days (latest record only) |
| `/medications` | Currently active medications |
| `/dewormings_due` | Dewormings overdue or due within the next 7 days (latest record only) |
| `/weights` | Latest recorded weight for each cat |
| `/status` | Health summary: cat count, upcoming vaccines, active meds, due dewormings |
| `/myid` | Show your LINE User ID |
| `/help` | Show all available commands |

## Notification Format

Vaccine and deworming alerts use this format on both LINE and web:

```
💉 แจ้งเตือน : {ชื่อวัคซีน}
━━━━━━━━━━━━━━━━━━━━
🐱 แมว: {ชื่อแมว}
📌 วัคซีน: {ชื่อวัคซีน}
📅 วันนัดฉีด: {วันที่}
⏰ อีก : {จำนวน} วัน
━━━━━━━━━━━━━━━━━━━━
กรุณานัดหมายคลินิกล่วงหน้า 🏥
```

## Push Notifications Schedule

Automatic push notifications are sent via LINE and shown in the web bell at the following checkpoints:

| Trigger | Vaccines | Dewormings | Medications |
|---|---|---|---|
| 30 days before | ✓ | ✓ | — |
| 15 days before | ✓ | ✓ | — |
| 7 days before | ✓ | ✓ | — |
| 5 days before | ✓ | ✓ | — |
| 2 days before | ✓ | ✓ | — |
| 1 day before | ✓ | ✓ | — |
| On the day | ✓ | ✓ | — |
| Daily (09:00 UTC+7) | overdue repeat | overdue repeat | ✓ active meds |

## Scripts

```bash
npm run dev          # local dev server
npm run deploy       # deploy to Cloudflare Workers
npm run test         # run jest tests
npm run lint         # ESLint
npm run lint:fix     # ESLint with auto-fix
npm run type-check   # TypeScript check (no emit)
```
