**DOKUMEN SYSTEM ANALYST** ERP AAPM - PT AGUNG ABADI PUTRA MANDIRI 



# **Arah Peluncuran Awal dan Prioritas Penyelarasan Aplikasi Layer Farm** 

**Kepada: PT Webekspres Teknologi Indonesia Perihal: Hasil pengujian, batas peluncuran awal, dan tindak lanjut aplikasi Layer Farm** 

#### Tanggal: **13 Agustus 2026** 

Konteks: **penggunaan aplikasi oleh pelanggan dan mitra farm PT Agung Abadi Putra Mandiri (AAPM)** 

**Arah yang diusulkan:** peluncuran awal tidak perlu menunggu seluruh fungsi aplikasi selesai. Namun, fungsi yang masuk dalam cakupan awal harus mudah digunakan, konsisten antara web dan Android, serta menghasilkan data produksi yang dapat dipercaya. 

## **1. Ringkasan Hasil Pengujian** 

Secara umum, aplikasi telah memiliki dasar alur operasional peternakan: penyiapan farm, kandang dan siklus; pencatatan harian; histori; serta pemantauan indikator produksi. Web dapat digunakan untuk pengaturan dan pemantauan, sedangkan aplikasi Android dapat digunakan staf kandang untuk pencatatan lapangan. 

Pengujian juga menunjukkan beberapa bagian yang perlu diselaraskan sebelum digunakan secara berkelanjutan oleh pelanggan. 

|**Temuan**|**Kondisi yang terlihat**|**Dampak**|
|---|---|---|
|**Alur produksi dasar sudah**<br>**tersedia**|Pencatatan produksi per kandang, histori,<br>serta dashboard produksi telah tersedia<br>pada aplikasi.|Aplikasi sudah dapat menjadi dasar peluncuran<br>terbatas apabila fungsi inti diselesaikan dan<br>diuji sebagai satu alur.|
|**Data Master Grade Telur**<br>**belum terbukti**<br>**mengendalikan input**<br>**operasional**|Masterpada web menampilkan kategori<br>`B`,<br>`C`,dan<br>`Remban`,sedangkan input Android<br>masih menggunakan<br>`TB`,<br>`TR`,dan<br>`TP`.|Pengaturan yang dibuat pada master dapat<br>berbeda dari pilihan yang digunakan staf<br>kandang dan hasil pengolahan berikutnya.|
|**Pencatatan tanggal**<br>**sebelumnya belum**<br>**terkonfrmasi sampai**<br>**penyimpanan**|Alur harian menggunakan tanggal, tetapi<br>pengujian belum membuktikan bahwa data<br>yang terlupa dapat disimpan pada tanggal<br>kejadian dengan pengendalian yang<br>memadai.|Histori dapat berlubang dan indikator produksi<br>dapat bergeser apabila data kemarin harus<br>dicatat sebagai data hari ini.|
|**Indikator produksi sudah**<br>**ditampilkan**|Dashboard menampilkan jumlah produksi,<br>populasi aktif, HDP, dan tren.|Manfaatnya sudah terlihat, tetapi keandalan<br>angka bergantung pada klasifkasi telur,<br>tanggal kejadian, kandang, siklus, dan rumus<br>yang telah disepakati.|
|**Penggunaan di tengah siklus**<br>**masih perlu dipastikan**|Pelanggan dapat mulai menggunakan<br>aplikasi ketika farm sudah berjalan,<br>sehingga kondisi awal tidak selalu dimulai<br>dari ayam umur satu hari.|Tanpa nilai awal dan penempatan siklus yang<br>benar, data pertumbuhan dan produksi dapat<br>tidak mencerminkan kondisi farm sebenarnya.|
|**Fungsi lain tersedia dengan**<br>**tingkat kesiapan berbeda**|Aplikasi juga memuat fungsi pakan,<br>persediaan, pembelian, kesehatan,<br>keuangan, dan fungsi pendukung lain.|Fungsi tersebut tidak perlu menjadi syarat<br>peluncuran awal apabila belum dibutuhkan<br>oleh pelanggan atau belum selesai sebagai<br>alur yang andal.|



Kesimpulannya, aplikasi **layak diteruskan menuju peluncuran awal terbatas** , bukan untuk dinyatakan selesai seluruhnya. Fokus sekarang adalah mematangkan sedikit fungsi yang paling sering dipakai pelanggan dan memastikan datanya tetap konsisten dari pengaturan, input, histori, sampai indikator. 

Halaman 1 dari 5 

