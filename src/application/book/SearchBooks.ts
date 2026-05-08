import { IBookRepository } from '../../domain/repositories/IBookRepository';
import { Book } from '../../domain/entities/Book';

export class SearchBooks {
  constructor(private bookRepo: IBookRepository) {}

  async execute(term: string): Promise<Book[]> {
    return this.bookRepo.search(term);
  }
}
export {};