import { Book } from '../entities/Book';

export interface IBookRepository {
  search(term: string): Promise<Book[]>;
}