**AAPM** SYSTEM ANALYST 

MARKDOWN AUTHORITY - PDF RENDER-COPY 

**DOKUMEN SYSTEM ANALYST** ERP AAPM - PT AGUNG ABADI PUTRA MANDIRI 



## **2. Kondisi Aplikasi Saat Ini** 

### **2.1 Web** 

Web telah menyediakan akses akun, pengaturan farm dan kandang, siklus, Data Master Grade Telur, input harian per kandang, histori, serta dashboard produksi. Posisi web cukup tepat sebagai sarana pengaturan dan pemantauan oleh pengelola. 

Hal yang masih perlu diselesaikan pada web adalah memastikan bahwa Data Master benar-benar berfungsi sebagai **pengaturan operasional** , bukan hanya daftar referensi. Jika pengelola menetapkan kategori aktif menjadi <mark>`Remban`</mark> <u><mark>,</mark></u> <mark>`Bujang`</mark> <u><mark>,</mark></u> <u><mark>`Super` ,</mark></u> atau kategori lain yang disepakati, kategori tersebut harus menjadi pilihan pada input kandang dan menjadi dasar histori, indikator, laporan, persediaan, serta proses lanjutan yang memakai klasifikasi telur. 

Alur berbasis tanggal telah terlihat, tetapi kemampuan menyimpan data untuk tanggal sebelumnya belum dibuktikan secara lengkap. Rumus indikator, kategori telur yang dihitung, pembagi, pembulatan, dan perlakuan data yang belum lengkap juga masih perlu difinalisasi agar angka dapat dijelaskan kembali kepada pelanggan. 

### **2.2 Aplikasi Android** 

Aplikasi Android telah menyediakan alur kerja staf kandang, termasuk masuk ke aplikasi, memilih kandang, mengisi produksi harian, pakan dan populasi, serta membaca histori. Ini sudah sesuai sebagai dasar pencatatan lapangan. 

Ketidaksesuaian utama berada pada klasifikasi telur. Android masih menampilkan <mark>`TB - Telur bagus`</mark> <u><mark>,</mark></u> <mark>`TR - Telur retak`</mark> <u><mark>,</mark></u> dan <mark>`TP - Telur pecah`</mark> <u><mark>,</mark></u> sedangkan Data Master web menunjukkan kategori yang berbeda. Daftar pada Android perlu mengambil kategori aktif dari pengaturan master yang sama, bukan mempertahankan pilihan tetap secara terpisah. 

Kemampuan memilih dan menyimpan tanggal kejadian sebelumnya juga perlu diuji pada Android. Hasil penyimpanan harus tetap muncul pada tanggal, kandang, dan siklus yang benar serta terbaca sama pada web. 

### **2.3 Hubungan web dan Android** 

|**Area**|**Web**|**Android**|**Kondisi yang harus dicapai**|
|---|---|---|---|
|Pengaturan|Menjadi tempat pengelolaan<br>farm, kandang, siklus, dan<br>master.|Menggunakan hasil pengaturan<br>sesuai kewenangan pengguna.|Satu pengaturan menghasilkan pilihan<br>yang sama di kedua aplikasi.|
|Input produksi|Mendukung pencatatan dan<br>pemeriksaan data per kandang.|Menjadi sarana utama staf<br>kandang untuk input harian.|Kategori, tanggal, kandang, siklus, dan<br>nilai tersimpan dengan arti yang<br>sama.|
|Histori dan<br>indikator|Menyediakan pemantauan dan<br>ringkasan.|Menyediakan histori yang<br>relevan bagi staf.|Data yang sama menghasilkan jumlah<br>dan histori yang konsisten.|
|Koreksi|Mendukung pemeriksaan dan<br>tindakan sesuai kewenangan.|Memberi akses hanya jika<br>perannya diperbolehkan.|Perubahan dapat ditelusuri dan tidak<br>membuat data ganda.|



Dengan demikian, masalah utamanya bukan ketiadaan seluruh fitur, melainkan perlunya memastikan **satu sumber pengaturan dan satu arti data** berlaku dari web ke Android hingga hasil pengolahannya. 

## **3. Tujuan dan Pembatasan Ruang Lingkup** 

Tujuan peluncuran awal adalah memberi manfaat yang langsung dirasakan pelanggan dengan cara yang sesuai bagi farm yang tingkat digitalisasinya masih beragam. Pelanggan dapat memulai dari pencatatan produksi dan persentase produksi, kemudian mengadopsi fungsi lain secara bertahap setelah terbiasa dan 

