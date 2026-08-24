# ¢ AAPM 







@ 



<!-- Start of picture text -->
@<br><!-- End of picture text -->

————SSS 



<!-- Start of picture text -->
CAKUPAN APLIKASI TERHADAP LAPISAN OPERASIONAL AAPM<br>Lapisan operasional lapangan TERCAKUP BAIK<br>Kandang, siklus, populasi, produksi telur, pakan, pengobatan,<br>vaksinasi, riwayat harian, dan stok dasar<br>Lapisan transaksi sederhana TERCAKUP UNTUK POLA TUNAI<br>Pesanan pembelian, penerimaan barang, penjualan langsung,<br>mutasi stok, dan catatan kas<br>Lapisan administrasi dan keuangan DI LUAR CAKUPAN PRODUK<br>Utang-piutang, jurnal, bagan akun, tutup buku, upah pekerja,<br>transaksi antarunit, dan perencanaan pengadaan<br><!-- End of picture text -->

Ringkasan Manajemen — Aplikasi Operasional Kandang Pihak Ketiga · Revisi 2 

PT Agung Abadi Putra Mandiri 

### **1.2  Yang sudah berjalan dan yang belum** 

|**Hal**|**Status**|**Dasar penilaian**|
|---|---|---|
|**Pencatatan harian dari**<br>**ponsel**|**BERJALAN**|Satu form memuat telur, pakan, populasi, dan pengobatan<br>sekaligus, lengkap dengan nama pencatat dan waktunya.|
|**Ketepatan angka antarlayar**|**BERJALAN**|Populasi, pembelian terhadap kas, dan saldo pakan dihitung ulang<br>secara manual dan cocok tanpa selisih.|
|**Stok dan pembelian dasar**|**BERJALAN**|Pemakaian, panen, dan penerimaan barang membentuk mutasi<br>stok otomats tanpa perlu dicatat dua kali.|
|**Pemantauan dan peringatan**|**BERJALAN**|Dashboard menampilkan indikator harian dan memberi peringatan<br>mortalitas dengan tautan ke kandang.|
|**Riwayat dan pelacakan**<br>**pencatat**|**BERJALAN**|Setap baris riwayat mencantumkan siapa mencatat dan pukul<br>berapa, untuk kedua kandang uji.|
|**Pemakaian saat jaringan**<br>**hilang**|**PERLU**<br>**PERBAIKAN**|Aplikasi menyatakan data ofine siap, tetapi menolak membuka<br>form setelah dibuka ulang tanpa sinyal.|
|**Kewenangan atas data**<br>**tersimpan**|**PERLU**<br>**PERBAIKAN**|Catatan harian dapat disuntng nilainya; kolom alasan hanya<br>opsional, tanpa persetujuan maupun versi.|
|**Pemisahan hak akses**|**PERLU**<br>**PERBAIKAN**|Petugas kandang dapat membuka dashboard keuangan dan form<br>pesanan pembelian.|
|**Defnisi indikator**|**PERLU**<br>**DISEPAKATI**|Rumus HDP dan FCR konsisten di semua layar, tetapi belum<br>disahkan sebagai defnisi tertulis bersama.|
|**Satuan dan konversinya**|**PERLU**<br>**DISEPAKATI**|Setap item menyimpan satuannya sendiri; belum ada satuan dasar<br>dan faktor konversi karung ke kilogram.|
|**Pencampuran pakan**|**BELUM**<br>**TERSEDIA**|Relevan bagi operasional AAPM maupun farm sejenis, tetapi<br>formula dan hasil jadi belum ditemukan.|
|**Utang-piutang, jurnal, dan**|**DI LUAR**|Berada pada lapisan administrasi dan keuangan, yang bukan|
|**upah**|**CAKUPAN**|sasaran aplikasi ini.|



### **1.3  Enam hal yang perlu diperbaiki** 

Enam temuan berikut berada di dalam lapisan yang memang dibangun pengembang. Semuanya menyentuh keandalan, kewenangan, dan ketertelusuran — bukan kelengkapan fitur. Tidak satu pun berupa kegagalan total atau kehilangan data. 

|**No**|**Temuan**|**Kriteria dinyatakan selesai**|
|---|---|---|
|**1**|Catatan harian dapat disuntng tanpa<br>alasan wajib, persetujuan, versi, atau<br>rujukan ke catatan asal|Koreksi berjalan sebagai pembalikan dan pencatatan ulang; alasan<br>wajib diisi, pelaku tersimpan, dan nilai sebelum serta sesudah dapat<br>dilihat kembali|
||Buka ulang aplikasi tanpa jaringan tdak|Aplikasi dapat menampilkan kandang dan menerima pencatatan|
|**2**|dapat memakai cache yang dinyatakan<br>siap|setelah dibuka ulang tanpa sinyal, termasuk lewat tautan QR di<br>pintu kandang|



