import { ItemBaseRepository } from "@/application/outPort/RegistroRepository";
import { ItemFilterBaseService } from "../services/ItemFilterBaseService";
import { IItemBase } from "@/interfaces/baseItem";

export abstract class ItemBaseUseCase<T extends IItemBase> {
    constructor(readonly repository: ItemBaseRepository<T>, readonly itemFilterBaseService: ItemFilterBaseService<T>) {

    }

    async getAll(): Promise<T[]> {
        const registros = await this.repository.getAll();
        this.itemFilterBaseService.setSourceData(registros);
        return registros;
    }

    abstract add(newRow: T): Promise<T[]>;

    async update(registros: T[]): Promise<void> {
        await this.repository.update(registros);
        const updated = await this.repository.getAll();
        this.itemFilterBaseService.setSourceData(updated);
    }

    abstract updateAllIdComum(idCommon: string, newValue: T): Promise<void>;

    async remove(id: string): Promise<T[]> {
        await this.repository.remove(id);
        const updated = await this.repository.getAll();
        this.itemFilterBaseService.setSourceData(updated);
        return updated;
    }
}