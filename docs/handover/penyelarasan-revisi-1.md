# Penyelarasan Produksi — Revisi 1 (acuan bisnis)

Ringkasan keputusan dari **Laporan Rencana Penyelarasan Sistem dan Operasional Produksi (Revisi 1)** — dokumen klien/SA resmi.

| | |
|--|--|
| **Nomor** | 001/WTI-SA/VIII/2026 |
| **Terbit** | 19 Agustus 2026 |
| **Dokumen lengkap (workspace)** | [`../../../Laporan_Rencana_Penyelarasan_Sistem_dan_Operasional_Produksi_Revisi1.md`](../../../Laporan_Rencana_Penyelarasan_Sistem_dan_Operasional_Produksi_Revisi1.md) |
| **UAT** | TC-01 s/d TC-05 **selesai** · [`../UAT/README.md`](../UAT/README.md) (PDF Berita Acara + lembar eksekusi) |

> **Jangan** mengutip `gap-matrix-aapm.md` baris GAP-014 versi lama (“belum ada formula resmi”). Formula **sudah ditetapkan** di Revisi 1 §4 dan diimplementasi di kode.

---

## §1 — Master grade telur

| Kode | Makna |
|------|--------|
| **TB** | Telur bagus / layak jual |
| **TR** | Telur retak (agregat retak halus + pecah) |
| **TP** | Telur putih (pigmen kerabang) |

- Grade dari master `EggGrade` dengan `is_active` — form mobile/web baca daftar aktif via API.
- Nonaktifkan grade **tidak** mengubah transaksi historis.

**Kode:** `features/egg-grades/`, `GET /api/v1/egg-grades`, mobile `egg-grade-picker.tsx`.

---

## §2 — Lookback, go-live, audit koreksi

| Peran | Batas input/koreksi (default uji) |
|-------|-----------------------------------|
| **Staff** | 7 hari kalender ke belakang; dalam siklus aktif |
| **Admin** | Hingga 30 hari (tenant setting) |

- Tolak tanggal **masa depan**.
- Tolak tanggal **sebelum Go-Live Date** siklus.
- Koreksi/hapus wajib **alasan**; log audit before/after + reversal stok.

**Kode:** `features/production/lib/input-window.ts`, `GET /api/v1/input-window`, `daily-corrections`, `record-correction-event.ts`, [`../daily-input-correction.md`](../daily-input-correction.md).

---

## §3 — Mid-cycle start & Pra-Go-Live

| Field | Fungsi |
|-------|--------|
| `start_date` | Chick-in — hitung **umur ayam** |
| `go_live_date` | Mulai input aplikasi — batas awal transaksi harian |
| `initial_population` | Populasi hidup pada go-live |

Rentang `[start_date, go_live_date)` = status **"Belum Dilaporkan"** (Pra-Go-Live) — **bukan** angka 0 di grafik KPI.

Isolasi siklus: agregasi KPI difilter per `cycle_id` / `fromDate` go-live. Lihat `compute-cycle-population.ts` (`fromDate`).

**Catatan:** multi-cycle penuh di pilot masih dibatasi (GAP-003/010) — lihat [`backlog-dan-risiko.md`](./backlog-dan-risiko.md).

---

## §4 — Rumus HDP & FCR (resmi)

### HDP (Hen Day Production)

```
HDP (%) = (Total butir semua kategori aktif pada hari itu / Populasi ayam hidup) × 100
```

Pembilang = **TB + TR + TP** (bukan TB saja).

**Kode backend:** `features/production/lib/compute-hdp.ts`  
**Tampilan:** rekap admin, `field/overview` API, chart mobile.

### FCR (Feed Conversion Ratio)

```
Egg Mass (kg) = Total butir × Berat rata-rata telur (kg)
FCR = Total konsumsi pakan (kg) / Egg Mass (kg)
```

| Kondisi | Tampilan FCR |
|---------|----------------|
| Berat rata-rata telur **diisi** + ada pakan | Hitung FCR |
| Berat **kosong** / egg mass ≤ 0 | Tampilkan **"—"** (tidak pakai pembagian butir) |
| Ada hari produksi tanpa berat dalam periode siklus | FCR siklus disembunyikan (`null`) |

**Kode backend:** `features/cages/lib/cycle-operational-metrics.ts` (`computeFcr`, `resolveCycleFcr`, `sumEggMassKgInPeriod`)  
**Mobile:** kartu "FCR siklus" di Home — data dari `GET /api/v1/field/overview`; berat opsional di form produksi.

### Status implementasi vs verifikasi

| Item | Status |
|------|--------|
| Formula ditetapkan Revisi 1 | ✅ |
| Implementasi kode web + API | ✅ |
| Tampilan mobile (KPI + form hint) | ✅ |
| Retest TC-05 (spreadsheet vs web vs Android) | ✅ — PDF [`../UAT/README.md`](../UAT/README.md) |

---

## §5 — Matriks uji (ringkas)

| TC | Fokus |
|----|--------|
| TC-01 | Mid-cycle + Pra-Go-Live + isolasi siklus |
| TC-02 | Grade master TB/TR/TP sinkron web ↔ Android |
| TC-03 | Lookback 7 hari staff + tolak future date |
| TC-04 | Audit koreksi + reversal stok (online/offline) |
| TC-05 | **Rekonsiliasi HDP & FCR** vs spreadsheet |

Urutan eksekusi: **TC-01 → TC-02 → TC-03 → TC-05 → TC-04** (TC-04 mengubah data TC-05).

---

## Peta file (backend)

| Topik | File utama |
|-------|------------|
| HDP | `features/production/lib/compute-hdp.ts` |
| FCR / egg mass | `features/cages/lib/cycle-operational-metrics.ts` |
| Field overview API | `features/production/services/get-field-overview.ts` |
| Input window | `features/production/lib/input-window.ts` |
| Pra-Go-Live riwayat | `features/production/services/list-cage-daily-history.ts` |
| Koreksi | `features/production/services/record-correction-event.ts` |

Mobile: [`layer-farm-agung-mobile/docs/handover/penyelarasan-revisi-1.md`](../../../layer-farm-agung-mobile/docs/handover/penyelarasan-revisi-1.md).
