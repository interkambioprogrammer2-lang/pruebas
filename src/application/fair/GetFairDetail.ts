import { IFairRepository } from '../../domain/repositories/IFairRepository';
import { Fair } from '../../domain/entities/Fair';

export class GetFairDetail {
  constructor(private fairRepo: IFairRepository) {}

  async execute(id: number): Promise<Fair> {
    return this.fairRepo.getById(id);
  }
}
export {};