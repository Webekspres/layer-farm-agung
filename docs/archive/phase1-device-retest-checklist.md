> **Arsip** — retest manual PH1 (Agu 2026). UAT formal TC-01–TC-05 **selesai**: [`../UAT/README.md`](../UAT/README.md).

# Phase 1 — Device Retest Checklist (manual)

**Produk:** AAPM Web + Mobile  
**Tujuan:** Menutup gate pilot terbatas (Prioritas Wajib).  
**Aturan:** Verify first. Catat PASS / FAIL / BLOCKED. Fix code hanya jika FAIL.  
**Referensi:** [phase1-pilot-reliability-report.md](./phase1-pilot-reliability-report.md) · [gap-matrix-aapm.md](./gap-matrix-aapm.md) · [pilot-guide-v1.md](./pilot-guide-v1.md)

| | |
|--|--|
| **Penguji** | (isi nama) |
| **Tanggal retest** | 2026-08-12 |
| **Lingkungan** | Smoke / perangkat lokal (bukan formal staging penuh) |
| **Catatan sesi** | Retest sekilas oleh mitra; PH1-C belum dijalankan (butuh klarifikasi skenario) |

Legenda: `PASS` | `FAIL` | `BLOCKED` | `PENDING` | `N/A`

---

## Persiapan

- [x] Akun admin + staff siap
- [x] Mobile login online
- [x] Satu siklus Active per kandang uji (jangan tutup/buka siklus selama tes)
- [ ] Nama kandang uji dicatat: L1=___ L2=___ L3=___

---

## PH1-A — Penugasan staff ↔ daftar kandang Mobile (GAP-001)

**Inti:** Setelah admin assign/cabut staff dan Mobile **refresh online** (buka ulang Input / pull-to-refresh / warm), daftar kandang ikut berubah. **Bukan** wajib realtime push tanpa refresh.

| # | Langkah | Hasil | Catatan |
|---|---------|-------|---------|
| A1 | Staff assigned L1+L2; Mobile refresh online | PASS | |
| A2 | Admin assign L3; Staff refresh online → L3 muncul | PASS | |
| A3 | Admin cabut L3; Staff refresh online → L3 hilang | PASS | |
| A4 | (Opsional) Home context picker = assigned saja | N/A | Tidak wajib di sesi ini |

**Verdict PH1-A:** **PASS**

---

## PH1-B — Input Mobile = Web (GAP-002)

**Inti:** Data input harian dari Mobile harus sama saat dibaca di Web (kandang + tanggal yang sama), dengan satu siklus Active.

| # | Langkah | Hasil | Catatan |
|---|---------|-------|---------|
| B1 | Kandang uji 1 siklus Active | PASS | |
| B2–B3 | Input produksi / pakan / populasi / pengobatan dari Mobile | PASS | |
| B4 | Riwayat Android sesuai | PASS | |
| B5 | Web rekap/histori sama dengan Android | PASS | |

**Verdict PH1-B:** **PASS**

---

## PH1-C — Tidak ada catatan ganda / idempotency (GAP-005)

**Inti (bahasa sederhana):** Sistem harus menolak “kirim dua kali = dua baris”.

Contoh gagal yang dicari UAT: staff menekan Simpan 2× cepat, atau simpan offline lalu flush 2×, lalu di Riwayat/Web muncul **2 catatan identik** padahal user hanya bermaksud **1 kali**.

### Cara tes singkat (kalau belum)

1. **Double-tap:** Buka form produksi, isi TB, tekan Simpan **dua kali cepat**. Cek Riwayat + Web: harus **1** baris saja (atau UI tidak menambah dobel).
2. **Offline queue:** Mode pesawat → simpan produksi/pakan → cek antrean di Profil → nyalakan data → biarkan flush / tekan sync → antrean kosong, Riwayat/Web **1** efek. Flush lagi: **tidak** nambah baris baru.

| # | Langkah | Hasil | Catatan |
|---|---------|-------|---------|
| C1 | Baseline: submit produksi 1×, hitung baris | PENDING | Belum dijalankan sesi ini |
| C2 | Double-tap Simpan | PENDING | |
| C3 | Offline → antrean Profil | PENDING | |
| C4 | Online → flush → satu efek | PENDING | |
| C5 | Flush/buka ulang lagi → tidak dobel | PENDING | |

**Verdict PH1-C:** **PENDING** — penguji belum menjalankan; perlu skenario di atas.

---

## PH1-D — Koreksi di riwayat tanpa restart app (GAP-006)

**Inti:** Edit di Riwayat Mobile → nilai baru terlihat setelah kembali ke layar riwayat (keluar-masuk menu / focus cukup). Tidak perlu kill app.

| # | Langkah | Hasil | Catatan |
|---|---------|-------|---------|
| D1–D2 | Edit produksi (mis. TB 2→3), simpan | PASS | |
| D3 | Web menampilkan nilai baru | PASS | (diasumsikan ikut dicek / konsisten dengan B) |
| D4 | Riwayat Android update tanpa restart app | PASS | Keluar-masuk menu cukup |

**Verdict PH1-D:** **PASS**

---

## PH1-H — Dashboard vs catatan sumber

**Inti:** Angka dashboard (populasi/produksi) masuk akal dibanding input yang baru dibuat; HDP/FCR indikatif.

| # | Langkah | Hasil | Catatan |
|---|---------|-------|---------|
| H1–H2 | Dashboard vs input diketahui | PASS | |
| H3 | Context satu kandang (jika dipakai) | PASS | |
| H4 | HDP/FCR bukan angka keputusan | PASS | |

**Verdict PH1-H:** **PASS**

---

## Smoke cepat (sudah di-code)

| Item | Cek | Hasil |
|------|-----|-------|
| PH1-E Staff Web tanpa keuangan | Nav Keuangan + KPI Pendapatan hilang | PENDING / N/A sesi ini |
| PH1-F Batas pilot | Label HDP, copy offline, QR opsional | PENDING / N/A sesi ini |
| PH1-G Versi | Profile Web + Mobile | PENDING / N/A sesi ini |

---

## Docs-ops & EAS (bukan retest app)

| # | Tugas | Status |
|---|-------|--------|
| O1 | Isi `pilot-ops-contact.md` | PENDING sebelum go-live |
| O2 | Isi Backup/Retensi di `pilot-guide-v1.md` | PENDING sebelum go-live |
| E1–E5 | EAS Preview APK + staging HTTPS | PENDING |

---

## Ringkasan verdict (2026-08-12)

| Gate | Verdict | Blocker? |
|------|---------|----------|
| PH1-A | PASS | Tidak |
| PH1-B | PASS | Tidak |
| PH1-C | PENDING | Ya — belum diverifikasi di perangkat |
| PH1-D | PASS | Tidak |
| PH1-H | PASS | Tidak |
| Ops contact/backup | PENDING | Ya untuk go-live formal |
| EAS preview | PENDING | Ya untuk distribusi APK internal |

**Siap mulai pilot terbatas?** **BELUM penuh** — tunggu PH1-C + isi ops + (disarankan) EAS preview.

**Lanjut produk (disepakati):** setelah laporan ini, refactor ringan Input Harian staff (detail menyusul).

**Bug ditemukan di sesi ini:** tidak ada yang dilaporkan FAIL.
