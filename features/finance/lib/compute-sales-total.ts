export type SalesOrderLineInput = {
  quantity: number;
  unitPrice: number;
};

/** Total penjualan = jumlah (quantity × harga satuan) semua baris. */
export function computeSalesOrderTotal(items: SalesOrderLineInput[]): number {
  return items.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
}
