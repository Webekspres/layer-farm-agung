# **Dokumen Eksekusi UAT Tenant AAPM — TC-01 s/d TC-05 (First Launch)** 

Acuan: Laporan Rencana Penyelarasan Sistem dan Operasional Produksi (Revisi 1) — 001/WTI-SA/VIII/2026, Bagian 5. 

|Status kesiapan|✅SEMUA SKENARIO SIAP DIUJI|
|---|---|
|Versi Web API|v1.0.6|
|Versi APK Android|v1.0.6-build.30|
|Lingkungan|PRODUCTION — backend Vercel + DB Neon|



## **1. Informasi Lingkungan Uji — isi saat mulai** 

|Komponen|Nilai|Cara mendapatkannya|
|---|---|---|
|URL Web Dashboard|https://layer-farm-agung-omega.vercel.app|Dari tim dev|
|URL API (APK)|Sama dengan URL Web|Baked dalam APK|
|Akun Admin (web)|admin.uat / password123|Seed UAT|
|Akun Staf (Android)|staff.uat / password123|Seed UAT|



⚠ Catatan penting: lingkungan ini adalah produksi pertama. Gunakan hanya tenant UAT beserta kandang miliknya (Kandang Uji A). JANGAN mengubah/menghapus data tenant lain. Password akun UAT bersifat publik untuk pengujian — tim dev wajib menonaktifkan akun UAT setelah UAT selesai. Akun superadmin hanya dipakai untuk master data global (lihat TC-02) — jangan memakainya untuk aktivitas operasional harian. 

#### 👥 Pembagian peran penguji: 

- Superadmin (superadmin) — pihak PT AAPM selaku pemilik sistem. Mengelola data master global (grade telur, strain) agar standar form input seragam untuk semua klien. 

- Admin (admin.uat) — peternakan klien AAPM yang berlangganan sistem. Mengelola master data tenant (lokasi, kandang, vendor), pengguna, kebijakan input, dan monitoring. 

- Staf kandang (staff.uat) — pekerja peternakan klien. Input harian produksi/pakan/mortalitas via Android. 

Konsekuensi RBAC: menu Grade Telur & Strain TIDAK tersedia untuk admin tenant (manage_global_catalog hanya dimiliki superadmin). Jika menu tersebut muncul saat login admin.uat, laporkan sebagai temuan (Bagian 7). 

## **2. Persiapan Tester (Pre-flight)** 

### **2.0 Persiapan data uji oleh TIM DEV (sekali, sebelum tester mulai)** 

Seed UAT membuat seluruh prasyarat pengujian dalam tenant terisolasi: 

DATABASE_URL="postgresql://...pooler...neon.tech/neondb?sslmode=require" bun run db:seed:uat 

Yang dihasilkan: tenant Tenant UAT (Pengujian) · akun admin.uat + staff.uat · Kandang Uji A dengan 1 siklus lama berstatus Completed berisi riwayat 7 hari (produksi TB/TR/TP ±4.000 butir/hari, pakan ±510 kg/hari, mortalitas harian) · grade TB/TR/TP aktif (katalog global) · item "Pakan Layer UAT" dengan stok awal 1000 kg · kebijakan input staf 7 / admin 30 hari. 

Akun superadmin (superadmin / password123) TIDAK dibuat oleh seed UAT — akun ini berasal dari seed utama (prisma/seed.ts). Pastikan tim dev menyatakan akun tersebut tersedia di lingkungan uji sebelum eksekusi TC-02. 

Sengaja TIDAK ada siklus aktif — siklus baru dibuat penguji lewat UI pada TC-01. Seed idempoten (aman diulang). Catat ID tenant dari output console untuk header dokumen. 

### **2.1 Perangkat & akun** 

- ✅ Ponsel Android fisik (wajib fisik, bukan emulator — untuk uji offline & QR). 

- ✅ Install file APK v1.0.5-build.27 (dari tim dev / link EAS). Izinkan instalasi dari sumber tidak dikenal bila diminta. 

- ✅ Ponsel terhubung internet (WiFi atau data). 

### **2.2 Cek masuk aplikasi** 

1. Buka aplikasi AAPM. 

