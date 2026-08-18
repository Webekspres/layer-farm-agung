# Launch Alignment — Peluncuran Awal AAPM (13 Agustus 2026)

**Status:** Review mitra (dokumentasi saja; **tidak** ada perubahan application code di wave ini)  
**Tanggal review:** 2026-08-14  
**Sumber prioritas terbaru:** [source/Priority/08_ARAH_PENGALAMAN_PENGGUNA_DAN_PELUNCURAN_AWAL_2026-08-13.md](./source/Priority/08_ARAH_PENGALAMAN_PENGGUNA_DAN_PELUNCURAN_AWAL_2026-08-13.md)

**Aturan:** Dokumen 13 Agu menjadi sumber **prioritas** terbaru. Dokumen lama tetap berlaku kecuali ada supersede yang disebut di sini. File source / gap-matrix / pilot-guide **tidak diubah** oleh dokumen ini.

**Baseline yang dibanding:** [gap-matrix-aapm.md](./gap-matrix-aapm.md) · [phase1-pilot-reliability-report.md](./phase1-pilot-reliability-report.md) · [phase1-device-retest-checklist.md](./phase1-device-retest-checklist.md) · [pilot-guide-v1.md](./pilot-guide-v1.md) · [pilot-ops-contact.md](./pilot-ops-contact.md) · [egg-sales-stock.md](./egg-sales-stock.md) · [daily-input-correction.md](./daily-input-correction.md)

---

## Tanggapan ke klien (inti)

Setuju: peluncuran awal **tidak menunggu seluruh modul**. Cakupan yang masuk harus mudah dipakai, konsisten Web ↔ Android, dan menghasilkan data produksi yang dapat dipercaya.

Tiga hal yang **belum selaras** dan harus dikunci **sebelum** coding klasifikasi telur:

1. Daftar resmi kategori vs kolom operasional yang sudah tertanam (`TB` / `TR` / `TP`).
2. Batas dan wewenang pencatatan tanggal kejadian sebelumnya.
3. Data minimum farm yang **sudah berjalan** (tengah siklus).

Modul pakan penuh, pembelian, kesehatan, keuangan, dan stok opname **tidak** ditahan sebagai syarat peluncuran awal (sesuai §3.2 dokumen 13 Agu). Idempotency di perangkat (PH1-C) dan paket ops (kontak / cadangan) **masih harus dibuktikan**.

---

## STEP 1 — Baseline progress (sebelum dokumen 13 Agu)

### Yang sudah direncanakan (Phase 0–1)

Pilot terbatas: 1 farm, 1–3 kandang, **satu siklus Active** per kandang, internet-first. Inti = input harian + histori + dashboard + koreksi dasar. Bukan produksi penuh.

### Yang sudah diimplementasikan (kode + sebagian retest)

- Alur produksi per kandang: Mobile form → `/api/v1/*` → Prisma `DailyProduction` / `FeedConsumption` / `PopulationMutation` / `MedicalRecord`, scoped `cage_id` + `record_date`. Produksi menolak jika kandang tidak punya siklus Active.
- Soft `DailyReport` + `DailyInputCorrection` (alasan, pelaku, before/after) — refinement GAP-007 / GAP-017.
- Explicit none/zero: toggle “tidak ada mutasi” / “tidak ada pengobatan”.
- PH1-E: staff Web tanpa KPI keuangan. PH1-F: label HDP/FCR indikatif. PH1-G: versi di UI. QR opsional (bukan primer).
- Device 12 Agu: **PH1-A / B / D / H = PASS**. **PH1-C = PENDING** (idempotency perangkat).

### Hanya retest / ops

- PH1-C: double-tap Simpan dan flush antrean offline.
- [pilot-ops-contact.md](./pilot-ops-contact.md) masih template kosong (kontak, backup).
- Tenant uji formal (bukan hanya smoke lokal).

### Pilot limitation (tetap berlaku)

| ID | Limit |
|----|--------|
| GAP-003 / 004 / 010 | Satu siklus Active; jangan tutup/buka siklus baru di pilot |
| GAP-011 / 028 | Internet-first; cold-start offline tidak dijanjikan |
| GAP-012 | Pilih kandang dari daftar; QR pintasan opsional |
| GAP-013 | Stok jual telur + penjualan bukan kapabilitas aktif pilot |
| GAP-014 | HDP/FCR bukan angka keputusan sampai rumus diratifikasi |

### Post-pilot / belum dikerjakan

