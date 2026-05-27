import { ItemBaseRepository } from "@/application/outPort/RegistroRepository";
import { ItemFilterBaseService } from "../services/ItemFilterBaseService";
import { IItemBase } from "@/interfaces/baseItem";

type Listener = () => void;

export abstract class ItemBaseUseCase<T extends IItemBase> {
    private listeners = new Set<Listener>();

    constructor(readonly repository: ItemBaseRepository<T>, readonly itemFilterBaseService: ItemFilterBaseService<T>) {
        if (!repository || !itemFilterBaseService) throw new Error('Um useCase necessariamente deve conter um repositorio e um filterService');
     }

    subscribe(listener: Listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    notify() {
        this.listeners.forEach(listener => listener())
    }

    async getAll(): Promise<T[]> {
        const registros = await this.repository.getAll();
        this.itemFilterBaseService.allItems = registros;
        this.notify();
        return registros;
    }

    async add(item: T): Promise<void> {
        return this.repository.add([item]);
    }

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

    getLastUpdate(): Promise<T> {
        return this.repository.getLastUpdate();
    }
}