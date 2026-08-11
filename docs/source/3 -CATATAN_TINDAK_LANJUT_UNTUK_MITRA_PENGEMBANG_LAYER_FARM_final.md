# ¢ AAPM 



## **Maksud Dokumen** 

Dokumen ini menyampaikan kondisi aplikasi dari sudut penggunaan pelanggan dan hasil yang perlu terlihat setelah perbaikan. Ruang lingkupnya adalah proses yang dijalankan pengguna melalui web dan aplikasi Android, keutuhan hasil proses, kesiapan kerja lapangan, serta informasi layanan yang dibutuhkan pelanggan. 

Dokumen ini tidak menentukan cara Mitra mengubah source, struktur penyimpanan data, layanan, atau rancangan teknis. Pilihan implementasi tetap menjadi tanggung jawab Mitra selama hasil akhirnya memenuhi kebutuhan pelanggan dan tidak merusak proses yang sudah berjalan. 

## **Posisi Penggunaan Saat Ini** 

#### **Aplikasi dinilai sebagai kandidat untuk pilot terbatas digitalisasi pencatatan kandang, setelah keandalan data inti diperiksa ulang dan batas pilot disepakati. Penggunaan penuh tetap belum siap.** 

Cakupan pilot adalah satu farm, 1-3 kandang, satu periode aktif per kandang, penggunaan internet sebagai jalur utama, pemilihan kandang dari daftar, input harian, histori, dashboard monitoring, pemeriksaan web, dan koreksi dasar. QR, jaminan membuka ulang tanpa internet, perpindahan periode, stok/penjualan telur, serta HDP/FCR sebagai angka keputusan belum diaktifkan. 

Empat temuan utama tetap dipertahankan, tetapi masing-masing menjadi syarat sebelum kemampuan terkait diaktifkan, bukan penghalang umum untuk seluruh bentuk pilot. Untuk pilot terbatas, prioritas utama adalah memastikan data sederhana yang dihasilkan dan diolah tetap benar, konsisten, tidak ganda, dan dapat dibaca kembali. 

## **Prioritas Wajib Sebelum Pilot Terbatas** 

Mohon buktikan pada versi yang akan dipakai pelanggan bahwa: 

daftar kandang Android mengikuti penugasan dan pencabutan staff; 

- input produksi, pakan, populasi/mortalitas, dan kesehatan yang masuk cakupan tersimpan pada kandang serta satu periode aktif yang benar; 

- nilai hasil input sama ketika dibaca kembali melalui histori Android dan web; 

- penyimpanan, penekanan ulang, atau sinkronisasi pada skenario pilot tidak membentuk catatan ganda; koreksi menampilkan nilai terbaru melalui mekanisme pemuatan ulang yang jelas; 

- dashboard dasar yang dipakai pilot sesuai dengan catatan sumber, sedangkan HDP/FCR diberi label sementara atau tidak dipakai sebagai angka keputusan; 

- tersedia konfirmasi pencadangan dasar, masa simpan yang berlaku, dan satu kontak penanggung jawab bila data atau layanan bermasalah. 

Pilot tidak boleh melakukan penutupan dan pembukaan periode baru. Pilot juga harus menggunakan internet sebagai jalur utama, pemilihan kandang manual, dan tidak mencakup penjualan telur. 

## **Kemampuan yang Perlu Dipertahankan** 

- Pengelola utama, admin cabang, dan staff kandang dapat masuk ke web; staff juga dapat masuk melalui Android. 

- Admin dapat menyiapkan lokasi, kandang, pengguna, penugasan staff, periode pemeliharaan, pemasok, pelanggan, barang kebutuhan kandang, program vaksin, dan jadwal vaksin. 

- Staff dapat mencatat produksi telur, pakan, perubahan populasi, pengobatan, dan kegiatan kesehatan. 

