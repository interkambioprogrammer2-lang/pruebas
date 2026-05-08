import { IFairRepository, DispatchItemRequest } from '../../domain/repositories/IFairRepository';

export class AddDispatchItems {
  constructor(private fairRepo: IFairRepository) {}

  async execute(fairId: number, items: DispatchItemRequest[]): Promise<void> {
    await this.fairRepo.addDispatchItems(fairId, items);
  }
}