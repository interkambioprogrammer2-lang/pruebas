import { DispatchItem } from './DispatchItem';

export enum FairStatus {
  DRAFT = 'DRAFT',
  DISPATCHED = 'DISPATCHED',
  CLOSED = 'CLOSED',
}

export interface Fair {
  id?: number;
  name: string;
  place: string;
  startDate: string;
  endDate: string;
  responsible: { id: number; name: string };
  status: FairStatus;
  dispatchItems?: DispatchItem[];
}
export {};