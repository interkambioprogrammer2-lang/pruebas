import { IFairRepository, ReturnRequest } from '../../domain/repositories/IFairRepository';
import { Fair } from '../../domain/entities/Fair';

export class RecordReturn {
  constructor(private fairRepo: IFairRepository) {}

  async execute(fairId: number, returns: ReturnRequest[]): Promise<Fair> {
    return this.fairRepo.recordReturn(fairId, returns);
  }
}
export {};