`cycle_id` pada tabel harian; cold-start offline; QR sebagai jalur utama; isolasi multi-siklus; klasifikasi telur dinamis dari `EggGrade`; transfer antar-kategori telur; periode tertutup; batas lookback tanggal resmi.

Nama gelombang ini: **Launch Alignment** (di atas sisa retest Phase 1). **Bukan** Phase 2 (multi-cycle / offline / QR-primary).

---

## STEP 2 — Mapping dokumen prioritas 13 Agu

Arah tertulis klien: peluncuran awal tidak menunggu seluruh fungsi; yang masuk cakupan harus matang. Fungsi lain boleh diuji jika siap, tetapi ketidaksiapannya tidak menahan alur produksi dasar.

| # | Priority baru (dok. §4) | Requirement tertulis | Kondisi saat ini | Evidence | Gap | Prioritas | Action |
|---|-------------------------|----------------------|------------------|----------|-----|-----------|--------|
| 1 | Data Master sebagai sumber klasifikasi | Kategori aktif master (contoh Remban, Bujang, Super) menjadi pilihan input Web dan Android; nonaktif tidak bisa dipilih; histori lama tetap terbaca | **Tidak implemented** sebagai pengendali operasional. `EggGrade` = katalog nama (+ label harga sales). Input hardcoded `tb` / `tr` / `tp`. Tidak ada flag aktif/nonaktif | Prisma `EggGrade` vs `DailyProduction.tb/tr/tp`; Mobile `features/daily-input/components/daily-input-form.tsx`; [egg-sales-stock.md](./egg-sales-stock.md) | **Kontradiksi arsitektur lama** vs arahan baru | **P0** | Kunci daftar resmi + mapping (lihat keputusan terbuka). Jangan implementasi sebelum itu |
| 2 | Uji aliran data setiap kategori | Simpan per kategori → histori, dashboard, indikator, persediaan, proses lain: arti sama | **Partial**: TB → `IN_HARVEST` Item `Egg`; TR/TP dicatat di produksi saja; HDP/FCR memakai TB | `record-daily-production.ts`; `compute-hdp.ts`; `computeFcr(feedKg, tb)` | Bergantung #1; stok tidak per-grade | **P0** setelah #1 | Bukti end-to-end per kategori setelah model dikunci |
| 3 | Finalisasi perubahan jenis telur | Pindah antar-kategori: wewenang, alasan, histori; jumlah asal turun, tujuan naik, total sama; tanpa stok negatif | **Tidak ada** alur pindah grade. Koreksi yang ada = ubah qty TB/TR/TP in-place + `DailyInputCorrection` | GAP-007 / [daily-input-correction.md](./daily-input-correction.md) | Requirement baru vs koreksi qty | **P1** | Klarifikasi: transfer stok vs relabel histori |
| 4 | Tanggal kejadian sebelumnya secara terkendali | Input kemarin; koreksi; pengiriman ulang; tanggal di luar siklus; periode tertutup; wewenang | **Partial**: API izinkan tanggal ≤ hari ini (WIB); Mobile **create** hardcode hari ini; riwayat bisa **lihat** tanggal lalu; koreksi past-date sudah memakai `?date=`; **tidak ada** lookback limit / closed period | `lib/business-date.ts` `operationalBusinessDateSchema`; Mobile `daily-input-form.tsx` (`todayRecordDate()`); Web date toolbar = rekap, bukan create lapangan | UX backfill + aturan batas | **P0** | Date picker Mobile + batas tertulis; uji duplikat |
| 5 | Penggunaan di tengah siklus | Umur, populasi, kandang, tanggal mulai sesuai keadaan farm yang sudah berjalan | **Partial**: `CycleSetting.start_date` + `initial_population` ada; umur dihitung dari `start_date`. Mutasi **tidak** dipotong `start_date` (GAP-004). Tidak ada opening stok telur/pakan / import histori sebelum app | `create-cage.ts`; `resolve-active-cycle-population.ts` | Setup salah jika `start_date` = hari instalasi, bukan tanggal aktual | **P0** | SOP + uji tenant “farm sudah jalan”. **Bukan** sama dengan ganti siklus (GAP-003) |
| 6 | Finalisasi indikator produksi | Rumus, kategori yang dihitung, pembagi, periode, pembulatan, data belum lengkap; angka dapat dihitung ulang dari histori | **Partial**: rumus ada di kode, **belum diratifikasi klien**. Label “indikatif” sudah (PH1-F). HDP = `(TB / populasi) × 100`; FCR = `kg pakan / TB` | `compute-hdp.ts`; `cycle-operational-metrics.ts`; dashboard “HDP hari ini (indikatif)” | Dokumen baru menaikkan GAP-014: rumus harus jelas + terbukti. **Tidak** otomatis membatalkan label indikatif | **P0** klarifikasi | Jangan ganti rumus diam-diam |
| 7 | Konsistensi dan kewenangan | Web = Android; pengguna hanya data yang ditugaskan | **Mostly implemented**; PH1-A/B PASS perangkat; staff scope PH1-E | gap-matrix; checklist retest 12 Agu | Retest tenant uji + PH1-C | **P0 retest** | Masuk acceptance Tahap 2 klien |
| 8 | Dukungan rilis | Versi, perangkat, pembaruan, pencadangan, pemulihan, jalur bantuan | **Partial**: versi UI ada; kontak/backup template kosong | Profile Web/Mobile; [pilot-ops-contact.md](./pilot-ops-contact.md) | Ops, bukan fitur | **P0 ops** | Isi kontak/backup sebelum go-live |

