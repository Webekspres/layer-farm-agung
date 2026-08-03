/**
 * Generates: docs/PANDUAN PENGGUNAAN WEB & MOBILE APPS AAPM.docx
 * Run: bun run docs:panduan
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";

const OUTPUT = join(
  import.meta.dir,
  "..",
  "docs",
  "PANDUAN PENGGUNAAN WEB & MOBILE APPS AAPM.docx",
);

const DOC_VERSION = "1.0";
const DOC_DATE = "Juli 2026";

function h1(text: string) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 200 } });
}

function h2(text: string) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 160 } });
}

function h3(text: string) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 120 } });
}

function p(text: string, opts?: { bold?: boolean; italic?: boolean }) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [
      new TextRun({
        text,
        bold: opts?.bold,
        italics: opts?.italic,
      }),
    ],
  });
}

function bullet(text: string) {
  return new Paragraph({
    text,
    bullet: { level: 0 },
    spacing: { after: 80 },
  });
}

function numbered(text: string, reference: string) {
  return new Paragraph({
    text,
    numbering: { reference, level: 0 },
    spacing: { after: 80 },
  });
}

function table(headers: string[], rows: string[][]) {
  const headerRow = new TableRow({
    children: headers.map(
      (h) =>
        new TableCell({
          width: { size: 100 / headers.length, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })] })],
        }),
    ),
  });
  const dataRows = rows.map(
    (row) =>
      new TableRow({
        children: row.map(
          (cell) =>
            new TableCell({
              width: { size: 100 / headers.length, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ text: cell })],
            }),
        ),
      }),
  );
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows],
  });
}

function spacer() {
  return new Paragraph({ text: "", spacing: { after: 120 } });
}

const numbering = {
  config: [
    {
      reference: "workflow-admin",
      levels: [
        {
          level: 0,
          format: "decimal" as const,
          text: "%1.",
          alignment: AlignmentType.START,
        },
      ],
    },
    {
      reference: "workflow-mobile",
      levels: [
        {
          level: 0,
          format: "decimal" as const,
          text: "%1.",
          alignment: AlignmentType.START,
        },
      ],
    },
    {
      reference: "setup-superadmin",
      levels: [
        {
          level: 0,
          format: "decimal" as const,
          text: "%1.",
          alignment: AlignmentType.START,
        },
      ],
    },
  ],
};

const children: (Paragraph | Table)[] = [
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [new TextRun({ text: "Layered Farm Agung (AAPM)", bold: true, size: 36 })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
    children: [
      new TextRun({
        text: "PANDUAN PENGGUNAAN WEB & MOBILE APPS",
        bold: true,
        size: 28,
      }),
    ],
  }),
  p(`Versi dokumen: ${DOC_VERSION} · ${DOC_DATE}`, { italic: true }),
  p(
    "Dokumen ini menjelaskan cara menggunakan aplikasi admin web dan aplikasi mobile lapangan untuk manajemen peternakan ayam petelur terintegrasi.",
  ),
  spacer(),

  h1("1. Ringkasan Produk"),
  p(
    "AAPM terdiri dari dua aplikasi yang saling terhubung melalui server pusat (backend). Data yang diinput di lapangan langsung tersimpan di server dan dapat direkap oleh admin di web.",
  ),
  table(
    ["Aplikasi", "Pengguna", "Fungsi utama"],
    [
      ["Admin Web (browser)", "Superadmin, Admin cabang", "Master data, inventori, keuangan, rekap operasional, jadwal vaksin"],
      ["Mobile (Android)", "Staff kandang", "Input harian produksi, pakan, populasi, pengobatan, vaksinasi"],
    ],
  ),
  spacer(),
  p("Semua tanggal operasional mengikuti zona waktu WIB (Asia/Jakarta).", { italic: true }),

  h1("2. Peran Pengguna"),
  table(
    ["Peran", "Aplikasi", "Hak akses utama"],
    [
      ["Superadmin", "Web", "Kelola tenant, katalog global (strain, grade telur), lintas cabang"],
      ["Admin cabang", "Web", "Master data tenant, inventori, keuangan, program & jadwal vaksin"],
      ["Staff kandang", "Mobile", "Input operasional kandang yang ditugaskan; tidak mengelola master data"],
    ],
  ),
  spacer(),
  p(
    "Catatan: Staff hanya melihat kandang yang ditugaskan ke akunnya. Admin dan superadmin menggunakan dashboard web; staff menggunakan aplikasi mobile sebagai alat utama kerja lapangan.",
  ),

  h1("3. Glosarium"),
  bullet("TB — Telur bagus (butir)"),
  bullet("TR — Telur retak (butir)"),
  bullet("TP — Telur pecah (butir)"),
  bullet("HDP — Persentase produksi telur bagus terhadap populasi aktif"),
  bullet("FCR — Feed Conversion Ratio; efisiensi pakan terhadap produksi telur"),
  bullet("Siklus kandang — Periode populasi ayam aktif di satu kandang, dari tanggal mulai hingga ditutup"),
  bullet("Saprodi — Bahan pendukung: pakan, obat, vaksin, vitamin"),
  bullet("Pending (vaksin) — Jadwal vaksin yang sudah dijadwalkan tetapi belum diselesaikan"),

  h1("4. Panduan Admin Web"),
  p("Buka aplikasi admin melalui browser (contoh: URL staging/production dari tim IT). Login dengan username atau email dan password yang diberikan admin."),

  h2("4.1 Menu Operasional"),
  h3("Dashboard"),
  bullet("Menampilkan ringkasan KPI: produksi telur hari ini, populasi aktif, HDP, FCR, stok kritis, pendapatan."),
  bullet("Pusat peringatan menampilkan alert otomatis (HDP rendah, mortalitas, stok minimum)."),
  bullet("Grafik produksi 30 hari dan perbandingan HDP vs target."),

  h3("Input harian"),
  bullet("Halaman rekap operasional per tanggal — bukan tempat input lapangan."),
  bullet("Empat tab: Telur (TB/TR/TP + HDP%), Pakan, Populasi, Pengobatan."),
  bullet("Data diisi oleh staff melalui mobile; admin memantau dan memverifikasi rekap di sini."),
  bullet("Gunakan filter tanggal di toolbar untuk melihat hari tertentu."),

  h3("Vaksinasi"),
  bullet("Jadwal operasional vaksin per kandang dan tanggal kalender."),
  bullet("Buat jadwal manual: pilih kandang, item vaksin, tanggal, dan catatan opsional."),
  bullet("Selesaikan atau batalkan jadwal; stok vaksin terpotong otomatis saat diselesaikan (OUT_VACCINE)."),
  bullet("Jadwal yang digenerate dari Program vaksin juga muncul di sini dengan status Pending."),

  h3("Program vaksin"),
  bullet("Template master berdasarkan umur ayam (hari) sejak mulai siklus."),
  bullet("Setiap langkah: hari ke-N, item vaksin/vitamin, patogen opsional, tipe formulasi opsional."),
  bullet("Saat siklus kandang baru dimulai, sistem otomatis membuat jadwal Pending dari program aktif."),
  bullet("Program per strain dipilih jika ada; jika tidak, dipakai program default tenant."),
  bullet("Tombol Generate ulang tersedia di detail kandang (idempotent — tidak menduplikasi jadwal Pending yang sama)."),
  p("Perbedaan penting:", { bold: true }),
  bullet("Program vaksin = template umur → menghasilkan jadwal."),
  bullet("Vaksinasi = kalender operasional → eksekusi dan pencatatan pelaksanaan."),

  h2("4.2 Menu Stok & Pembelian"),
  h3("Inventori"),
  bullet("Kelola item saprodi: pakan, obat, vaksin, vitamin, dan lainnya."),
  bullet("Lihat stok per lokasi; buka detail item untuk kartu stok dan penyesuaian manual."),

  h3("Mutasi stok"),
  bullet("Ledger global semua perubahan stok (masuk/keluar) dengan filter."),
  bullet("Jenis mutasi otomatis: IN_PURCHASE, OUT_FEED, OUT_VACCINE, OUT_MEDICAL, OUT_SALES, IN_HARVEST (dari panen TB)."),

  h3("Pesanan pembelian"),
  bullet("Buat PO ke vendor, terima barang sebagian atau penuh."),
  bullet("Stok bertambah sesuai jumlah diterima; pengeluaran kas tercatat saat penerimaan."),

  h2("4.3 Keuangan"),
  bullet("Tab Arus kas: pemasukan dan pengeluaran per periode."),
  bullet("Tab Penjualan: catat penjualan telur; stok telur (TB) terpotong otomatis."),
  bullet("Tab Pelanggan: kelola data pembeli."),

  h2("4.4 Data Master"),
  h3("Lokasi"),
  bullet("Tempat fisik peternakan (gudang, kandang area, dll.)."),

  h3("Kandang"),
  bullet("Buat kandang: nama, lokasi, strain, kapasitas, QR code."),
  bullet("Tugaskan staff kandang ke kandang tertentu."),
  bullet("Mulai siklus: isi tanggal mulai dan populasi awal → jadwal vaksin dari program otomatis digenerate."),
  bullet("Pantau metrik siklus: populasi, umur, HDP, FCR, mutasi, kesehatan."),
  bullet("Tutup siklus saat kandang kosong atau selesai periode."),

  h3("Strain (superadmin)"),
  bullet("Katalog strain ayam global."),
  bullet("Atur target HDP dan FCR per umur (minggu) — dipakai perbandingan di dashboard."),

  h3("Grade telur (superadmin)"),
  bullet("Katalog grade/label harga telur (opsional untuk penjualan)."),

  h3("Vendor"),
  bullet("Data pemasok pakan, obat, dan bahan lain untuk PO."),

  h2("4.5 Administrasi"),
  h3("Tenant (superadmin)"),
  bullet("Buat dan kelola cabang/tenant peternakan."),
  bullet("Pilih tenant aktif di header kanan atas untuk melihat data cabang tersebut."),

  h3("Pengguna"),
  bullet("Buat akun admin dan staff; atur password awal."),
  bullet("Reset password dari menu aksi di tabel pengguna."),

  h3("Peran & Akses"),
  bullet("Kelola role dan permission (hak akses menu)."),

  h3("Profil"),
  bullet("Ubah password sendiri."),
  bullet("Admin cabang: upload logo dan nama brand tenant."),

  h2("4.6 Alur Kerja Admin (disarankan)"),
  numbered("Superadmin membuat tenant, admin cabang, dan staff kandang.", "workflow-admin"),
  numbered("Admin membuat lokasi, kandang, assign staff, dan mulai siklus aktif.", "workflow-admin"),
  numbered("Admin menyiapkan program vaksin aktif (atau gunakan program default).", "workflow-admin"),
  numbered("Admin mengelola inventori: item, PO, penerimaan barang.", "workflow-admin"),
  numbered("Staff mengisi data harian di mobile; admin memantau rekap di Input harian dan Dashboard.", "workflow-admin"),
  numbered("Admin mencatat penjualan dan memantau keuangan.", "workflow-admin"),

  h1("5. Panduan Aplikasi Mobile"),
  p("Aplikasi mobile ditujukan untuk staff kandang di lapangan. Install APK yang dibagikan tim IT (preview atau production)."),

  h2("5.1 Login"),
  bullet("Buka aplikasi Layered Farm Agung."),
  bullet("Masukkan username dan password staff (contoh uji: staff.kandang — ganti di produksi)."),
  bullet("Hanya akun dengan peran staff yang dapat login di mobile."),
  bullet("Pastikan HP terhubung internet dan backend dapat diakses (HTTPS)."),

  h2("5.2 Navigasi Utama (3 Tab)"),
  table(
    ["Tab", "Fungsi"],
    [
      ["Kandang", "Daftar kandang yang ditugaskan; tarik ke bawah untuk refresh"],
      ["Input harian", "Scan QR kandang atau pilih dari daftar"],
      ["Profil", "Data akun, mode offline, sinkronisasi antrean, logout"],
    ],
  ),
  spacer(),

  h2("5.3 Masuk ke Kandang"),
  bullet("Dari tab Input harian: tap Scan QR, arahkan kamera ke QR di kandang."),
  bullet("Atau pilih kandang dari daftar."),
  bullet("Layar Hub kandang menampilkan nama, lokasi, strain, dan populasi aktif."),

  h2("5.4 Hub Kandang — Menu Lanjutkan"),
  h3("Form input harian"),
  bullet("Satu formulasi terpadu dengan empat bagian (accordion):"),
  bullet("Produksi — isi TB, TR, TP (butir). Total dihitung otomatis."),
  bullet("Konsumsi pakan — pilih item pakan dari inventori, isi jumlah (kg)."),
  bullet("Mutasi populasi — Masuk, Mati, Afkir, atau Pindah antar kandang."),
  bullet("Pengobatan — gejala, populasi sakit, obat/vitamin (dari inventori atau teks), dosis."),
  bullet("Tanggal rekam = hari ini (WIB). Kematian dicatat di Mutasi populasi, bukan di pengobatan."),

  h3("Riwayat kandang"),
  bullet("Lihat semua entri per tanggal; navigasi hari sebelumnya/berikutnya."),
  bullet("Edit entri produksi, pakan, populasi, atau pengobatan yang sudah tersimpan."),

  h3("Vaksinasi"),
  bullet("Daftar jadwal Pending untuk kandang ini."),
  bullet("Tap jadwal → isi jumlah pemakaian (dosis/unit item) dan catatan opsional."),
  bullet("Selesaikan → stok vaksin terpotong di server."),

  h2("5.5 Mode Offline"),
  bullet("Di tab Profil: unduh data offline saat masih online (kandang, item, riwayat hari ini)."),
  bullet("Saat tidak ada sinyal, input tetap bisa disimpan ke antrean lokal."),
  bullet("Saat online kembali: tap Sinkronkan sekarang di Profil untuk mengirim antrean ke server."),
  bullet("Logout dengan antrean belum sync akan memperingatkan; data tetap tersimpan di perangkat untuk akun tersebut."),

  h2("5.6 Alur Kerja Staff Harian"),
  numbered("Login dan pastikan data offline sudah diunduh (jika bekerja di area sinyal lemah).", "workflow-mobile"),
  numbered("Buka kandang via scan QR atau daftar.", "workflow-mobile"),
  numbered("Isi Form input harian: produksi, pakan, mutasi, pengobatan sesuai kondisi hari itu.", "workflow-mobile"),
  numbered("Selesaikan jadwal vaksin Pending jika ada.", "workflow-mobile"),
  numbered("Cek Riwayat bila perlu koreksi data.", "workflow-mobile"),
  numbered("Sinkronkan antrean sebelum pulang jika sempat offline.", "workflow-mobile"),

  h1("6. Panduan Superadmin — Setup Awal"),
  p("Bagian ini untuk operator platform yang menyiapkan sistem pertama kali."),
  numbered("Login sebagai superadmin.", "setup-superadmin"),
  numbered("Buat tenant (cabang peternakan) di menu Tenant.", "setup-superadmin"),
  numbered("Buat akun admin cabang dan staff kandang di menu Pengguna.", "setup-superadmin"),
  numbered("Pastikan strain dan grade telur global sudah ada (menu Strain, Grade telur).", "setup-superadmin"),
  numbered("Pilih tenant aktif di header, lalu minta admin cabang melengkapi master data.", "setup-superadmin"),
  numbered("Untuk URL production/staging, koordinasikan dengan tim IT (deploy Vercel + database).", "setup-superadmin"),
  spacer(),
  p("Akun demo (lingkungan uji saja — ganti password di produksi):", { bold: true }),
  table(
    ["Username", "Password", "Peran"],
    [
      ["superadmin", "password123", "Superadmin"],
      ["admin.cabang", "password123", "Admin tenant"],
      ["staff.kandang", "password123", "Staff lapangan (mobile)"],
    ],
  ),

  h1("7. Pertanyaan Umum (FAQ)"),
  h3("Login web gagal"),
  bullet("Periksa username/email dan password. Hubungi admin untuk reset password."),

  h3("Staff tidak melihat kandang di mobile"),
  bullet("Pastikan staff sudah ditugaskan ke kandang di halaman detail kandang (web admin)."),
  bullet("Pastikan kandang berada di tenant yang sama dengan akun staff."),

  h3("Jadwal vaksin kosong setelah mulai siklus"),
  bullet("Periksa apakah ada program vaksin aktif untuk tenant/strain."),
  bullet("Gunakan tombol Generate jadwal vaksin dari program di detail kandang."),

  h3("Input mobile gagal / error merah"),
  bullet("Baca pesan error (Bahasa Indonesia) dari server."),
  bullet("Periksa koneksi internet dan URL backend."),
  bullet("Jika offline, data masuk antrean — sinkronkan saat online."),

  h3("Stok tidak sesuai"),
  bullet("Cek Mutasi stok di web admin untuk melihat riwayat IN/OUT."),
  bullet("Pastikan PO sudah diterima dan vaksin/pakan sudah diselesaikan di jadwal yang benar."),

  h1("8. Penutup"),
  p(
    "Panduan ini mencerminkan fitur AAPM per Juli 2026. Untuk pertanyaan teknis deployment atau penyesuaian fitur, hubungi tim pengembang Webekspres.",
  ),
  p(`Dokumen: PANDUAN PENGGUNAAN WEB & MOBILE APPS AAPM · Versi ${DOC_VERSION}`, {
    italic: true,
  }),
];

const doc = new Document({
  numbering,
  sections: [{ children }],
});

async function main() {
  const buffer = await Packer.toBuffer(doc);
  await mkdir(dirname(OUTPUT), { recursive: true });
  await writeFile(OUTPUT, buffer);
  console.log(`Panduan berhasil dibuat:\n${OUTPUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
