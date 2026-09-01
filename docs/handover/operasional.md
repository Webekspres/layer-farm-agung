# Operasional — Backend

Deploy, staging, cron, dan alur UAT.

---

## Lingkungan

| Lingkungan | Stack | Dokumen |
|------------|-------|---------|
| **Lokal** | Docker Postgres `:5433` + MinIO | [mulai-cepat.md](./mulai-cepat.md) |
| **Staging / Production** | Vercel + Neon Postgres + Cloudflare R2 | [`../staging.md`](../staging.md) |

URL production (per handoff UAT v1.0.6): `https://layer-farm-agung-omega.vercel.app`

---

## Deploy backend (ringkas)

1. Set env di Vercel: `DATABASE_URL` (Neon pooled), `BETTER_AUTH_*`, `STORAGE_*` untuk R2
2. Terapkan migrasi ke Neon:

```bash
DATABASE_URL="postgresql://...@ep-xxx.neon.tech/neondb?sslmode=require" \
  bun run db:migrate:deploy
```

3. Seed awal (sekali): `bun run db:seed`
4. Seed UAT production (manual, dari mesin yang punya URL Neon):

```bash
cd layer-farm-agung
DATABASE_URL="..." bun run db:seed:uat
```

Detail & batasan idempoten seed: [`UAT/revisi/DEPLOY_v1.0.6_Handoff.md`](../../../UAT/revisi/DEPLOY_v1.0.6_Handoff.md)

5. Push ke branch yang terhubung Vercel → deploy otomatis
6. Verifikasi: `GET /api/health` → `200` dengan `status: "ok"`

---

## Cron notifikasi

Script: [`scripts/notification-jobs.ts`](../../scripts/notification-jobs.ts)

Menjalankan generator notifikasi (vaksin, input belum lapor, stok rendah, ringkasan) lalu push ke mobile. **Idempoten** (`dedupeKey`) — aman dijalankan berkali-kali.

```bash
bun scripts/notification-jobs.ts
```

Contoh crontab (06:30 WIB setiap hari):

```cron
30 6 * * * cd /path/layer-farm-agung && DATABASE_URL=... bun scripts/notification-jobs.ts >> /var/log/aapm-notifications.log 2>&1
```

Pastikan `DATABASE_URL` dan credential push (Expo) terset di lingkungan cron.

---

## UAT & perbaikan bug

Folder workspace (bukan di dalam repo backend):

| Path | Isi |
|------|-----|
| [`../UAT/README.md`](../UAT/README.md) | **Dokumen resmi** — PDF Berita Acara + lembar eksekusi |
| [`../UAT/STATUS.md`](../UAT/STATUS.md) | Ringkasan status TC-01–TC-05 |
| [`../../../UAT/revisi/`](../../../UAT/revisi/) | Triage & checklist dev (workspace root, opsional) |
| [`../../../UAT/revisi/Triage_Temuan_TC01-TC05.md`](../../../UAT/revisi/Triage_Temuan_TC01-TC05.md) | Keputusan dev per temuan |

**Status:** TC-01–TC-05 **selesai** (2026-09-01); PDF dikirim ke klien — [`../UAT/`](../UAT/README.md).

**Urutan eksekusi UAT:** TC-01 → TC-02 → TC-03 → TC-05 → **TC-04** (TC-04 mengubah data TC-05).

Arsip alur fix dev: baca triage → fix item **Bug** → update checklist.

Panduan workspace: [`AGENT.md`](../../../AGENT.md) § UAT.

---

## Mobile terhadap staging

- Set `MOBILE_CORS_ORIGINS` dan `BETTER_AUTH_TRUSTED_ORIGINS` di Vercel jika Expo mengakses staging
- Mobile bake API URL saat EAS build (`eas.json` → `EXPO_PUBLIC_API_URL`)

---

## Rilis & versi

| Sumber | Field |
|--------|-------|
| Web | `package.json` → `version` |
| Mobile | `layer-farm-agung-mobile/app.json` → `expo.version`, `android.versionCode` |

Naikkan versi web & mobile selaras saat perubahan kontrak API. Aturan SemVer: [`AGENTS.md`](../../AGENTS.md) § Application Versioning.