---

## STEP 3 — Lima area klien

### A. Produksi per kandang

```text
Staff Mobile → pilih kandang assigned → Input harian
  → POST /api/v1/production (dll.)
  → DailyProduction (cage_id + record_date)
  → Web rekap per kandang + dashboard agregasi
```

- Binding: **kandang + tanggal**, bukan `cycle_id` pada baris harian.
- Produksi menolak jika tidak ada siklus Active. Beberapa baris per kandang per hari (multi-record) diizinkan.
- Beberapa kandang: `GET /api/v1/cages` terfilter assignment; dashboard Web `?cageId=`.
- **Cukup untuk peluncuran terbatas** dengan satu siklus Active (GAP-002 PASS). Multi-kandang OK. Multi-siklus **belum** terbukti.

### B. Klasifikasi telur vs Data Master

Ini gap terbesar terhadap dokumen 13 Agu.

| Layer | Perilaku hari ini |
|-------|-------------------|
| Master Web `/dashboard/egg-grades` | CRUD nama/deskripsi; **bukan** aktif/nonaktif; **bukan** mapping ke kolom produksi |
| Input Mobile / skema produksi | Hardcoded TB / TR / TP |
| `GET /api/v1/egg-grades` | Ada; **tidak** dipakai form produksi Mobile |
| Database | `DailyProduction.tb`, `.tr`, `.tp` integer; tidak ada FK grade |
| Stok | Hanya TB → Item tipe `Egg` (`IN_HARVEST`) |
| Penjualan | `egg_grade_id` opsional sebagai label harga |
| Dashboard / HDP / FCR | Memakai **TB** |

Mismatch yang klien lihat (master `B` / `C` / `Remban` vs Android `TB` / `TR` / `TP`) **sesuai kode**, bukan salah uji.

**Supersede arah (bukan hapus file):** [egg-sales-stock.md](./egg-sales-stock.md) menjelaskan *implementasi hari ini* (operasional = TB/TR/TP; EggGrade katalog penjualan). Dokumen 13 Agu §2.1 mengarahkan master menjadi **pengaturan operasional**. File lama tetap bukti as-is sampai model baru dikunci.

### C. Pencatatan tanggal sebelumnya

Perilaku existing (kode), bukan requirement baru:

- Create API: tanggal operasional **tidak boleh masa depan**; **boleh kemarin** tanpa batas lookback.
- Mobile Input Harian **create**: tanggal = hari ini (`todayRecordDate()`), tidak bisa dipilih.
- Mobile Riwayat: geser tanggal = **baca** history, bukan create.
- Koreksi: PATCH + alasan; load memakai `?date=` (bug “hanya hari ini” sudah ditutup).
- Tidak ada “periode ditutup”. Tidak ada cek “tanggal di luar rentang siklus” selain “harus ada siklus Active”.
- Jika data kemarin **tersimpan** dengan `record_date` kemarin, agregasi memakai tanggal itu — sistem **tidak** memaksa kemarin tercatat sebagai hari ini, kecuali staf memakai form yang selalu today.

Dokumen 13 Agu meminta **pembuktian + pengendalian**. Pengendalian (batas hari, wewenang, periode tertutup) **belum ada di produk** dan masih keputusan terbuka.

### D. Kondisi awal farm yang sedang berjalan

