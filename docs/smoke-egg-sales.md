# Penjualan telur & stok gudang — smoke checklist

Gunakan setelah migrate (lokal atau Neon) untuk memverifikasi alur Egg Ledger per grade.

1. Pastikan ada grade telur aktif (TB/TR/TP di master grade) dan lokasi dengan kandang aktif. Item `Egg` lama sudah tidak dipakai (stok per grade).
2. Catat produksi dengan **beberapa grade > 0** (mobile atau admin) di kandang lokasi A.
3. Buka `/dashboard/inventory` → tab **Stok Telur**: stok per grade naik sesuai panen (mis. TB dan TR tampil terpisah).
4. Buka kartu stok grade (`/dashboard/inventory/eggs/[gradeId]`): saldo per lokasi + ledger `IN_HARVEST`.
5. Catat penjualan di `/dashboard/finance` → Penjualan: pilih lokasi A; **grade wajib** dipilih per baris; qty ≤ stok grade tsb.
6. Pastikan: order tersimpan, cashflow Income muncul, stok **grade tersebut** turun di tab Stok Telur (`OUT_SALES` di kartu stok).
7. Coba jual qty > stok grade → error “Stok telur tidak mencukupi untuk grade tersebut.”
8. Tanpa memilih grade → error “Grade telur wajib dipilih.”
9. Inventori saprodi (tab **Pakan & Saprodi**) **tidak** menampilkan telur; PO tidak menawarkan telur.
10. Koreksi produksi: update grade turun → kartu stok `OUT_ADJUSTMENT`; hapus produksi → stok grade kembali.

Lihat juga [`egg-ledger-architecture.md`](./egg-ledger-architecture.md) · [`egg-sales-stock.md`](./egg-sales-stock.md).