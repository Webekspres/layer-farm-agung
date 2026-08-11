## **PANDUAN PENGUJIAN SISTEM (UAT)** 

## **AAPM – Sistem Manajemen Peternakan Ayam Petelur** 

**Versi: Beta Testing v0.1** 

## **Disusun oleh:** 

## **PT Webekspres Teknologi Indonesia** 

## **1. Pendahuluan** 

Dokumen ini digunakan sebagai panduan bagi pengguna dalam melakukan proses pengujian (User Acceptance Testing/UAT) terhadap Sistem Manajemen Peternakan Ayam Petelur (AAPM). 

Tujuan pengujian adalah memastikan seluruh fitur utama telah berjalan sesuai kebutuhan operasional peternakan sebelum sistem digunakan secara penuh (Go-Live). 

Selama proses testing, diharapkan pengguna mencatat apabila terdapat: 

- Bug / Error 

- Alur yang membingungkan 

- Data yang kurang sesuai 

- Saran perbaikan 

- Penyesuaian kebutuhan operasional 

## **2. Informasi Akses (Akses Awal)** 

|no|akses|username|password|
|---|---|---|---|
|1|Akun super admin<br>(dashboard web)|superadmin|password123|
|2|Akun admin/tenant<br>(dashboard web)|admin|password123|
|3|Akun staff kandang<br>untuk operasional<br>harian mobile apps|staff.kandang|password123|





<!-- Start of picture text -->
—— ALUR PENGGUNAAN SISTEM -——<br>AAPM - Sistem Manajemen Peternakan Ayam Petelur<br>~<br>ea) Login Masuk ke sistem dengan akun yang telah diberikan. |<br>¥ s<br>sa<br>Setup Master Data sebelum operasional.<br>| & Menyiapkan data masteryang diperlukan<br>_ oo aoe<br>~\<br>\e)< e Buat Lokasi Membuat data lokasi peternakan.<br>+ Pd<br>><br>vs 4) Buat Kandang Membuat data kandang pada setiap lokasi. |<br>v<br>~<br>5) Buat Strain Membuat data strain (jenis ayam).<br>GF 6) Input Target Produksi —Menentukan target produksi per kandang/siklus.<br>GI : = a = — =<br>v<br>Tambah Vendor Membuat data vendor/supplier.<br>Fy 7p) ;4<br>J<br>Tambah Inventory (pakan, obat, vitamin, vaksin, dll).<br>@| © Menambahkan data item saprodi Po<br>¥v<br>eee<br>=7 © Input Operasional,  Harian4 mutasiMelakukan populasi,input danproduksi, catatankonsumsi medis. pakan,<br>= ==. ay<br>rs, ae acne ~<br>Monitoring Dashboard stok, dan indikator lainnya.<br>€| 10) oe ike Memantau kinerja produksi, populasi,<br>v y<br>A @ Pembelian mM e nerimambuat pesanan barang dari pemb v ndor. e lian dan<br>oameainn ; v ai<br>-_—->— 12) Mutasi: Stok pM e ml ak aiuk an , muta tran s fer,i stok (penyesuaian,dll).<br>\ J) )<br>v<br>~<br>Vaksi ni Menjadwalkan dan mencatat<br>aksinasi pelaksanaan vaksinasi.<br>)<br>v<br>><br>FA @ Keuangan danMencatat memantau penjualan arus telur, kas. pengeluaran,<br><!-- End of picture text -->

## **4. Skenario Pengujian** 

# **Login** 

Pengujian modul Login. 

|Checklist|Catatan<br>|
|---|---|
|Berhasil<br>☐|**Terbukt berjalan**<br>|
|Perlu Perbaikan<br>☑|Ketga akun contoh berhasil masuk: superadmin,<br>admin, dan staf.kandang.<br>Halaman utama dan dashboard menolak akses tanpa<br>sesi dan mengalihkan ke halaman masuk.<br>Validasi kolom wajib pada aplikasi ponsel tampil jelas.<br>**Perlu perbaikan**<br>|
||Akun staf.kandang dapat masuk dashboard web,<br>melihat ringkasan keuangan, membuka dafar pesanan<br>pembelian, dan membuka form pembuatan pesanan.<br>Penyebabnya bukan pemasangan menu, melainkan<br>jumlah izin yang hanya delapan untuk seluruh sistem,<br>tanpa izin terpisah untuk pesanan pembelian.|
||Beberapa percobaan masuk pada ponsel menghasilkan<br>pesan kegagalan jaringan yang bersifat sesekali dan<br>pulih pada percobaan berikutnya. Akar penyebabnya<br>belum kami tetapkan.|



