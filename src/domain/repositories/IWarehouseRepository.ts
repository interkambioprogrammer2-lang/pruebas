import { Warehouse } from '../entities/Warehouse';

export interface IWarehouseRepository {
  getAll(): Promise<Warehouse[]>;
}