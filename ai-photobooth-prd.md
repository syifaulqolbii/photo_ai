# PRD — AI Photobooth Web App

## 1. Executive Summary

Platform web photobooth berbasis AI untuk event (CFD, wedding, pesta, dll). User bisa ambil foto, pilih tema transformasi (cartoon, anime, Avatar Pandora, dll), AI memproses, lalu hasilnya bisa dipreview, download, atau cetak langsung.

---

## 2. Problem Statement

Photobooth konvensional di event membosankan — hanya cetak foto biasa. Tidak ada personalisasi atau pengalaman "wow" yang bisa dibagikan di sosmed. Event organizer butuh daya tarik lebih untuk menarik pengunjung.

---

## 3. Target Users

| Persona | Deskripsi |
|---|---|
| **Event Organizer** | Sewa/deploy booth di event mereka |
| **Peserta Event** | User akhir yang foto dan download hasil |
| **Operator Booth** | Yang jaga fisik printer di lokasi |

---

## 4. Core Features

### P0 — Must Have

- [ ] **Capture foto** — upload dari device atau akses kamera langsung (WebRTC)
- [ ] **Pilih tema** — gallery tema: Cartoon, Anime, Avatar Pandora, Sketch, Vintage, Oil Painting, dll
- [ ] **AI processing** — transformasi foto via Replicate/fal.ai (img2img)
- [ ] **Preview hasil** — tampil before/after, bisa retry atau konfirmasi
- [ ] **Download softfile** — unduh hasil dalam format JPG/PNG
- [ ] **Cetak foto** — kirim ke printer via API atau trigger manual operator

### P1 — Should Have

- [ ] **Auth user** — login via Google/email (BetterAuth) untuk simpan history
- [ ] **History foto** — galeri hasil foto user sebelumnya
- [ ] **Watermark branding** — logo event/sponsor di pojok foto
- [ ] **Share ke sosmed** — tombol share langsung ke IG/WA

### P2 — Nice to Have

- [ ] **Admin dashboard** — EO bisa lihat statistik penggunaan
- [ ] **Multi-bahasa** — ID/EN
- [ ] **QR Code** — scan QR untuk download tanpa login

---

## 5. User Stories

```
Sebagai peserta event,
saya ingin foto langsung dari kamera HP,
agar tidak perlu upload manual.

Sebagai peserta event,
saya ingin memilih tema anime untuk foto saya,
agar hasilnya unik dan bisa dibagikan ke Instagram.

Sebagai operator booth,
saya ingin ada tombol "Cetak" yang mudah,
agar saya bisa langsung print tanpa perlu teknis.

Sebagai event organizer,
saya ingin ada watermark logo event di hasil foto,
agar branding event tetap terlihat di sosmed.
```

---

## 6. User Flow

```
[Buka Web] 
    → [Izin Kamera / Upload Foto]
    → [Preview foto mentah]
    → [Pilih Tema] (gallery card)
    → [Klik "Proses"]
    → [Loading AI ~5-15 detik]
    → [Preview Hasil Before/After]
    → [Pilih: Download | Cetak | Coba Tema Lain]
    → [Done / Share]
```

---

## 7. Technical Requirements

### Tech Stack

| Layer | Tech |
|---|---|
| **Frontend + Backend** | Next.js 15 (App Router) |
| **Database** | Supabase (PostgreSQL) |
| **Storage** | Supabase Storage (foto original + hasil) |
| **ORM** | Drizzle ORM |
| **Auth** | BetterAuth (Google OAuth + email) |
| **AI Processing** | Replicate API atau fal.ai (img2img models) |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Deployment** | Docker di VPS atau Vercel |

### AI Models (Replicate)

| Tema | Model Rekomendasi |
|---|---|
| Cartoon | `tencentarc/photomaker` |
| Anime | `cjwbw/anything-v3` / `lucataco/realvisxl` |
| Avatar Pandora | Custom LoRA atau `fofr/sticker-maker` |
| Sketch | `jagilley/controlnet-scribble` |
| Oil Painting | `stability-ai/stable-diffusion-img2img` |

### Database Schema (Drizzle)

```ts
// users — handled by BetterAuth
// photos
photos {
  id: uuid PK
  user_id: uuid FK → users
  event_id: uuid FK → events (nullable)
  original_url: text       // Supabase Storage
  result_url: text         // Supabase Storage
  theme: text
  status: enum(pending, processing, done, failed)
  created_at: timestamp
}

// events
events {
  id: uuid PK
  name: text
  watermark_url: text
  active: boolean
  created_at: timestamp
}
```

### API Endpoints

```
POST /api/photos/upload     → upload foto original ke Supabase
POST /api/photos/process    → trigger AI, return job_id
GET  /api/photos/:id        → polling status + result URL
POST /api/photos/:id/print  → trigger cetak
GET  /api/events/:slug      → load event config (tema, watermark)
```

---

## 8. Success Metrics (KPIs)

| Metric | Target |
|---|---|
| AI processing time | < 15 detik per foto |
| Success rate transformasi | > 95% |
| Download rate | > 70% user yang selesai proses |
| Uptime saat event | > 99.5% |
| Time to first photo | < 30 detik dari buka web |

---

## 9. Timeline & Milestones

| Milestone | Estimasi |
|---|---|
| M1: Setup project + auth + upload foto | 3 hari |
| M2: Integrasi Replicate API + 3 tema pertama | 4 hari |
| M3: Preview UI + download | 2 hari |
| M4: Cetak + watermark + event config | 3 hari |
| M5: Testing di event pertama (CFD) | 1 hari |
| **Total** | **~2 minggu** |

---

## 10. Risks & Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| AI processing lambat saat antrian ramai | Tinggi | Queue system (Supabase + polling), batas concurrent request |
| Replicate API down saat event | Medium | Fallback ke fal.ai sebagai provider kedua |
| Kamera tidak bisa diakses (iOS Safari) | Medium | Fallback ke upload manual |
| Foto gagal diproses (konten tidak sesuai) | Rendah | Error handling + pesan user-friendly + retry |
| Biaya AI melonjak | Medium | Rate limit per session, monitor usage |

---

## 11. Appendix

**Referensi UI:** ngodingpakeai.com/plan — live markdown preview saat AI generate

**Printer integration:** Bisa pakai `electron` + `node-printer` jika deploy sebagai desktop app di booth, atau trigger via webhook ke operator.

**Tema expansion:** Setelah MVP, bisa tambah tema seasonal (Lebaran, Christmas, dll) atau tema custom per event.

---

**Generated:** 2026-07-06  
**Tech Stack:** Next.js 15 + Drizzle + BetterAuth + Supabase + Replicate/fal.ai