2. <mark>Login dengan staff.uat / password123.</mark> 

   - <mark>✅ Berhasil → masuk ke halaman utama (tab Kandang), terlihat kartu Kandang Uji A.</mark> 

   - ❌ Gagal → hentikan, laporkan ke tim dev (kemungkinan backend/URL salah atau seed belum dijalankan). 

3. Di komputer/laptop, buka URL Web Dashboard → login sebagai admin.uat / password123. 

   - ✅ Berhasil → tampil halaman Dashboard. Perhatikan: sidebar tidak memuat menu Strain, Grade Telur, maupun Tenant (memang bukan wewenang admin tenant). 

4. Logout, lalu login web sebagai superadmin / password123. 

   - ✅ Berhasil → sidebar memuat menu global superadmin: Strain, Grade Telur, dan Tenant. 

   - ❌ Gagal login atau menu tidak tampil → hentikan, laporkan ke tim dev (akun superadmin belum tersedia). 

### **2.3 Alat pendukung** 

- ✅ Spreadsheet rekonsiliasi (template di Bagian 5). 

- ✅ Folder penyimpanan screenshot dengan penamaan: TC{nomor}-{langkah}-{platform}.png Contoh: TC01-02-android.png , TC01-03-web.png , TC04-06-offline.png. Wajib mengisi checklist lengkap di Bagian 6 (Daftar Wajib Screenshot). 

- ✅ Catatan setiap anomali memakai template Bug Report (Bagian 7). 

### **2.4 Urutan eksekusi (WAJIB berurutan)** 

TC-01 → TC-02 → TC-03 → TC-05 → TC-04 

Alasan: TC-01 menyiapkan siklus aktif (syarat semua input harian); TC-05 membuat data lengkap satu hari; TC-04 merusak/mengubah data itu (edit + hapus), jadi harus terakhir agar bukti rekonsiliasi TC-05 tidak ikut berubah. Nomor ID tetap mengacu dokumen klien; hanya urutan eksekusi yang diatur di sini. 

## **3. Data Uji Standar** 

Agar hasil antar-penguji konsisten, gunakan angka berikut (boleh disesuaikan oleh tim dev, tapi catat di dokumen final): 

|Parameter|Nilai|
|---|---|
|Kandang uji|Kandang Uji A(dari seed UAT: sudah punya 1 siklus<br>Completed + riwayat 7 hari)|
|Populasi awal siklus baru (Initial Population)|5000ekor|
|Start Date siklus baru|H-40(40 hari kalender sebelum hari eksekusi)|
|Go-Live Date siklus baru|hari ini(tanggal eksekusi)|
|Produksi hari uji|TB2500, TR150, TP50butir|
|Mortalitas hari uji|10ekor (penyebab: misal "dikull" / seleksi)|
|Konsumsi pakan hari uji|324 kg(item: Pakan Layer UAT)|
|Berat rata-rata telur (Egg Mass)|60 gram/butir|
|Hari kedua (tanpa berat telur)|TB/TR/TP bebas, pakan bebas, kolom berat<br>DIKOSONGKAN|



## **4. Eksekusi Skenario Pengujian** 

### **TC-01 — Inisiasi Mid-Cycle & Isolasi Siklus** 

Tujuan: membuktikan peternakan yang sudah berjalan bisa dimulai di tengah siklus tanpa data masa lalu, umur ayam terhitung otomatis, dan data siklus lama tidak terbawa. 

Prasyarat: login admin web; ada kandang dengan riwayat siklus lama (Kandang Uji A). 

|#|Langkah|Platform<br>Hasil yang diharapkan|
|---|---|---|
|1|Buka menuKandang→<br>klikKandang Uji A→ cari<br>bagian siklus → buat<br>Siklus Baru: Start Date =<br>hari ini − 40 hari, Go-Live<br>Date =hari ini, Initial<br>Population =5000.<br>Simpan.|Web<br>Siklus baru tersimpan,<br>status aktif.📸<br>TC01-01-web.png|
|2|Buka detail kandang,<br>perhatikanumur ayam<br>yang tampil.|Web<br>Umur =40 hari(atau 5<br>minggu 5 hari — konversi<br>minggu boleh, selama<br>totalnya 40 hari).📸<br>TC01-02-web.png|
|3|Di Android, buka tab<br>Kandang→ tap kartu|Android<br>Umur/ayam tampil sama:<br>40 hari, populasi5000.📸|



