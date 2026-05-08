export interface DispatchItem {
  returnedDate: any;
  sentDate: any;
  id: number;
  bookId: number;
  sku: string;
  isbn: string;
  title: string;
  quantitySent: number;
  salePrice: number;
  sourceLocation: { id: number; name: string };
  quantityReturned?: number;
  quantitySoldManual?: number;
  notes?: string;
}