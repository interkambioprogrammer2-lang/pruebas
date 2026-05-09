import { IFairRepository, CreateFairPayload } from '../../domain/repositories/IFairRepository';
import { Fair } from '../../domain/entities/Fair';

export class UpdateFair {
  constructor(private fairRepo: IFairRepository) {}

  private normalizeDate(value: string): string {
    if (!value) return value;
    return value.includes('T') ? value.split('T')[0] : value;
  }

  async execute(id: number, fairData: CreateFairPayload): Promise<Fair> {
    const payload: CreateFairPayload = {
      name: fairData.name.trim(),
      place: fairData.place.trim(),
      startDate: this.normalizeDate(fairData.startDate),
      endDate: this.normalizeDate(fairData.endDate),
      responsibleUserId: Number(fairData.responsibleUserId),
    };

    return this.fairRepo.update(id, payload);
  }
}
export {};