|#|Langkah<br>Platform|Hasil yang diharapkan|
|---|---|---|
||Kandang Uji A.|TC01-03-android.png|
|4|Bukariwayat harian<br>kandang, geser ke rentang<br>tanggal Start Date s/d H-1<br>(sebelum go-live).<br>Android|Setiap hari bertanda<br>"Belum Dilaporkan<br>(Pra-Go-Live)"— BUKAN<br>angka nol.📸<br>TC01-04-android.png|
|5|Periksa grafik/metrik<br>kandang (HDP harian,<br>populasi) pada periode<br>pra-go-live.<br>Web + Android|Grafik TIDAK membentuk<br>nilai 0 pada periode<br>pra-go-live (periode<br>tersebut dilompati/ditandai,<br>bukan dihitung nol).📸<br>TC01-05-web.png|
|6<br>asil per langkah:|Bandingkan angka agregat<br>siklus baru (total produksi,<br>pakan, mortalitas) dengan<br>data siklus lama.<br>Web|Total siklus baru =0di<br>semua metrik (belum ada<br>input). Data siklus lama<br>tidak muncul di ringkasan<br>siklus baru dan sebaliknya.<br>📸TC01-06-web.png|
|No<br>1|2<br>3<br>4|5<br>6|
|Status<br>(✅/❌)<br> ✅|✅<br> ✅<br> ✅|✅<br> ✅|



## Hasil per langkah: 

### **TC-02 — Data Master & Pemetaan Grade Telur** 

Tujuan: membuktikan master grade telur (TB/TR/TP) sinkron antara web dan Android, dan status aktif/nonaktif bekerja. 

Prasyarat: langkah 1/3/5 di web memakai login superadmin (master grade telur adalah katalog global milik PT AAPM — admin tenant tidak punya akses); Android login staff.uat; langkah 6 verifikasi web memakai admin.uat. 

|#|Langkah|Platform|Hasil yang diharapkan|
|---|---|---|---|
|1|Login web sebagai<br>superadmin→ buka menu<br>Grade Telur. Pastikan<br>tersedia minimal:TB (Telur<br>Bagus),TR (Telur Retak),<br>TP (Telur Putih)— semua<br>statusAktif.|Web|Daftar sesuai.📸<br>TC02-01-web.png|
|2|Android (staff.uat): tab<br>Input Harian→ lihat pilihan<br>grade telur pada form.<br>(Jika grade tidak muncul,<br>pastikan online lalu<br>tarik-tarik layar untuk<br>refresh / tutup-buka form.)|Android|Label & jumlah grade<br>identik dengan web.📸<br>TC02-02-android.png|
|3|Di web (masih|Web|Status berubah Nonaktif.|



|#|Langkah|Platform|Hasil yang diharapkan|
|---|---|---|---|
||superadmin),Nonaktifkan<br>salah satu grade (misal<br>TP).||📸TC02-03-web.png|
|4|Android (masih online):<br>refresh form input harian.|Android|Grade TPhilangdari opsi<br>input baru.📸<br>TC02-04-android.png|
|5|Di web (superadmin)<br>aktifkan kembaliTP.<br>Refresh Android sekali<br>lagi.|Web + Android|TP muncul kembali.📸<br>TC02-05-android.png|
|6|Input produksi multi-grade<br>(boleh data dummy kecil,<br>tanggal hari ini) → simpan<br>→ cek riwayat. Lalu buka<br>web sebagai admin.uat →<br>rekapInput harian.|Android + Web|Label grade pada riwayat<br>Android = label pada rekap<br>web, nilai sama.📸<br>TC02-06-android.png,<br>TC02-06-web.png|



## Hasil per langkah: 

|No|1|2|3|4|5|6|
|---|---|---|---|---|---|---|
|Status|✅|✅|✅|✅|✅|✅|
|(✅/❌)|||||||



### **TC-03 — Pengendalian Input & Validasi Tanggal** 

