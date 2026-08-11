# ¢ AAPM 



Dokumen Markdown ini adalah ACTIVE AUTHORITY. DOCX dan PDF adalah RENDER-COPY dari isi dan evidence yang sama. 

## **1. Ringkasan Keputusan** 

|**Pertanyaan keputusan**|**Jawaban**|**Makna bagi customer**|
|---|---|---|
|Boleh dipresentasikan?|**Dapat Dilakukan**|Digitalisasi pencatatan kandang dasar dapat didemokan. QR, cold-start<br>ofine, perpindahan siklus, KPI resmi, dan penjualan harus dinyatakan<br>sebagai ftur di luar baseline pilot atau belum aktif.|
|Layak pilot customer?|**Dapat Dilanjutkan**<br>**dengan Syarat**|Kandidat pilot satu farm, 1-3 kandang, satu siklus aktif, online-frst, dengan<br>input harian, histori, dashboard, dan pemeriksaan web. Pilot dimulai setelah<br>regresi inti membuktikan data tersimpan satu kali, terbaca konsisten, dan<br>koreksi menghasilkan nilai terbaru.|
|Layak produksi penuh?|**Belum Siap**|Operasi tanpa pembatasan, multi-siklus, capability tambahan, dan tata<br>kelola layanan produksi belum cukup terbukti.|
|Keputusan target 5<br>September 2026|**Bergantung pada**<br>**Pengujian Ulang**|Tanggal target dapat dipakai untuk pilot terbatas hanya bila batas pilot<br>disepakati, hasil pengujian ulang keandalan data inti lulus, dan tersedia<br>basic backup serta kontak penanggung jawab.|
|Profl customer saat ini|**Kandidat**<br>**Digitalisasi Awal**|Digitalisasi awal farm sederhana: tujuannya mengubah catatan manual<br>menjadi data digital terpusat yang mudah diinput dan dapat dipantau,<br>bukan langsung menggantikan seluruh operasi bisnis farm.|



Rebaseline ini tidak menurunkan standar kebenaran data. Fitur boleh sederhana, tetapi data produksi, pakan, populasi/mortalitas, dan kesehatan yang masuk dalam pilot harus tersimpan pada kandang serta siklus yang benar, tidak tercatat ganda, terbaca konsisten di Android dan web, dapat dikoreksi dengan hasil terbaru, serta tidak menghasilkan dashboard yang menyesatkan. Temuan siklus, cold-start offline, QR, dan produksi-ke-penjualan tetap dicatat, tetapi menjadi gate aktivasi capability masing-masing selama jalur tersebut tidak dipakai dalam pilot. 

### **Baseline Pilot Digitalisasi Operasional Kandang Dasar** 

**Termasuk:** penyiapan farm/lokasi/kandang; akun dan penugasan staff; satu siklus aktif per kandang; input produksi telur, pakan, populasi/mortalitas, dan kesehatan sederhana; histori; dashboard monitoring; pemeriksaan web; serta koreksi dasar. 

**Internet sebagai jalur utama:** internet menjadi jalur utama. Sesi offline dan antrean satu perangkat boleh dipakai terbatas sebagai kemampuan tambahan, tetapi cold-start offline tidak dijanjikan. 

**Tidak termasuk:** QR, penutupan/pembukaan siklus baru, stok telur jual, penjualan, KPI HDP/FCR sebagai angka keputusan, ekspor lanjutan, konflik dua perangkat, dan operasi multi-lokasi kompleks. Pembelian, vaksinasi, persediaan saprodi, dan kas sederhana adalah kemampuan tambahan, bukan syarat inti pilot. 

## **2. Kemampuan yang Sudah Terbukti** 

### **Sudah Terbukti / Terbukti dengan Batasan** 

Login web tiga role dan login Android staff. 

- Penyiapan lokasi, kandang, siklus, vendor, item, customer, program, dan jadwal vaksin melalui tampilan. Penugasan dan pencabutan: cache ponsel berubah dari 2 ke 3 kandang saat ditugaskan, lalu dari 3 ke 2 setelah penugasan dicabut. 

- Pembelian beberapa barang, penerimaan bertahap/penuh, penolakan penerimaan berlebih, mutasi stok, dan satu pengeluaran kas setelah penerimaan penuh. 

Penolakan penggunaan vaksin melebihi stok, penyelesaian vaksin, stok habis, pengeluaran kas manual, 

Halaman 2 dari 29 

**AAPM** SYSTEM ANALYST 

SISTEM ANALISIS — PT AAPM 

**LAPORAN KESIAPAN RILIS PELANGGAN** PT AGUNG ABADI PUTRA MANDIRI 



dan koreksi vendor. 

- Pembacaan data offline, penyimpanan data offline terbatas pada satu perangkat, ketahanan antrean, sinkronisasi ulang dari 2 ke 0, dan tepat satu efek per komponen pada satu perangkat. 

- Koreksi produksi dari 2 menjadi 3 butir berhasil dan nilai web berubah; muat ulang aktif di Android masih menampilkan nilai lama. 

### **Sebagian Sudah Berjalan / Perlu Pembatasan atau Keputusan Produk** 

- Input harian dapat menyimpan per komponen dan memberi pesan <u><mark>`Sebagian tersimpan` ;</mark></u> bukan satu transaksi atomik lintas komponen. 

- Dashboard dan KPI terlihat, tetapi definisi resmi HDP/FCR tidak tersedia dan angka terkontaminasi defect siklus. HDP/FCR tidak menjadi angka acuan pilot sampai rumus dan pemisahan siklus dibuktikan. Inventory terbukti untuk kg, dose, dan ml; conversion antar-unit belum dibuktikan. 

- Histori operasional tersedia pada beberapa layar; export customer yang formal tidak ditemukan pada evidence aktif. 

## **3. Alur Operasional Farm End-to-End** 

