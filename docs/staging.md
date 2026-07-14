# Staging — Vercel + Neon + Cloudflare R2

Staging untuk admin Next.js + `/api/v1/*`. Lokal tetap Docker Postgres + MinIO.

## Stack

| Layer | Staging | Lokal |
|-------|---------|--------|
| App | Vercel (Hobby) | `bun run hybrid` / `bun run dev` |
| Database | Neon Postgres (pooled URL) | Docker Postgres `:5433` |
| Object storage | Cloudflare R2 | MinIO `:9000` |

## Env yang wajib di Vercel

| Variable | Sumber | Catatan |
|----------|--------|---------|
| `DATABASE_URL` | Neon → Connection string **pooled** | Tambahkan `?sslmode=require` jika belum ada |
| `BETTER_AUTH_SECRET` | Generate random panjang | Bukan placeholder contoh |
| `BETTER_AUTH_URL` | URL publik staging | Contoh `https://aapm-xxx.vercel.app` |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | Sama dengan di atas | Rebuild setelah diubah |
| `STORAGE_ENDPOINT` | R2 | `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` |
| `STORAGE_ACCESS_KEY` | R2 API token | Access Key ID |
| `STORAGE_SECRET_KEY` | R2 API token | Secret Access Key (sekali tampil) |
| `STORAGE_BUCKET` | Nama bucket R2 | Buat bucket dulu di dashboard |

Opsional:

| Variable | Kapan |
|----------|--------|
| `MOBILE_CORS_ORIGINS` | Test Expo terhadap staging |
| `BETTER_AUTH_TRUSTED_ORIGINS` | Origin Metro tambahan |
| `STORAGE_REGION` | Default `auto` (R2) |
| `STORAGE_FORCE_PATH_STYLE` | Default otomatis (`false` untuk R2) |

## Bootstrap sekali

1. Buat project Neon + bucket R2 + API token Object Read & Write.
2. Set env di Vercel (Production atau Preview).
3. Dari mesin lokal (pakai Neon **direct/unpooled** di `DATABASE_URL` sementara, atau `DIRECT_URL` jika kamu wire):

```bash
# Terapkan migrasi ke Neon
DATABASE_URL="postgresql://...@ep-xxx.region.aws.neon.tech/neondb?sslmode=require" bun run db:migrate:deploy

# Seed user demo (sekali saja)
DATABASE_URL="..." bun run db:seed
```

4. Deploy / push ke branch yang terhubung Vercel.
5. Login admin di URL staging; uji upload logo tenant (admin cabang).

## Catatan

- Logo tetap dilayani lewat proxy `/api/storage/...` — tidak perlu public R2 URL.
- `output: "standalone"` di-skip otomatis saat `VERCEL=1` (Docker tetap pakai standalone).
- `bun run build` menjalankan `prisma generate` dulu (generated client di-gitignore).