Tujuan: membuktikan batas mundur (lookback) staf 7 hari, kebijakan admin 30 hari, dan penolakan tanggal masa depan. 

Prasyarat: siklus aktif dari TC-01; login Android sebagai staff.uat. 

|#|Langkah|Platform|Hasil yang diharapkan|
|---|---|---|---|
|1|(a) Submit input harian<br>dengan tanggalhari ini<br>(data kecil apa saja).|Android|✅Tersimpan ("Tersimpan<br>lokal / terkirim").📸<br>TC03-01-android.png|
|2|(b) Submit input harian<br>dengan tanggalH-3.|Android|✅Tersimpan.📸<br>TC03-02-android.png|
|3|(c) Submit input harian<br>dengan tanggalH-8.|Android|❌ Ditolakdengan pesan<br>validasi batas 7 hari (teks<br>boleh bervariasi; intinya<br>melebihi jendela staf).📸<br>TC03-03-android.png|
|4|(d) Coba submit dengan<br>tanggalbesok.|Android|❌ Ditolak— Secara<br>default tidak dapat<br>membuka ke tanggal hari<br>berikutnya📸<br>TC03-04-android.png|
|5|Login web sebagai admin<br>→ menuKebijakan input<br>→ catat nilai batas<br>staf/admin yang tampil.|Web|Staf =7hari, Admin =30<br>hari (default).📸<br>TC03-05-web.png|



## Hasil per langkah: 

|No|1|2|3|4|5|
|---|---|---|---|---|---|
|Status|✅|✅|✅|✅|✅|
|(✅/❌)||||||



### **TC-05 — Rekonsiliasi Formula HDP & FCR** **_(dikerjakan SEBELUM TC-04)_** 

Tujuan: membuktikan HDP (%) dan FCR dihitung benar dan identik antara Android, Web, dan hitungan manual spreadsheet. 

Prasyarat: siklus aktif; login Android staff; siapkan spreadsheet. 

### **Hari uji pertama — input data lengkap** 

|#|Langkah|Platform|Hasil yang diharapkan|
|---|---|---|---|
|1|Buat input harian tanggal<br>hari inidi Android: TB2500,<br>TR150, TP50, mortalitas10<br>ekor (isi alasan/notes),<br>pakan: pilih item pakan,<br>jumlah324 kg, berat<br>rata-rata telur60 g. Simpan.|Android|Semua tersimpan<br>(langsung atau via antrean<br>singkat).📸<br>TC05-01-android.png|
|2|Tunggu sinkron (ikon status<br>di Profil / otomatis saat<br>online), lalu buka tab<br>Kandang→ kartu Kandang<br>Uji A → catat angka yang<br>ditampilkan: populasi hidup,<br>total telur,HDP,FCR siklus.|Android|Kartu HDP & FCR<br>menampilkan angka<br>(bukan kosong/"—").📸<br>TC05-02-android.png|
|3|Hitung manual di<br>spreadsheetmemakai angka<br>populasi yang ditampilkan<br>aplikasi(lihat contoh di<br>bawah).|Spreadsheet|Rumus: HDP % = total<br>telur ÷ populasi hidup ×<br>100; Egg Mass (kg) = total<br>telur × berat rata-rata (kg);<br>FCR = pakan (kg) ÷ Egg<br>Mass (kg).📸<br>TC05-03-spreadsheet.png|
|4|Buka Web → detailKandang<br>Uji A→ bandingkan HDP &<br>FCR. Juga cek rekapInput<br>harian.|Web|Angkaidentikdengan<br>Android dan spreadsheet<br>(selisih pembulatan<br>maksimal 0,01 untuk HDP;<br>FCR harus persis pada 2<br>desimal).📸<br>TC05-04-web.png|
|5|Isi Tabel Rekonsiliasi 4 arah<br>(Bagian 5).|—|Semua baris✔.|



### **Contoh perhitungan (dengan angka standar Bagian 3, populasi tampilan aplikasi 4990)** 

<mark>Total telur       = 2500 + 150 + 50            = 2.700 butir Populasi hidup    = 4.990 ekor (AMBIL dari tampilan aplikasi) HDP               = 2700 ÷ 4990 × 100          = 54,11% Egg Mass          = 2700 × 0,060 kg            = 162,0 kg</mark> FCR               = 324 ÷ 162                  = 2,00 