AAPM/SA/EVAL-3P-R/2026-07-31-R2  ·  Internal 

Halaman 3 dari 15 







<!-- Start of picture text -->
10:21 9 5G wii!<br>< Edit konsumsi pakan<br>L2<br>Edit konsumsi pakan — Piala. Jenis pakan tidak dapat diubah<br>Jumlah dipakai (kg)<br>50<br>Catatan — opsional<br>Simpan perubahan<br><!-- End of picture text -->



<!-- Start of picture text -->
10:50 9 az<br>< Input harian<br>Tidak ada koneksi. Unduh data offline dari Profil saat terhubung ke server.<br>Coba lagi<br><!-- End of picture text -->





<!-- Start of picture text -->
fest es Oo F0d59450-def9-43¢2-9199-a2b474c2a7e3 Padang Kalumpang FAR © ‘Super Admin]<br>88 Dashboard<br>te SEE)<br>; ailatam Dedak  Lainnya + Penyesuaian stok<br>© Inventor ps<br>Lokas! 30 Jul 2026 Masuk —Pembelian<br><!-- End of picture text -->



<!-- Start of picture text -->
@ Utama Poultry Oo Keuangan @ Tenant Utam<br>98 Dashboard Keuangan<br>@ Veksines| Aruskas | Ponjualan —_—Polanggan<br>lepton<br>Re tte Rp 700.000 Rp 4.680.000 -Rp 3.980.004<br>© Lokas!<br><!-- End of picture text -->

Ringkasan Manajemen — Aplikasi Operasional Kandang Pihak Ketiga · Revisi 2 

PT Agung Abadi Putra Mandiri 

Ketiganya dapat diperbaiki dengan usaha kecil: memvalidasi jenis item, membedakan nilai nol dari nilai yang belum diisi, dan mengganti satu label. Dampaknya terhadap kepercayaan pada dashboard jauh lebih besar daripada besarnya pekerjaan. 

### **1.6  Posisi yang disarankan untuk AAPM** 

|**Pertanyaan**|**Jawaban**|**Alasan**|
|---|---|---|
|**Dapat menjadi kanal pencatatan**<br>**lapangan?**|**DAPAT, BERSYARAT**|Nilai tambahnya nyata dan menjawab kebutuhan yang<br>belum terjawab. Syaratnya enam temuan mutu tuntas<br>dan batas kewenangan disepakat.|
|**Dapat menjadi pemegang catatan**<br>**resmi?**|**BELUM**|Keutuhan penyimpanan, otorisasi sisi server, dan jejak<br>koreksi belum terbukt.|
|**Dapat menggantkan sistem yang**<br>**berjalan?**|**DI LUAR SASARAN**|Lapisan administrasi dan keuangan memang bukan<br>yang dibangun aplikasi ini.|
|**Dapat dipakai uji coba terbatas?**|**SETELAH ENAM HAL**<br>**TUNTAS**|Terutama pemakaian tanpa jaringan, kewenangan<br>peran, dan kesepakatan satuan.|



#### **Bila dipilih sebagai kanal pencatatan lapangan** 

Pembagian kewenangan perlu ditetapkan tertulis sebelum satu baris data pun mengalir: aplikasi mencatat kejadian di kandang, sistem AAPM tetap memegang catatan resmi. 

Diperlukan pemetaan identitas antara kandang, item, dan petugas di kedua sisi, beserta aturan apa yang terjadi bila data ditolak setelah tercatat di aplikasi. 



**RINGKASAN 2** 

## **Cakupan terhadap Dua Puluh Empat Proses AAPM** 

Operasional AAPM sudah terdokumentasi menjadi dua puluh empat proses. Bagian ini menempatkan aplikasi terhadap keduapuluhempat proses tersebut, satu paragraf per proses, dengan pola yang sama: apa yang sudah, apa yang belum, dan apa artinya bagi pemakaian. 

Nama, nomor, urutan, dan status setiap proses sama persis dengan matriks pada Dokumen 2. Tidak ada proses baru yang ditambahkan dan tidak ada status yang diubah. Temuan di luar keduapuluhempat proses dicatat terpisah pada bagian 2.5 sebagai temuan lintas-proses, dan tidak dihitung sebagai proses tambahan. 