- Pembelian sederhana dengan beberapa barang, penerimaan bertahap, pencegahan penerimaan berlebih, penambahan stok, dan pencatatan kas keluar sudah terlihat saling terhubung. 

Halaman 2 dari 9 

**AAPM** SYSTEM ANALYST 

SISTEM ANALISIS — PT AAPM 

**TINDAK LANJUT UNTUK MITRA PENGEMBANG** PT AGUNG ABADI PUTRA MANDIRI 



- Pemakaian vaksin melebihi stok ditolak; pemakaian yang valid mengurangi stok dan menyelesaikan jadwal. 

- Pada satu perangkat, produksi dan pakan dapat disimpan tanpa internet, antrean tetap tersimpan setelah aplikasi ditutup, lalu terkirim ketika koneksi kembali tanpa catatan ganda yang terlihat. Koreksi produksi berhasil mengubah nilai pada web. 

Perbaikan berikutnya tidak boleh menghilangkan kemampuan di atas. 

## **Hasil yang Diharapkan dari Tindak Lanjut** 

Mitra memberikan versi dan informasi pendukung yang memungkinkan pemeriksaan ulang keandalan data inti dilakukan secara terarah. Pilot terbatas dapat dimulai apabila data inti terbukti benar, konsisten, tidak ganda, dapat dibaca kembali, dan batas pilot diterapkan. Perbaikan periode, penggunaan penuh tanpa internet, QR, serta stok/penjualan tetap wajib sebelum kemampuan masing-masing diaktifkan dan tidak boleh hilang dari rencana tindak lanjut. 

## **Perkembangan Dibanding Pengujian Awal** 

Dasar awal adalah pengujian 30–31 Juli 2026. Kondisi terbaru berasal dari pengujian ulang 9 Agustus 2026. Perbandingan dilakukan terhadap pengalaman pengguna pada web dan Android. Nama file APK tidak dipakai untuk menyatakan kemajuan; metadata aplikasi yang tersedia tetap menunjukkan <mark>`versionName 1.0.0`</mark> dan <mark>`versionCode 2`</mark> <u><mark>.</mark></u> Web juga belum menyediakan identitas rilis yang dapat dibaca pelanggan, sehingga perbandingan web menggunakan tanggal dan hasil pengujian. 

### **Web** 

|**Area**|**Kondisi awal**|**Kondisi 9 Agustus**|**Kesimpulan untuk Mitra**|
|---|---|---|---|
|**Pembatasan**<br>**staf**|Staf dapat membuka area<br>pesanan pembelian dan<br>form pembuatannya.|Menu sensitif tidak terlihat dan<br>halaman tertentu yang dibuka<br>langsung kembali ke dashboard.<br>Dashboard staf masih menampilkan<br>ringkasan keuangan, stok,<br>peringatan, dan aktivitas pembelian.|Ada perbaikan pembatasan tampilan.<br>Mohon tetapkan bersama pemilik<br>produk informasi apa yang memang<br>boleh dilihat staf, lalu pastikan<br>hasilnya konsisten.|
|**Penyiapan farm**|Berbagai data master dan<br>kandang sudah tersedia,<br>terutama pada data yang<br>telah disiapkan.|Lokasi, kandang, penugasan, periode,<br>barang, pemasok, pelanggan,<br>program, dan jadwal vaksin berhasil<br>dibuat ulang melalui tampilan.|Kemampuan penyiapan lebih dapat<br>diulang. Panduan farm baru masih<br>perlu melengkapi stok telur, grade,<br>lokasi, satuan, dan tanggung jawab<br>penyiapan.|
|**Pembelian dan**<br>**stok**|Pesanan, penerimaan, stok,<br>mutasi, dan kas keluar<br>sudah terlihat.|Pesanan beberapa barang,<br>penerimaan bertahap/penuh,<br>penolakan penerimaan berlebih, stok,<br>dan satu kas keluar berhasil diuji<br>dengan data baru.|Ini merupakan kemajuan bukti dan<br>perlindungan proses. Mohon<br>pertahankan perilaku tersebut pada<br>versi baru.|
|**Vaksinasi**|Menu program vaksin<br>tersedia, tetapi proses<br>lengkap belum dapat<br>dijalankan karena data<br>pendukung belum siap.|Program/jadwal dapat disiapkan, stok<br>kurang ditolak, dan pemakaian valid<br>menyelesaikan jadwal serta<br>mengurangi stok.|Vaksinasi sederhana berkembang dari<br>keberadaan menu menjadi proses<br>yang terbukti. Pembentukan jadwal<br>pada periode baru masih perlu<br>dibuktikan bila memang dijanjikan.|
|**Penjualan telur**|Layar dan transaksi<br>penjualan terlihat pada data<br>lama yang sudah tersedia.|Produksi baru sebanyak 14 telur baik<br>belum membentuk stok jual pada<br>lokasi pengujian sehingga penjualan<br>tidak dapat disimpan.|Tidak cukup dasar untuk<br>menyebutnya kemunduran. Yang<br>dibutuhkan adalah panduan dan<br>demonstrasi yang dapat diulang dari<br>produksi baru sampai stok serta<br>penjualan.|



