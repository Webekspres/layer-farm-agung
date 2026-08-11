## PROPOSAL

## PENAWARAN

## PROPOSAL

## PENAWARAN

###### PT WEBEKSPRES TEKNOLOGI INDONESIA

```
Proyek Pengembangan Sistem Manajemen Peternakan Ayam Petelur Terintegrasi
Berbasis Cloud Progressive Web App (PWA) + Web Aplikasi Android
```
_Kepada_ **_Kak Agung Perdana_** _di Tempat_


##### PENDAHULUAN

Kepada Yth,
**Agung Perdana**
Di Tempat

Dalam operasional industri peternakan ayam petelur, akurasi monitoring populasi dan
efisiensi produksi telur adalah kunci utama profitabilitas. Aktivitas pengelolaan kandang,
pemantauan siklus umur ayam (fase Pullet hingga Layer), serta pencatatan mutasi
harian memerlukan sistem yang terpadu untuk menghindari kesalahan data manual.

Saat ini, tantangan utama yang sering dihadapi adalah keterlambatan sinkronisasi data
dari lapangan ke bagian administrasi, serta sulitnya menganalisis performa harian
seperti Hen Day Production (HDP) dan Feed Conversion Ratio (FCR) secara cepat. Hal ini
berdampak pada kurangnya visibilitas manajemen terhadap kondisi operasional dan
keuangan perusahaan.

Melalui proposal ini, kami menawarkan solusi Pengembangan Sistem Manajemen
Peternakan Ayam Petelur Berbasis Cloud PWA. Sistem ini dirancang untuk mendigitalisasi
seluruh proses operasional melalui akses hybrid (Laptop & HP) dengan kemampuan kerja
offline di area kandang. Dengan arsitektur Multi-Subdomain, sistem ini memberikan
kontrol penuh kepada Bapak Agung selaku Superadmin untuk mengelola manajemen
user dan akses data secara terpusat dan efisien.


##### PROFIL

##### PERUSAHAAN

PT Webekspres Teknologi Indonesia, atau

Webekspres adalah perusahaan pengembangan

website, aplikasi, software, dan digital marketing.

Dengan tim ahli yang berdedikasi, kami

menawarkan solusi inovatif yang disesuaikan

dengan kebutuhan unik bisnis Anda. Tujuan kami

adalah untuk memastikan setiap langkah digital

Anda sukses dan berdampak positif.

###### NIB : 0310240053735

**Software**

**Website**

```
Solusi software custom untuk
meningkatkan efisiensi bisnis
Anda.
```
```
Website profesional dan
responsif untuk meningkatkan
kehadiran online Anda.
```
```
Aplikasi
Aplikasi mobile dan desktop yang
user-friendly dan fungsional.
```
```
Digital Marketing
Solusi meningkatkan visibilitas
dan engagement bisnis Anda.
```

```
Akurasi Data: Menjamin validitas data produksi
telur dan konsumsi pakan secara digital.
```
```
Monitoring Otomatis: Memantau siklus umur
ayam (Pullet ke Layer) secara sistematis.
```
```
Analisis Instan: Menyediakan laporan HDP dan
FCR otomatis untuk evaluasi cepat.
```
```
Mobilitas Lapangan: Memudahkan input data
via HP di area minim sinyal (Offline Sync).
```
```
Kontrol Terpusat: Manajemen akses bertingkat
bagi Superadmin, Admin, dan Staff.
```
```
Transparansi Keuangan: Mengintegrasikan
data operasional dengan laporan arus kas
(Sales vs Opex).
```
#### TUJUAN

**01**

**03**

**04**

**05**

**06**

**02**


### BATASAN

### PENGEMBANGAN SISTEM

```
Platform Utama: Sistem dikembangkan berbasis Cloud Progressive Web App (PWA) yang diakses melalui browser
(Chrome/Safari) dan tidak dipublikasikan di Play Store atau App Store.
Konektivitas Data: Fitur Auto-Sync Offline hanya berlaku untuk modul pencatatan harian produksi di Front Office;
modul keuangan dan manajemen user memerlukan koneksi internet stabil.
Cakupan Bisnis: Sistem difokuskan pada manajemen peternakan ayam petelur (Layer), tidak mencakup manajemen
ayam pedaging (Broiler) atau unit bisnis pembibitan (Hatchery).
```
**Data Awal:** Migrasi data historis dari pencatatan manual/spreadsheet sebelumnya sepenuhnya menjadi tanggung