AAPM/SA/EVAL-3P-R/2026-07-31-R2  ·  Internal 

Halaman 6 dari 15 



<!-- Start of picture text -->
DUA PULUH EMPAT PROSES OPERASIONAL AAPM SEBAGAI ACUAN<br><!-- End of picture text -->

Tercakup sebagian Di luar cakupan Belum tersedia ada dan berjalan, administrasi dan keuangan, relevan operasional, kedalamannya berbeda bukan sasaran aplikasi tetapi belum ada 



<!-- Start of picture text -->
Sebelas proses berada pada lapisan administrasi dan Keuangan yang memang bukan sasaran aplikasi ini. Yang perlu dibicarakan adalah tiga proses yang relevan bagi operasional tetapi belum tersedia.<br><!-- End of picture text -->



Ringkasan Manajemen — Aplikasi Operasional Kandang Pihak Ketiga · Revisi 2 

PT Agung Abadi Putra Mandiri 

##### **04.  Layer Transaction** 

###### **TERCAKUP SEBAGIAN** 

Yang sudah: mutasi populasi dicatat per kandang dengan jenis mati, afkir, masuk, atau pindah, dan populasi berjalan berubah otomatis serta terbukti cocok dengan dashboard yaitu 2.500 ditambah 2.500 dikurangi 33 sama dengan 4.967 ekor. Yang belum: pilihan mutasi jenis pindah tidak meminta kandang tujuan sehingga perpindahan belum berpasangan, sebab kematian belum dapat dikelompokkan, dan afkir belum terhubung ke penjualan ayam afkir. Dengan demikian, perubahan jumlah populasi dapat dipercaya, tetapi perpindahan antarkandang akan menimbulkan selisih yang tidak dapat dijelaskan. 

##### **05.  Production Unit & Egg** 

###### **TERCAKUP SEBAGIAN** 

Yang sudah: produksi telur dicatat per kandang dengan pemisahan telur bagus, retak, dan pecah, disertai peringatan ketika retak dan pecah melampaui lima persen, dan angkanya konsisten sampai ke dashboard. Yang belum: telur belum tercatat sebagai item persediaan dengan gudang tujuan, belum ada rekonsiliasi antara produksi tercatat dengan stok dan telur terjual, dan belum ada verifikasi produksi sebelum angka dianggap final. Dengan demikian, pencatatan produksinya kuat sebagai catatan lapangan, tetapi belum dapat dipakai untuk menghitung nilai persediaan telur. 

##### **06.  Purchase Delivery & Invoice** 

###### **TERCAKUP SEBAGIAN** 

Yang sudah: pesanan pembelian multi-item dengan jumlah, harga satuan, dan subtotal otomatis; penerimaan mencatat jumlah dipesan, diterima, dan sisa; stok bertambah dan kas keluar tercatat; dan totalnya cocok persis Rp 8.340.000 dengan pengeluaran pada arus kas. Yang belum: penerimaan barang dan pengeluaran kas tergabung menjadi satu kejadian sehingga faktur pemasok, utang usaha, verifikasi faktur, dan pembayaran tidak terpisah; belum ada retur pembelian; dan pesanan tidak terkunci setelah penerimaan dibuat. Dengan demikian, aplikasi melayani pembelian tunai dengan rapi, tetapi pembelian tempo belum dapat dijalankan karena utang tidak pernah terbentuk. 

##### **07.  Egg / Feed Sales Invoice** 

###### **TERCAKUP SEBAGIAN** 

Yang sudah: penjualan langsung mencatat pelanggan, gudang, grade opsional, jumlah butir, berat kilogram opsional, dan harga; stok telur bagus keluar pada saat penjualan dicatat; dan status Delivered serta Lunas tersedia pada daftar. Yang belum: faktur sebagai dokumen tersendiri, piutang usaha, pembayaran bertahap, dan retur penjualan; seluruh tahap terjadi sekaligus dan langsung final. Dengan demikian, penjualan tunai tercatat benar sampai ke stok dan kas, tetapi penjualan tempo tidak dapat dilayani karena piutang tidak pernah terbentuk. 

##### **08.  Sales Delivery** 

###### **TERCAKUP SEBAGIAN** 

Yang sudah: stok telur bagus keluar pada saat penjualan dicatat, dan pengurangannya terlihat pada buku mutasi dengan jenis penjualan. Yang belum: dokumen pengiriman yang terpisah dari penjualan, penguncian dokumen hulu setelah pengiriman dibuat, dan penanganan penjualan lansiran yang mengirim ke banyak pelanggan kecil dalam satu hari. Dengan demikian, dampak stoknya benar, tetapi tidak ada dokumen yang dapat dibawa pengantar maupun ditandatangani penerima. 