Halaman 3 dari 9 

**AAPM** SYSTEM ANALYST 

SISTEM ANALISIS — PT AAPM 

**TINDAK LANJUT UNTUK MITRA PENGEMBANG** PT AGUNG ABADI PUTRA MANDIRI 



|**Area**|**Kondisi awal**<br>**K**|**ondisi 9 Agustus**|**Kesimpulan untuk Mitra**|
|---|---|---|---|
|**Periode**<br>**pemeliharaan**|Pembuatan periode pertama<br>tersedia; perpindahan ke<br>periode berikutnya belum<br>diuji.<br>P<br>b<br>la|enutupan dan pembukaan periode<br>aru dapat dilakukan, tetapi data<br>ma ikut terbawa.|Pengujian lebih luas menemukan<br>masalah baru yang material.<br>Perbaikan perlu menjaga histori lama<br>sekaligus memulai ringkasan baru<br>dari kondisi awal yang benar.|
|**Laporan**<br>**pelanggan**|Dashboard dan histori<br>utama dapat dibaca melalui<br>layar.<br>C<br>p<br>p<br>b|akupan layar tetap tersedia, tetapi<br>engunduhan data dan proses<br>engambilan seluruh data pelanggan<br>elum ditemukan.|Kemampuan melihat data bertahan;<br>kemampuan mengambil data masih<br>perlu dijelaskan atau disediakan<br>sesuai cakupan produk.|
|**Android**||||
|**Area**|**Kondisi awal**|**Kondisi 9 Agustus**|**Kesimpulan untuk Mitra**|
|**Penugasan**<br>**kandang**|Daftar kandang dan form tersedia,<br>tetapi perubahan daftar akibat<br>penugasan belum dibuktikan<br>lengkap.|Kandang muncul setelah<br>ditugaskan dan diperbarui, lalu<br>hilang setelah penugasan dicabut<br>dan diperbarui.|Ada kemajuan yang jelas. Mohon<br>jelaskan perlakuan akses ketika<br>perangkat belum sempat<br>memperbarui data.|
|**Input harian**|Form dan histori tersedia, tetapi<br>perjalanan input baru sampai hasil<br>di web belum dibuktikan lengkap.|Produksi, pakan, dan populasi<br>berhasil disimpan dan diperiksa<br>pada web; hasil sebagian juga<br>dijelaskan kepada pengguna.|Proses inti lebih matang. Aturan<br>beberapa input dalam satu hari dan<br>cara menghindari pengulangan tetap<br>perlu dijelaskan.|
|**Tanpa**<br>**internet**|Status data siap tersedia, tetapi<br>membuka ulang aplikasi tanpa<br>internet gagal. Penyimpanan dan<br>pengiriman antrean belum terbukti<br>lengkap.|Baca data saat aplikasi terbuka,<br>simpan antrean, ketahanan<br>antrean, dan pengiriman setelah<br>koneksi kembali berhasil pada<br>satu perangkat. Membuka ulang<br>tanpa internet tetap gagal.|Ada kemajuan pada penyimpanan dan<br>sinkronisasi, tetapi masalah lama yang<br>menghentikan kerja setelah aplikasi<br>dimulai ulang belum selesai.|
|**Catatan**<br>**ganda**|Perlindungan saat pengiriman<br>ulang belum terbukti.|Hasil produksi dan pakan muncul<br>satu kali pada skenario simpan<br>berulang dan sinkronisasi satu<br>perangkat.|Kemajuan terbukti untuk skenario<br>dasar. Jangan memperluas klaim ke<br>gangguan layanan atau dua perangkat<br>sebelum pengujian tersebut dilakukan.|
|**QR/tautan**|Tautan tidak membuka kandang<br>secara andal dan menampilkan<br>pesan koneksi yang<br>membingungkan.|Tautan yang benar dan sudah<br>ditugaskan tetap gagal walaupun<br>internet aktif.|Belum ada kemajuan yang terlihat.<br>Perbaiki tautan terlebih dahulu<br>sebelum menguji label QR melalui<br>kamera.|
|**Koreksi**|Nilai dapat disunting tanpa alasan<br>wajib atau jejak perubahan yang<br>terbukti.|Koreksi produksi tersimpan dan<br>web berubah, tetapi histori<br>Android perlu dibuka ulang untuk<br>melihat nilai baru.|Penyimpanan koreksi terbukti, tetapi<br>aturan koreksi, alasan, jejak<br>perubahan, dan pembaruan layar<br>masih perlu diselesaikan sesuai<br>keputusan produk.|



