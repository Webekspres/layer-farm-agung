# Backlog & risiko — Backend

Status proyek dan hal yang perlu diwaspadai successor developer.

| | |
|--|--|
| **Progress keseluruhan** | ~90% (13 modul internal) — lihat [`../sitemap.md`](../sitemap.md) §7 |
| **Domain 3 (operasional)** | ~98% |
| **Domain 4 (finance)** | ~80% |
| **Acuan bisnis produksi** | [`penyelarasan-revisi-1.md`](./penyelarasan-revisi-1.md) |

---

## Backlog terbuka (admin repo)

Dari [`../sitemap.md`](../sitemap.md) §8:

- [ ] **D4 lanjutan:** harga jual harian formal
- [ ] **P&L period** di finance dashboard
- [ ] **Early warning** — aturan alert dashboard lite masih parsial (~65% modul 9)
- [ ] **Kurva target strain** (`ProductionTarget` per umur) — CRUD ada; garis target chart bisa kosong jika master strain belum diisi (GAP-024)

Mobile backlog (EAS production AAB): lihat [`layer-farm-agung-mobile/docs/progress.md`](../../../layer-farm-agung-mobile/docs/progress.md).

---

## Gap matrix — yang masih relevan

Sumber lengkap: [`../gap-matrix-aapm.md`](../gap-matrix-aapm.md). Ringkasan prioritas:

| ID | Topik | Status / risiko |
|----|-------|-----------------|
| **GAP-003/004** | Isolasi siklus multi-cycle | **Pilot limit** — jangan tutup/buka siklus baru di pilot; retest TC-01 |
| **GAP-008/009** | Staff web: batasi akses keuangan (nav + KPI) | Policy decided — verifikasi implementasi |
| **GAP-010** | Tutup/buka siklus saat pilot | Harus dibatasi / disabled |
| **GAP-014** | HDP/FCR | **Selesai ✅** — Revisi 1 §4 + TC-05 ([`../UAT/STATUS.md`](../UAT/STATUS.md)) |
| **GAP-013** | Stok telur per grade + penjualan | Implemented 2026-08-20 — retest [`../smoke-egg-sales.md`](../smoke-egg-sales.md) |

---

## Dokumen yang jangan dijadikan sumber kebenaran

| Lokasi | Alasan |
|--------|--------|
| `docs/weekly progress/` | Arsip Juni–Juli 2026; path repo lama |
| `gap-matrix` baris GAP-014 **tanpa** catatan Revisi 1 | Bisa masih menyebut “belum ada formula” — utamakan [`penyelarasan-revisi-1.md`](./penyelarasan-revisi-1.md) |
| `openapi.yaml` → `info.version` | Dapat tertinggal dari `package.json` |
| Lembar UAT v1.0.5-build.27 | Arsip — gunakan build.30 |

---

## Keputusan produk belum ditutup

- Konversi satuan karung↔kg (GAP-019) — out of pilot
- Cold-start offline penuh (GAP-011) — post-pilot

---

## Setelah handover — checklist singkat

1. Baca [`penyelarasan-revisi-1.md`](./penyelarasan-revisi-1.md) sebelum ubah produksi/KPI
2. Baca [`../implementation_plan.md`](../implementation_plan.md) untuk status fase
3. Sinkronkan `sitemap.md` jika menambah route admin atau API
4. UAT: [`../UAT/README.md`](../UAT/README.md) (PDF klien + status)
5. Konteks bisnis klien: [`../source/`](../source/)
