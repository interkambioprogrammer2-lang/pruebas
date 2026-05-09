import { Fair } from '../entities/Fair';


export interface DispatchItem {
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
  sentDate?: string;          // nuevo
  returnedDate?: string;      // nuevo
  notes?: string;
}

export interface DispatchItemRequest {
  bookId: number;
  quantitySent: number;
  salePrice: number;
  sourceLocationId: number;
}

export interface ReturnRequest {
  dispatchItemId: number;
  quantityReturned: number;
  quantitySoldManual?: number;
}

export interface CreateFairPayload {
  name: string;
  place: string;
  startDate: string;
  endDate: string;
  responsibleUserId: number;
}

export interface IFairRepository {
  getAll(): Promise<Fair[]>;
  getById(id: number): Promise<Fair>;
  create(fair: CreateFairPayload): Promise<Fair>;
  update(fairId: number, fair: CreateFairPayload): Promise<Fair>;
  addDispatchItems(fairId: number, items: DispatchItemRequest[]): Promise<Fair>;
  confirmDispatch(fairId: number): Promise<Fair>;
  recordReturn(fairId: number, returns: ReturnRequest[]): Promise<Fair>;
  getSendOutReport(fairId: number): Promise<Blob>;
  getFinalReport(fairId: number): Promise<Blob>;
}
