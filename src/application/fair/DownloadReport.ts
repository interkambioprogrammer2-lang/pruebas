import { IFairRepository } from '../../domain/repositories/IFairRepository';

export class DownloadReport {
  constructor(private fairRepo: IFairRepository) {}

  async sendOut(fairId: number): Promise<Blob> {
    return this.fairRepo.getSendOutReport(fairId);
  }

  async final(fairId: number): Promise<Blob> {
    return this.fairRepo.getFinalReport(fairId);
  }
}
export {};