Halaman 2 dari 5 

**AAPM** SYSTEM ANALYST 

MARKDOWN AUTHORITY - PDF RENDER-COPY 

**DOKUMEN SYSTEM ANALYST** ERP AAPM - PT AGUNG ABADI PUTRA MANDIRI 



#### memperoleh manfaat. 

Pembatasan ruang lingkup bukan berarti menurunkan mutu. Cakupan dibuat lebih kecil agar fungsi yang diluncurkan benar-benar matang, nyaman digunakan, dan menghasilkan data yang dapat dipercaya. 

### **3.1 Cakupan peluncuran awal** 

- akses pengguna sesuai farm dan kandang yang ditugaskan; 

- penyiapan kondisi awal farm, kandang, dan siklus sesuai keadaan sebenarnya, termasuk ketika mulai di tengah siklus; 

- Data Master Grade Telur sebagai pengaturan aktif yang dipakai oleh input web dan Android; pencatatan produksi harian per kandang; 

- pencatatan tanggal sebelumnya dan koreksi secara terkendali; 

- histori yang dapat dibaca kembali berdasarkan tanggal, kandang, dan siklus; dan indikator produksi dasar yang rumus dan sumber datanya jelas. 

### **3.2 Fungsi yang belum menjadi syarat peluncuran awal** 

Penerapan penuh persediaan dan pembelian pakan, kesehatan dan vaksin, penjualan, keuangan, stok opname, analisis lanjutan, dan fungsi pendukung lainnya dapat dilakukan bertahap. Fungsi yang sudah tersedia tetap dapat diuji atau digunakan apabila siap, tetapi ketidaksiapan fungsi tersebut tidak harus menahan peluncuran alur produksi dasar selama tidak menimbulkan data yang menyesatkan atau proses yang saling bergantung. 

## **4. Hal yang Harus Dilakukan Sekarang** 

Tindak lanjut perlu memadukan perbaikan aplikasi, finalisasi aturan penggunaan, dan pembuktian pada tenant uji. Pengujian tidak cukup hanya memastikan menu terlihat; data harus diikuti dari pengaturan sampai hasil akhirnya. 

|**Prioritas**|**Tindakan yang diperlukan**|**Bukti hasil yang diharapkan**|
|---|---|---|
|**1. Jadikan Data Master**<br>**sebagai sumber**<br>**klasifkasi**|Atur kategori uji, misalnya<br>`Remban`,<br>`Bujang`,dan<br>`Super`. Pastikan kategori aktif tersebut otomatis<br>menjadi pilihan input setiap kandang pada web<br>dan Android.|Daftar pada kedua aplikasi sama; kategori<br>nonaktif tidak dapat dipilih untuk input baru;<br>histori lama tetap dapat dibaca.|
|**2. Uji aliran data setiap**<br>**kategori**|Simpan produksi menggunakan masing-masing<br>kategori, lalu periksa histori, dashboard,<br>indikator, laporan, persediaan, dan proses lain<br>yang memakai jenis telur.|Identitas kategori dan jumlah tidak berubah<br>atau berpindah arti pada setiap tahap.|
|**3. Finalisasi perubahan**<br>**jenis telur**|Tetapkan aturan pemindahan telur antarkategori,<br>kewenangan, alasan, dan histori perubahan.|Jumlah asal berkurang, tujuan bertambah, total<br>tetap sama, dan perubahan dapat ditelusuri<br>tanpa stok negatif.|
|**4. Sediakan tanggal**<br>**kejadian sebelumnya**<br>**secara terkendali**|Uji input data kemarin, koreksi, pengiriman ulang,<br>tanggal di luar siklus, periode yang ditutup, dan<br>kewenangan pengguna.|Data masuk ke tanggal kejadian; waktu<br>pencatatan dan pengguna tetap diketahui;<br>indikator diperbarui; duplikasi dan tanggal<br>tidak sah ditolak.|
|**5. Pastikan**<br>**penggunaan di tengah**<br>**siklus**|Mulai tenant uji dari kondisi farm yang sedang<br>berjalan dengan umur, populasi, kandang, dan<br>tanggal mulai sebenarnya.|Hari/umur, populasi, produksi, dan indikator<br>mengikuti kondisi awal yang benar serta tidak<br>bercampur dengan siklus lain.|
|**6. Finalisasi indikator**<br>**produksi**|Sepakati rumus, kategori telur yang dihitung,<br>pembagi, periode, pembulatan, dan perlakuan<br>ketika data belum lengkap.|Angka dashboard dapat dihitung ulang dari<br>histori sumber untuk kandang dan siklus yang<br>sama.|
|**7. Uji konsistensi dan**<br>**kewenangan**|Bandingkan data web dan Android untuk<br>pengguna yang berbeda serta perubahan<br>penugasan farm/kandang.|Pengguna hanya melihat dan mengubah data<br>yang menjadi kewenangannya; hasil pada<br>kedua aplikasi tetap sama.|



