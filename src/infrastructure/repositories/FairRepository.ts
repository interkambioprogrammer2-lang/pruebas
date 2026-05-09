import apiClient from '../http/apiClient';
import {
  IFairRepository,
  DispatchItemRequest,
  ReturnRequest,
  CreateFairPayload
} from '../../domain/repositories/IFairRepository';
import { Fair } from '../../domain/entities/Fair';

export class FairRepository implements IFairRepository {
  async getAll(): Promise<Fair[]> {
    try {
      const { data } = await apiClient.get<Fair[]>('/fairs');
      return data;
    } catch (error) {
      console.error('Error fetching fairs:', error);
      throw error;
    }
  }

  async getById(id: number): Promise<Fair> {
    const { data } = await apiClient.get<Fair>(`/fairs/${id}`);
    return data;
  }

  async create(fair: CreateFairPayload): Promise<Fair> {
    const { data } = await apiClient.post<Fair>('/fairs', fair);
    return data;
  }

  async update(id: number, fair: CreateFairPayload): Promise<Fair> {
    const { data } = await apiClient.put<Fair>(`/fairs/${id}`, fair);
    return data;
  }

  async addDispatchItems(fairId: number, items: DispatchItemRequest[]): Promise<Fair> {
    const { data } = await apiClient.post<Fair>(`/fairs/${fairId}/dispatch-items`, items);
    return data;
  }

  async confirmDispatch(fairId: number): Promise<Fair> {
    const { data } = await apiClient.put<Fair>(`/fairs/${fairId}/confirm-dispatch`);
    return data;
  }

  async recordReturn(fairId: number, returns: ReturnRequest[]): Promise<Fair> {
    const { data } = await apiClient.put<Fair>(`/fairs/${fairId}/record-return`, returns);
    return data;
  }

  async getSendOutReport(fairId: number): Promise<Blob> {
    const response = await apiClient.get(`/fairs/${fairId}/report/sendout`, {
      responseType: 'blob',
    });
    return response.data;
  }

  async getFinalReport(fairId: number): Promise<Blob> {
    const response = await apiClient.get(`/fairs/${fairId}/report/final`, {
      responseType: 'blob',
    });
    return response.data;
  }
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/fairs/${id}`);
  }
  async removeDispatchItem(fairId: number, itemId: number): Promise<void> {
    await apiClient.delete(`/fairs/${fairId}/dispatch-items/${itemId}`);
  }
}