Perbandingan tersebut membedakan tiga hal: kemajuan fungsi, masalah lama yang masih ada, dan masalah baru yang baru terlihat karena pengujian sekarang lebih dalam. Temuan baru tidak otomatis berarti aplikasi memburuk; beberapa proses memang belum pernah diuji sampai tahap tersebut pada kondisi awal. 

## **6. Syarat Sebelum Perpindahan Periode Diaktifkan** 

### **Kondisi yang dialami pelanggan** 

Periode pertama ditutup dengan populasi akhir 9 ekor, produksi telur baik 14 butir, pemakaian pakan 3 kilogram, dan kematian 1 ekor. Periode kedua kemudian dimulai dengan populasi awal 5 ekor. Saat periode kedua dibuka, aplikasi langsung menampilkan populasi 4 ekor serta membawa produksi 14 butir, pakan 3 kilogram, kematian 1 ekor, HDP 350%, dan FCR 0,21 dari periode sebelumnya. 

### **Dampak bagi pelanggan** 

Ringkasan periode baru sudah salah sejak awal. Pelanggan tidak dapat membedakan hasil periode lama dan 

Halaman 4 dari 9 

**AAPM** SYSTEM ANALYST 

SISTEM ANALISIS — PT AAPM 

**TINDAK LANJUT UNTUK MITRA PENGEMBANG** PT AGUNG ABADI PUTRA MANDIRI 



baru, sehingga populasi, produksi, konsumsi pakan, kematian, HDP, FCR, dan histori tidak dapat dipercaya sebagai dasar operasi. 

### **Hasil yang dibutuhkan** 

- Setiap periode pemeliharaan mempunyai data produksi, pakan, populasi, kematian, HDP, FCR, dan histori yang terpisah. 

- Menutup periode tidak mengubah atau menghilangkan histori periode tersebut. 

- Memulai periode baru menggunakan populasi awal dan transaksi periode baru saja. 

- Apabila dua periode pada kandang yang sama dapat dibuat pada tanggal yang sama, aturan pemisahannya harus tetap jelas dan konsisten. 

