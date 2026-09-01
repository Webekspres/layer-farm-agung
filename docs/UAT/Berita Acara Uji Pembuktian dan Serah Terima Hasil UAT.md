

<!-- Start of picture text -->
Ve webekspres<br><!-- End of picture text -->

# Ve webekspres 







|Parameter Pengujian|Rincian / Nilai Konfigurasi|
|---|---|
|**Versi Mobile Application**|AAPM Mobile Android v1.0.6 (Build 30)|
|**Akun Pengujian Terlibat**|Superadmin (Global), admin.uat (Tenant Admin), staff.uat (Field Staff)|



## **2. Matriks Hasil Eksekusi Skenario Pengujian (TC-01 s/d TC-05)** 

Seluruh skenario pengujian utama telah dieksekusi secara berurutan sesuai prosedur baku dengan ringkasan status kelulusan sebagai berikut: 

|ID|Skenario Pengujian|Kriteria Keberhasilan / Hasil Aktual|Status Kelulusan|
|---|---|---|---|
|**TC-0**<br>**1**|Inisiasi Mid-Cycle &<br>Isolasi Siklus|Umur ayam terhitung 40 hari (5 minggu 5 hari);<br>data siklus lama tidak terbawa ke siklus baru;<br>status rentang H-40 s/d H-1 berlabel "Belum<br>Dilaporkan" (tidak membentuk titik nilai 0 pada<br>grafik).|**LULUS (PASS)**|
|**TC-0**<br>**2**|Data Master &<br>Pemetaan Grade<br>Telur|Katalog grade global (TB, TR, TP) sinkron<br>antara Superadmin Web dan Staf Android; aksi<br>nonaktif/aktif grade langsung membatasi opsi<br>form input secara dinamis tanpa merusak<br>integritas riwayat transaksi.|**LULUS (PASS)**|
|**TC-0**<br>**3**|Pengendalian Input &<br>Validasi Tanggal|Input Hari-H dan H-3 berhasil disimpan; input<br>H-8 tertolak validasi batas lookback staf<br>(maksimal 7 hari); penginputan tanggal masa<br>depan (besok) secara mutlak diblokir oleh UI &<br>API.|**LULUS (PASS)**|
|**TC-0**<br>**4**|Jejak Audit Koreksi &<br>Mode Offline Outbox|Form koreksi/hapus mewajibkan input alasan;<br>audit trail mencatat nilai before/after, waktu,<br>dan pelaku; input dalam mode offline pesawat<br>masuk antrean pending dan tersinkronisasi<br>otomatis saat online tanpa duplikasi.|**LULUS (PASS)**|
|**TC-0**<br>**5**|Rekonsiliasi Formula<br>HDP & FCR|Kalkulasi formula HDP (54.1%) dan FCR (2.00)<br>terbukti identik dan presisi antara Android, Web<br>Dashboard, dan Spreadsheet Manual. Input<br>tanpa berat telur tidak memblokir simpan|**LULUS (PASS)**|



www.webekspres.co.id | 085111221788 | cs@webekspres.co.id 

Halaman 2 

NPWP: 26.839.395.6-408.000 | NIB: 0310240053735 

|ID|Skenario Pengujian|Kriteria Keberhasilan / Hasil Aktual|Status Kelulusan|
|---|---|---|---|
|||harian.||



## **3. Tabel Rekonsiliasi Data 4 Arah (Validasi Formula TC-05)** 

Pembuktian integritas kalkulasi matematis dilakukan dengan menyandingkan data formulir input mentah, visualisasi mobile Android, rekapitulasi web dashboard, serta spreadsheet manual independen: 

