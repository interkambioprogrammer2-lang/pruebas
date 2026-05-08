import { Fair } from '../../domain/entities/Fair';
import { IFairRepository, CreateFairPayload } from '../../domain/repositories/IFairRepository';

export class CreateFair {
  constructor(private fairRepo: IFairRepository) {}

  async execute(fairData: CreateFairPayload): Promise<Fair> {
    return this.fairRepo.create(fairData);
  }
}
export {};