# **Master Data** 

Pengujian modul Master Data. 

|Checklist|Catatan<br>|
|---|---|
|Berhasil<br>☑|**Terbukt berjalan**|
|Perlu Perbaikan<br>☐|Tenant, lokasi, kandang, strain, grade telur, vendor,<br>item persediaan, dan pengguna dapat dibuat dan<br>dilihat, lengkap dengan form pembuatannya.<br>Penugasan petugas ke kandang berfungsi; kandang<br>muncul pada ponsel petugas setelah siklus aktf.<br>Kode QR per kandang tersedia beserta tautan langsung<br>ke form produksinya.<br>**Masukan**<br>Form lokasi hanya meminta satu kolom nama. Alamat,<br>penanggung jawab, dan tanggal berlaku belum ada.<br>Jenis item belum divalidasi. Dedak dan Jagung tercatat<br>berjenis "Lainnya", sehingga kartu pakan pada<br>dashboard menampilkan 0 kg meski stok bahan pakan<br>1.150 kg.<br>Ketga strain belum memiliki satu pun baris target<br>umur, sementara dashboard tetap menggambar garis<br>target HDP.<br>Setap item menyimpan satuannya sendiri (kg, karung,<br>gram, ml, liter). Belum ada satuan dasar dan faktor<br>konversi, sehingga bahan yang dibeli per karung dan<br>dipakaiper kilogram belum dapat dijumlahkan dengan|



aman. 

# **Inventory** 

Pengujian modul Inventory. 

|Checklist|Catatan|
|---|---|
|Berhasil<br>☑|**Terbukt berjalan**|
|Perlu Perbaikan<br>☐|Saldo per item dan per lokasi tampil benar dan dapat<br>direkonsiliasi.<br>Mutasi terbentuk otomats dari pemakaian pakan,<br>pengobatan, panen, dan penerimaan pembelian, tanpa<br>perlu dicatat dua kali.<br>Kartu stok tersedia pada halaman detail setap item,<br>berisi riwayat mutasi per tanggal.<br>Rekonsiliasi cocok: Dedak +150 kg, Jagung +1.000 kg,<br>dan Piala +100 −100 +50 −50 sehingga saldo akhir 0 kg,<br>sama dengan halaman inventori.<br>**Masukan**<br>Baris mutasi belum mencantumkan rujukan ke<br>dokumen sumbernya. Baris pembelian tdak menyebut<br>nomor pesanan, dan baris penyesuaian tdak menyebut<br>transaksi yang dikoreksi.<br>Kartu stok belum memiliki kolom saldo berjalan,<br>sehingga saldo pada satu tanggal harus dihitung<br>sendiri.<br>Ambang batas minimum belum terisi pada item yang<br>kami periksa, sehingga peringatan stok rendah belum<br>dapat bekerja.<br>**Belum diuji**<br>Larangan stok negatf tdak kami uji karena akan<br>mengubah data pada lingkungan pengembang.|



# **Purchase Order** 

Pengujian modul Purchase Order. 

|Checklist|Catatan<br>|
|---|---|
|Berhasil<br>☑|**Terbukt berjalan**<br>|
|Perlu Perbaikan<br>☐|Pesanan mult-item dapat dibuat dengan vendor,<br>tanggal, jumlah, dan harga satuan; subtotal dihitung<br>otomats.|
||Penerimaan mencatat jumlah dipesan, diterima, dan<br>sisa dengan benar.<br>Rekonsiliasi cocok tanpa selisih: Jagung Rp 6.000.000,<br>Dedak Rp 540.000, dan Piala Rp 1.800.000 berjumlah<br>Rp 8.340.000, sama persis dengan pengeluaran pada<br>halaman arus kas.|
||Stok bertambah sesuai jumlah diterima dan tercatat<br>pada buku mutasi sebagai pembelian.<br>**Masukan**<br>Penerimaan barang dan pengeluaran kas tergabung<br>menjadi satu kejadian,sehinggapembelian tempo|



