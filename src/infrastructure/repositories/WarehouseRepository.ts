import apiClient from '../http/apiClient';
import { IWarehouseRepository } from '../../domain/repositories/IWarehouseRepository';
import { Warehouse } from '../../domain/entities/Warehouse';

export class WarehouseRepository implements IWarehouseRepository {
  async getAll(): Promise<Warehouse[]> {
    const { data } = await apiClient.get<Warehouse[]>('/warehouses');
    return data;
  }
}