### **Hari kedua — tanpa berat telur (FCR opsional)** 

|#|Langkah|Platform|Hasil yang diharapkan|
|---|---|---|---|
|6|Besoknya (atau ganti<br>tanggal H-1), buat input<br>baru: TB/TR/TP bebas +<br>pakan bebas, kolomberat<br>rata-rata DIKOSONGKAN.<br>Simpan sampai sukses.|Android|Input lolos — berat kosong<br>tidak memblokirsimpan.<br>📸TC05-06-android.png|
|7|Cek kartu FCR.|Android|FCR tampil"—"(tidak<br>dihitung, tidak error). HDP<br>tetap terhitung.📸<br>TC05-07-android.png,|



## Hasil per langkah: 

|No|1|2|3|4|5|6|7|
|---|---|---|---|---|---|---|---|
|Status|✅|✅|✅|✅|✅|✅|✅|
|(✅/❌)||||||||



Note:4.  Nilai HDP 54,1% dan FCR 2,00 pada Web sesuai dengan Android dan perhitungan spreadsheet. Namun, Kumulatif TB pada Web tercatat 2.501 butir, berbeda 1 butir dari data uji TC05 sebesar 2.500 butir karena terdapat input sebelumnya pada tanggal yang sama. 

5.Hasil rekonsiliasi menunjukkan nilai HDP dan FCR sudah sesuai antara Android, Web, dan perhitungan spreadsheet. Namun, pada Web terdapat Kumulatif TB sebesar 2.501 butir, sedangkan data uji TC05 adalah 2.500 butir. Selisih 1 butir berasal dari input pengujian sebelumnya pada tanggal yang sama, sehingga rekonsiliasi data belum sepenuhnya identik. 

### **TC-04 — Jejak Audit Koreksi & Reversal Stok (Online + Offline)** **_(dikerjakan TERAKHIR — mengubah data TC-05)_** 

Tujuan: membuktikan setiap edit/hapus tercatat di audit (alasan wajib, before/after), stok otomatis dikoreksi, dan semuanya bekerja juga saat offline. 

### **A. Online — edit & hapus** 

|#<br>Langkah|Platform|Hasil yang diharapkan|
|---|---|---|
|1<br>Catat dulu: saldo stok|Web|Catat angka "SEBELUM"|
|pakan item yang dipakai<br>kemarin (menuInventori)<br>dan stok telur per grade<br>(Inventori→ telur per<br>grade).||di sini: pakan __656____ ,<br>telur __tb=2.601, tr=160,<br>tp=55____ .📸<br>TC04-01-web.png|
|2<br>Android: buka riwayat<br>kandang →editentri|Android|Tanpa alasan → tombol<br>simpan tidak aktif/ditolak.|



|#|Langkah|Platform<br>Hasil yang diharapkan|
|---|---|---|
||produksi dari TC-05 (ubah<br>TB 2500 → 2400) → wajib<br>isiAlasan Koreksi(contoh:<br>"salah hitung shift pagi") →<br>simpan.|Dengan alasan →<br>tersimpan.📸<br>TC04-02-android.png|
|3|Cek efeknya.|Android<br>TB menjadi 2400 di kedua<br>platform; HDP ikut berubah<br>sesuai rumus.📸<br>TC04-03-web.png|
|4|Verifikasi jejak audit: buka<br>rekap koreksi (menuInput<br>harian— tabel koreksi).|Web<br>Terlihat entri koreksi:<br>alasan, nilai before/after<br>(TB 2500→2400; pakan<br>dihapus), pelaku, waktu.<br>📸TC04-06-web.png|



### **B. Offline — koreksi tanpa jaringan** 

