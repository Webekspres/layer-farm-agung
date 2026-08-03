# UAT Checklist — 13 Modul AAPM

Checklist ini dipakai sebelum backend Vercel dan EAS Preview dinyatakan release candidate.

## Role dan tenant

- Superadmin bisa login, memilih tenant aktif, dan melihat data lintas tenant hanya setelah tenant dipilih.
- Admin tenant hanya melihat data tenant sendiri.
- Staff kandang hanya bisa memakai AAPM Mobile dan kandang yang ditugaskan.
- User nonaktif atau tenant nonaktif ditolak.

## Modul 1–3: akun, master, strain

- Buat tenant, admin, staff, role, dan permission.
- Buat lokasi dan kandang dengan siklus aktif.
- Buat strain dan target HDP/FCR; edit target dan pastikan dashboard memakai target terbaru.

## Modul 4–6: input, offline, populasi

- Mobile login, lihat kandang, scan QR, lalu submit produksi TB/TR/TP.
- Submit konsumsi pakan dan pastikan stok pakan berkurang.
- Submit mutasi `Masuk`, `Mati`, `Afkir`, dan `Pindah`; pastikan populasi aktif berubah benar.
- Matikan jaringan, submit input baru, hidupkan jaringan, flush antrean, dan pastikan data tidak dobel.

## Modul 7–8: procurement dan inventori

- Buat vendor dan PO.
- Terima PO sebagian, pastikan stok bertambah hanya sesuai jumlah diterima.
- Terima sisa PO, pastikan status `Received` dan cashflow expense dibuat satu kali.
- Cek kartu stok dan halaman mutasi stok.

## Modul 9–10: alert dan dashboard

- Buat kondisi HDP di bawah target; pastikan alert muncul di dashboard dan tercatat di pusat peringatan.
- Buat mortalitas melewati ambang 7 hari; pastikan alert critical muncul.
- Turunkan stok di bawah minimum; pastikan alert stok rendah muncul.
- Tandai alert sudah dibaca dan refresh dashboard.
- Verifikasi KPI produksi, FCR, mortalitas, kas, dan timeline.

## Modul 11–12: sales dan cashflow

- Buat customer.
- Catat penjualan telur dari lokasi stok telur; pastikan `OUT_SALES` memotong stok.
- Pastikan income cashflow otomatis dibuat dari sales.
- Filter cashflow per periode dan cocokkan pemasukan, pengeluaran, dan laba/rugi periode.

## Modul 13: kesehatan dan vaksinasi

- Buat jadwal vaksinasi untuk kandang aktif.
- Selesaikan vaksinasi di mobile; pastikan stok vaksin berkurang.
- Buat pengobatan dengan item obat/vitamin; pastikan stok terkait berkurang.
- Cek riwayat kandang berisi produksi, pakan, populasi, pengobatan, dan vaksinasi.

## Backend Vercel smoke

- `GET /api/health` mengembalikan `200`.
- `/dashboard` redirect ke login tanpa session.
- `/api/v1/cages` tanpa cookie mengembalikan JSON `401`.
- Login admin, upload logo tenant, dan buka `/api/storage/...`.
- Login staff dari mobile terhadap URL Vercel HTTPS.

## EAS Preview smoke

- Install APK preview pada perangkat fisik.
- Login, scan QR, input/edit data operasional, vaksinasi, warm cache, mode pesawat, flush, logout, login ulang.