##### **09.  Inventory Journal** 

###### **TERCAKUP SEBAGIAN** 

Yang sudah: seluruh perubahan stok muncul pada satu buku mutasi dengan jenis pembelian, konsumsi pakan, penyesuaian, panen, dan penjualan; mutasi terbentuk otomatis dari pemakaian, pengobatan, panen, dan penerimaan tanpa perlu dicatat dua kali; dan saldo per item maupun per lokasi dapat direkonsiliasi tanpa selisih. Yang belum: rujukan ke dokumen sumber pada setiap baris, satuan dasar sehingga mutasi lintas satuan aman dijumlahkan, larangan stok negatif yang terbukti, dan penguncian baris pada periode tertutup. Dengan demikian, jalur pencatatannya sudah tunggal, tetapi sebuah baris mutasi belum dapat ditelusuri kembali ke dokumen yang menyebabkannya. 

AAPM/SA/EVAL-3P-R/2026-07-31-R2  ·  Internal 

Halaman 8 dari 15 

Ringkasan Manajemen — Aplikasi Operasional Kandang Pihak Ketiga · Revisi 2 

PT Agung Abadi Putra Mandiri 

##### **10.  Receipt / Opname / Mutation** 

###### **TERCAKUP SEBAGIAN** 

Yang sudah: penerimaan barang dari pesanan pembelian berfungsi, kartu stok tersedia pada halaman detail setiap item berisi riwayat mutasi per tanggal, dan tombol penyesuaian stok tersedia. Yang belum: kolom saldo berjalan pada kartu stok, stock opname sebagai proses pencacahan tersendiri beserta berita acaranya, pembedaan antara penyesuaian hasil pencacahan dan koreksi atas transaksi, serta persetujuan sebelum penyesuaian berlaku. Dengan demikian, saldo pada satu tanggal harus dihitung sendiri, dan selisih stok tidak dapat dibedakan antara temuan fisik dan koreksi pencatatan. 

### **2.3  Proses di luar cakupan produk** 

Sebelas proses berikut berada pada lapisan administrasi dan keuangan. Ketidakhadirannya bukan kekurangan mutu, melainkan garis batas produk yang memang tidak diklaim pengembang. Uraiannya tetap dicantumkan agar terlihat apa yang hilang bila aplikasi dipakai sendirian. 

##### **11.  Cash Verification** 

**DI LUAR CAKUPAN** 

Yang sudah: catatan kas tersedia, dapat disaring per periode, dan terbukti cocok dengan nilai pembelian. Yang belum: verifikasi kas sebagai gate terpisah, keadaan draf sebelum final, tiga keadaan baris kas yaitu belum tersimpan lalu tersimpan lalu terhubung ke dokumen lain sehingga tidak dapat dihapus, serta pemeriksa kedua sebelum jurnal dianggap final. Dengan demikian, proses ini dinyatakan di luar cakupan karena verifikasi kas adalah kendali keuangan yang dijalankan bagian akuntansi, bukan bagian dari pencatatan operasional kandang, dan pengembang memang tidak mengklaimnya. 

##### **12.  General Journal** 

**DI LUAR CAKUPAN** 

Yang sudah: pemasukan dan pengeluaran kas tercatat dengan tanggal, kategori, dan catatan. Yang belum: jurnal berpasangan debit dan kredit, aturan bahwa jurnal hanya boleh diverifikasi bila total debit sama dengan total kredit, serta penjagaan aturan tersebut sampai lapis basis data. Dengan demikian, proses ini dinyatakan di luar cakupan karena akuntansi berpasangan bukan sasaran aplikasi pencatatan kandang; akibatnya laporan keuangan tetap harus disusun di luar aplikasi. 

##### **13.  Standard Account / COA** 

**DI LUAR CAKUPAN** 

Yang sudah: form pengeluaran menyediakan kolom kategori yang dapat diisi bebas. Yang belum: bagan akun, pemetaan setiap transaksi ke akunnya, dan penyusunan laporan keuangan dari transaksi yang sama tanpa pencatatan ulang. Dengan demikian, proses ini dinyatakan di luar cakupan karena penyusunan bagan akun adalah pekerjaan akuntansi; kategori bebas cukup untuk mengelompokkan kas sederhana, tetapi tidak untuk pelaporan keuangan. 

