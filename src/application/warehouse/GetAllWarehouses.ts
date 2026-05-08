import { IWarehouseRepository } from '../../domain/repositories/IWarehouseRepository';
import { Warehouse } from '../../domain/entities/Warehouse';

export class GetAllWarehouses {
  constructor(private warehouseRepo: IWarehouseRepository) {}

  async execute(): Promise<Warehouse[]> {
    return this.warehouseRepo.getAll();
  }
}