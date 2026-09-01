# Handover — Layer Farm Agung (Backend)

Paket serah terima untuk **successor developer** yang mengambil alih repo **admin dashboard + API backend**.

| | |
|--|--|
| **Terakhir diperbarui** | 2026-09-01 |
| **Versi saat handover** | `package.json` → **1.0.6** |
| **Repo mobile** | [`layer-farm-agung-mobile`](../../../layer-farm-agung-mobile) |
| **Workspace** | [`AGENT.md`](../../../AGENT.md) (dua repo + UAT) |

---

## Urutan baca (hari pertama)

1. **[penyelarasan-revisi-1.md](./penyelarasan-revisi-1.md)** — **acuan bisnis** HDP/FCR, go-live, grade, UAT (wajib)
2. **[mulai-cepat.md](./mulai-cepat.md)** — setup lokal, env, seed, perintah harian
3. **[arsitektur.md](./arsitektur.md)** — folder, auth, pola API vs Server Actions
4. **[operasional.md](./operasional.md)** — staging, deploy, cron notifikasi, UAT
5. **[backlog-dan-risiko.md](./backlog-dan-risiko.md)** — backlog & risiko pilot

---

## Dokumen referensi (jangan duplikasi di sini)

| Dokumen | Isi |
|---------|-----|
| [`penyelarasan-revisi-1.md`](./penyelarasan-revisi-1.md) | **Acuan bisnis** Revisi 1 — HDP/FCR, go-live, grade, TC-01–05 |
| [`../UAT/README.md`](../UAT/README.md) | **UAT resmi** — PDF Berita Acara + lembar eksekusi |
| [`../../AGENTS.md`](../../AGENTS.md) | Konvensi kode, RBAC, testing, SemVer |
| [`../../DEV_NOTES.md`](../../DEV_NOTES.md) | Aturan bisnis & batas validasi (termasuk rumus HDP/FCR) |
| [`../sitemap.md`](../sitemap.md) | Peta rute admin + tabel API v1 |
| [`../apicontract/openapi.yaml`](../apicontract/openapi.yaml) | Kontrak OpenAPI (25 route `/api/v1/*`) |
| [`../ecosystem.md`](../ecosystem.md) | Arsitektur dua repo |
| [`../staging.md`](../staging.md) | Vercel + Neon + R2 |
| [`../../prisma/schema.prisma`](../../prisma/schema.prisma) | Model data (45 model) |

---

## Handover mobile

UI lapangan ada di repo terpisah: **[`layer-farm-agung-mobile/docs/handover/`](../../../layer-farm-agung-mobile/docs/handover/)**.

Perubahan API → update `openapi.yaml` + regenerate types di mobile dalam siklus rilis yang sama.