### **Bukti yang diminta setelah perbaikan** 

Tunjukkan satu kandang dengan periode pertama yang memiliki transaksi, tutup periode tersebut, mulai periode kedua, lalu buktikan bahwa ringkasan periode kedua dimulai dari data baru sementara histori periode pertama tetap utuh. 

**Posisi terhadap pilot:** tetap kritis untuk penggunaan umum dan operasi beberapa periode, tetapi dapat dibatasi pada pilot pertama dengan satu periode aktif per kandang serta larangan menutup/memulai periode selama pilot. 

## **7. Syarat Sebelum Penggunaan Penuh Tanpa Internet Dijanjikan** 

### **Kondisi yang dialami pelanggan** 

Setelah staff masuk saat internet tersedia dan mengunduh data, aplikasi menyatakan data offline siap. Selama aplikasi tetap terbuka, dashboard, kandang, detail, dan form dapat digunakan tanpa internet. Produksi dan pakan juga dapat disimpan sebagai antrean, bertahan setelah aplikasi ditutup, dan terkirim ketika koneksi kembali. 

Masalah muncul ketika aplikasi ditutup lalu dibuka kembali tanpa internet. Staff kembali ke halaman login dan tidak dapat membuka kandang, memeriksa catatan yang masih menunggu pengiriman, atau melanjutkan pekerjaan sampai koneksi tersedia. Pengujian tidak menunjukkan data antrean hilang; yang terbukti adalah akses kerja berhenti setelah aplikasi dimulai ulang tanpa internet. 

### **Dampak bagi pelanggan** 

Staff kandang dapat kehilangan akses kerja karena aplikasi tertutup, perangkat dimulai ulang, atau aplikasi dihentikan oleh perangkat di lokasi dengan jaringan buruk. Pencatatan menjadi tertunda dan staff tidak dapat memastikan data mana yang sudah tersimpan atau masih menunggu pengiriman. 

### **Hasil yang dibutuhkan** 

- Staff yang sudah masuk dan mengunduh data dapat membuka kembali aplikasi tanpa login melalui internet selama masa akses offline masih berlaku. 

- Hanya kandang yang terakhir menjadi tanggung jawab staff dan sudah diunduh yang dapat dibuka. Catatan yang menunggu pengiriman tetap utuh dan jumlahnya dapat dilihat. 

- Staff dapat melanjutkan pencatatan yang memang diperbolehkan tanpa internet. Ketika koneksi kembali, setiap catatan dikirim satu kali dan status antrean diperbarui dengan jelas. Mitra menjelaskan masa berlaku akses offline, tindakan ketika penugasan kandang dicabut, dan kondisi yang mengharuskan pengguna masuk kembali melalui internet. 

### **Bukti yang diminta setelah perbaikan** 

Lakukan dua pengujian. Pertama, unduh data, tutup aplikasi tanpa catatan tertunda, putuskan internet, lalu 

Halaman 5 dari 9 

**AAPM** SYSTEM ANALYST 

SISTEM ANALISIS — PT AAPM 

**TINDAK LANJUT UNTUK MITRA PENGEMBANG** PT AGUNG ABADI PUTRA MANDIRI 



buka kembali aplikasi. Kedua, buat catatan produksi dan pakan tanpa internet, pastikan keduanya masuk antrean, tutup aplikasi, buka kembali tanpa internet, periksa kandang dan antrean, tambahkan satu catatan sesuai aturan, lalu hubungkan internet dan buktikan semua catatan terkirim satu kali. 

**Posisi terhadap pilot:** bukan syarat untuk pilot yang menggunakan internet sebagai jalur utama. Penggunaan penuh tanpa internet harus dinyatakan belum aktif sampai pengujian di atas lulus. 

## **8. Syarat Sebelum QR atau Tautan Kandang Diaktifkan** 

### **Kondisi yang dialami pelanggan** 

