import apiClient from '../http/apiClient';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';

export class UserRepository implements IUserRepository {
  async getAll(): Promise<User[]> {
    const { data } = await apiClient.get<User[]>('/users');
    return data;
  }
}