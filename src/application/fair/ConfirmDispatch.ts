import { IFairRepository } from '../../domain/repositories/IFairRepository';
import { Fair } from '../../domain/entities/Fair';

export class ConfirmDispatch {
  constructor(private fairRepo: IFairRepository) {}

  async execute(fairId: number): Promise<Fair> {
    return this.fairRepo.confirmDispatch(fairId);
  }
}
export {};