belum terakomodasi. Kami catat sebagai pertanyaan cakupan, bukan sebagai cacat. Belum ada persetujuan pembelian sebagai gerbang sebelum pesanan berlaku. 

# **Input Harian** 

Pengujian modul Input Harian. 

|Checklist|Catatan|
|---|---|
|Berhasil<br>☐|**Terbukt berjalan**|
|Perlu Perbaikan<br>☑|Satu form memuat produksi telur, konsumsi pakan,<br>mutasi populasi, dan pengobatan sekaligus, dan dapat<br>diisi lebih dari satu kali per hari.<br>Riwayat menampilkan produksi, pakan, mutasi, nama<br>petugas, dan waktu pencatatan dengan lengkap.<br>Peringatan mutu telur muncul ketka telur retak dan<br>pecah melampaui lima persen.<br>Dampak pencatatan terlihat langsung pada stok dan<br>dashboard web.<br>**Perlu perbaikan**<br>Layar penyuntngan tersedia untuk produksi, pakan,<br>dan populasi. Nilai dapat diubah dengan kolom alasan<br>bertuliskan opsional, tanpa persetujuan, tanpa nomor<br>versi, dan tanpa rujukan ke catatan asal.<br>Aplikasi menyatakan data ofine siap, tetapi setelah<br>dihentkan dan dibuka kembali tanpa jaringan, aplikasi<br>berhent pada layar muat lebih dari dua belas detk lalu<br>kembali ke halaman masuk. Membuka kandang lewat<br>tautan QR tanpa jaringan juga ditolak dengan pesan<br>agar mengunduh data ofine dari halaman Profl.<br>**Masukan**<br>Telur retak dan telur pecah tercatat, tetapi belum<br>terlihat ke mana keduanya bermuara pada stok<br>maupun penjualan.<br>Pilihan mutasi "pindah" tersedia, tetapi kandang tujuan<br>tdak diminta, sehingga perpindahan belum tercatat<br>berpasangan.<br>**Belum diuji**<br>Keutuhan satu kali simpan. Bila sebagian bagian gagal<br>tersimpan, belum diketahui apakah seluruhnya<br>dibatalkan atau sebagian tetap tercatat.|



# **Dashboard** 

Pengujian modul Dashboard. 

|Checklist|Catatan<br>|
|---|---|
|Berhasil<br>☐|**Terbukt berjalan**|



|Perlu Perbaikan<br>☑|Enam indikator utama tampil: produksi telur, populasi<br>aktf, HDP, FCR, stok krits, dan pendapatan.<br>Peringatan mortalitas otomats berfungsi dan<br>menautkan langsung ke kandang bersangkutan.<br>Angka indikator konsisten dengan catatan di<br>bawahnya. Populasi L1 2.472 ditambah L2 2.495 sama<br>dengan 4.967 pada dashboard, dan selisih 33 ekor<br>cocok dengan mortalitas tercatat.<br>Rumus dapat direkonstruksi dan cocok di semua ttk:<br>HDP sebagai butr telur bagus dibagi populasi aktf<br>dikali seratus, dan FCR sebagai kilogram pakan dibagi<br>butr telur bagus.<br>**Perlu perbaikan**<br>Satuan FCR yang dihasilkan adalah kilogram per butr.<br>Angkanya konsisten, tetapi tdak dapat dibandingkan<br>dengan standar strain maupun angka FCR farm lain.<br>Mohon konfrmasi apakah satuan ini memang<br>disengaja.<br>Kartu pakan menampilkan 0 kg padahal terdapat 1.150<br>kg bahan pakan di gudang. Penyebabnya klasifkasi<br>jenis item, bukan kesalahan hitung.<br>Kartu populasi menampilkan teks "0% siklus aktf"<br>padahal dua siklus sedang berjalan. Penyebut yang<br>dipakai tdak dapat ditebak dari layar.<br>**Masukan**<br>Defnisi bisnis HDP dan FCR belum disahkan tertulis.<br>Diperlukan dokumen berisi sumber data, penyebut,<br>periode, dan pembulatan.<br>Belum terlihat laporan formal yang dapat diekspor<br>untuk pembanding antarperiode.|
|---|---|