jawab pihak klien dalam format yang ditentukan sistem.

```
Integrasi Eksternal: Sistem bersifat mandiri (Standalone) dan tidak mencakup integrasi dengan perangkat IoT
(sensor suhu/kelembaban otomatis) atau API pihak ketiga (bank/payment gateway).
```
**Keamanan & Infrastruktur:** Layanan mencakup pengelolaan server cloud dan subdomain selama masa kontrak,

namun tidak mencakup pengadaan perangkat keras (smartphone/laptop) bagi petugas lapangan.


**1. Modul Centralized User Management
Deskripsi:**
Mengatur otoritas akses terpusat untuk keamanan data.
**Fungsi Utama:**
    Manajemen Multi-Subdomain,
    RBAC (Superadmin, Admin, Staff), dan Aktivasi Akun.
**Struktur Data:**
    Users,
    Roles,
    Permissions,
    Subdomains.
**Output:**
Sistem akses akun terintegrasi.
    **2. Modul Master Data Peternakan**
    **Deskripsi:**
    Pengaturan dasar infrastruktur peternakan.
    **Fungsi Utama:**
       Manajemen data kandang (Open/Closed),
       kapasitas, dan setting siklus umur ayam.
    **Struktur Data:**
       Cages,
       Cycle_Settings,
       Locations.
    **Output:**
    Database infrastruktur peternakan.

##### RUANG LINGKUP DEVELOPMENT (1/7)

Sistem Manajemen Peternakan Ayam Petelur dikembangkan dalam satu platform utama berbasis Cloud PWA dengan
struktur modul sebagai berikut:


##### RUANG LINGKUP DEVELOPMENT (2/7)

**3. Modul Master Strain & Standardisasi Produksi
Deskripsi:**
Manajemen data bibit dan target performa.
**Fungsi Utama:**
    Database jenis bibit (Strain)
    input parameter standar target HDP harian.
**Struktur Data:**
    Strains,
    Production_Targets,
    Egg_Grades.
**Output:**
Benchmark performa produksi berdasarkan jenis bibit.
    **4. Modul Front Office PWA (Input Produksi)**
    **Deskripsi:**
    Antarmuka mobile untuk petugas kandang.
    **Fungsi Utama:**
       Pencatatan harian telur per grade
       konsumsi pakan per kandang.
    **Struktur Data:**
       Daily_Productions,
       Feed_Consumptions.
    **Output:**
    Rekap data produksi lapangan.

Sistem Manajemen Peternakan Ayam Petelur dikembangkan dalam satu platform utama berbasis Cloud PWA dengan
struktur modul sebagai berikut:


##### RUANG LINGKUP DEVELOPMENT (3/7)

**5. Modul Offline Synchronization Engine
Deskripsi:**
Teknologi untuk menjamin data tetap terinput tanpa internet.
**Fungsi Utama:**
    Local storage data saving
    auto-sync saat perangkat kembali online.
**Struktur Data:**
    Sync_Queue,
    Conflict_Resolvers.
**Output:**
Kontinuitas input data di area minim sinyal.
    **6. Modul Manajemen Mutasi Populasi**
    **Deskripsi:**
    Pelacakan jumlah ayam secara akurat.
    **Fungsi Utama:**
       Pencatatan ayam masuk (DOC),
       angka kematian, afkir, dan mutasi antar kandang.
    **Struktur Data:**
       Population_Mutations,
       Mortality_Logs.
    **Output:**
    Laporan populasi ayam aktif (Real-time).

Sistem Manajemen Peternakan Ayam Petelur dikembangkan dalam satu platform utama berbasis Cloud PWA dengan
struktur modul sebagai berikut:


##### RUANG LINGKUP DEVELOPMENT (4/7)

**7. Modul Manajemen Vendor & Procurement
Deskripsi:**
Pengelolaan hubungan dengan pemasok.
**Fungsi Utama:**
    Database supplier pakan/obat dan pencatatan riwayat pembelian
    (PO).
**Struktur Data:**
    Vendors,
    Purchase_Orders,
    Supplier_Contacts.
**Output:**
Database mitra dan riwayat pengadaan.
    **8. Modul Inventory & Stock Control**
    **Deskripsi:**
    Manajemen stok sarana produksi (Saprodi).
    **Fungsi Utama:**
       Monitoring stok pakan, obat, dan vitamin serta notifikasi stok
       rendah.
    **Struktur Data:**
       Inventory_Stocks,
       Stock_Mutations.
    **Output:**
    Kartu stok digital dan laporan inventaris.