|**Alur**|**Tujuan dan tindakan**<br>**user**|**Yang terbukti / batas**|**Dampak customer**|**Status**|
|---|---|---|---|---|
|5.1 Membuka<br>farm/kandang|Admin memilih tenant;<br>staf membuka daftar<br>dan detail kandang.|Dashboard web/mobile dan dua<br>kandang baseline terbaca.|Monitoring dasar dapat<br>didemokan.|**Dapat**<br>**Digunakan**<br>**dengan**<br>**Batasan**|
|5.2 Memulai siklus|Admin memasukkan<br>populasi awal dan<br>tanggal mulai.|Siklus pertama dapat dibuat.<br>Aturan persyaratan dan siklus<br>ganda hari sama belum dijelaskan.|Setup awal<br>memungkinkan untuk<br>satu siklus aktif;<br>perpindahan siklus tidak<br>termasuk pilot.|**Dapat**<br>**Digunakan**<br>**(Batas Pilot)**|
|5.3 Input harian|Staf mencatat<br>produksi, pakan,<br>populasi, kesehatan.|Form dan beberapa record per<br>hari tersedia; aturan pencatatan<br>belum dijelaskan.|Pencatatan bisa<br>berjalan, tetapi aturan<br>pengulangan perlu<br>defnisi.|**Sebagian**<br>**Berjalan**|
|5.4 Produksi telur|Staf memasukkan<br>TB/TR/TP.|Tiga catatan menghasilkan total<br>TB14/TR1/TP1 setelah koreksi.|Angka tersedia.|**Dapat**<br>**Digunakan**<br>**dengan**<br>**Batasan**|
|5.5 Pakan|Staf memasukkan<br>konsumsi.|1+2 kg menurunkan saldo 10 ke<br>7. Pengambilan melebihi stok<br>ditolak.|Perlindungan dasar<br>terbukti.|**Dapat**<br>**Digunakan**<br>**dengan**<br>**Batasan**|
|5.6<br>Populasi/mortalitas|Staf memasukkan<br>mati/afkir.|Satu kematian menurunkan<br>populasi 10 ke 9.|Perubahan populasi<br>terlihat.|**Dapat**<br>**Digunakan**<br>**dengan**<br>**Batasan**|
|5.7 Kesehatan/vaksin|Admin menyiapkan<br>program/jadwal dan<br>menyelesaikan vaksin.|Enam dosis ditolak saat stok lima;<br>dua dosis berhasil dan stok<br>menjadi tiga.|Alur sederhana dapat<br>dipakai setelah<br>penyiapan.|**Dapat**<br>**Digunakan**<br>**dengan**<br>**Batasan**|
|5.8 Persediaan|Admin membuat item,<br>menerima PO, melihat<br>saldo/mutasi.|Pakan/vaksin/obat tercatat. Telur<br>jual belum terbentuk.|Persediaan kebutuhan<br>kandang lebih siap<br>daripada persediaan<br>telur.|**Sebagian**<br>**Berjalan**|
|5.9 Pembelian|Admin membuat PO<br>dan menerima<br>bertahap.|Penerimaan bertahap/penuh dan<br>penolakan penerimaan berlebih<br>lulus.|Pembelian sederhana<br>sesuai ruang lingkup<br>dapat didemokan.|**Dapat**<br>**Digunakan**<br>**dengan**<br>**Batasan**|



Halaman 3 dari 29 

**AAPM** SYSTEM ANALYST 

SISTEM ANALISIS — PT AAPM 

**LAPORAN KESIAPAN RILIS PELANGGAN** PT AGUNG ABADI PUTRA MANDIRI 



|**Alur**|**Tujuan dan tindakan**<br>**user**|**Yang terbukti / batas**|**Dampak customer**|**Status**|
|---|---|---|---|---|
|5.10 Penjualan|Admin memilih<br>customer, lokasi,<br>grade, jumlah.|Stok telur lokasi UAT tetap nol<br>setelah TB14; pengiriman<br>dinonaktifkan.|Penjualan belum dapat<br>dipakai dan tidak<br>termasuk baseline pilot.|**Belum**<br>**Diaktifkan**|
|5.11 Kas|User melihat cashfow<br>dan input expense.|Pengeluaran PO satu kali dan<br>expense Rp1 terlihat.|Buku kas sederhana<br>terbukti, bukan bukti<br>akuntansi lengkap.|**Dapat**<br>**Digunakan**<br>**dengan**<br>**Batasan**|
|5.12<br>Dashboard/laporan|Manajer melihat KPI,<br>histori, saldo, mutasi,<br>transaksi.|Dashboard dan histori layar<br>tersedia; ekspor formal tidak<br>ditemukan.|Tinjauan operasional<br>ada, pengambilan data<br>customer perlu<br>klarifkasi.|**Sebagian**<br>**Berjalan**|
|5.13 Ofine|Staf mengunduh<br>cache, mencatat tanpa<br>jaringan,<br>menyinkronkan ulang.|Pembacaan/pengiriman data<br>ofine pada satu perangkat<br>terbukti; pembukaan ulang tanpa<br>internet belum berhasil.|Pilot memakai jalur<br>internet sebagai jalur<br>utama; jaminan ofine<br>penuh belum diaktifkan.|**Belum**<br>**Diaktifkan**<br>**pada Pilot**|
|5.14 QR/deep-link|Staf membuka<br>kandang dari<br>kode/URL.|Tautan terlihat, tetapi tautan yang<br>valid gagal dengan pesan koneksi.|Staf tetap dapat<br>memilih kandang<br>manual; QR<br>dinonaktifkan pada<br>pilot.|**Belum**<br>**Diaktifkan**<br>**pada Pilot**|
|5.15 Tutup/mulai<br>siklus baru|Admin menutup<br>periode lalu memulai<br>berikutnya.|Penutupan/pembukaan berhasil<br>secara tampilan, tetapi siklus baru<br>mewarisi data lama.|Pilot dibatasi satu siklus<br>aktif; multi-siklus wajib<br>menunggu perbaikan.|**Belum**<br>**Diaktifkan —**<br>**Kritis**|



## **4. Customer Fit** 

### **Simple Farm** 

**<mark>Kandidat Digitalisasi Awal</mark>** — pilot terbatas. Ruang lingkup dibatasi satu farm, 1-3 kandang, satu siklus aktif per kandang, internet sebagai jalur utama, input harian, histori, dashboard, pemeriksaan web, dan koreksi dasar. Data inti wajib lulus pengujian ulang keandalan sebelum mulai. Penjualan, perpindahan siklus, QR, cold-start offline, dan KPI resmi tidak boleh dijanjikan atau diaktifkan. 

### **Medium Farm** 

**<mark>Belum Cukup Diuji</mark>** untuk perluasan saat ini. Beberapa kandang, pembelian parsial, dan alur dasar terlihat, tetapi siklus berulang, multi-lokasi, pelaporan, banyak pengguna/perangkat, dan penggunaan offline belum cukup dibuktikan. 

### **Complex Farm** 

**<mark>Belum Cukup Diuji</mark>** . Bukti saat ini tidak cukup untuk kompleksitas, konflik data, berbagai jenis perangkat, pemulihan gangguan, siklus penggunaan jangka panjang, dan operasi produksi. 

## **5. Release Readiness 5 September 2026** 

|**Gate**|**Saat Ini**|**Pilot**|**Penggunaan Penuh**|
|---|---|---|---|
|Keandalan data inti pada satu siklus<br>aktif|**Lulus dengan**<br>**Batasan**|Pengujian ulang wajib|Lulus wajib|
|Penugasan, histori/pembacaan<br>ulang, koreksi, pengendalian<br>duplikat|**Terbukti pada**<br>**Skenario Terbatas**|Pengujian ulang wajib|Bukti diperluas|
|Pemisahan siklus|**Belum Lulus**|Tidak digunakan;<br>penutupan/pembukaan siklus<br>dilarang|Lulus wajib sebelum<br>multi-siklus|



Halaman 4 dari 29 

**AAPM** SYSTEM ANALYST 

SISTEM ANALISIS — PT AAPM 

**LAPORAN KESIAPAN RILIS PELANGGAN** PT AGUNG ABADI PUTRA MANDIRI 