# **Vaksinasi** 

Pengujian modul Vaksinasi. 

|Checklist|Catatan|
|---|---|
|Berhasil<br>☐|**Terbukt berjalan**|
|Perlu Perbaikan<br>☑|Menu vaksinasi tersedia pada web maupun ponsel,<br>dengan tab Jatuh tempo dan Semua.<br>Form penjadwalan berisi kandang, vaksin, dan tanggal.<br>**Perlu perbaikan**<br>Tidak terdapat satu pun item vaksin maupun jadwal<br>pada tenant uji, sehingga siklus dari penjadwalan<br>sampai pelaksanaan belum dapat kami amat sampai<br>selesai.|
||Keadaan kosong pada ponsel baru tampil sekitar tga<br>puluh detk pada emulator. Mohon diukur ulang pada<br>perangkat nyata; bila tetap selama itu, pengguna akan<br>mengira aplikasi berhent bekerja.<br>**Masukan**|
||Belum ada nomor batch, tanggal kedaluwarsa, dosis<br>per ekor, dan masa hent obat sebelum telur boleh<br>dijual.|
||Belum terlihat kasus kesehatan sebagai catatan<br>tersendiri dengan penanggung jawab dan hasil akhir.|



# **Keuangan** 

Pengujian modul Keuangan. 

|Checklist|Catatan|
|---|---|
|Berhasil<br>☑|**Terbukt berjalan**|
|Perlu Perbaikan<br>☐|Pemasukan dan pengeluaran tercatat dengan tanggal,<br>jenis, kategori, dan catatan, serta dapat disaring<br>berdasarkan rentang tanggal.<br>Pengeluaran dari penerimaan pembelian tercatat<br>otomats dan cocok persis dengan total pesanan.<br>Form penjualan langsung berfungsi: pelanggan,<br>gudang, grade opsional, jumlah butr, berat, dan harga<br>tersedia, dengan stok telur bagus keluar saat penjualan<br>dicatat.|
||**Masukan**|
||Selisih pemasukan dikurangi pengeluaran diberi label<br>"Laba/Rugi periode". Secara akuntansi yang dihitung<br>adalah arus kas, bukan laba rugi. Mohon digant<br>menjadi arus kas bersih atau surplus dan defsit kas.<br>Perbaikan kecil ini mencegah salah tafsir yang cukup<br>besar.|
||Data penjualan dan pelanggan pada tenant uji masih<br>kosong, sehingga alur penjualan belum dapat kami<br>amat sampai selesai.<br>Piutang, faktur, dan pembayaran bertahap belum ada.<br>Kami catat sebagai pertanyaan cakupan, bukan sebagai<br>cacat, karena berada pada lapisan administrasi<br>keuangan.|



## **5. Daftar Bug / Masukan** 

|No|Modul|Deskripsi|Harapan|Status|
|---|---|---|---|---|
|1|Input Harian|Catatan produksi,<br>pakan, dan populasi<br>dapat disuntng<br>nilainya. Kolom<br>alasan bertuliskan<br>opsional, tanpa<br>persetujuan, tanpa<br>nomor versi, dan<br>tanpa rujukan ke<br>catatan asal.|Koreksi berjalan<br>sebagai pembalikan<br>lalu pencatatan<br>ulang. Alasan wajib<br>diisi, pelaku<br>tersimpan, dan nilai<br>sebelum serta<br>sesudah dapat dilihat<br>kembali.|Bug – Prioritas 1|
|2|Input Harian|Profl menyatakan<br>data ofine siap,<br>tetapi buka ulang<br>tanpa jaringan<br>berhent di layar<br>muat lebih dari dua<br>belas detk lalu<br>kembali ke halaman<br>masuk.|Aplikasi dapat<br>menampilkan<br>kandang dan<br>menerima<br>pencatatan setelah<br>dibuka ulang tanpa<br>sinyal.|Bug – Prioritas 1|
|3|Input Harian|Tautan QR kandang|Tautan QR dapat|Bug – Prioritas 1|