##### **14.  Deposit Settlement** 

**DI LUAR CAKUPAN** 

Yang sudah: tidak ditemukan padanan proses ini pada aplikasi. Yang belum: penyelesaian titipan barang atau uang muka pelanggan menjadi penerimaan persediaan dan faktur pembelian, beserta persetujuan dan pembatalannya. Dengan demikian, proses ini dinyatakan di luar cakupan karena merupakan administrasi penjualan dan pembelian; farm yang tidak menerima titipan barang tidak akan merasakan ketiadaannya. 

##### **15.  Drying Batch** 

**DI LUAR CAKUPAN** 

Yang sudah: tidak ditemukan padanan proses ini pada aplikasi. Yang belum: pengeringan jagung berbasis batch beserta perhitungan susutnya. Dengan demikian, proses ini dinyatakan di luar cakupan karena merupakan proses khusus AAPM yang muncul karena perusahaan menangani bahan baku sendiri, dan tidak lazim tersedia pada aplikasi pencatatan kandang. 

AAPM/SA/EVAL-3P-R/2026-07-31-R2  ·  Internal 

Halaman 9 dari 15 

Ringkasan Manajemen — Aplikasi Operasional Kandang Pihak Ketiga · Revisi 2 

PT Agung Abadi Putra Mandiri 

##### **16.  Employee Loans** 

###### **DI LUAR CAKUPAN** 

Yang sudah: tidak ditemukan modul kepegawaian pada aplikasi. Yang belum: pinjaman pegawai beserta jadwal angsuran yang dapat dipratinjau, dan angsuran yang masuk otomatis sebagai potongan upah pada periode berjalan. Dengan demikian, proses ini dinyatakan di luar cakupan karena termasuk urusan kepegawaian; pengelolaan pinjaman pekerja tetap berjalan di luar aplikasi. 

##### **17.  Payroll** 

###### **DI LUAR CAKUPAN** 

Yang sudah: tidak ditemukan data pekerja, komponen upah, maupun cetak slip pada aplikasi; kata upah juga tidak muncul pada panduan penggunaan yang diperiksa. Yang belum: penyusunan komponen upah dan potongan per periode serta penerbitan hasil perhitungannya. Dengan demikian, proses ini dinyatakan di luar cakupan. Meski begitu, perhitungan upah anak kandang adalah salah satu pekerjaan manual yang paling sering dikeluhkan pemilik farm, sehingga layak diusulkan sebagai penambahan dan bukan dinilai sebagai kekurangan. 

##### **18.  Egg Delivery Intercompany** 

**DI LUAR CAKUPAN** 

Yang sudah: aplikasi memiliki konsep tenant dan pemilih tenant aktif di bagian atas layar. Yang belum: permintaan telur, pengiriman, penerimaan barang, dan faktur di kedua sisi sebagai rangkaian berpasangan, serta penguncian dokumen hulu begitu dokumen lanjutannya dibuat. Dengan demikian, proses ini dinyatakan di luar cakupan karena kebutuhan tersebut muncul dari struktur badan usaha AAPM dan jarang berlaku pada satu farm; namun isolasi data antartenant tetap perlu diuji tersendiri. 

##### **20.  Purchase Invoice Verification** 

**DI LUAR CAKUPAN** 

Yang sudah: tidak ditemukan faktur pemasok pada aplikasi, sehingga verifikasinya pun tidak ada. Yang belum: pemeriksaan faktur pembelian sebagai gate tersendiri sebelum utang diakui final. Dengan demikian, proses ini dinyatakan di luar cakupan dan berkaitan langsung dengan nomor 06; selama pembelian dianggap tunai, gate ini memang tidak diperlukan. 

##### **21.  Sales Request** 

###### **DI LUAR CAKUPAN** 

Yang sudah: penjualan dapat langsung dicatat dengan pelanggan, jumlah, dan harga. Yang belum: permintaan penjualan sebagai dokumen pendahulu dengan enam tahap yaitu baru, disetujui, dalam pengiriman, menunggu pembayaran tunai, menunggu pembayaran nontunai, lalu tutup; persetujuan sebagai syarat sebelum pengiriman; dan penguncian permintaan begitu pengiriman dibuat. Dengan demikian, proses ini dinyatakan di luar cakupan karena rangkaian tersebut melayani penjualan tempo; untuk penjualan tunai, alur pendek aplikasi justru lebih sesuai. 

##### **22.  SCM Planning Cycle** 

###### **DI LUAR CAKUPAN** 

