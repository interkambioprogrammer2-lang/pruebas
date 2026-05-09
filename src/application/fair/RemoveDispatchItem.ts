import { IFairRepository } from '../../domain/repositories/IFairRepository';

export class RemoveDispatchItem {
    constructor(private fairRepo: IFairRepository) {}
    async execute(fairId: number, itemId: number): Promise<void> {
        await this.fairRepo.removeDispatchItem(fairId, itemId);
    }
}
export {};