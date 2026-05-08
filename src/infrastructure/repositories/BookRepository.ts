import apiClient from '../http/apiClient';
import { IBookRepository } from '../../domain/repositories/IBookRepository';
import { Book } from '../../domain/entities/Book';

export class BookRepository implements IBookRepository {
  async search(term: string): Promise<Book[]> {
    const { data } = await apiClient.get<Book[]>('/books/search', {
      params: { term },
    });
    return data;
  }
}