**Bukan** sama dengan GAP-003 (siklus ke-2 mewarisi produksi/pakan/mati siklus 1).

**Yang ada:** buat kandang + siklus dengan `start_date` (boleh lampau, tidak future) + `initial_population`. Umur = selisih `start_date` vs hari ini.

**Yang tidak ada / berisiko:**

- Import histori produksi / pakan / mati sebelum go-live.
- Opening stock telur / pakan sebagai “kondisi gudang saat mulai pakai app”.
- Mutasi dengan `record_date` sebelum `start_date` tetap masuk hitungan populasi live (GAP-004) — berbahaya jika ada data uji lama di kandang yang sama.
- Jika operator mengisi `start_date` = hari instalasi dan populasi = stok hari ini, umur flock salah.

Data minimum “tengah siklus” **belum dikunci klien** (dokumen 13 Agu §4, keputusan penggunaan).

### E. Histori dan indikator yang dapat dipercaya

- Histori Mobile/Web: cage + date, status dilaporkan vs belum, riwayat koreksi. Konsistensi Web ↔ Mobile terbukti PH1-B pada one-cycle.
- HDP/FCR: rumus kode ada; keputusan produk GAP-014 **belum**; PH1-F label indikatif. Dokumen 13 Agu: angka harus **dapat dihitung ulang** dan rumus disepakati. Itu **tidak** otomatis menjadikan HDP/FCR angka keputusan resmi (Readiness: jangan dipakai keputusan sampai rumus + isolasi siklus terbukti).
- FCR di kode = kg pakan ÷ butir TB (bukan kg telur). HDP dibulatkan `toFixed(1)`.
- Jejak koreksi ada; UI tidak menampilkan reversal teknis.

**Rumus yang dipakai kode hari ini (belum diratifikasi klien):**

| Indikator | Rumus di kode | Catatan |
|-----------|---------------|---------|
| HDP % | `(TB / populasi layer aktif) × 100` | `features/production/lib/compute-hdp.ts`. Kategori selain TB tidak masuk pembilang. Populasi dari siklus Active + mutasi `record_date ≤ asOf`. |
| FCR | `kg pakan / TB` | `computeFcr` di `cycle-operational-metrics.ts`. Null jika TB atau pakan ≤ 0. |
| Crack ratio | `(TR + TP) / (TB + TR + TP)` | Bukan KPI keputusan; peringatan > 5% di form. |

---

## STEP 4 — Dampak ke plan lama

