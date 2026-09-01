# API contract — Mobile (Expo)

Kontrak OpenAPI untuk konsumsi aplikasi **React Native + Expo**. Repo admin Next.js mengimplementasikan handler di `app/api/v1/`.

| File | Isi |
|------|-----|
| **[openapi.yaml](./openapi.yaml)** | Spesifikasi OpenAPI **3.1** — sumber kontrak untuk tim mobile (25 route `/api/v1/*`) |

> **Versi:** `openapi.yaml` → `info.version` dapat tertinggal dari `package.json` backend. Untuk rilis, percayai `layer-farm-agung/package.json`.

## Cakupan v1

| Area | Path | Status |
|------|------|--------|
| Auth mobile | `POST /api/v1/mobile/auth/sign-in` | ✅ |
| Dasbor lapangan | `GET /api/v1/field/overview` | ✅ |
| Jendela input | `GET /api/v1/input-window` | ✅ |
| Kandang | `GET /api/v1/cages`, `GET /api/v1/cages/{cageId}`, `POST /api/v1/cages/scan` | ✅ |
| Riwayat & laporan | `GET …/daily-history`, `GET …/daily-report`, `GET …/daily-corrections` | ✅ |
| Vaksin | `GET …/vaccine-schedules`, `POST /api/v1/vaccinations` | ✅ |
| Produksi | `POST /api/v1/production`, `PATCH /api/v1/production/{recordId}` | ✅ |
| Pakan | `POST /api/v1/feed-consumption`, `PATCH …/{recordId}` | ✅ |
| Populasi | `POST /api/v1/population-mutation`, `PATCH …/{recordId}` | ✅ |
| Pengobatan | `POST /api/v1/medical-records`, `PATCH …/{recordId}` | ✅ |
| Katalog | `GET /api/v1/items`, `GET /api/v1/egg-grades`, `GET /api/v1/feed-items` (legacy) | ✅ |
| Notifikasi | `GET /api/v1/notifications`, `PATCH …/{id}/read`, `POST /api/v1/push-tokens` | ✅ |
| Auth (Better Auth) | `/api/auth/*` | ✅ (library) |

## Envelope respons

Semua `/api/v1/*` memakai format yang sama:

```json
{ "success": true, "message": "...", "data": { } }
```

```json
{ "success": false, "error": "..." }
```

Implementasi: [`lib/api/response.ts`](../../lib/api/response.ts).

## Autentikasi (mobile)

1. `POST /api/v1/mobile/auth/sign-in` (staff) atau Better Auth `/api/auth/sign-in/username`.
2. Simpan session cookie dari respons (`credentials: 'include'` pada fetch).
3. Panggil `/api/v1/*` dengan cookie yang sama.

Tanpa session → **401** JSON (bukan redirect HTML).

## Pratinjau & codegen

```bash
# Pratinjau (sekali jalan)
bunx @redocly/cli preview-docs docs/apicontract/openapi.yaml

# Client TypeScript (mobile, dari workspace root)
cd layer-farm-agung-mobile
bunx openapi-typescript ../layer-farm-agung/docs/apicontract/openapi.yaml -o ./types/aapm-api.ts
```

Saat menambah endpoint di `app/api/v1/`, **perbarui `openapi.yaml` di PR yang sama**.

## Terkait

- [ecosystem.md](../ecosystem.md) — hubungan backend ↔ **layer-farm-agung-mobile**
- [sitemap.md](../sitemap.md) — status implementasi per route
- [AGENTS.md](../../AGENTS.md) — aturan arsitektur API v1 (backend)
- [layer-farm-agung-mobile/AGENTS.md](../../../layer-farm-agung-mobile/AGENTS.md) — panduan app mobile
- [DEV_NOTES.md](../../DEV_NOTES.md) — validasi bisnis domain 3