|#|Langkah|Platform|Hasil yang diharapkan|
|---|---|---|---|
|5|Aktifkanmode pesawatdi<br>ponsel. Buat 1 input<br>produksi baru|Android|Tetap bisa disimpan; UI<br>menyatakan tersimpan<br>lokal / masuk antrean<br>(indikator pending di<br>Profil).📸<br>TC04-07-android.png|
|6|Cek menuProfil→ status<br>sinkronisasi/antrean.|Android|Antrean menampilkan entri<br>pending (jumlah sesuai<br>aksi offline).📸<br>TC04-08-android.png|
|7|Matikan mode pesawat,<br>tunggu auto-sync atau<br>tekan tombol sinkron di<br>Profil.|Android|Antrean habis; tidak ada<br>duplikat entri di riwayat.📸<br>TC04-09-android.png|
|8|Cek web: entri offline tadi<br>ada, edit-an masuk, dan<br>rekap koreksi bertambah.|Web|Konsisten; audit log<br>mencatat aksi offline<br>dengan alasan yang sama.<br>📸TC04-10-web.png|



## Hasil per langkah: 

|No|1|2|3|4|5|6|7|8|
|---|---|---|---|---|---|---|---|---|
|Status|✅|✅|✅|✅|✅|✅|✅|✅|
|(✅/❌)|||||||||



Profil 



<!-- Start of picture text -->
Informs aku<br><!-- End of picture text -->

Profil Staff UAT 



<!-- Start of picture text -->
a<br><!-- End of picture text -->

@ Peternakan AAPM UATfenant Poultryvat Penguii 

Nama Staff UAT Username staffuat Versi aplikasi AAPM Mobile v1.0.6 (build 30) 





2:43 PMO <€ 

PMO Baul G+ Kandang Kandang UjiA Lokasi UAT : Lohmann Brow! Umuropulasisiklus:ayam: 40hari§ 000 (5 mingguekor 5 hay 

15.35 



<!-- Start of picture text -->
<<br><!-- End of picture text -->

Riwayat kandang 



<!-- Start of picture text -->
ee We<br><!-- End of picture text -->

Minggu,23 Agustus 2026 

Kandang UjiA 

Riwayat koreksi 

mgo-l 

Input sekarang 

Produksi telur 

Konsumsi pakan 

Mutasi populasi 

Pengobatan 

Muat ulang 





- 

= 

Pilih klasifikasi telur 

x 

Cari 

Remban 

TB — Tolur Bagu: 

R — Telur Rotak 

TP — Tetur Putih 

fe) 

fe) 

fe) 

fe) 

Tutup 

: 

= 



<!-- Start of picture text -->
2:20PM© @ ull GE) 4<br>Pilih klasifikasi telur x<br>Cari<br>Klik untuk mencatat panen klasifkast ini v<br>c<br>Remban<br>TB — Telur Bagus<br>TR — Telur Retak<br>a 1} <<br><!-- End of picture text -->



<!-- Start of picture text -->
2:24PM© @ ‘Sutl GED 4<br>Pilih klasifikasi telur x<br>Cari<br>Klik untuk mencatat panen klasifikas! ini v<br>Remban<br>TB — Telur Bagus<br>TR — Telur Retak<br>TP — Telur Putih<br>a 1} <<br><!-- End of picture text -->





<!-- Start of picture text -->
2:26PM© &<br><!-- End of picture text -->



<!-- Start of picture text -->
Sul G+<br><!-- End of picture text -->



<!-- Start of picture text -->
€<br><!-- End of picture text -->



<!-- Start of picture text -->
Riwayat kandang<br>Tanggal rivayat<br>Jumat, 28 Agustus 2026<br><!-- End of picture text -->



<!-- Start of picture text -->
~<br><!-- End of picture text -->



<!-- Start of picture text -->
Kandang Uji A<br>Lokasi UAT<br>Riwayat koreksi<br>Produksi telur<br>TB50:TRO-TP161425: Staff UAT Edit | | Hapus<br>Total 66 butir<br>Konsumsi pakan Belum<br><!-- End of picture text -->



<!-- Start of picture text -->
aporkan<br><!-- End of picture text -->

Belum ditaporkan 



<!-- Start of picture text -->
Belum dilaporkan<br><!-- End of picture text -->



<!-- Start of picture text -->
Mutasi populasi<br><!-- End of picture text -->

Belum ditaporkan 

Belum dilaporkan. 



<!-- Start of picture text -->
Pengobatan<br><!-- End of picture text -->

