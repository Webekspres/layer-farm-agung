# API contract — Mobile (Expo)

Kontrak OpenAPI untuk konsumsi aplikasi **React Native + Expo**. Repo admin Next.js mengimplementasikan handler di `app/api/v1/`.

| File | Isi |
|------|-----|
| **[openapi.yaml](./openapi.yaml)** | Spesifikasi OpenAPI **3.1** — sumber kontrak untuk tim mobile |

## Cakupan v1

| Area | Path | Status |
|------|------|--------|
| Auth (Better Auth) | `/api/auth/*` | ✅ (library) |
| Kandang | `GET /api/v1/cages`, `GET /api/v1/cages/{cageId}` | ✅ |
| Katalog | `GET /api/v1/egg-grades` | ✅ |
| Produksi | `POST /api/v1/production` | ✅ |
| Pakan | `POST /api/v1/feed-consumption` | 🔲 stub `501` |

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

1. `POST /api/auth/sign-in/username` (atau `/sign-in/email`) dengan body JSON.
2. Simpan session cookie dari respons (`credentials: 'include'` pada fetch).
3. Panggil `/api/v1/*` dengan cookie yang sama.

Tanpa session → **401** JSON (bukan redirect HTML).

## Pratinjau & codegen

```bash
# Pratinjau (butuh npx, sekali jalan)
npx @redocly/cli preview-docs docs/apicontract/openapi.yaml

# Client TypeScript (contoh)
npx openapi-typescript docs/apicontract/openapi.yaml -o ./types/aapm-api.ts
```

Saat menambah endpoint di `app/api/v1/`, **perbarui `openapi.yaml` di PR yang sama**.

## Terkait

- [ecosystem.md](../ecosystem.md) — hubungan backend ↔ **aapm-mobile**
- [sitemap.md](../sitemap.md) — status implementasi per route
- [AGENTS.md](../../AGENTS.md) — aturan arsitektur API v1 (backend)
- [aapm-mobile/AGENTS.md](../../../mobile-apps/aapm-mobile/AGENTS.md) — panduan app mobile
- [DEV_NOTES.md](../../DEV_NOTES.md) — validasi bisnis domain 3