Yang sudah: pesanan pembelian dapat dibuat kapan saja tanpa dokumen pendahulu. Yang belum: perencanaan kebutuhan bahan sebagai siklus tersendiri sebelum pengadaan dijalankan, dan siklus pemesanan ulang berdasarkan ambang minimum. Dengan demikian, proses ini dinyatakan di luar cakupan karena perencanaan pengadaan adalah pekerjaan kantor; namun ambang minimum yang belum terisi pada item membuat peringatan stok rendah tidak dapat bekerja. 

### **2.4  Proses yang belum tersedia** 

Tiga proses berikut relevan bagi operasional kandang, tetapi belum ditemukan pada versi yang diuji. Ketiganya menjadi bahan keputusan pada Ringkasan 4. 

AAPM/SA/EVAL-3P-R/2026-07-31-R2  ·  Internal 

Halaman 10 dari 15 

Ringkasan Manajemen — Aplikasi Operasional Kandang Pihak Ketiga · Revisi 2 

PT Agung Abadi Putra Mandiri 

##### **19.  Mixing / BOM** 

###### **BELUM TERSEDIA** 

Yang sudah: Dedak dan Jagung tersedia sebagai item persediaan dengan saldo yang benar, masing-masing 150 kg dan 1.000 kg. Yang belum: formula pencampuran, pemakaian bahan sebagai satu kesatuan batch, hasil jadi yang masuk sebagai item stok baru, perhitungan susut, dan verifikasi produksi sebelum dianggap final. Dengan demikian, proses ini dicatat sebagai belum tersedia dan bukan di luar cakupan, karena berbeda dari sebelas proses administrasi lainnya, pencampuran pakan berada langsung di lapisan operasional kandang dan cukup umum pada farm menengah. 

##### **23.  Editable Period** 

###### **BELUM TERSEDIA** 

Yang sudah: tidak ditemukan penguncian periode pada aplikasi. Yang belum: penutupan periode sehingga data di dalamnya tidak dapat diubah tanpa proses pembukaan resmi, beserta pemeriksaan penguncian sebelum setiap pembuatan dan perubahan dokumen. Dengan demikian, proses ini dicatat sebagai belum tersedia dan bukan di luar cakupan, karena digabung dengan adanya layar penyuntingan langsung pada catatan harian, data bulan lalu masih dapat diubah kapan saja tanpa batas waktu. 

##### **24.  Warehouse Transfer** 

###### **BELUM TERSEDIA** 

Yang sudah: stok ditampilkan per lokasi pada halaman detail setiap item. Yang belum: pemindahan stok antargudang sebagai transaksi berpasangan yang saling mengunci, yaitu berkurang di gudang asal dan bertambah di gudang tujuan dalam satu kejadian. Dengan demikian, proses ini dicatat sebagai belum tersedia dan bukan di luar cakupan, karena farm dengan lebih dari satu gudang akan langsung membutuhkannya, dan saat ini perpindahan hanya dapat ditiru lewat dua penyesuaian terpisah. 

### **2.5  Temuan lintas-proses** 

Empat hal berikut tidak melekat pada satu proses tertentu, melainkan menyentuh beberapa proses sekaligus. Keempatnya tidak dihitung sebagai proses tambahan. 

|**Temuan lintas-proses**|**Proses yang tersentuh**|**Art**|
|---|---|---|
|**Penyuntngan catatan harian**<br>**tanpa alasan wajib**|Nomor 4, 5, 9, dan 23|Nilai pakan, telur, dan populasi dapat<br>diubah setelah tersimpan, sehingga stok<br>dan indikator ikut bergeser tanpa jejak.|
|**Satuan dasar dan faktor konversi**<br>**belum ada**|Nomor 3, 9, dan 10|Bahan yang dibeli per karung dan dipakai<br>per kilogram belum dapat dijumlahkan<br>dengan aman.|
|**Izin peran terlalu kasar**|Nomor 3, 6, 9, dan 21|Satu izin kelola persediaan sekaligus<br>membuka area pembelian; batas<br>kewenangan antarproses menjadi kabur.|
|**Pemakaian tanpa jaringan belum**<br>**dapat diandalkan**|Nomor 2, 4, dan 5|Pencatatan lapangan berhent ketka<br>sinyal hilang, sehingga seluruh proses<br>hulu ikut tertunda.|



AAPM/SA/EVAL-3P-R/2026-07-31-R2  ·  Internal 

Halaman 11 dari 15 

Ringkasan Manajemen — Aplikasi Operasional Kandang Pihak Ketiga · Revisi 2 