Web sudah menampilkan kode kandang dan tautan untuk membuka proses produksi. Pada pengujian, tautan milik kandang yang benar dan sudah ditugaskan kepada staff tetap menampilkan pesan tidak ada koneksi walaupun internet aktif. 

### **Dampak bagi pelanggan** 

QR belum dapat dipakai sebagai jalur kerja utama di kandang. Pesan yang sama juga dapat membingungkan staff karena tidak menjelaskan apakah kode salah, kandang bukan tanggung jawabnya, atau memang terjadi gangguan koneksi. 

### **Hasil yang dibutuhkan** 

- QR atau tautan yang benar dan menjadi tanggung jawab staff membuka kandang atau form tujuan. Kode yang tidak dikenal menampilkan penjelasan bahwa kode tidak valid. 

- Kandang yang bukan tanggung jawab staff menampilkan penjelasan bahwa akses tidak tersedia. Hasilnya konsisten ketika aplikasi sudah terbuka maupun baru dibuka. 

### **Bukti yang diminta setelah perbaikan** 

Tunjukkan hasil untuk tiga kondisi: kandang yang ditugaskan, kode yang tidak dikenal, dan kandang yang tidak ditugaskan. Setelah tautan berhasil, pengujian dilanjutkan menggunakan label QR dan kamera pada perangkat fisik. 

**Posisi terhadap pilot:** bukan syarat bila QR dinonaktifkan dan staff memilih kandang dari daftar yang tersedia. 

## **9. Syarat Sebelum Stok Telur dan Penjualan Diaktifkan** 

### **Kondisi yang dialami pelanggan** 

Produksi telur baik sudah mencapai 14 butir, tetapi stok telur yang tersedia pada lokasi penjualan tetap nol. Penjualan satu butir tidak dapat disimpan. 

Belum ada panduan resmi apakah pelanggan harus membuat barang telur dan grade secara manual, apakah hasil produksi otomatis menambah stok, bagaimana telur baik, retak, dan pecah dipetakan, lokasi mana yang menerima stok, serta pengguna mana yang bertanggung jawab menyiapkannya. 

### **Dampak bagi pelanggan** 

Alur usaha berhenti setelah pencatatan produksi. Pelanggan belum dapat menggunakan hasil produksi sebagai persediaan yang siap dijual dan belum mengetahui apakah masalahnya berasal dari penyiapan awal atau fungsi aplikasi. 

### **Hasil yang dibutuhkan** 

Mitra memberikan panduan penyiapan barang telur, grade, satuan, lokasi penyimpanan, saldo awal bila diperlukan, dan pengguna yang bertanggung jawab. 

Halaman 6 dari 9 

**AAPM** SYSTEM ANALYST 

SISTEM ANALISIS — PT AAPM 

**TINDAK LANJUT UNTUK MITRA PENGEMBANG** PT AGUNG ABADI PUTRA MANDIRI 



- Produksi membentuk atau memperbarui stok sesuai grade dan lokasi yang ditetapkan. 

Telur yang dijual mengurangi stok satu kali dan transaksi dapat dilihat kembali. 

Telur baik, retak, dan pecah diperlakukan sesuai aturan usaha yang dijelaskan kepada pelanggan. 

### **Bukti yang diminta setelah perbaikan** 

Mulai dari farm yang sudah disiapkan sesuai panduan, catat produksi untuk setiap kategori yang didukung, tunjukkan perubahan stok per grade dan lokasi, lakukan penjualan satu butir, lalu buktikan stok dan histori penjualan berubah sesuai transaksi. 

**Posisi terhadap pilot:** di luar cakupan dasar digitalisasi pencatatan kandang. Temuan ini tidak menahan pilot selama stok telur dan penjualan tidak diaktifkan atau dijanjikan. 

## **Penjelasan Produk yang Masih Dibutuhkan** 

### **Aturan input harian** 