Sistem Manajemen Peternakan Ayam Petelur dikembangkan dalam satu platform utama berbasis Cloud PWA dengan
struktur modul sebagai berikut:


##### RUANG LINGKUP DEVELOPMENT (5/7)

**9. Modul Smart Early Warning System (Analytics)
Deskripsi:**
Fitur analisis cerdas untuk deteksi dini masalah.
**Fungsi Utama:**
    Komparasi realita vs target bibit dan notifikasi otomatis penurunan
    produksi/mortalitas.
Struktur Data:
    Analytics_Engine,
    Alert_Logs.
**Output:**
Notifikasi peringatan dini bagi manajemen.
    **10. Modul Executive Dashboard & Portal Klien**
    **Deskripsi:**
    Visualisasi data untuk pengambilan keputusan.
    **Fungsi Utama:**
       Laporan HDP/FCR otomatis,
       laporan arus kas (Sales vs Opex),
       akses khusus buyer.
    **Struktur Data:**
       Analytics_Summary,
       Shared_Reports.
    **Output:**
    Dashboard performa dan laporan keuangan instan.

Sistem Manajemen Peternakan Ayam Petelur dikembangkan dalam satu platform utama berbasis Cloud PWA dengan
struktur modul sebagai berikut:


##### RUANG LINGKUP DEVELOPMENT (6/7)

**11. Modul Pencatatan Penjualan (Sales Out)
Deskripsi:**
Mengelola transaksi pengeluaran dan penjualan telur ke buyer atau
agen.
**Fungsi Utama:**
    Form pencatatan keluarnya telur dari gudang ke pembeli/agen.
    Pengaturan harga jual harian dan rekap total pendapatan kotor
    penjualan.
**Struktur Data:**
    Customers,
    Sales_Orders,
    Delivery_Logs.
**Output:**
Rekap pendapatan penjualan dan riwayat transaksi agen.
    **12. Modul Rekap Arus Kas (Cashflow)**
    **Deskripsi:**
    Pencatatan arus kas operasional secara ringkas dan terpusat.
    **Fungsi Utama:**
       Pencatatan biaya operasional (Opex) harian di luar pakan
       (seperti gaji, listrik, dll).
       Menggabungkan data pemasukan (penjualan) dan
       pengeluaran menjadi satu laporan Laba/Rugi sederhana.
    **Struktur Data:**
       Opex_Categories,
       Financial_Ledgers,
       Profit_Loss_Records.
    **Output:**
    Laporan kesehatan finansial (Arus Kas) peternakan yang mudah
    dibaca.

Sistem Manajemen Peternakan Ayam Petelur dikembangkan dalam satu platform utama berbasis Cloud PWA dengan
struktur modul sebagai berikut:


##### RUANG LINGKUP DEVELOPMENT (7/7)

**13. Modul Manajemen Kesehatan & Vaksinasi
Deskripsi:**
Penjadwalan rekam medis untuk menjaga produktivitas populasi
ayam.
**Fungsi Utama:**
    Pembuatan pengingat/jadwal pemberian vaksin dan vitamin
    berdasarkan siklus umur.
    Pencatatan rekam medis harian jika terjadi indikasi penyakit pada
    flock tertentu.
**Struktur Data:**
    Vaccine_Schedules,
    Medical_Records,
    Treatment_Logs.
**Output:**
Notifikasi jadwal vaksinasi dan riwayat kesehatan populasi kandang.

Sistem Manajemen Peternakan Ayam Petelur dikembangkan dalam satu platform utama berbasis Cloud PWA dengan
struktur modul sebagai berikut:


**KOMPONEN BIAYA**

```
Basic System Rp 3.000.000,-
```
```
Pembuatan 13 Modul 13 x Rp 2.250.000,- = Rp 29.250.000,-
```
```
Setup / Deploying Termasuk
```
```
Infrastruktur & Server Termasuk
```
```
Domain, Maintenance, Pelatihan Termasuk
```
```
Catatan :
Biaya di atas belum termasuk PPN 11%
Biaya perpanjangan: Domain, Hosting, & SSL Security: Rp 2.902.500,-/tahun (jika layanan tersebut dari Webekspres)
Biaya di atas belum termasuk biaya langganan Plugin Pro & API dari pihak ketiga jika dibutuhkan penambahan.
Biaya sudah termasuk maintenance (Fix Bug, Update Minor) Selama 6 Bulan
Jika Setup di servel local, diluar biaya di atas.
Termin Pembayaran dapat dilihat pada halaman selanjutnya
Biaya Percepatan 1 hari kerja = Rp350.000 & 1 hari libur Rp.500.
```
**Total Biaya Keseluruhan: Rp 32.250.000,- Rp 29.029.000,-**