PT Agung Abadi Putra Mandiri 

#### **Cara membaca bagian ini** 

Dari dua puluh empat proses, sebelas berada di luar sasaran produk. Menghitungnya sebagai kekurangan akan menghasilkan penilaian yang tidak adil terhadap pengembang. 

Yang benar-benar perlu dibicarakan adalah sepuluh proses yang tercakup sebagian dan tiga proses yang belum tersedia — terutama pencampuran pakan, karena hanya proses itu yang berada langsung di lapisan operasional kandang. 

Uraian yang sama, beserta bukti dan tangkapan layarnya, tersedia pada Dokumen 2 bagian 4.4. 



**RINGKASAN 3** 

## **Kelayakan untuk Pelanggan** 

Pertanyaan kedua berbeda sasaran: apakah aplikasi ini layak ditawarkan kepada farm lain. Jawabannya bergantung pada profil farm yang dituju, dan perbedaannya cukup tajam untuk menentukan siapa yang boleh dihubungi lebih dahulu. 

|**Profl farm**|**Penilaian**|**Yang menentukan**|
|---|---|---|
|**Satu siklus per kandang, pakan jadi,**<br>**jual-beli tunai**|**CUKUP POTENSIAL**|Kebutuhan pokoknya sudah terjawab: pencatatan harian,<br>stok dasar, dan catatan kas.|
|**Membeli pakan secara tempo**|**BELUM COCOK**|Penerimaan barang dan pengeluaran kas masih<br>tergabung, sehingga utang tdak terbentuk.|
|**Menjual telur secara tempo**|**BELUM COCOK**|Stok keluar dan kas masuk tergabung, sehingga piutang<br>tdak terbentuk.|
|**Mencampur pakan sendiri**|**BELUM COCOK**|Formula, pemakaian bahan, hasil jadi, dan susut belum<br>tersedia.|
|**Membutuhkan laba rugi dan buku**<br>**besar**|**DI LUAR CAKUPAN**|Yang tersedia adalah catatan kas. Akuntansi memang<br>bukan sasaran produk ini.|
|**Punya beberapa farm yang saling**<br>**mengirim**|**BELUM TERBUKTI**|Isolasi data antartenant dan transaksi antarunit belum<br>diuji.|
|**Ingin mempekerjakan dan**<br>**menggaji lewat sistem**|**DI LUAR CAKUPAN**|Modul kepegawaian memang tdak dibangun pada versi<br>ini.|



AAPM/SA/EVAL-3P-R/2026-07-31-R2  ·  Internal 

Halaman 12 dari 15 



