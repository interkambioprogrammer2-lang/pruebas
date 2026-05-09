import { DispatchItem } from './DispatchItem';


export enum FairStatus {
  OPEN = 'OPEN',
  DISPATCHED = 'DISPATCHED',
  CLOSED = 'CLOSED',
}

export interface Fair {
  id: number;
  name: string;
  place: string;
  startDate: string;
  endDate: string;
  responsible?: { id: number; name: string };   // puede seguir estando si se usa en otros lados
  responsibleUserId?: number;                    // ← NUEVO, para el detalle
  status: FairStatus;
  dispatchItems?: DispatchItem[];
}
export {};