Halaman 3 dari 5 

**AAPM** SYSTEM ANALYST 

MARKDOWN AUTHORITY - PDF RENDER-COPY 

**DOKUMEN SYSTEM ANALYST** ERP AAPM - PT AGUNG ABADI PUTRA MANDIRI 



|**Prioritas**|**Tindakan yang diperlukan**|**Bukti hasil yang diharapkan**|
|---|---|---|
|**8. Siapkan dukungan**<br>**rilis**|Tetapkan versi sumber aplikasi, perangkat yang<br>didukung, cara pembaruan, pencadangan,<br>pemulihan, dan jalur bantuan.|Pengguna mengetahui versi yang digunakan<br>dan pihak yang dihubungi ketika terjadi<br>kendala.|



Keputusan penggunaan yang masih perlu difinalisasi bersama meliputi daftar resmi kategori telur, aturan kategori aktif/nonaktif, batas tanggal sebelumnya, pihak yang boleh melakukan koreksi, arti beberapa input dalam satu hari, data minimum saat mulai di tengah siklus, rumus indikator, dan peran pengguna pada peluncuran awal. 

## **5. Rencana Peluncuran Awal** 

Peluncuran disarankan dilakukan secara bertahap agar manfaat dapat mulai dirasakan tanpa memperluas risiko. 

### **Tahap 1 — Penyelarasan dan pembuktian pada tenant uji** 

Tim pengembang menyelesaikan prioritas pada bagian sebelumnya. Seluruh skenario diuji pada tenant yang memang disediakan untuk pengujian, termasuk klasifikasi dari master, input kemarin, koreksi, penggunaan di tengah siklus, konsistensi web–Android, dan perhitungan indikator. 

### **Tahap 2 — Pemeriksaan penerimaan alur inti** 

AAPM dan tim pengembang melakukan pemeriksaan bersama dari awal sampai akhir: 

1. mengatur farm, kandang, siklus, dan klasifikasi telur; 

2. melakukan input lapangan melalui Android pada beberapa kandang; 

3. melengkapi satu data yang terlupa pada tanggal sebelumnya; 

4. memeriksa histori dan indikator pada web; 

5. melakukan satu koreksi yang sah dan memastikan riwayatnya; dan 

6. memastikan pengiriman ulang tidak menimbulkan data ganda. 

### **Tahap 3 — Peluncuran terbatas pada farm terpilih** 

Penggunaan awal difokuskan pada pencatatan produksi per kandang dan pemantauan indikator dasar. Pengelola menggunakan web untuk pengaturan dan pemeriksaan, sedangkan staf kandang menggunakan Android untuk input lapangan. Penerapan fungsi tambahan dilakukan hanya apabila alurnya sudah siap dan pelanggan memang membutuhkannya. 

### **Tahap 4 — Pemantauan dan evaluasi** 

Selama masa awal, ditinjau secara rutin kelengkapan input, kesesuaian histori, perbedaan web–Android, data ganda, koreksi, ketepatan indikator, kendala perangkat, dan kebutuhan bantuan pengguna. Hasilnya menjadi dasar keputusan untuk memperluas penggunaan atau melakukan penyempurnaan berikutnya. 

### **Kriteria kesiapan peluncuran** 

Peluncuran awal dapat dimulai setelah: 

kategori aktif pada Data Master benar-benar mengatur input web dan Android; 

- input tanggal sebelumnya dan koreksi bekerja dengan batas yang disepakati; kondisi awal farm yang sedang berjalan dapat dimasukkan dengan benar; histori dan indikator konsisten serta dapat dihitung kembali; tidak terbentuk data ganda karena klik atau pengiriman ulang; akses pengguna sesuai farm dan kandang yang ditugaskan; dan versi rilis, pembaruan, pencadangan, pemulihan, serta jalur bantuan telah disiapkan. 

Halaman 4 dari 5 

**AAPM** SYSTEM ANALYST 

MARKDOWN AUTHORITY - PDF RENDER-COPY 

<u>(¢ AAPM</u> 