<!-- Start of picture text -->
2 Utama Poultry (Dashboard<br>88= Dashboard Selamat datang, Admin Cabang Utama<br>© Input harian<br>2B Vaksinasi :<br>@® Inventor<br>2 Mutasi stok<br>@ Pesanan pembetian<br>Peringatan mortalitas<br>© Keuangan marae<br>© Lokasi Pusat peringatan<br>© Kandang<br>® Vendor Mortalitas melewati ambang ‘Stok saprodi rendah<br>Administrast Mortalitas melewati ambang<br>‘amin<br>Anal produksi<br><!-- End of picture text -->



<!-- Start of picture text -->
1006 9 a><br>< Inputharian<br>7m<br>18 — Tol bagus buh<br>TR = Tour tak ut<br>census pakan -<br>@_ Mutasi populasi es<br>cay Pengobatan %<br><!-- End of picture text -->







SS 

Ringkasan Manajemen — Aplikasi Operasional Kandang Pihak Ketiga · Revisi 2 

PT Agung Abadi Putra Mandiri 

Rencana peluncuran yang dinilai adalah 5 September 2026. Penilaiannya dipisahkan menurut jenis 

kegiatan, karena mempresentasikan produk dan mengoperasikannya secara nyata memiliki syarat yang sangat berbeda. 

|**Kegiatan**|**Penilaian**|**Syarat**|
|---|---|---|
|**Presentasi perkembangan produk**|**DAPAT DILAKUKAN**|Gunakan data contoh; jelaskan fungsi yang sudah<br>ada dan yang masih diuji.|
|||Sampaikan cakupan produk apa adanya; hindari|
|**Demonstrasi ke calon pelanggan**|**DAPAT, TERBATAS**|klaim pencampuran pakan, utang-piutang,<br>akuntansi, dan upah.|
|**Uji coba pada satu farm tdak krits**|**SETELAH ENAM HAL**<br>**TUNTAS**|Terutama pemakaian tanpa jaringan,<br>kewenangan peran, dan kesepakatan satuan.|
|**Pemakaian nyata untuk uang dan**|**BELUM**|Keutuhan simpan, otorisasi sisi server, dan jejak<br>|
|**barang**|**DIREKOMENDASIKAN**|koreksi belum terbukt.|
|**Menjadi pemegang catatan resmi**<br>**AAPM**|**BELUM**<br>**DIREKOMENDASIKAN**|Diperlukan kesepakatan integrasi dan pembagian<br>kewenangan lebih dahulu.|



### **4.1  Urutan perbaikan yang disarankan** 

Urutan berikut disusun agar setiap langkah menutup risiko terbesar lebih dahulu, dan agar langkah berikutnya tidak perlu diulang karena keputusan yang belum diambil. 

**1.** Sepakati siapa pemegang catatan resmi dan bagaimana batas transaksi harian ditetapkan. Ini menentukan bentuk seluruh perbaikan berikutnya. 

**2.** Perbaiki pemakaian tanpa jaringan, termasuk lewat tautan QR, beserta jaminan kirim tepat satu kali. 

**3.** Ganti penyuntingan langsung menjadi koreksi berbasis pembalikan dengan alasan wajib dan jejak pelaku. 

**4.** Pecah izin menjadi per tindakan, lalu tegakkan di sisi server dan uji secara negatif untuk setiap peran. 

**5.** Tetapkan satuan dasar dan faktor konversi; sahkan definisi HDP dan FCR secara tertulis bersama. 

**6.** Perbaiki tiga hal yang mudah salah dibaca: jenis item, target strain, dan label arus kas. 

### **4.2  Perkiraan urutan waktu** 

|**Tahap**|**Isi**|**Yang menandai selesai**|
|---|---|---|
|**Sebelum 5 September**|Kesepakatan batas kewenangan,<br>defnisi indikator, dan satuan|Dokumen disetujui kedua pihak; tdak memerlukan<br>perubahan program|
|**Setelah kesepakatan**|Perbaikan pemakaian tanpa jaringan<br>dan tata kelola koreksi|Diuji ulang dengan skenario yang sama dan<br>hasilnya berubah|
|**Menjelang uji coba**|Pemecahan izin dan pengujian<br>negatf sisi server|Petugas kandang tdak dapat menyimpan data di<br>luar kewenangannya|



AAPM/SA/EVAL-3P-R/2026-07-31-R2  ·  Internal 

Halaman 14 dari 15 

Ringkasan Manajemen — Aplikasi Operasional Kandang Pihak Ketiga · Revisi 2 

PT Agung Abadi Putra Mandiri 

|**Tahap**|**Isi**|**Yang menandai selesai**|
|---|---|---|
|**Saat uji coba**|Satu farm tdak krits, data nyata,<br>pendampingan penuh|Satu siklus penuh berjalan tanpa selisih yang tdak<br>dapat dijelaskan|



### **4.3  Keputusan yang diminta** 

|**Keputusan**|**Yang perlu ditetapkan**|
|---|---|
|**Posisi aplikasi bagi AAPM**|Apakah ditempatkan sebagai kanal pencatatan lapangan, atau tdak dipakai<br>untuk internal.|
|**Kelanjutan penawaran ke pelanggan**|Apakah penawaran dimulai sekarang sebagai pratnjau, atau menunggu<br>enam temuan mutu tuntas.|
|**Cakupan yang diminta ke pengembang**|Apakah pencampuran pakan, perpindahan antarkandang, dan penguncian<br>periode diminta masuk rencana produk.|
|**Penanggung jawab pendampingan**|Siapa dari AAPM yang mendampingi uji coba dan berwenang menyatakan<br>lulus atau tdak.|



#### **Catatan penutup ringkasan** 

Aplikasi ini punya nilai nyata yang belum banyak tersedia: pencatatan lapangan lewat ponsel yang benar-benar dipakai petugas, dengan angka yang terbukti konsisten sampai ke dashboard. 

Yang belum selesai bukan daftar fitur, melainkan aturan: siapa boleh mengubah apa, apa yang terjadi ketika jaringan hilang, dan bagaimana setiap perubahan dapat ditelusuri kembali. 

Uraian setiap temuan, seluruh bukti, penelusuran tiga puluh dua langkah, dan analisis per fitur tersedia pada Dokumen 2 — Analisis Lengkap. 

AAPM/SA/EVAL-3P-R/2026-07-31-R2  ·  Internal 

Halaman 15 dari 15 

