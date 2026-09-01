# Mulai cepat — Backend

Panduan setup lokal untuk **layer-farm-agung** (admin + API).

---

## Prasyarat

| Tool | Catatan |
|------|---------|
| **Bun** | Package manager & test runner (`bun install`, `bun test`) |
| **Docker** | Postgres + MinIO lokal (disarankan) |
| **Node.js LTS** | Toolchain Next.js |

Repo mobile (opsional untuk uji end-to-end): sibling [`layer-farm-agung-mobile`](../../../layer-farm-agung-mobile).

---

## Setup pertama kali

```bash
cd layer-farm-agung
bun install
cp .env.example .env
```

Edit `.env`:

- `BETTER_AUTH_SECRET` — string acak panjang (wajib)
- `DATABASE_URL` — untuk dev lokal: `postgresql://...@127.0.0.1:5433/...` (port **5433**, bukan 5432)
- Gunakan **`127.0.0.1`**, bukan `localhost` (hindari bentrok IPv6 di Windows)

```bash
bun run docker:db          # Postgres di host :5433
bun run db:generate
bun run db:migrate
bun run db:seed            # roles, permissions, data contoh
bun run dev                # http://localhost:3000
```

Satu perintah (DB + MinIO + dev): `bun run hybrid`

---

## Akun uji (setelah seed)

| Username | Password | Peran |
|----------|----------|--------|
| `staff.kandang` | `password123` | Staff lapangan (mobile) |
| `admin.cabang` | `password123` | Admin tenant |
| `superadmin` | `password123` | Global |

Seed UAT khusus: `bun run db:seed:uat` (lihat [operasional.md](./operasional.md)).

---

## Perintah sehari-hari

| Perintah | Fungsi |
|----------|--------|
| `bun run dev` | Server development |
| `bun test` | Unit test (`*.test.ts` colocated) |
| `bun run lint` | ESLint |
| `bun run db:migrate` | Migrasi dev |
| `bun run db:migrate:deploy` | Migrasi production (Neon) |
| `bun run build` | Build production |

---

## Verifikasi cepat

1. Buka [http://localhost:3000](http://localhost:3000) — redirect ke login
2. Login `admin.cabang` / `password123`
3. API docs: [http://localhost:3000/api-docs](http://localhost:3000/api-docs) (Swagger UI)
4. Health (jika ada di deploy): `GET /api/health`

---

## Versi

- **Sumber kebenaran rilis:** `package.json` → `version` (saat ini **1.0.6**)
- `docs/apicontract/openapi.yaml` → `info.version` dapat tertinggal — jangan pakai untuk rilis

---

## Langkah berikutnya

- Baca [arsitektur.md](./arsitektur.md) sebelum menyentuh fitur baru
- Untuk mobile: jalankan backend dulu, lalu ikuti [`layer-farm-agung-mobile/docs/handover/mulai-cepat.md`](../../../layer-farm-agung-mobile/docs/handover/mulai-cepat.md)