||saat tanpa jaringan<br>menolak membuka<br>form dengan pesan<br>agar mengunduh<br>data ofine dari<br>Profl, bertentangan<br>dengan status siap<br>pada Profl.|membuka form<br>dalam kondisi tanpa<br>jaringan, atau status<br>pada Profl<br>menyesuaikan<br>kenyataannya.||
|---|---|---|---|
|4<br>Login|Akun staf.kandang<br>dapat masuk<br>dashboard web,<br>melihat ringkasan<br>keuangan, membuka<br>dafar pesanan<br>pembelian, dan<br>membuka form<br>pembuatan pesanan.|Izin dipecah per<br>tndakan: lihat<br>pesanan, buat<br>pesanan, terima<br>barang, sesuaikan<br>stok. Penegakannya<br>di sisi server, bukan<br>hanya<br>menyembunyikan<br>menu.|Bug – Prioritas 1|
|5<br>Input Harian|Keutuhan satu kali<br>simpan belum dapat<br>dipastkan. Bila<br>sebagian bagian form<br>gagal tersimpan,<br>belum diketahui<br>apakah seluruhnya<br>dibatalkan atau<br>sebagian tetap<br>tercatat.|Satu kali simpan<br>bersifat utuh: bila<br>ada bagian yang<br>gagal, seluruh<br>pengiriman<br>dibatalkan dan<br>pengguna diberi<br>tahu.|Bug – Prioritas 1|
|6<br>Login|Beberapa percobaan<br>masuk pada ponsel<br>menghasilkan pesan<br>kegagalan jaringan<br>yang bersifat sesekali<br>dan pulih pada<br>percobaan<br>berikutnya.|Akar penyebabnya<br>ditetapkan; bila<br>berasal dari batas<br>waktu, batasnya<br>dinaikkan dan<br>percobaan ulang<br>otomats<br>ditambahkan.|Bug – Prioritas 1|
|7<br>Master Data|Dedak dan Jagung<br>berjenis "Lainnya"<br>sehingga kartu pakan<br>pada dashboard<br>menampilkan 0 kg<br>meski stok bahan<br>pakan 1.150 kg.|Jenis item divalidasi<br>saat penyimpanan,<br>atau agregat<br>dashboard<br>menghitung seluruh<br>bahan pakan.|Bug – Prioritas 2|
|8<br>Dashboard|Satuan FCR yang<br>dihasilkan adalah<br>kilogram per butr,<br>sehingga angkanya<br>tdak dapat<br>dibandingkan dengan<br>standar strain<br>maupun farm lain.|Konfrmasi apakah<br>satuan ini disengaja.<br>Bila mengikut praktk<br>industri, FCR dihitung<br>terhadap massa<br>telur.|Bug – Prioritas 2|
|9<br>Dashboard|Kartu populasi<br>menampilkan "0%<br>siklus aktf" padahal<br>dua siklus sedang<br>berjalan.|Penyebut dan<br>pembilang indikator<br>ini dijelaskan, atau<br>tampilannya<br>diperbaiki agar sesuai<br>keadaan.|Bug – Prioritas 2|
|10<br>Dashboard|Ketga strain belum<br>memiliki baris target<br>umur, tetapi<br>dashboard tetap|Nilai belum diisi<br>dibedakan dari nilai<br>nol; garis target<br>dinyatakan tdak|Bug – Prioritas 2|



