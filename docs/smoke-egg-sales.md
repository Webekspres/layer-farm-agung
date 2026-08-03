# Penjualan telur & stok gudang — smoke checklist

Gunakan setelah migrate (lokal atau Neon) untuk memverifikasi alur Egg Ledger.

1. Pastikan ada Item tipe `Egg` (seed) dan lokasi dengan kandang aktif.
2. Catat produksi **TB > 0** (mobile atau admin) di kandang lokasi A.
3. Cek stok telur lokasi A naik (form penjualan Keuangan menampilkan “Stok telur tersedia”).
4. Catat penjualan di `/dashboard/finance` → Penjualan: pilih lokasi A, qty ≤ stok.
5. Pastikan: order tersimpan, cashflow Income muncul, stok telur lokasi A turun (`OUT_SALES` di Mutasi stok).
6. Coba jual qty > stok → error “Stok tidak mencukupi…”.
7. Inventori saprodi (`/dashboard/inventory`) **tidak** menampilkan item telur; PO tidak menawarkan telur.

Lihat juga [`egg-ledger-architecture.md`](./egg-ledger-architecture.md) · [`egg-sales-stock.md`](./egg-sales-stock.md).