Belum dilaporkan Belum dilaporkan. 



<!-- Start of picture text -->
Muat ulang<br><!-- End of picture text -->



<!-- Start of picture text -->
09.24 ee, “Wo<br>Tersimpan<br>Mortalitas 0 tersimpan (dilaporkan<br>kosong).<br>Laporan tanpa pengobatan tersimpan.<br>Data akan disinkronkan otomatis.<br>oK<br><!-- End of picture text -->



<!-- Start of picture text -->
09.57 BUSS “y hae<br>Tersimpan<br>Produksi telur tersimpan.<br>Mortalitas 0 tersimpan (dilaporkan<br>kosong).<br>Laporan tanpa pengobatan tersimpan<br>Data akan disinkronkan otomatis.<br>OK<br><!-- End of picture text -->



<!-- Start of picture text -->
10.27 eS “Gs<br>< Input harian<br>Kandang UjiA<br>kasi UAT n Browr<br>Senin, 24 Agustus 2026<br>t<br>QO _ Produksitelur Vv<br>+ Konsumsi pakan<br>®_ Mutasi poputesi Vv<br>Pengobatan vy<br><!-- End of picture text -->



<!-- Start of picture text -->
10.27 ee “ules<br><€ Input harian<br>Kandang Uji A<br>kasi UAT<br>Senin, 24 Agustus 2026<br>fopat<br>Q _ Produksi telur Vv<br>ca Konsumsi pakan v<br>G)_ Mutasi populasi v<br>&“7 Pengobatan8v<br><!-- End of picture text -->

= 



<!-- Start of picture text -->
13.10 2s “ie<br>< Edit produksi<br>Kandang Uji A<br>B (butir)<br>Remban (butir)<br>TB — Telur Bagus (butin)<br>TR— Telur Retak (butir<br>TP — Telur Putih (outir<br>2.700 butir<br><!-- End of picture text -->



<!-- Start of picture text -->
1137 eRe We<br>Kandang a<br>4.990 ek 00 buti<br>Progress input hari ini<br>1/1 kandang<br>Produksi telur 7 hari hari<br>a3 @) &<br><!-- End of picture text -->

Produksi telur 7 hari hari a3 @) & Data Nilai TB 2500 TR 150 TP 50 Total telur 2700 Populasi hidup 4990 Pakan 324 Berat rata-rata telur 60 

HDP 54.11% Egg Mass 162 FCR 2 





<!-- Start of picture text -->
13.32 eee a><br>Tersimpan<br>Produksi telur tersimpan<br>Konsumsi pakan tersimpan.<br>Data akan disinkronkan otomatis<br>oK<br><!-- End of picture text -->



<!-- Start of picture text -->
FCR siklus<br><!-- End of picture text -->

Menunggu data pakan & b 



<!-- Start of picture text -->
Inventor<br><!-- End of picture text -->



<!-- Start of picture text -->
14.11 ees ie<br>Tersimpan<br>Koreksi disimpan. Data akan disinkronkan<br>otomatis.<br>OK<br><!-- End of picture text -->



<!-- Start of picture text -->
1431 ae “ie<br>< Riwayat kandang<br>Kamis, 27 7 Agustus7  2026<br>Kandang UjiA<br>Riwayat koreksi<br>Produksi telur x<br>r but<br>Konsumsi pakan<br>akan Layer UAT — 324k Edit Hape<br>Mutasi populasi<br>Mati lor Edit Hape<br>bhai — ook Edit Hapus<br>Pengobatan x<br><!-- End of picture text -->





<!-- Start of picture text -->
3:48PMO@d © -- + aS<br>Tersimpan<br>Produksi telur tersimpan.<br>Data akan disinkronkan otomatis.<br>OK<br>s © <<br><!-- End of picture text -->



<!-- Start of picture text -->
Antrean sinkronisasi<br>1<br>Data input harian menunggu dikrim ke serve<br>Produksi 2026-08-28 (500 butir)<br><!-- End of picture text -->



<!-- Start of picture text -->
3:51PMO @d © -- Bull D4<br>Tidak ada antrean<br>Semua data sudah tersinkronkan.<br>OK<br>s © <<br><!-- End of picture text -->