|||menggambar garis<br>target HDP.|tersedia bila memang<br>kosong.||
|---|---|---|---|---|
|11|Keuangan|<br>Selisih pemasukan<br>dikurangi<br>pengeluaran diberi<br>label "Laba/Rugi<br>periode", padahal<br>yang dihitung adalah<br>arus kas.|Label digant menjadi<br>arus kas bersih, atau<br>surplus dan defsit<br>kas.|Bug – Prioritas 2|
|12|Inventory|Baris mutasi tdak<br>mencantumkan<br>rujukan ke dokumen<br>sumbernya, dan<br>penyesuaian tdak<br>dapat dibedakan dari<br>koreksi transaksi.|Setap baris mutasi<br>mencantumkan<br>dokumen asal yang<br>dapat dibuka,<br>beserta pelaku dan<br>alasannya.|Bug – Prioritas 2|
|13|Master Data|Setap item<br>menyimpan<br>satuannya sendiri<br>tanpa satuan dasar<br>dan faktor konversi.|Tersedia satuan<br>dasar per item<br>beserta faktor<br>konversinya, dan<br>seluruh mutasi<br>tersimpan dalam<br>satuan dasar.|Bug – Prioritas 2|
|14|Input Harian|Telur retak dan telur<br>pecah tercatat, tetapi<br>belum terlihat ke<br>mana keduanya<br>bermuara pada stok<br>maupun penjualan.|Telur retak dan<br>pecah masuk ke<br>grade tersendiri<br>sehingga dapat dijual<br>atau disusutkan<br>dengan jelas.|Bug – Prioritas 2|
|15|Inventory|Kartu stok belum<br>memiliki kolom saldo<br>berjalan per baris.|Ditambahkan kolom<br>saldo berjalan agar<br>saldo pada satu<br>tanggal dapat dibaca<br>langsung.|Masukan – Prioritas 3|
|16|Vaksinasi|Keadaan kosong<br>pada ponsel baru<br>tampil sekitar tga<br>puluh detk pada<br>emulator.|Diukur ulang pada<br>perangkat nyata; bila<br>tetap lama,<br>ditambahkan<br>penanda kemajuan<br>atau batas waktu.|Masukan – Prioritas 3|
|17|Umum|Pohon aksesibilitas<br>mencatat empat<br>puluh lima kotak<br>pilihan tanpa nama<br>yang dapat dibaca<br>perangkat bantu,<br>tersebar pada<br>seluruh enam belas<br>halaman.|Setap kotak pilihan<br>diberi nama. Pola ini<br>tampak berasal dari<br>satu komponen<br>berulang, sehingga<br>satu perbaikan<br>kemungkinan<br>menutup seluruhnya.|Masukan – Prioritas 3|
|18|Umum|Pencarian baru<br>berjalan setelah<br>menekan Enter,<br>tanpa tombol atau<br>penanda yang<br>menjelaskan hal<br>tersebut.|Ditambahkan tombol<br>cari, atau pencarian<br>berjalan otomats<br>dengan jeda singkat.|Masukan – Prioritas 3|
|19|Umum|Catatan log Android<br>mencatat lompatan<br>155, 42, dan 81<br>frame saat aplikasi<br>mulai.|Pekerjaan berat<br>dipindahkan dari alur<br>utama agar aplikasi<br>tetap lancar pada<br>perangkat kelas|Masukan – Prioritas 3|



|20|Master Data|Form lokasi hanya<br>meminta satu kolom<br>nama; alamat,<br>penanggung jawab,<br>dan tanggal berlaku<br>belum ada.|bawah.<br>Ditambahkan alamat,<br>penanggung jawab,<br>dan tanggal berlaku<br>agar lokasi dapat<br>dipakai sebagai<br>rujukan dokumen.|Masukan – Prioritas 3|
|---|---|---|---|---|
|21|Inventory|Ambang batas<br>minimum belum<br>terisi pada item yang<br>diperiksa, sehingga<br>peringatan stok<br>rendah belum dapat<br>bekerja.|Ambang batas diisi<br>per item, dan<br>peringatan stok<br>rendah diuji sekali<br>dengan data nyata.|Masukan – Prioritas 3|
|22|Vaksinasi|Belum ada nomor<br>batch, tanggal<br>kedaluwarsa, dosis<br>per ekor, dan masa<br>hent obat sebelum<br>telur boleh dijual.|Keempat data<br>tersebut dicatat pada<br>setap pelaksanaan<br>vaksinasi dan<br>pengobatan.|Masukan – Prioritas 3|
|23|Master Data|Kebutuhan<br>pelanggan: satu item<br>pakan dibeli per<br>karung dan dipakai<br>per kilogram. Saat ini<br>kedua satuan tdak<br>dapat dijumlahkan<br>dengan aman.|Setap item memiliki<br>satuan dasar, satuan<br>beli, dan faktor<br>konversi. Seluruh<br>mutasi disimpan<br>dalam satuan dasar;<br>satuan lain hanya<br>tampilan.|Kebutuhan<br>operasional|
|24|Purchase Order|Kebutuhan<br>pelanggan: sebagian<br>pembelian pakan dan<br>obat dilakukan<br>secara tempo,<br>dibayar sebagian di<br>muka lalu dilunasi<br>kemudian.|Penerimaan barang<br>dipisahkan dari<br>pembayaran. Faktur<br>pemasok terbentuk<br>saat barang diterima,<br>dan pembayaran<br>dapat dicatat lebih<br>dari satu kali<br>terhadap faktur yang<br>sama.|Kebutuhan<br>operasional|
|25|Keuangan|Kebutuhan<br>pelanggan: penjualan<br>telur ke pelanggan<br>tetap umumnya tdak<br>dibayar tunai di<br>tempat.|Penjualan<br>menghasilkan surat<br>jalan dan faktur;<br>piutang terbentuk<br>otomats dan<br>berkurang saat<br>pembayaran dicatat,<br>dengan umur piutang<br>yang dapat dilihat<br>per pelanggan.|Kebutuhan<br>operasional|
|26|Master Data|Kebutuhan<br>pelanggan: sebagian<br>farm meramu pakan<br>sendiri dari beberapa<br>bahan, bukan<br>membeli pakan jadi.|Tersedia formula<br>pakan berisi dafar<br>bahan dan takaran.<br>Saat produksi pakan<br>dicatat, bahan<br>berkurang dan pakan<br>jadi bertambah<br>dalam satu kejadian.|Kebutuhan<br>operasional|
|27|Inventory|Kebutuhan<br>pelanggan:<br>pemindahan stok<br>antargudang perlu<br>tercatat berpasangan|<br>Satu transaksi<br>pemindahan<br>mengurangi gudang<br>asal dan menambah<br>gudangtujuan|Kebutuhan<br>operasional|



