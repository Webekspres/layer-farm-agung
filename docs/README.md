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
| **[sitemap.md](./sitemap.md)** | Peta rute aplikasi, target modul, progress implementasi vs `prisma/schema.prisma` |

## Sumber kebenaran lain

| Lokasi | Peran |
|--------|--------|
| `prisma/schema.prisma` | ERD / model data |
| `README.md` | Ringkasan produk & stack |
| `DESIGN.md` | Brand & UI |
| `AGENTS.md` | Konvensi pengembangan |
| `DEV_NOTES.md` | Aturan bisnis & validasi (root) |

Saat menambah halaman baru, **perbarui `sitemap.md`** di PR yang sama.
