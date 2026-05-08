import { IFairRepository, ReturnRequest } from '../../domain/repositories/IFairRepository';

export class RecordReturn {
  constructor(private fairRepo: IFairRepository) {}

  async execute(fairId: number, returns: ReturnRequest[]): Promise<void> {
    await this.fairRepo.recordReturn(fairId, returns);
  }
}
export {};