|||agar saldo kedua sisi<br>tetap benar.|sekaligus, dan tdak<br>dapat tersimpan<br>sebagian.||
|---|---|---|---|---|
|28|Input Harian|Kebutuhan<br>pelanggan: petugas<br>kandang sering<br>bekerja di area tanpa<br>sinyal dan baru<br>terhubung setelah<br>kembali ke kantor.|Aplikasi dapat dibuka<br>dan menerima<br>pencatatan tanpa<br>jaringan, menyimpan<br>antrean, lalu<br>mengirimkannya<br>sekali saja saat sinyal<br>kembali, dengan<br>penanganan bentrok<br>yang jelas.|Kebutuhan<br>operasional|
|29|Dashboard|Kebutuhan<br>pelanggan: laporan<br>periodik perlu<br>dicetak dan<br>dibandingkan<br>antarbulan untuk<br>rapat internal.|Tersedia laporan<br>produksi, pemakaian<br>pakan, dan mutasi<br>stok yang dapat<br>disaring per periode<br>dan diekspor ke<br>berkas.|Kebutuhan<br>operasional|
|30|Umum|Kebutuhan<br>pelanggan: setap<br>perubahan atas data<br>yang sudah<br>tersimpan harus<br>dapat<br>dipertanggungjawabk<br>an saat pemeriksaan.|Tersedia jejak<br>perubahan berisi<br>pelaku, waktu,<br>alasan, serta nilai<br>sebelum dan<br>sesudah, yang dapat<br>ditelusuri dari<br>dokumen<br>bersangkutan.|Kebutuhan<br>operasional|



## **6. Kesimpulan Pengujian** 

Tuliskan hasil akhir pengujian dan saran perbaikan. 

### **Hasil akhir pengujian** 

Sistem Manajemen Peternakan Ayam Petelur versi Beta Testing v0.1 sudah berfungsi sebagai aplikasi pencatatan operasional kandang. Alur dari mendaftarkan lokasi dan kandang, mengaktifkan siklus, mencatat kegiatan harian lewat ponsel, sampai melihat hasilnya pada dashboard web benar-benar tersambung. Untuk aplikasi pada tahap ini, itu bukan pencapaian kecil. 

Yang paling menguatkan penilaian tersebut adalah ketepatan angkanya. Tiga rekonsiliasi kami hitung ulang secara manual dan cocok tanpa selisih: populasi ternak 4.967 ekor, total pesanan pembelian Rp 8.340.000 terhadap pengeluaran kas, dan saldo pakan Piala 0 kg. Angka pada dashboard bukan angka lepas, melainkan hasil penjumlahan dari catatan di bawahnya. 