Beberapa catatan produksi dapat dibuat pada kandang dan tanggal yang sama serta ditampilkan berdasarkan waktu. Mohon jelaskan apakah satu catatan mewakili waktu pengambilan telur, giliran kerja, atau kejadian input lain. Aturan ini diperlukan agar staff memahami kapan input dianggap ganda dan bagaimana progres harian dihitung. 

Satu pengiriman form dapat menghasilkan sebagian data berhasil dan sebagian ditolak. Mohon pertahankan penjelasan hasil per bagian dan pastikan pengguna dapat mengetahui bagian mana yang harus diulang tanpa menggandakan bagian yang sudah berhasil. 

### **HDP dan FCR** 

Mohon berikan rumus resmi yang menjelaskan kategori telur yang dihitung, jumlah ayam yang dipakai, periode perhitungan, satuan pakan, serta pembulatan. Setelah pemisahan periode diperbaiki, angka pada dashboard perlu sesuai dengan rumus tersebut. 

### **Satuan persediaan** 

Pengujian membuktikan penggunaan kilogram, dosis, mililiter, dan butir. Apabila aplikasi mendukung hubungan antar-satuan seperti kilogram dan karung, mohon berikan aturan konfigurasi, konversi, serta pembulatannya. Apabila tidak didukung, batas tersebut perlu dinyatakan kepada pelanggan. 

### **Koreksi data** 

Koreksi produksi dari dua menjadi tiga butir berhasil dan nilai pada web berubah. Namun histori Android yang sedang terbuka masih menampilkan nilai lama sampai layar ditutup dan dibuka kembali. Setelah koreksi berhasil, nilai pada layar aktif perlu diperbarui atau pengguna diberi petunjuk yang jelas untuk memuat ulang. 

### **Informasi yang terlihat oleh staff** 

Menu keuangan dan data master tidak terlihat pada staff, tetapi dashboard staff masih menampilkan ringkasan keuangan, stok, peringatan kandang, dan aktivitas pembelian farm. Mohon konfirmasi informasi mana yang memang boleh dilihat staff kandang, lalu sesuaikan tampilan dengan keputusan pemilik produk. 

### **Laporan dan pengambilan data pelanggan** 

Dashboard, histori kandang, produksi, pakan, populasi, vaksinasi, persediaan, pembelian, penjualan, dan kas dapat dilihat melalui layar dengan tingkat kelengkapan yang berbeda. Fitur unduh ke CSV, Excel, atau PDF belum ditemukan. Mohon jelaskan laporan minimum yang tersedia, cara pelanggan mengambil seluruh datanya, lama penyimpanan data, dan proses ketika akun farm ditutup. 

Halaman 7 dari 9 

**AAPM** SYSTEM ANALYST 

SISTEM ANALISIS — PT AAPM 

**TINDAK LANJUT UNTUK MITRA PENGEMBANG** PT AGUNG ABADI PUTRA MANDIRI 



## **Informasi Kesiapan Layanan yang Diminta** 

Untuk pilot terbatas, mohon berikan minimum konfirmasi pencadangan dasar, masa simpan yang berlaku, dan satu kontak penanggung jawab. Sebelum penggunaan penuh, pelanggan memerlukan penjelasan dan bukti yang lebih lengkap mengenai: 

jadwal pencadangan data dan lama penyimpanannya; 

- cara mengembalikan data serta hasil pengujian pemulihan terbaru; 

- pemantauan layanan dan pihak yang menerima peringatan gangguan; 

- kontak bantuan, jam layanan, kategori gangguan, dan waktu tanggapan; 

- pihak yang bertanggung jawab atas penerbitan versi baru dan persetujuannya; 

- cara kembali ke versi sebelumnya apabila pembaruan bermasalah; 

- pihak yang menandatangani aplikasi Android serta saluran distribusi dan pembaruannya; versi Android dan jenis perangkat yang didukung; 

- pihak yang bertanggung jawab atas alamat layanan produksi; 

