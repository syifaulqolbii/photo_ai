# AI Photobooth — MVP

Platform web photobooth berbasis AI. User foto/upload → pilih tema → AI transform → download.

## Stack

- **Next.js 15** (App Router)
- **Drizzle ORM** + **PostgreSQL** via Supabase
- **Supabase Storage** (foto original + hasil)
- **Replicate API** (img2img AI models)
- **Tailwind CSS**

## Setup

```bash
cp .env.example .env.local
npm install
npm run db:push
npm run dev
```

## Env vars

| Var | Keterangan |
|-----|------------|
| `DATABASE_URL` | Supabase PostgreSQL connection string |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role (server-side upload) |
| `REPLICATE_API_TOKEN` | Replicate API token |
| `NEXT_PUBLIC_APP_URL` | App URL (untuk webhook Replicate) |

## Supabase Storage

Buat bucket bernama `photobooth` dengan public access di Supabase dashboard.

## Flow

```
/ (capture + theme) → POST /api/photos/upload → POST /api/photos/process
→ /result?id=xxx → GET /api/photos/:id (polling) → download
```

## MVP Scope (P0)

- [x] Capture kamera (WebRTC) + upload fallback
- [x] Pilih tema (5 tema)
- [x] AI processing via Replicate
- [x] Before/after preview + download
- [x] Share ke WA/IG

## Out of scope untuk MVP

- Auth (BetterAuth — P1)
- Print trigger (P1)
- Admin dashboard (P2)
- Watermark (P1)