Empat dari delapan modul kami nyatakan Berhasil: Master Data, Inventory, Purchase Order, dan Keuangan. Empat modul lainnya Perlu Perbaikan: Login pada pemisahan kewenangan, Input Harian pada tata kelola penyuntingan dan pemakaian tanpa jaringan, Dashboard pada tiga tampilan yang mudah salah dibaca, serta Vaksinasi yang belum dapat diuji sampai selesai karena data masih kosong. 

Tidak ditemukan kegagalan total maupun kehilangan data selama pengujian. Seluruh temuan menyentuh tiga hal: keandalan ketika jaringan hilang, kewenangan atas data yang sudah tersimpan, dan ketertelusuran perubahan. Ketiganya bukan pekerjaan menambah fitur, melainkan menyepakati aturan lalu menegakkannya di sisi server. 

### **Saran perbaikan menurut urutan** 

1.  Tutup nomor 1 sampai 6 pada Daftar Bug lebih dahulu. Keenamnya menyentuh keandalan dan kewenangan; selama masih terbuka, data yang tercatat belum dapat dipertanggungjawabkan penuh. 

2.  Selesaikan nomor 7 sampai 14. Perbaikannya kecil, tetapi pengaruhnya terhadap kepercayaan pada dashboard cukup besar. 

3.  Kerjakan nomor 15 sampai 22 secara bertahap; sifatnya penyempurnaan dan tidak menghalangi uji coba terbatas. 

4.  Sahkan definisi bisnis HDP dan FCR secara tertulis, berisi sumber data, penyebut, periode, dan pembulatan, sebelum angka keduanya dipakai untuk mengambil keputusan. 

5.  Isi data vaksin dan penjualan pada lingkungan uji agar kedua alur dapat diamati sampai selesai. 

### **Arahan kebutuhan operasional pelanggan** 

Nomor 23 sampai 30 pada Daftar Bug bukan cacat, melainkan kebutuhan operasional yang belum terakomodasi. Kami cantumkan karena dokumen ini meminta pengguna mencatat penyesuaian kebutuhan operasional, dan karena delapan hal tersebut menentukan sejauh mana aplikasi dapat dipakai di luar pola paling sederhana. 

Kebutuhan tersebut terbagi menjadi tiga kelompok. Pertama, satuan dan formula pakan: satuan dasar beserta faktor konversi, dan formula pakan bagi farm yang meramu sendiri. Kedua, transaksi bertempo: faktur dan pembayaran yang terpisah dari penerimaan barang pada sisi pembelian, serta surat jalan, faktur, dan piutang pada sisi penjualan. Ketiga, keandalan lapangan dan pertanggungjawaban: pemakaian tanpa jaringan yang benar-benar dapat diandalkan, pemindahan stok antargudang yang berpasangan, laporan periodik yang dapat diekspor, dan jejak perubahan yang dapat ditelusuri. 

Kami menyadari sebagian di antaranya mungkin berada di luar sasaran produk pada tahap ini. Karena itu kami tidak menghitungnya sebagai kegagalan pengujian, melainkan sebagai bahan pembicaraan mengenai batas cakupan. Bila sebagian disepakati masuk peta jalan, urutan yang kami sarankan adalah satuan dasar lebih dahulu, kemudian pemakaian tanpa jaringan, lalu transaksi bertempo, karena dua yang pertama menjadi fondasi bagi yang ketiga. 

### **Catatan cakupan pengujian** 

Pengujian dijalankan pada 30 sampai 31 Juli 2026 terhadap dashboard web Layered Farm Agung dan AAPM Mobile Demo v1.0.0, memakai ketiga akun yang disediakan pada bagian Informasi Akses. Seluruh catatan di atas memiliki bukti tangkapan layar dan berkas log yang tersimpan, terverifikasi sidik jari SHA-256, dan dapat diserahkan bila diperlukan. Tidak ada data yang kami hapus dan tidak ada konfigurasi aplikasi yang kami ubah selama pengujian. 

## **7. Persetujuan** 

Nama : Fahzi Putra Jannafi — System Analyst, PT Agung Abadi Putra Mandiri Tanggal: 31 Juli 2026 