|Parameter / Metrik|Input<br>Mentah|Layar<br>Android|Layar Web|Spreadshee<br>t|Hasil Uji|
|---|---|---|---|---|---|
|Produksi TB (Telur<br>Bagus)|2.500 butir|2.500 butir|2.500 butir|2.500 butir|**SESUAI**<br>**(**✓**)**|
|Produksi TR (Telur<br>Retak)|150 butir|150 butir|150 butir|150 butir|**SESUAI**<br>**(**✓**)**|
|Produksi TP (Telur<br>Putih)|50 butir|50 butir|50 butir|50 butir|**SESUAI**<br>**(**✓**)**|
|Populasi Ayam Hidup|4.990 ekor|4.990 ekor|4.990 ekor|4.990 ekor|**SESUAI**<br>**(**✓**)**|
|Mortalitas / Kematian|10 ekor|10 ekor|10 ekor|10 ekor|**SESUAI**<br>**(**✓**)**|
|Konsumsi Pakan|324 kg|324 kg|324 kg|324 kg|**SESUAI**<br>**(**✓**)**|
|Berat Rata-Rata Telur|60 gram|60 gram|60 gram|60 gram|**SESUAI**<br>**(**✓**)**|
|Total Egg Mass (kg)|—|162,0 kg|162,0 kg|162,0 kg|**SESUAI**<br>**(**✓**)**|
|**Hen Day Production**<br>**(HDP)**|—|**54.1%**|**54.1%**|**54.11%**|**SESUAI**<br>**(**✓**)**|



www.webekspres.co.id | 085111221788 | cs@webekspres.co.id 

Halaman 3 

NPWP: 26.839.395.6-408.000 | NIB: 0310240053735 

|Parameter / Metrik|Input<br>Mentah|Layar<br>Android|Layar Web|Spreadshee<br>t|Hasil Uji|
|---|---|---|---|---|---|
|**Feed Conversion**<br>**Ratio (FCR)**|—|**2.00**|**2.00**|**2.00**|**SESUAI**<br>**(**✓**)**|



## **4. Catatan Teknis** 

Dari hasil observasi mendalam selama proses pengujian mandiri, dicatat 1 poin temuan teknis sebagai catatan penyelarasan: 

### 1. **Selisih Data Kumulatif TB pada Tampilan Web Dashboard (TC-05):** 

- _Temuan:_ Rekap kumulatif TB pada Web Dashboard menampilkan angka 2.501 butir (terdapat selisih 1 butir dari data uji form sebesar 2.500 butir). 

- _Evaluasi:_ Selisih 1 butir tersebut merupakan residu dari transaksi uji awal sebelum penataan ulang database UAT pada tanggal yang sama. Logika agregasi dan kalkulasi sistem dinyatakan berjalan normal dan valid. 

## **5. Kesimpulan & Persetujuan Peluncuran (Sign-Off)** 

Berdasarkan pemenuhan seluruh parameter pada skenario pengujian TC-01 hingga TC-05, disimpulkan bahwa: 

- Seluruh fungsi utama yang mencakup inisiasi _Mid-Cycle Start_ , katalog grade telur global, kebijakan batas _lookback_ , mekanisme audit trail, dan kalkulasi HDP/FCR telah **DITERIMA (ACCEPTED)** dan terbukti selaras dengan kebutuhan ERP AAPM. 

- Aplikasi Website Dashboard dan Mobile Android dinyatakan **MEMENUHI SYARAT UNTUK** 

### **PELUNCURAN AWAL (GO-LIVE READY)** . 

- Tim Pengembang diwajibkan menonaktifkan seluruh akun kredensial pengujian (admin.uat dan staff.uat) pada database produksi sebelum operasional kandang komersial dimulai. 

Demikian Berita Acara ini dibuat dengan sebenarnya dalam rangkap 2 (dua) untuk dipergunakan sebagaimana mestinya. 

|**Pihak Pengembang**|**Pihak Klien / Penilai Teknis**|
|---|---|
|PT Webekspres Teknologi Indonesia|PT AAPM|



Halaman 4 

www.webekspres.co.id | 085111221788 | cs@webekspres.co.id 

NPWP: 26.839.395.6-408.000 | NIB: 0310240053735 

**<u>( Developer Webekspres) ( System Analyst )</u>** 

Halaman 5 www.webekspres.co.id | 085111221788 | cs@webekspres.co.id NPWP: 26.839.395.6-408.000 | NIB: 0310240053735 

