export type VendorsListFilters = {
  search?: string;
  category?: string;
};

export type VendorListItem = {
  id: string;
  name: string;
  category: string;
  address: string | null;
  contactCount: number;
  purchaseOrderCount: number;
  createdAt: string;
};
