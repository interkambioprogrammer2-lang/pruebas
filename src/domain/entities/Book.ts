export interface Book {
  id: number;
  sku: string;
  title: string;
  isbn: string;
  price: number;   // precio sugerido (selling_price)
}

export interface StockLocation {
  id: number;
  warehouseId: number;
  warehouseName: string;
  bookcase: number;
  bookcaseFloor: number;
  stock: number;
  condition: string;
}

export interface BookSearchResultItem {
  id: number;
  sku: string;
  title: string;
  isbn: string;
  price: string;                         // precio como string (ej. "114.00")
  stockLocations: StockLocation[];
}