### ESTIMASI BIAYA

```
Basic System Bundle
Rp 3.000.000,-
```
```
Modul Bundle
Rp 2.250.000,-/Modul
```
```
TERBATAS
```

### TERMIN PEMBAYARAN

```
Termin pembayaran disusun untuk memberi kenyamanan kedua belah pihak:
```
**Termin Tahapan Pembayaran Deskripsi**

```
50 % Setelah Proposal disetujui Memulai Analisis & Pengerjaan Proyek
```
```
50 %
```
```
Setelah UAT dan revisi selesai Persiapan Go-Live
```
```
Sebelum Go-Live Sebelum Serah terima source code & Pelatihan
```

### JADWAL PELAKSANAAN

```
Tahap 1 Tahap 2
Analisis kebutuhan dan desain
sistem
```
```
Pengerjaan Modul, pengujian
modul & quality control
```
```
UAT & Pengecekan oleh Klien
(Tahap Revisi)
```
```
Tahap 4
Implementasi (Go-Live) dan
Pelatihan Pengguna
```
Tahap 3

Kami memperkirakan waktu pengerjaan proyek ini adalah selama **45 Hari kerja** (bisa juga lebih cepat), dengan
rincian sebagai berikut:

```
Catatan :
Pengerjaan dilakukan pada hari kerja dan jam operasional kantor, yaitu Senin–Jumat pukul 08.00–17.00 WIB.
Detail Timeline pengerjaan proyek akan dibuatkan jika sudah masuk tahap pengerjaan (sudah deal)
```

Domain

Klien akan mendapatkan
nama domain secara gratis
untuk tahun pertama,
sehingga website memiliki
alamat unik dan profesional
yang mudah diakses
pengguna.

```
Kami menyediakan layanan
hosting gratis selama 1 tahun
pertama, memastikan website
dapat berjalan dengan cepat
dan stabil di server yang
andal.
```
Hosting SSL Security

```
Website akan dilengkapi
dengan sertifikat SSL gratis
pada tahun pertama, untuk
menjamin koneksi aman
(https) dan meningkatkan
kepercayaan pengguna saat
mengakses situs.
```
```
Backup &
Maintenance
```
```
Website dilengkapi backup
otomatis mingguan, serta
layanan maintenance dan
pemantauan keamanan untuk
menjaga performa tetap
optimal dan aman dari
gangguan teknis maupun
ancaman siber.
```
Training

```
Kami menyediakan sesi
pelatihan jarak jauh (online)
melalui Google Meet, untuk
membimbing klien dalam
memahami cara
menggunakan dan
mengelola konten website
secara mandiri.
```
### PRODUK & LAYANAN

### YANG DIDAPATKAN

```
KLIEN AKAN MENDAPATKAN WEBSITE LENGKAP SESUAI FITUR YANG TELAH DIJELASKAN
SEBELUMNYA, DITAMBAH BONUS LAYANAN SUPPORT DAN MAINTENANCE DARI KAMI BERUPA:
```

##### PENUTUP

```
Sistem Manajemen Peternakan Ayam Petelur ini diharapkan dapat menjadi
solusi digital yang meningkatkan efisiensi operasional, akurasi pencatatan
produksi, serta kemudahan monitoring performa harian pada bisnis Bapak
Agung.
Dengan sistem yang terintegrasi dan real-time, proses input data
lapangan, analisis performa HDP/FCR, dan pelaporan keuangan dapat
dilakukan dengan lebih cepat, akurat, dan terkontrol.
Kami siap mendukung implementasi dan pengembangan lanjutan sesuai
dengan kebutuhan bisnis peternakan Bapak Agung. Atas perhatian dan
kerja sama yang diberikan, kami ucapkan terima kasih
```
+62 851-1741-1788 webekspres.id cs@webekspres.co.id

Telepon Website Email


# TERIMA KASIH

## SEKIAN

**_WEBEKSPRES, MITRA DIGITAL ANDA!_**

**SELESAI**

PT Webekspres teknologi Indonesia


