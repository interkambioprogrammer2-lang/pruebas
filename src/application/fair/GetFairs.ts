import { IFairRepository } from '../../domain/repositories/IFairRepository';
import { Fair } from '../../domain/entities/Fair';

export class GetFairs {
  constructor(private fairRepo: IFairRepository) {}

  async execute(): Promise<Fair[]> {
    return this.fairRepo.getAll();
  }
}