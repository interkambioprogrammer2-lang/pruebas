import { IFairRepository } from '../../domain/repositories/IFairRepository';

export class DeleteFair {
    constructor(private fairRepo: IFairRepository) {}

    async execute(id: number): Promise<void> {
        await this.fairRepo.delete(id);
    }
}
export {};