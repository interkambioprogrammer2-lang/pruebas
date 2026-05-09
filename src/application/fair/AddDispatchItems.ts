import { IFairRepository, DispatchItemRequest } from '../../domain/repositories/IFairRepository';
import { Fair } from '../../domain/entities/Fair';

export class AddDispatchItems {
  constructor(private fairRepo: IFairRepository) {}

  async execute(fairId: number, items: DispatchItemRequest[]): Promise<Fair> {
    return this.fairRepo.addDispatchItems(fairId, items);
  }
}
