import { User } from '../entities/User';

export interface IUserRepository {
  getAll(): Promise<User[]>;
}