| Item lama | Dampak |
|-----------|--------|
| Pilot blockers GAP-001, 002, 005, 006, 008, 009, 015, 016 | Tetap relevan. 001/002/006/008/009/015 sebagian done + retest. **005 PH1-C wajib** sebelum launch. **016 kontak/backup wajib isi**. |
| GAP-014 HDP/FCR | **Direvisi:** dari “label saja” → “sepakati rumus + bukti hitung ulang” untuk indikator dasar. Label indikatif boleh tetap sampai rumus diratifikasi. |
| GAP-007 / 017 | Tetap valid; sudah di kode; masuk bukti klien (koreksi + unreported vs 0). |
| GAP-003 / 004 / 010 | **Tetap post-pilot / limit.** Jangan P0 `cycle_id` kecuali tenant uji **harus** ganti siklus. Tengah-siklus ≠ ganti siklus. |
| GAP-011 / 012 / 013 | **Turun vs syarat launch** sesuai §3.2 dokumen 13 Agu, **kecuali** stok telur dimasukkan ke arti klasifikasi (#1/#2). |
| GAP-018–030, PO, keuangan, vaksin penuh | Bukan syarat peluncuran awal (P2 / out of initial). |
| egg-sales-stock.md TB/TR/TP | Rencana implementasi lama; **superseded sebagai arah klasifikasi** jika klien mengunci master sebagai sumber input. Jangan hapus file. |
| Phase 1 vs Phase 2 | Jangan hapus. Rebaseline nama: Launch Alignment + sisa Phase 1 retest. |

---

## STEP 5 — Proposed priority

### P0 — Must prove before initial launch

1. **Klasifikasi telur satu sumber** (dok. prioritas 1–2) — butuh keputusan daftar resmi dulu.
2. **Backfill tanggal terkendali** (prioritas 4) — minimal: pilih tanggal ≤ today di Mobile + bukti `record_date`; batas lookback/wewenang tertulis.
3. **Setup tengah siklus** (prioritas 5) — SOP + bukti umur/populasi dari `start_date` + `initial_population`.
4. **Indikator terhitung ulang** (prioritas 6) — rumus kode hari ini (tabel di atas) vs dashboard 1 kandang; ratifikasi atau tetap indikatif secara eksplisit.
5. **PH1-C idempotency perangkat** (GAP-005).
6. **Kewenangan kandang** retest tenant uji (prioritas 7).
7. **Paket rilis** isi [pilot-ops-contact.md](./pilot-ops-contact.md) (prioritas 8).

### P1 — Immediately after launch / early iteration

- Transfer antar-kategori telur (prioritas 3) setelah model grade operasional.
- Harden Active-cycle pada feed/medical (GAP-027).
- GAP-026 retest “0% siklus aktif” jika masih muncul.
- Stok telur per kategori jika klien memasukkan persediaan ke arti klasifikasi.

### P2 — Later

Isolasi multi-siklus (GAP-003/004); cold-start offline; QR-primary; aktivasi penjualan telur; konversi satuan; export; polish master-data GAP-018–025.

### Out of initial scope

GAP-029 akuntansi; GAP-030 mixing pakan; PO tempo; keuangan sebagai syarat launch (§3.2 dokumen 13 Agu).

---

## STEP 6 — Rencana pembuktian (tenant uji)

Evidence tiap skenario: screenshot Mobile, screenshot Web, cuplikan API, baris DB, perbandingan before/after.

### S1 — Master mengatur input (setelah keputusan kategori)

```text
Scenario: Data Master mengendalikan pilihan input
Given kategori uji aktif di Data Master (daftar resmi yang disepakati)
When staf membuka input Android dan admin membuka input/rekap Web
Then daftar kategori pada kedua aplikasi sama
And kategori nonaktif tidak dapat dipilih untuk input baru
And baris histori lama (TB/TR/TP) tetap dapat dibaca
Evidence:
- Mobile screenshot
- Web screenshot (master + form/rekap)
- API GET egg-grades / production payload
- DB: baris baru memakai identitas kategori yang sama
```

### S2 — Aliran satu kategori

```text
Scenario: Identitas kategori tidak berubah arti
Given simpan N butir kategori K di kandang A tanggal D
When memeriksa histori Android, rekap Web, dashboard, dan stok jika berlaku
Then jumlah dan identitas K tidak berubah atau berpindah arti
Evidence:
- Mobile / Web screenshot
- API response
- DB DailyProduction (+ stok jika jalur itu aktif)
- Before/after dashboard
```

### S3 — Tanggal kemarin

```text
Scenario: Data terlupa masuk ke tanggal kejadian
Given hari ini T dan siklus Active mencakup T-1
When staf menyimpan produksi untuk T-1 (bukan T)
Then record_date = T-1
And created_at = waktu pencatatan sekarang
And pengguna tercatat
And histori T-1 menampilkan data
And indikator periode yang memuat T-1 berubah
And tanggal T tidak menggandakan baris itu
Evidence:
- Mobile screenshot (tanggal dipilih)
- Web rekap T-1 vs T
- API body recordDate
- DB record_date vs created_at
```

### S4 — Retry / tidak ganda

```text
Scenario: Pengiriman ulang satu efek
Given submit sukses dengan clientMutationId M
When payload yang sama dengan M dikirim ulang atau double-tap / flush antrean
Then tepat satu baris DB untuk mutasi itu
Evidence:
- Mobile (double-tap / antrean Profil)
- Web riwayat
- DB count by client_mutation_id
```

### S5 — Tengah siklus

```text
Scenario: Farm sudah berjalan
Given tenant uji: umur aktual U, populasi P, start_date = tanggal mulai aktual flock
When membuka dashboard / detail kandang
Then umur mengikuti start_date
And populasi = P (tidak mencampur siklus lain)
And hari sebelum go-live yang tidak di-backfill tampil sebagai belum dilaporkan, bukan 0 palsu
Evidence:
- Web siklus (start_date, initial_population)
- Web/Mobile populasi dan umur
- Histori tanggal sebelum go-live
```

### S6 — Koreksi sah

```text
Scenario: Koreksi tertelusur
Given nilai produksi sudah tersimpan
When staf/admin melakukan koreksi sah dengan alasan
Then nilai baru sama di Web dan Android
And riwayat koreksi menampilkan before → after, pelaku, waktu
And tidak terbentuk baris ganda
Evidence:
- Mobile form koreksi + riwayat
- Web tab Riwayat koreksi
- DB DailyInputCorrection
```

### S7 — Indikator dihitung ulang

```text
Scenario: Dashboard = histori sumber
Given histori sumber kandang A tanggal D (TB, populasi, pakan)
When menghitung HDP dan FCR dengan rumus tertulis di dokumen ini (atau rumus resmi setelah ratifikasi)
Then hasil sama dengan dashboard dalam toleransi pembulatan yang disepakati
Evidence:
- Web dashboard
- Web/Mobile histori
- Perhitungan manual (before/after spreadsheet)
```

### S8 — Kewenangan kandang

```text
Scenario: Hanya kandang yang ditugaskan
Given staf assigned kandang A, bukan B
When staf membuka daftar / input
Then hanya A yang terlihat dan dapat diisi
When admin mencabut A dan staf refresh online
Then A hilang dari daftar
Evidence:
- Web penugasan
- Mobile daftar kandang (setelah refresh online)
- API GET /api/v1/cages
```

---

## Keputusan terbuka yang harus dikunci klien

Dokumen 13 Agu §4 (akhir) meminta finalisasi bersama. **Jangan dikarang.** Sampai ada jawaban tertulis, implementasi klasifikasi dinamis dan aturan backfill ditahan.

| ID | Pertanyaan | Mengapa perlu | Default yang **tidak** kami asumsikan |
|----|------------|---------------|----------------------------------------|
| D1 | Daftar resmi kategori telur untuk peluncuran awal? | Master vs TB/TR/TP | Bukan menganggap Remban/Bujang/Super sudah final (itu contoh uji di dokumen) |
| D2 | Aturan aktif / nonaktif per kategori? | Input baru vs histori lama | `EggGrade` hari ini tidak punya `is_active` |
| D3 | Mapping TB / TR / TP ke kategori resmi, atau ganti model sepenuhnya? | Data existing + API OpenAPI | Jangan silently rename kolom |
| D4 | Batas tanggal sebelumnya (berapa hari)? Siapa boleh backfill? | Pengendalian yang diminta §4.4 | API hari ini: semua tanggal ≤ today, tanpa lookback |
| D5 | Periode tertutup / tanggal di luar siklus: tolak atau izinkan dengan peringatan? | Belum ada di kode | — |
| D6 | Arti beberapa input dalam satu hari (multi-record): jumlahkan atau satu baris resmi? | Sudah multi-record di DB | Jangan ubah tanpa keputusan |
| D7 | Siapa boleh koreksi di peluncuran awal (staff vs admin)? | GAP-007: staff assigned + `manage_production` | Jangan tambah approval (sudah diputuskan 12 Agu: tanpa approval) |
| D8 | Data minimum tengah siklus: `start_date` aktual + `initial_population` saja, atau wajib juga opening stok / backfill histori? | §4.5 | Jangan bangun import histori sebelum D8 |
| D9 | HDP/FCR: ratifikasi rumus kode hari ini, rumus lain, atau tetap indikatif non-keputusan? | GAP-014 vs §4.6 | Jangan ganti rumus diam-diam |
| D10 | Pembilang HDP: hanya “telur bagus” / TB, atau semua kategori aktif? | Bergantung D1–D3 | Kode hari ini: TB saja |
| D11 | Peran peluncuran awal: staff Mobile + admin Web seperti sekarang? | §4.7–4.8 | PH1-E: staff Web operasional tanpa keuangan |

### Usulan urutan keputusan (bukan implementasi)

1. D1 + D2 + D3 (klasifikasi) — memblokir P0 item 1–2.
2. D4 + D5 + D7 (tanggal + wewenang) — memblokir P0 item 2 (pengendalian).
3. D8 (tengah siklus) — memblokir SOP P0 item 3.
4. D9 + D10 (indikator) — memblokir apakah dashboard tetap “indikatif” atau resmi.
5. D6, D11 — bisa paralel.

---

## Yang sengaja tidak dilakukan di wave dokumentasi ini

- Tidak mengubah application code.
- Tidak mengedit [gap-matrix-aapm.md](./gap-matrix-aapm.md), [pilot-guide-v1.md](./pilot-guide-v1.md), atau file di `docs/source/`.
- Tidak mengimplementasikan date picker, model grade operasional, atau rumus HDP baru sampai keputusan D1–D10 tertulis.

Setelah keputusan klien masuk, PR berikutnya: (1) update gap-matrix status/prioritas, (2) implementasi P0 yang sudah dikunci, (3) jalankan S1–S8 di tenant uji.
