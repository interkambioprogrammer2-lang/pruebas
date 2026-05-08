import { IFairRepository } from '../../domain/repositories/IFairRepository';

export class ConfirmDispatch {
  constructor(private fairRepo: IFairRepository) {}

  async execute(fairId: number): Promise<void> {
    await this.fairRepo.confirmDispatch(fairId);
  }
}
export {};