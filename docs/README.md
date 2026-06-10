# Dokumen proyek — Layered Farm Agung

Folder ini berisi **referensi bisnis** dan **dokumentasi teknis** yang boleh di-commit ke Git.

## Apa yang masuk repo

| Jenis | Contoh | Git |
|-------|--------|-----|
| Markdown | `sitemap.md`, catatan implementasi | ✅ Di-commit |
| Teks / konfig ringan | `.md`, `.txt` (jika ada) | ✅ Di-commit |

## Apa yang tetap lokal (tidak di-push)

File referensi dari klien / konsultan — biasanya besar dan berubah jarang:

| File (contoh di folder ini) | Topik |
|-----------------------------|--------|
| `Guidance untuk strain Lohman.pdf` | Standar strain, HDP/FCR |
| `Program vaksinasi.pdf` | Jadwal & program vaksin |
| `Proyek Pengembangan Sistem … PWA … .pdf` | Ruang lingkup modul 1–13 |
| `Rekap Data Farm … .xlsx` | Sample data lapangan |

Aturan di `.gitignore`: `*.pdf`, `*.doc(x)`, `*.xls(x)`, `*.ppt(x)`, arsip zip, dll. di bawah `docs/`.

## Dokumen utama di repo

| File | Isi |
|------|-----|
| **[ecosystem.md](./ecosystem.md)** | **Arsitektur dua repo** — backend (ini) + [`aapm-mobile`](../mobile-apps/aapm-mobile) |
| **[sitemap.md](./sitemap.md)** | Peta rute **admin web + API**; progress implementasi |
| **[apicontract/](./apicontract/)** | Kontrak **OpenAPI 3.1** untuk mobile (`openapi.yaml`) |

## Sumber kebenaran lain

| Lokasi | Peran |
|--------|--------|
| `prisma/schema.prisma` | ERD / model data |
| `README.md` | Ringkasan produk & stack |
| `DESIGN.md` | Brand & UI |
| `AGENTS.md` | Konvensi pengembangan |
| `DEV_NOTES.md` | Aturan bisnis & validasi (root) |

Saat menambah halaman baru, **perbarui `sitemap.md`** di PR yang sama.

## Pengembangan lokal (database)

PostgreSQL via Docker memakai **port host `5433`** (bukan `5432`) agar tidak bentrok dengan Postgres sistem. Lihat [`.env.example`](../.env.example) dan bagian *Local database* di [`README.md`](../README.md).
