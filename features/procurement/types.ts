export type PurchaseOrderStatus =
  | "Pending"
  | "PartiallyReceived"
  | "Received"
  | "Cancelled";

export type PurchaseOrderListItem = {
  id: string;
  vendorName: string;
  orderDate: string;
  status: PurchaseOrderStatus;
  totalAmount: number;
  itemCount: number;
  createdAt: string;
};

export type PurchaseOrderLineItem = {
  id: string;
  itemId: string;
  itemName: string;
  itemUnit: string;
  quantity: number;
  quantityReceived: number;
  unitPrice: number;
  lineTotal: number;
};

export type PurchaseOrderDetail = {
  id: string;
  vendorId: string;
  vendorName: string;
  orderDate: string;
  status: PurchaseOrderStatus;
  totalAmount: number;
  items: PurchaseOrderLineItem[];
  createdAt: string;
};

export type PurchaseOrderFormOptions = {
  vendors: { id: string; name: string }[];
  items: { id: string; name: string; unit: string }[];
  locations: { id: string; name: string }[];
};