cara pelanggan mengambil data, menutup akun, dan menangani data setelah layanan berakhir. 

Ketiadaan informasi ini tidak otomatis berarti aplikasi rusak. Kedalaman buktinya mengikuti tahap penggunaan: perlindungan minimum untuk pilot, sedangkan pemulihan teruji, pemantauan, dukungan formal, pengelolaan rilis, dan penutupan data menjadi syarat penggunaan penuh. 

## **Paket yang Diminta dari Mitra** 

Mohon serahkan dalam satu paket: 

1. Versi aplikasi baru dengan <mark>`versionName`</mark> <u><mark>,</mark></u> <mark>`versionCode`</mark> <u><mark>,</mark></u> tanggal pembuatan, dan identitas file yang jelas. 

2. Ringkasan perubahan dalam bahasa pengguna untuk setiap area yang diperbaiki. 

3. 

   - Tanggapan tertulis terhadap seluruh kebutuhan dan pertanyaan dalam dokumen ini. 

4. Panduan Pilot Digitalisasi Farm v1: penyiapan farm/lokasi/kandang, penugasan staff, satu periode aktif, input inti, histori, pemeriksaan web, koreksi, penggunaan internet sebagai jalur utama, dan fitur yang dinonaktifkan. 

5. Langkah pengujian yang dapat diulang untuk pemeriksaan keandalan data inti dan, secara terpisah, empat kemampuan lanjutan. 

6. Informasi pencadangan, pemulihan, dukungan, pembaruan, perangkat yang didukung, dan pengambilan data pelanggan. 

7. Daftar batas fitur yang masih berlaku agar tidak dijanjikan secara keliru kepada pelanggan. 

## **Pengujian Ulang Setelah Versi Baru Diterima** 

Pengujian ulang dibagi dua tahap: 

1. **Inti pilot:** penugasan dan pencabutan staff; input produksi, pakan, populasi/mortalitas, dan kesehatan yang dipakai; hasil histori Android dan web; koreksi; pencegahan catatan ganda; serta konsistensi dashboard dasar pada satu periode aktif. 

2. **Kemampuan yang akan diaktifkan kemudian:** pemisahan periode; pembukaan aplikasi tanpa internet dengan dan tanpa antrean; tautan valid/tidak dikenal/tidak ditugaskan lalu QR melalui kamera; produksi sampai stok dan penjualan; serta HDP/FCR resmi. 

Pengujian dua perangkat, gangguan layanan yang disengaja, banyak jenis perangkat, dan penggunaan jangka panjang dilakukan ketika kemampuan tersebut masuk cakupan atau Mitra menyatakan aplikasi siap untuk perluasan/penggunaan penuh. 

Halaman 8 dari 9 

**AAPM** SYSTEM ANALYST 

SISTEM ANALISIS — PT AAPM 

**TINDAK LANJUT UNTUK MITRA PENGEMBANG** PT AGUNG ABADI PUTRA MANDIRI 



## **Batas Dokumen** 

- Android diuji pada perangkat virtual Android 17, bukan perangkat fisik target. 

- Pemindaian QR melalui kamera belum dilakukan. 

- Perubahan data yang sama dari dua perangkat, gangguan layanan yang disengaja, pengujian beban, dan penggunaan jangka panjang belum dilakukan. 

- Penilaian didasarkan pada tampilan dan hasil proses yang dapat dilihat pengguna, bukan pemeriksaan source, rancangan internal, atau struktur penyimpanan data. 

- Dokumen ini tidak meminta Mitra membuka source atau menjelaskan detail internal apabila hasil pelanggan dapat dibuktikan dengan jelas. 

- Nilai kecil pada data pengujian sengaja digunakan agar perubahan produksi, stok, populasi, dan kas mudah diperiksa. 

Halaman 9 dari 9 

**AAPM** SYSTEM ANALYST 

SISTEM ANALISIS — PT AAPM 

