# Arsitektur — Backend

Ringkasan arsitektur **layer-farm-agung** untuk developer yang baru.

---

## Peran repo

| Komponen | Lokasi | Konsumen |
|----------|--------|----------|
| Admin dashboard (web) | `app/(dashboard)/` | Admin, superadmin |
| Auth | `app/api/auth/*` (Better Auth) | Web + mobile |
| REST API mobile | `app/api/v1/*` | **layer-farm-agung-mobile** |
| Skema & migrasi DB | `prisma/schema.prisma` | Hanya repo ini |
| Kontrak API | `docs/apicontract/openapi.yaml` | Tim mobile |

**Tidak ada** UI lapangan (`/kandang`, PWA) di repo ini — pivot Juni 2026 ke Expo.

---

## Struktur folder

```
layer-farm-agung/
├── app/              # Next.js App Router
│   ├── (authentication)/
│   ├── (dashboard)/  # halaman admin
│   └── api/
│       ├── auth/     # Better Auth
│       └── v1/       # mobile API
├── features/         # modul domain (20 slice)
├── components/       # UI shared (shadcn)
├── lib/              # prisma, api helpers, business-date
├── prisma/           # schema + migrations + seed
└── scripts/          # cron, migrasi data, generator doc
```

Modul `features/` utama: `auth`, `production`, `inventory`, `finance`, `notifications`, `permissions`, `cages`, `eggs`, `health`, dll.

---

## Auth & RBAC

- **Better Auth** — session cookie
- Peran: `superadmin`, `admin`, `staff`
- Proteksi rute web: **`proxy.ts`** (bukan `middleware.ts`)
- API `/api/v1/*`: guard session + permission (mis. `manage_production` untuk operasional lapangan)
- Mobile staff: `POST /api/v1/mobile/auth/sign-in` (staff-only)

Detail: [`AGENTS.md`](../../AGENTS.md) · rules di `.cursor/rules/nextjs-auth-patterns.mdc`

---

## Pola kode

| Kebutuhan | Pola |
|-----------|------|
| Mutasi dari dashboard admin | **Server Actions** + Zod |
| Konsumsi mobile / eksternal | **Route Handlers** `app/api/v1/` + envelope JSON |
| Validasi bisnis | `features/*/services/` + `features/*/schemas/` |
| Tanggal operasional | WIB — `lib/business-date.ts` |

Envelope API:

```json
{ "success": true, "message": "...", "data": {} }
{ "success": false, "error": "..." }
```

---

## API v1 (mobile)

**25 route** — daftar lengkap di [`../sitemap.md`](../sitemap.md) §5.3 dan [`../apicontract/openapi.yaml`](../apicontract/openapi.yaml).

Kelompok utama:

- Kandang & riwayat: cages, scan, daily-history, daily-report, daily-corrections
- Input operasional: production, feed-consumption, population-mutation, medical-records (POST + PATCH)
- Vaksin: vaccine-schedules, vaccinations
- Dasbor lapangan: field/overview, input-window
- Notifikasi: notifications, push-tokens

**Aturan:** ubah API → update OpenAPI + `sitemap.md` dalam PR yang sama.

---

## Keputusan arsitektur (ADR ringkas)

| Topik | Dokumen |
|-------|---------|
| Jadwal vaksin operasional | [`../vaccination-architecture.md`](../vaccination-architecture.md) |
| Stok telur vs saprodi | [`../egg-ledger-architecture.md`](../egg-ledger-architecture.md) |
| Koreksi input harian | [`../daily-input-correction.md`](../daily-input-correction.md) |
| Penjualan telur per grade | [`../egg-sales-stock.md`](../egg-sales-stock.md) |

---

## Modul 14 — Notifikasi

| Bagian | Path |
|--------|------|
| Domain logic | `features/notifications/` |
| Cron harian | `scripts/notification-jobs.ts` |
| API mobile | `GET/PATCH /api/v1/notifications`, `POST /api/v1/push-tokens` |

Generator: vaksin terjadwal/terlambat, input belum dilaporkan, stok rendah, ringkasan harian. Idempoten via `dedupeKey`. Detail operasional: [operasional.md](./operasional.md).

---

## Testing

- Runner: **Bun** (`bun test`)
- File: colocated `*.test.ts` di `features/` dan `lib/`
- Wajib tambah/update test untuk perubahan Category A (RBAC, tenant scope, stok, finansial)

Standar: `.cursor/rules/testing-standards.mdc`