|**Gate**|**Saat Ini**|**Pilot**|**Penggunaan Penuh**|
|---|---|---|---|
|Tautan QR/deep-link yang valid|**Belum Lulus**|Lulus jika QR diaktifkan|Lulus jika diaktifkan|
|Cold-start ofine|**Belum Lulus**|Lulus jika ofine diaktifkan|Lulus jika diaktifkan|
|Input harian secara online|**Lulus dengan**<br>**Batasan**|Aturan identitas + pengujian ulang|Lulus|
|Sinkronisasi ofine satu perangkat|**Terbukti pada**<br>**Skenario Terbatas**|Batasan terdokumentasi|Bukti retry/konfik<br>diperluas|
|Produksi sampai stok telur lalu<br>penjualan|**Belum Lulus /**<br>**Konfgurasi Tidak**<br>**Diketahui**|Lếu penjualan masuk pilot|Lulus|
|Defnisi KPI|**Belum Diketahui /**<br>**Perlu Konfrmasi**|Tidak dipakai sebagai angka<br>keputusan|Defnisi + pengujian<br>ulang sebelum diaktifkan|
|Pembelian dasar|**Lulus dengan**<br>**Batasan**|Lulus sesuai ruang lingkup|Lulus sesuai ruang<br>lingkup|
|Pelaporan/ekspor|**Sebagian Berjalan**|Histori dan monitoring melalui layar<br>cukup untuk ruang lingkup|Laporan minimum +<br>ekspor data|
|Hak akses/role|**Sebagian Berjalan**|Kontrak role jelas|Role + kebijakan<br>sesi/perangkat|
|Pencadangan/pemulihan|**Belum Diketahui**|Konfrmasi pencadangan dasar<br>diperlukan|Pemulihan teruji<br>diperlukan|
|Insiden/bantuan|**Belum Diketahui**|Satu penanggung jawab diperlukan|Proses produksi formal|



Keputusan target: **Presentasi: Dapat Dilakukan; pilot terbatas satu farm/satu siklus/internet-first: Dapat Dilanjutkan dengan Syarat setelah pengujian ulang keandalan data inti lulus dan batas pilot disepakati; kemampuan tambahan belum diaktifkan; penggunaan penuh: belum siap.** 

## **6. Kesimpulan Akhir** 

Aplikasi telah menunjukkan alur dasar yang relevan untuk digitalisasi awal farm: penyiapan farm/kandang, penugasan staff, input harian, histori, pemantauan Android–web, koreksi, serta perlindungan dasar terhadap stok dan catatan ganda pada skenario yang diuji. Hal ini membuktikan produk mempunyai fondasi yang layak dipertimbangkan untuk pilot terbatas. 

Keputusan direbaseline menjadi **Kandidat Digitalisasi Awal, Dapat Dilanjutkan dengan Syarat** , bukan penolakan absolut. Pilot hanya dapat dimulai setelah pengujian ulang keandalan data inti membuktikan bahwa data yang dicatat dan diolah tetap benar, konsisten, tidak ganda, dan dapat dibaca kembali. Pilot dibatasi satu farm, 1-3 kandang, satu siklus aktif per kandang, dan internet sebagai jalur utama; QR, coldstart offline, perpindahan siklus, stok/penjualan telur, serta HDP/FCR sebagai angka keputusan tidak diaktifkan. Penggunaan penuh tetap memerlukan perbaikan kemampuan tersebut sesuai ruang lingkup dan bukti pencadangan/pemulihan, pemantauan, dukungan, pengelolaan versi, pembaruan, perangkat yang didukung, serta pengambilan data. 

**Hasil penutupan bukti: LULUS UNTUK DOKUMEN KEPUTUSAN RILIS PELANGGAN.** Pencarian kesenjangan menyeluruh ditutup. Tahap berikutnya adalah perbaikan vendor dan pengujian ulang terarah, bukan pengujian eksplorasi tambahan. 

## **7. Apa Aplikasi Ini dan Bagaimana Cara Kerjanya** 

Alur produk yang terlihat adalah: admin menyiapkan farm, lokasi, kandang, staff, assignment, item, dan siklus; staff memakai aplikasi Android untuk melihat kandang serta mencatat produksi, pakan, populasi, dan kesehatan; data muncul di web; transaksi tertentu memengaruhi stok dan kas; manajer memonitor dashboard dan histori. 

Halaman 5 dari 29 

**AAPM** SYSTEM ANALYST 

SISTEM ANALISIS — PT AAPM 

**LAPORAN KESIAPAN RILIS PELANGGAN** PT AGUNG ABADI PUTRA MANDIRI 



Fungsi web lebih banyak dipakai untuk setup, pengawasan, pembelian, stok, vaksinasi, penjualan, dan kas. Aplikasi Android difokuskan pada staff kandang dan input lapangan. 

## **8. Ruang Lingkup dan Cara Pengujian** 

Keputusan pilot pada dokumen ini menggunakan baseline **digitalisasi awal farm** , bukan kesiapan sebagai aplikasi operasional farm lengkap. Bukti kemampuan di luar baseline tetap dipertahankan agar batas produk dan syarat perluasannya tidak hilang. 

- Runtime web: <mark>`https://layer-farm-agung-omega.vercel.app`</mark> <u><mark>.</mark></u> 

- APK source metadata: package <u><mark>`com.layeredfarmagung.aapm` ,</mark></u> <mark>`versionName 1.0.0`</mark> <u>,</u> <mark>`versionCode 2`</mark> <u><mark>;</mark></u> SHA-256 <u><mark>`91DF9DE274D0F41FB1757337BF5EAAFBE376800C5C0C312AEEFF6A143E90393E`</mark> . Nama file lokal tidak digunakan</u> sebagai version authority karena merupakan nama hasil rename pengguna. 

- Role: <u><mark>`superadmin` ,</mark></u> <u><mark>`admin.cabang` ,</mark></u> dan <u><mark>`staff.kandang` ;</mark></u> Android diuji sebagai staff. 

- Tenant: Padang Kalumpang FARM; entity UAT bernama <u><mark>`UAT-*`</mark></u> dibuat melalui UI. 

- Android: emulator Android 17/API 37. Perangkat fisik Samsung yang disebut di handoff tidak tersedia. 

- Evidence: screenshot, accessibility UI-tree, visible runtime observation, rekonsiliasi angka, dan appprocess log. 

- Mutation boundary: hanya data UAT melalui UI. Tidak ada inspeksi atau perubahan source, database, deployment, maupun konfigurasi backend. 

Screenshot membuktikan keadaan UI yang terlihat, bukan keadaan database secara langsung. Redirect route membuktikan hasil navigasi yang terlihat, bukan keseluruhan authorization server. 

## **9. Temuan dan Gate Aktivasi Capability** 

### **P0-01 Cycle isolation** 

Observed: siklus pertama ditutup dengan populasi akhir9, TB14, pakan3, mati1. Siklus kedua dimulai dengan populasi awal5, tetapi langsung menampilkan populasi4, TB14, pakan3, mati1, FCR0,21, dan HDP350%. 

Expected customer behavior: transaksi, populasi, KPI, dan histori setiap siklus terpisah sesuai identity/periode yang disetujui. 

Business impact: ringkasan periode baru salah sejak awal dan tidak dapat dipercaya untuk operasi. Acceptance: dua siklus pada kandang/tanggal sama tidak mewarisi produksi, pakan, mortalitas, HDP, atau FCR; closed cycle tetap utuh. 

Pilot treatment: **known limitation yang dapat dibatasi** untuk pilot pertama hanya bila setiap kandang memakai satu siklus aktif dan close/start siklus dilarang selama pilot. Temuan ini tetap **P0 untuk multicycle dan release umum** . 

##### 

Observed: Profil menyatakan data offline siap; setelah app ditutup dan dibuka tanpa internet, user kembali ke login. 

Expected customer behavior: user yang telah login dan download cache dapat membuka authorized shell, kandang, dan outbox sesuai kebijakan sesi offline yang terdokumentasi. Business impact: pekerjaan berhenti bila app restart di area jaringan buruk. 

Acceptance: cold relaunch offline mempertahankan local bootstrap dan data authorized tanpa server login. 

Pilot treatment: **bukan gate pilot online-first** . Capability offline penuh harus dinyatakan tidak aktif dan tidak dijanjikan sampai acceptance lulus. 

Halaman 6 dari 29 

**AAPM** SYSTEM ANALYST 

SISTEM ANALISIS — PT AAPM 

**LAPORAN KESIAPAN RILIS PELANGGAN** PT AGUNG ABADI PUTRA MANDIRI 



### **P0-03 Valid QR/deep-link** 

Observed: deep-link valid milik kandang assigned menghasilkan pesan tidak ada koneksi pada jaringan aktif; invalid dan unassigned belum mempunyai pesan canonical yang dapat dibedakan. 

Expected customer behavior: valid assigned membuka target; invalid menyatakan kode tidak dikenal; unassigned menyatakan tidak memiliki akses. 

Business impact: QR tidak dapat menjadi entry path lapangan yang dapat diandalkan. 

Acceptance: valid/invalid/unassigned lulus pada cold dan warm app state sebelum physical QR test besar. 

Pilot treatment: **bukan gate bila QR dinonaktifkan** dan staff memilih kandang dari daftar manual. 

### **P0/P1-04 Production to egg stock to sale** 

Observed: setelah TB14, stok telur tersedia pada lokasi UAT tetap0 dan penjualan1 butir tidak dapat disimpan. Classification: <mark>`PRODUCT DEFECT /`</mark> <u><mark>`CONFIGURATION GAP` ;</mark></u> karena kontrak provisioning belum tersedia, status final adalah <u><mark>`ONBOARDING/CONFIGURATION CONTRACT UNKNOWN`</mark> . Acceptance: panduan konfigurasi resmi</u> tersedia dan produksi membentuk saldo per grade/lokasi yang dapat dijual tepat sekali. 

Pilot treatment: **di luar baseline pencatatan kandang** . Menjadi gate sebelum stok telur dan sales diaktifkan. 

### **Core gate untuk bounded pilot** 

Sebelum pilot dimulai, regresi inti harus membuktikan pada data baru bahwa: 

- kandang yang tampil mengikuti assignment staff; 

- produksi, pakan, populasi/mortalitas, dan kesehatan yang dipakai pilot tersimpan pada kandang serta satu siklus aktif yang benar; 

- setiap hasil dapat dibaca kembali pada histori Android dan web dengan nilai yang sama; 

- klik/sinkronisasi ulang tidak menghasilkan catatan ganda pada skenario pilot; 

- koreksi menghasilkan nilai terbaru setelah mekanisme refresh yang jelas; 

- dashboard yang dipakai pilot bersumber dari catatan inti yang sama, sedangkan HDP/FCR diberi label belum menjadi angka acuan; 

- tersedia basic backup yang dikonfirmasi vendor dan satu kontak penanggung jawab ketika data atau layanan bermasalah. 

## **10. Data Logic dan Integritas** 

Produksi setelah koreksi: TB <u><mark>`3+7+4=14` ,</mark></u> TR1, TP1. 

Pakan: <mark>`1+2=3 kg`</mark> <u><mark>;</mark></u> saldo pakan <mark>`10-3=7 kg`</mark> <u>.</u> 

- Populasi: <mark>`10-1=9`</mark> <u><mark>`ekor`</mark></u> pada siklus pertama. 

- Partial save: produksi tersimpan saat pakan 11 kg ditolak; UI menyatakan <u><mark>`Sebagian tersimpan` .</mark></u> 

- Outbox: satu submit produksi+pakan menghasilkan dua komponen; bertahan setelah force-stop; reconnect mengubah queue 2 ke0; web menunjukkan tepat satu efek per komponen. 

- Correction: TB2 ke3 tersimpan dan web berubah; riwayat Android baru segar setelah keluar-masuk layar. Cycle aggregation: transaksi siklus pertama terbaca kembali pada siklus kedua. 

- Saleable stock: TB14 tidak menghasilkan saldo jual yang terlihat pada lokasi UAT. 

Tepat satu kali pada satu perangkat adalah skenario terbatas yang sudah terbukti, bukan bukti percobaan ulang saat timeout/5xx atau konflik dua perangkat. 

## **11. Dashboard, HDP, dan FCR** 

Angka visible siklus pertama konsisten dengan HDP <mark>`14/9 x 100 = 155,6%`</mark> dan FCR <u><mark>`3/14 = 0,21` .</mark></u> Pada siklus kedua, data warisan menghasilkan HDP <mark>`14/4 x 100 = 350%`</mark> <u>.</u> 

Halaman 7 dari 29 

**AAPM** SYSTEM ANALYST 

SISTEM ANALISIS — PT AAPM 

**LAPORAN KESIAPAN RILIS PELANGGAN** PT AGUNG ABADI PUTRA MANDIRI 



<mark>`ANALYST-INFERENCE`</mark> <u>: runtime tampak menggunakan TB/populasi saat ini untuk HDP dan pakan/TB untuk FCR.</u> <mark>`FORMULA OFFICIAL`</mark> <u><mark>:</mark></u> UNKNOWN. Tooltip, inclusion TB/TR/TP, period/window, unit, dan rounding resmi tidak ditemukan. 

Karena cycle isolation gagal, KPI tidak boleh digunakan untuk menilai performa periode baru sebelum fix dan regression. 

Untuk pilot terbatas, dashboard hanya dipakai untuk memantau catatan operasional dasar yang sudah direkonsiliasi. HDP dan FCR harus ditandai sebagai indikator sementara atau disembunyikan dari bahan keputusan sampai definisi resmi dan hasil pengujian ulangnya tersedia. 

## **12. Offline dan Kerja Lapangan** 

|**Skenario**|**Hasil**|**Batas klaim**|
|---|---|---|
|Pembacaan data ofine saat sesi masih<br>aktif|Terbukti sebagian|Dashboard, kandang, detail, dan form dapat dibuka<br>selama sesi aktif.|
|Penyimpanan data tanpa internet|Terbukti pada skenario<br>terbatas|Produksi dan pakan masuk antrean pada satu<br>perangkat.|
|Penutupan paksa dengan antrean|Terbukti pada skenario<br>terbatas|Antrean bertahan, tetapi aplikasi kembali ke login.|
|Sinkronisasi saat koneksi kembali|Terbukti pada skenario<br>terbatas|Antrean berkurang dari 2 ke 0 dan tepat satu efek per<br>komponen.|
|Pembukaan ulang tanpa internet|Belum lulus|Aplikasi tidak masuk ke halaman kerja.|
|Percobaan ulang manual/status gagal|Belum ditemukan / belum<br>diketahui|Tampilan menunjukkan jumlah antrean dan<br>sinkronisasi otomatis; mekanisme percobaan ulang<br>manual belum ditemukan.|
|Percobaan ulang saat gangguan<br>layanan|Belum diuji|Tidak dilakukan injeksi gangguan server.|
|Konfik dua perangkat|Belum diuji|Belum dilakukan.|



## **13. Kesiapan Onboarding Customer** 

|**Item**|**Status**|**Role/lokasi konfgurasi**<br>**yang terlihat**|**Dampak jika belum siap**|
|---|---|---|---|
|Tenant/Farm|REQUIRED|superadmin/admin<br>context|Dashboard dan scope farm tidak<br>terbentuk.|
|Location|REQUIRED untuk setup UAT|Admin - Data Master|Kandang dan transaksi lokasi tidak<br>dapat dipetakan.|
|Cage + capacity|REQUIRED|Admin - kandang|Staf tidak memiliki unit operasi.|
|Strain|UNKNOWN/CONTEXTUAL|Field setup<br>cycle/kandang|Kontrak wajib belum dibuktikan.|
|Staf account|REQUIRED|Admin user management|Tidak ada operator mobile.|
|Cage assignment|REQUIRED untuk visibility mobile|Admin assignment|Cage tidak muncul setelah refresh<br>cache.|
|Active cycle|REQUIRED untuk operasi cage<br>UAT|Admin cage/cycle|Cage assigned tidak aktif sebagai<br>unit input.|
|Feed/medicine/vaccine<br>items|REQUIRED bila capability dipakai|Admin inventory|Penerimaan/pemakaian tidak dapat<br>dicatat.|
|Egg item/grade mapping|UNKNOWN - vendor clarifcation|Tidak ditemukan|Produksi tidak menjadi saldo jual.|
|Vendor|REQUIRED untuk purchase|Admin vendor|PO tidak dapat disiapkan.|
|Customer|REQUIRED untuk sales|Admin customer|Penjualan tidak dapat disiapkan.|



Halaman 8 dari 29 

**AAPM** SYSTEM ANALYST 

SISTEM ANALISIS — PT AAPM 

**LAPORAN KESIAPAN RILIS PELANGGAN** PT AGUNG ABADI PUTRA MANDIRI 



|**Item**|**Status**|**Role/lokasi konfgurasi**<br>**yang terlihat**|**Dampak jika belum siap**|
|---|---|---|---|
|Opening stock|REQUIRED sesuai item yang<br>dipakai|Receipt/inventory fow|Transaksi keluar dapat ditolak<br>karena saldo.|
|QR label|OPTIONAL sampai fx / required<br>bila dijanjikan|Detail cage|Entry path QR belum usable.|
|Ofine download|REQUIRED bila ofine dipakai|Android Profle|Warm cache/outbox tidak siap.|
|Opening cash/fnance setup|UNKNOWN|Cash/fnance UI|Kontrak saldo awal belum<br>dibuktikan.|



## **14. Monitoring, Laporan, dan Data Customer** 

|**Informasi**|**Status**|**Evidence visible**|**Export/flter**|
|---|---|---|---|
|KPI/dashboard farm dan mobile|AVAILABLE WITH<br>LIMITATION|Populasi, produksi, HDP, vaksin,<br>stok, cash summary terlihat.|Filter/defnisi KPI tidak lengkap<br>dibuktikan.|
|Cage/production history|AVAILABLE|Baris produksi time-stamped dan<br>detail cage terlihat.|Export tidak ditemukan.|
|Feed/population/mortality|PARTIAL|Ringkasan/detail dan mutasi UAT<br>terlihat.|Report terpisah/export tidak<br>ditemukan.|
|Vaccination/treatment|AVAILABLE WITH<br>LIMITATION|Program, jadwal, completion, dan<br>stock mutation terlihat.|Export tidak ditemukan.|
|Inventory balance/mutation|AVAILABLE|Saldo dan mutation history terlihat.|Filter item/location terlihat<br>sebagian; export tidak<br>ditemukan.|
|Purchase history|AVAILABLE|PO, detail, partial/full receipt<br>terlihat.|Export tidak ditemukan.|
|Sales history|AVAILABLE SHELL /<br>NOT OPERATIONAL<br>UAT|Menu/form tersedia; transaksi UAT<br>blocked oleh stock0.|Export tidak ditemukan.|
|Cash income/expense/cashfow|AVAILABLE WITH<br>LIMITATION|Cash-out PO dan expense manual<br>terlihat.|Export formal tidak ditemukan.|
|Customer data retrieval|UNKNOWN|Tidak ada artefak export/retention<br>vendor.|`VENDOR-EVIDENCE REQUIRED`.|



Untuk bounded pilot, manajer dapat melakukan pemeriksaan melalui histori dan dashboard yang tersedia. Export CSV/Excel/PDF bukan gate pilot, tetapi tetap menjadi kebutuhan tahap berikutnya agar pelanggan dapat mengambil dan mengelola datanya secara lebih mandiri. 

## **15. Hak Akses dan Operasional Pengguna** 

- Superadmin, admin.cabang, dan staff.kandang berhasil login web; staff berhasil login Android. Menu Keuangan dan Data Master tidak tampak pada staff; direct route finance/users kembali ke dashboard. 

- Dashboard staff tetap menampilkan ringkasan finansial, stok, alert, dan timeline lintas farm. Ini <mark>`RISKHYPOTHESIS`</mark> <u><mark>`/ PRODUCT-SCOPE DECISION` ,</mark></u> bukan bukti incident atau bypass. 

- Assignment/revocation terlihat efektif setelah refresh cache. 

- Online session bertahan setelah force-stop; offline session tidak bertahan untuk cold-start. 

- Session/device management, disabled user behavior, dan server-side authorization per endpoint belum dibuktikan. 

Halaman 9 dari 29 

**AAPM** SYSTEM ANALYST 

SISTEM ANALISIS — PT AAPM 

**LAPORAN KESIAPAN RILIS PELANGGAN** PT AGUNG ABADI PUTRA MANDIRI 



## **16. Kesiapan Operasional Produksi** 

|**Area**|**Status**|**Evidence yang diperlukan**|
|---|---|---|
|Backup frequency/retention|UNKNOWN|Jadwal, owner, retention, dan lokasi backup.|
|Restore procedure/test|NOT PROVEN|Runbook dan hasil restore test terbaru.|
|Monitoring/alerting|UNKNOWN|Coverage, alert owner, dan escalation.|
|Incident contact/support/SLA|UNKNOWN|Kontak, jam layanan, severity, response expectation.|
|Release ownership/rollback|UNKNOWN|Release owner, approval, rollback runbook.|
|APK signing/update/distribution|UNKNOWN|Signing owner, channel distribusi, update policy.|
|Supported Android/device|PARTIAL|Emulator API37 lulus; matrix resmi dan physical device belum ada.|
|Production URL/environment owner|UNKNOWN|Environment ownership dan change control.|
|Data export/ofboarding/closure|UNKNOWN|Retrieval, retention, tenant closure procedure.|



Semua item di atas adalah <mark>`VENDOR-EVIDENCE REQUIRED`</mark> <u>, bukan defect software otomatis. Untuk bounded pilot</u> diperlukan minimum konfirmasi basic backup, masa simpan yang berlaku, dan satu kontak penanggung jawab. Restore test formal, monitoring, SLA, release recovery, signing/update, serta offboarding tetap menjadi gate produksi penuh. 

## **17. Yang Harus Diperbaiki Vendor** 

|**Prioritas**|**Temuan**|**Yang Terlihat**|**Yang Diharapkan**|
|---|---|---|---|
|Inti pilot|Pengujian ulang<br>keandalan data|Bukti inti sudah positif, tetapi<br>keputusan pilot memerlukan<br>satu pengujian ulang terarah<br>pada data baru.|Input inti tersimpan satu kali, muncul pada<br>kandang/siklus yang benar, terbaca sama di<br>Android dan web, koreksi terbaca terbaru, dan<br>dashboard dasar konsisten.|
|Kritis untuk<br>multi-siklus|Pemisahan siklus|Siklus baru mewarisi produksi,<br>pakan, kematian, populasi, HDP,<br>FCR dari siklus lama.|Dua siklus tidak saling mewarisi dan siklus yang<br>sudah ditutup tetap konsisten sebelum multi-siklus<br>diaktifkan.|
|Syarat ftur<br>ofine|Cold-start ofine|Aplikasi kembali ke login setelah<br>penutupan paksa ofine.|Aplikasi dapat dibuka kembali tanpa login melalui<br>internet sebelum penggunaan ofine penuh<br>dijanjikan.|
|Syarat ftur QR|Tautan QR/deep-link<br>valid|Tautan yang valid dan sudah<br>ditugaskan memberi error<br>koneksi.|Tautan valid membuka target; tautan tidak valid<br>dan tidak ditugaskan memberi pesan spesifk<br>sebelum QR diaktifkan.|
|Syarat ftur<br>penjualan|Stok telur/penjualan|Setelah 14 telur baik, stok<br>penjualan tetap nol; mekanisme<br>penyiapan tidak diketahui.|Penyiapan resmi tersedia dan alur produksi-stok-<br>penjualan lulus secara end-to-end sebelum<br>penjualan diaktifkan.|
|Perbaikan|Tampilan koreksi<br>belum segar|Server/web sudah menunjukkan<br>TB3, tetapi riwayat aktif di<br>ponsel masih menampilkan TB2.|Riwayat aktif memperbarui nilai setelah koreksi<br>berhasil.|
|Keputusan<br>produk|Cakupan dashboard<br>staf|Staf melihat ringkasan fnansial<br>walau menu sensitif<br>tersembunyi.|Pemilik produk menetapkan informasi yang<br>memang boleh terlihat dan tampilan mengikuti<br>keputusan.|



Detail pertanyaan vendor dan acceptance terdapat di <u><mark>`01_VENDOR_FOLLOWUP_BEFORE_FIX.md`</mark> .</u> 

## **18. Yang Harus Dibuktikan Setelah Build Baru** 

Pengujian dilakukan bertahap. **Tahap pertama** adalah core reliability regression: assignment, input produksi/pakan/populasi-mortalitas/kesehatan yang dipakai, readback Android-web, duplicate control, correction refresh, dan dashboard dasar pada satu siklus aktif. **Tahap kedua** hanya untuk capability yang 

Halaman 10 dari 29 

**AAPM** SYSTEM ANALYST 

SISTEM ANALISIS — PT AAPM 

e 



e e e e 

e 

|PadangKalumpangF_.<br>Layer Farm Partner|(0<br>Dashboard|&@ PadangKalumpangFARM<br>=G<br>Admin CabangUtama<br>a|
|---|---|---|
|Operasional<br>8§ Dashboard|Selamat datang,AdminC<br>?<br><br><br><br>|abang Utama<br>9g<br><br><br><br><br>|
|O<br>Input harian|Ringkasan<br>kesehatan<br>operasional<br>farm|— produksi,<br>stok,<br>dan<br>keuangan<br>ha|
|2 \aksinasi|||
|(23) Programvaksin|0)|4.967<br>0,0%|
|Stok & pembelian<br>®<br>Inventori<br>2 Mutasi stok|FOR hari<br>ini|Stok kritis<br>Pendapatan<br>hari<br>ir|
|Pesanan pembelian||re)<br>Rpre)|
|Keuangan<br>€ Keuangan||pain|
|Data master<br>©<br>Lokasi<br>Admin<br>Tenant aktif|Pusatperingatan<br>te<br>ra<br>4h:<br>pais aaceue<br>Mortalitas melewati ambang<br>5<br>/<br>‘|Tandai sudah dibaca<br>ld<br>teers<br>.<br>Mortalitas melewatiambang<br>ue<br>7<br>v|



1:19 Kandang Minggu, 9 Agustus 2026 





<!-- Start of picture text -->
iho<br><!-- End of picture text -->

|Populasi aktif<br>4.967 ekor|TB hari ini<br>0 butir|
|---|---|
|2 kandang|TRO:-TPO|
|HDP hari ini|Vaksin Pending|
|0.0%|0|
||Tidak ada yang terlambat|
|Progressinputhari ini||
|0/2kandang<br>0%kandangsudahtercatatproduksinyahariini||



Produksitelur 7 hari 

Belum ada data produksi 7 hari terakhir. 



<!-- Start of picture text -->
as ©<br>Kandang Input Harian Profil<br><!-- End of picture text -->

HDP7 hari 

_Ss 

Terbaru: 0.0% 





<!-- Start of picture text -->
1:20 Tino<br>< Kandang<br>u<br>Jorong Padang Kalumpang :Lohmann Brown<br>Populasi siklus: 2.472 ekor<br>Lanjutkan<br>G Form input harian ><br>Catat produksi, pakan, dan data operasional kandang<br>© Riwayat kandang ><br>Lihat histori input dan aktivitas kandang ini<br>= Vaksinasi ><br>Selesaikan jadwal vaksinasi yang menunggu<br><!-- End of picture text -->

_Ss 

Tio] 

Input harian 





<!-- Start of picture text -->
2:50<br><!-- End of picture text -->

€ 



<!-- Start of picture text -->
UAT-LF-0908<br>UAT-20260809-A :Lohmann Brown<br>Tanggal: Minggu, 9 Agustus 202¢<br><!-- End of picture text -->

Buka bagian yang perlu diisi. Tanggal dan blok kandang sudah terisi otomatis; pelapor dari akun Anda 

O Produksi telur 

“A 



<!-- Start of picture text -->
TB — Telur bagus (butir)<br>TR — Telur retak (butir)<br>fe)<br>TP — Telur pecah (butir)<br>to)<br>Total telur<br>0 butir<br>sama seperti kolom Total di laporan harian<br>« Konsumsi pakan<br>® Pilih jenis pakandan jumlah yang dipaka<br><!-- End of picture text -->

Vv 

Mutasi populasi 

Vv 



<!-- Start of picture text -->
PadangLayer Farm KalumpangPartner F... Oo shboard > Kandan« Detail &@ Padang Kalumpang FARM G Admin Cabang Utama<br>a<br>Operasional<br>€ Kembali ke Daftar Kandan<br>95 Dashboard<br>O Input harian<br>2 Naksinasi — UAT-LF-0908i | Aktif5 20 Ekor |<br>(23) Program vaksin<br>Stok & pembelian QR Kandang Staff Kandang<br>® Inventori Tempel di pintu UAT-LF-0908. Staf untt DU g ditug C pat scan QR da<br>2 Mutasi stok<br>mn © KDGE@F 832837363 Staff Kandang i , t<br>Pesanan pembelian [a] [a] RL: aapmmobile: //kandang/K<br>DGEF832837363/produksi Simpan penugasan<br>.<br>Keuangan<br>.<br>€ Keuangan [a]elta" -<br>Data master<br>© Lokasi<br>Admin: Siklus Berjalan (Aktif)<br>Tenant aktif<br>v<br><!-- End of picture text -->





<!-- Start of picture text -->
Mulai Siklus Baru x<br>Tanggal Mulai<br>09/08/2026 o<br>Populasi Awal (Maksimal 20 Ekor)<br>10<br><!-- End of picture text -->





<!-- Start of picture text -->
Buat pesanan pembelian x<br>a<br>Vendor<br>—— —_<br>UAT-VENDOR-0908<br>Tanggal pesanan<br>f gAgustus 2026<br>Barang<br>UAT-VACCINE-0908 (dose) v or<br>5 2000 w<br>UAT-MED-0908 (ml) v<br>imiat Jarga satuar<br>100 10 wy<br>v<br>+ Tambah barang<br>v<br><!-- End of picture text -->



<!-- Start of picture text -->
—— —-— «= ——<br>Terima barang — UAT-VENDOR-0908 x<br>Lokasi penerimaan stok<br>UAT-20260809-A v<br>Jumiah diterima per barang<br>UAT-FEED-0908 5<br>UAT-VACCINE-0908 2<br>UAT-MED-0g08 50<br><!-- End of picture text -->





<!-- Start of picture text -->
-— = —-—-— - -_ _—_—_<br>Terima barang — UAT-VENDOR-0908 x<br>Lokasi penerimaan stok<br>UAT-20260809-A v<br>Jumtah diterima per barang<br>UAT-FEED-0908Bee d a><br>UAT-VACCINE-0908 Py<br>UAT-MED-0908 0<br>Konfirmasi terima<br><!-- End of picture text -->

|-— =<br>—-—-—<br>-<br>-_<br>_—_—_<br>Terima barang—UAT-VENDOR-0908<br>x<br>Lokasi penerimaan stok<br>UAT-20260809-A<br>v<br>Jumtah diterima perbarang<br>UAT-FEED-0908<br>d<br>a<br>Bee<br>><br>UAT-VACCINE-0908<br>Py<br>UAT-MED-0908<br>0<br>Konfirmasi terima<br>Padang Kalumpang F_.<br>(0s<br>Dashboard<br>> Inventori<br>@ PadangKalumpangFARM<br>«G&<br>Admin CabangUtama<br>Layer Farm Partner<br>a<br>Operasional<br>:<br>=<br>Fatnee<br>Inventori<br>@ Mutasistok<br>O<br>Input harian<br>euar<br>bukan<br>item<br>saprod<br>2 \aksinasi<br>Qc<br>Semua tipe<br>v<br>2) Program vaksin<br>ua<br>Up<br>+ Tambah item<br>Stok & pembelian<br>Dedak<br>Lainnya<br>kg<br>150<br>2<br>®<br>Inventori<br># Mutasi stok<br>Jagung<br>Lainnya<br>kg<br>1.000<br>oe<br>Pesanan pembelian<br>Piala<br>Pakan<br>kg<br>°<br>2<br>Keuangan<br>UAT-FEED-0908<br>Pakan<br>kg<br>10<br>oe<br>€ Keuangan<br>UAT-MED-0908<br>Obat<br>ml<br>100<br>oe<br>Dota meeter<br>UAT-VACCINE-0908<br>Vaksin<br>dose<br>5<br>oO<br>©<br>Lokasi<br>Menampilkan<br>1-6d<br>iter<br>Baris perhalaman<br>| 10<br>»<br>1/1<br>Admin<br>Tenant aktif<br>v|
|---|





<!-- Start of picture text -->
Padang Kalumpang F_. (0s Dashboard > Inventori @ Padang KalumpangFARM  «G& Admin Cabang Utama<br>Layer Farm Partner<br>a<br>Operasional<br>: =<br>Fat nee Inventori @ Mutasi stok<br>O Input harian euar bukan item saprod<br>2 \aksinasi<br>2) Program vaksin Qc Semua uatipeUp v + Tambah item<br>Stok & pembelian<br>® Inventori Dedak Lainnya kg 150 2<br># Mutasi stok Jagung Lainnya kg 1.000 oe<br>Pesanan pembelian<br>Piala Pakan kg ° 2<br>Keuangan UAT-FEED-0908 Pakan kg 10 oe<br>€ Keuangan<br>UAT-MED-0908 Obat ml 100 oe<br>Dota meeter UAT-VACCINE-0908 Vaksin dose 5 oO<br>© Lokasi<br>Menampilkan 1-6d iter Baris perhalaman | 10 » 1/1<br>Admin<br>Tenant aktif<br>v<br><!-- End of picture text -->





<!-- Start of picture text -->
-_-- -—<br>Selesaikan vaksinasi x<br>Jumiah dipakai (dose)<br>Catatan pelaksanaan — opsional<br>Selesaikan<br><!-- End of picture text -->



<!-- Start of picture text -->
Padang Kalumpang F... (0s Dashboard > Health > Vaccines @ Padang KalumpangFARM -G& Admin Cabang Utama<br>Layer Farm Partner<br>Operasional<br>95 Dashboard Vaksinasi<br>O Input harian IT_V N t disel as<br>2 Vaksinasi<br>2) Program vaksin QCari kand. ksin Semuare statusa v + Buat jadwal<br>Kandang Vaksin Tanggal jadwal Status Jumlah dipaka Aks<br>Stok & pembelian<br>@® Inventori WADERSAT-20260809-A ees UAT-VACCINE-0908 g Agu 2026 Selesai 2 dose<br>ae ;<br>= Mutasi stok Menampilkan 1-1.dari 1 iady. Baris per halamar 10 v 1/1<br>Pesanan pembelian<br>Keuangan<br>€ Keuangan<br>Data master<br>© Lokasi<br>Admin<br>Tenant aktif<br><!-- End of picture text -->





<!-- Start of picture text -->
1:21<br>Profil<br>Staff Kandang<br><!-- End of picture text -->



<!-- Start of picture text -->
iho<br><!-- End of picture text -->



<!-- Start of picture text -->
Peternakan<br>E Padang Kalumpang FARM<br>Nama<br>Staff Kandang<br>Username<br>staff.kandang<br><!-- End of picture text -->



<!-- Start of picture text -->
Tampilan<br>Pilih tema terang, gelap, atau ikuti pengaturan perangkat.<br>cor (S<br>Terang Gelap<br>Data offline<br>Data offline siap<br>Kandang, item pakan/obat, dan riwayat hari ini tersimpan di perangkat.<br>Terakhir diunduh: Minggu, 9 Agustus 2026 -2 kandang<br>Unduh data untuk offline<br>oo e<br>Kandang Input Harian Profil<br>vv<br>Tidak ada data yang menunggu sinkronisasi —_———————_—_—_—_—_—_—_—_—<br><!-- End of picture text -->

1:23 Kandang Minggu, 9 Agustus 2026 





<!-- Start of picture text -->
ya<br><!-- End of picture text -->

|Populasi aktif<br>4.967 ekor|TB hari ini<br>0 butir|
|---|---|
|2 kandang|TRO:-TPO|
|HDP hari ini|Vaksin Pending|
|0.0%|0|
||Tidak ada yang terlambat|
|Progressinputhari ini||
|0/2kandang<br>0%kandangsudahtercatatproduksinyahariini||



Produksitelur 7 hari 



<!-- Start of picture text -->
Belum ada data produksi 7 hari terakhir.<br>as ©<br>Kandang Input Harian Profil<br><!-- End of picture text -->

HDP7 hari 

_Ss 

Terbaru: 0.0% 

1:22 

+a 



AAPM 

Layered Farm Agung Sistem manajemen peternakan ayam petelur terintegrasi 

Masuk ke akun staff 

Username 

staff.kandanc¢ 

Password 



<!-- Start of picture text -->
Gunakan akun staff yang dibuat admin<br><!-- End of picture text -->

2:48 

Input harian 





<!-- Start of picture text -->
Tike<br><!-- End of picture text -->



<!-- Start of picture text -->
<<br><!-- End of picture text -->

Tidak ada koneksi. Unduh data offline dari Profil saat terhubung ke server. 

Coba lagi 

eee 





<!-- Start of picture text -->
3:08 +a<br>Tersimpan lokal<br>Produksi telur disimpan lokal — akan disinkronkan saat online.<br>Konsumsi pakan disimpan lokal — akan disinkronkan saat online.<br>OK<br><!-- End of picture text -->

3:13 





<!-- Start of picture text -->
Thom]<br><!-- End of picture text -->

Profil Staff Kandang 



<!-- Start of picture text -->
Peternakan<br>E Padang Kalumpang FARM<br><!-- End of picture text -->

Nama 

Staff Kandang 

Username staff.kandang 

Tampilan »ilih tema terang, gelap, atau ikuti pengaturan perangkat 8 & Terang Gelap 

Data offline 



<!-- Start of picture text -->
Data offline siap<br><!-- End of picture text -->

Kandang, item pakan/obat, dan riwayat hari ini tersimpandi perangkat. Terakhir diunduh: Minggu, 9 Agustus 2026 : 3 kandang Unduh data untuk offline oo 00 G) e Kandang Input Harian Profil vu Tidak ada data yang menunggu sinkronisasi SS 



<!-- Start of picture text -->
PadangLayer Farm KalumpangPartner  F_. in) card > Produksi Padang KalumpangFARM G&G Admin Cabang Utama<br>a<br>Operasional<br>95 Dashboard InputP  harian<br>5 ap int apangan — bh | tus 202 ata ti-re ¢ kanda pa ¢<br>O Input harian<br>2 Naksinasi < fg Agustus 2026<br>(23) Program vaksin<br>Ki F L2 UAT-LF-0908 Lapor<br>Stok & pembelian<br>® \ Inventori; - ~ -<br>2 Mutasi stok @Pp # Pai ¢<br>a a a<br>Pesanan pembelian e ? °<br>Keuangan Produksi telur Konsumsi pakan Mutasi populas! Pengobatan<br>€ Keuangan<br>Riwayat Transaksi Harian: UAT-LF-0908<br>Data master le P ~ it ees ee ~ = U nena g dip<br>© Lokasi<br>Admin Kandan kas’ TB TR TP Tot DP Staff X/akt<br>Tenant aktif<br>s en. 2 On o o 2 a oe g <= v<br><!-- End of picture text -->

s en. 

<= 

o 





<!-- Start of picture text -->
3:28<br>< Riwayat kandang<br><!-- End of picture text -->



<!-- Start of picture text -->
ls a<br><!-- End of picture text -->

|~|Tanggal riwayat<br>Minggu, 9Agustus2026||
|---|---|---|
|UAT-LF-0908<br>UAT-20260809-A|||
|Tanggal: Minggu,<br>9Agustus 2026<br>Produksi telur|||
|14.54-StaffKandang<br>TB3:TR1:TPOo||.<br>Edit|
|Total4 butir|||
|TR+TP>5%|||
|14.59:<br>Staff Kandang<br>TB7:TRO: TPO||,<br>Edit|
|Total 7 butir|||
|15.13-Staff Kandang<br>TB4:TRO-TP1||,<br>Edit|
|Total 5 butir|||
|TR+TP>5%|||
|Konsumsi pakan|||
|14.59<br>Staff Kandang<br>UAT-FEED-0908 — 1 kg||Edit|
|15.13-StaffKandang<br>UAT-FEED-0g08 — 2 kg||Edit|
|Mutasipopulasi|||



14.59: Staff Kandang eee | Mati a Alar Edit 





<!-- Start of picture text -->
3:35<br>Profil<br>Staff Kandang<br><!-- End of picture text -->



<!-- Start of picture text -->
ls a<br><!-- End of picture text -->



<!-- Start of picture text -->
Peternakan<br>E Padang Kalumpang FARM<br>Nama<br>Staff Kandang<br>Username<br>staff.kandang<br><!-- End of picture text -->



<!-- Start of picture text -->
Tampilan<br>Pilih tema terang, gelap, atau ikuti pengaturan perangkat.<br>cor (S<br>Terang Gelap<br><!-- End of picture text -->

Data offline 

#### Data offline siap 

Kandang, item pakan/obat, dan riwayat hari ini tersimpan di perangkat. Terakhir diunduh: Minggu, 9 Agustus 2026 - 3 kandang 



<!-- Start of picture text -->
Mengunduh...<br>oo<br>Kandang Input Harian<br><!-- End of picture text -->



<!-- Start of picture text -->
e<br>Profil<br><!-- End of picture text -->

vv 

Tidak ada data yang menunggu sinkronisasi —_———————_—_—_—_—_—_—_—_— 





<!-- Start of picture text -->
3:38<br>Input harian<br>Scan QR atau pilih kandang untuk lanjut<br><!-- End of picture text -->



<!-- Start of picture text -->
Tio]<br><!-- End of picture text -->

@@os ScanQRkandang 

> 

Kandang saya 

K1 



<!-- Start of picture text -->
Belum input<br><!-- End of picture text -->

Pilubang : Lohmann Brown 

L2 

Belum input 

Pilubang : Lohmann Brown 

UAT-LF-0908 

Sudah input 

UAT-20260809-A :Lohmann Brown 



<!-- Start of picture text -->
oo<br>00 G)<br>Kandang Input Harian<br><!-- End of picture text -->

(Q) Profil 



<!-- Start of picture text -->
x<br>— Catat penjualan telur<br>Jorong Padang Kalumpang<br>t °<br>Tanggal penjualan<br>fg Agustus 2026<br>Barang + Tambah<br>ye! r<br>Tanpa grade<br>wah (bu 5 } (Ops al H 3 k<br>1 1000<br>Simpan penjualan<br><!-- End of picture text -->





<!-- Start of picture text -->
Padang Kalumpang<br>Layer Farm Partner F_. (0 Dashboard @ Padang Kalumpang FARM «G Staff Kandang<br>a<br>Operasional<br>8§ Dashboard Selamat datang,? Staff Kandan9<br>O Input harian<br>2 \aksinasi Produksi telur hari ini Populasi aktif HDP hari ini<br>(23) Program vaksin 0) 4.967 0,0%<br>Stok & pembelian<br>® Inventori<br>2 Mutasi stok FOR hari ini Stok kritis Pendapatan hari ir<br>Pesanan pembelian re) Rp re)<br>Pusat peringatan Tandai sudah dibaca<br>Riwayat ale m. i HDP, rv ali k minimur<br>Mortalitas melewati ambang Mortalitas melewati ambang<br>Staff 5 7 : saa - 7<br>Tenant aktif<br>v<br><!-- End of picture text -->



<u>¢ AAPM</u> 



