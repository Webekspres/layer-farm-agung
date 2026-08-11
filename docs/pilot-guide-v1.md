# Panduan Pilot Digitalisasi Farm v1

**Produk:** AAPM (Web + Mobile)  
**Versi dokumen:** 2026-08-11  
**Sumber:** Readiness Report + Follow-up Notes (P0)

## Cakupan pilot

- Satu farm / tenant, 1–3 kandang, **satu siklus aktif** per kandang
- Internet sebagai jalur utama
- Staff memilih kandang dari daftar (bukan QR sebagai jalur utama)
- Input harian: produksi, pakan, populasi/mortalitas, kesehatan
- Histori Android + pemeriksaan web + koreksi dasar
- Dashboard monitoring operasional

## Peran

| Peran | Kanal utama | Catatan |
|-------|-------------|---------|
| Superadmin / Admin | Web | Setup farm, penugasan, PO, keuangan, vaksin |
| Staff kandang | **Mobile** (utama) + Web (terbatas) | Web login tetap diizinkan; dashboard operasional saja — **tanpa** KPI pendapatan / ringkasan keuangan |

## Fitur yang dinonaktifkan / tidak dijanjikan pada pilot

- Tutup / buka siklus baru (hindari multi-siklus)
- QR / deep-link sebagai jalur kerja utama
- Cold-start offline (buka ulang app tanpa jaringan)
- Stok jual telur + penjualan sebagai alur aktif
- HDP / FCR sebagai **angka keputusan** (ditampilkan sebagai indikatif saja)

## Cadangan & kontak (isi sebelum go-live pilot)

- **Backup:** [isi prosedur snapshot DB / penyedia hosting dan frekuensi]
- **Retensi:** [isi masa simpan]
- **Kontak on-call:** [nama / telepon / kanal]

## Verifikasi inti sebelum mulai

1. Penugasan/cabut staff → daftar kandang Mobile update setelah refresh online  
2. Input tersimpan pada kandang + siklus aktif; nilai sama di Android & web  
3. Retry/sync tidak menggandakan catatan  
4. Koreksi produksi menampilkan nilai terbaru di riwayat Android setelah kembali ke layar  
5. Staff Web: tidak melihat Pendapatan / Ringkasan keuangan  
