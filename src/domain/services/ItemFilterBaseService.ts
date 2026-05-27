import { ItemBaseFilterInPort } from "@/application/inPort/RegistroFilterInPort";
import { IItemBase, IItemBaseFilter } from "@/interfaces/baseItem";
import dayjs from "dayjs";

type Listener = () => void;

export abstract class ItemFilterBaseService<T extends IItemBase> implements ItemBaseFilterInPort {
    private listeners = new Set<Listener>();

    allItems: T[] = [];
    filtered: T[] = [];
    protected filters: IItemBaseFilter;

    constructor(initialData: T[], initialFilters: IItemBaseFilter) {
        this.allItems = initialData;
        this.filters = initialFilters;
    }

    subscribe(listener: Listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    notify() {
        this.listeners.forEach(listener => listener())
    }

    protected applyFiltering(items: T[], filters: IItemBaseFilter): T[] {
        if (!items || items.length === 0) return [];
        this.filtered = this.doFilter(items, filters);
        this.notify();
        return this.filtered;
    }

    getFiltered(): T[] {
        return this.filtered;
    }

    setSourceData(data: T[]): void {
        this.allItems = data;
    }

    getAllItems = (): T[] => this.allItems;

    updateFilters(partialFilters: Partial<IItemBaseFilter>): void {
        this.filters = {
            ...this.filters,
            ...partialFilters,
        };
        this.applyFiltering(this.allItems, this.filters);
    }

    getLastUpdate(): T | null {
        const regs = this.getFiltered();

        if (!regs || regs.length === 0) {
            return null;
        }

        const latestRecord = regs.reduce<T | null>((latest, current) => {
            if (!current.dtEfetiva) return latest;

            const currentDate = dayjs(current.dtEfetiva);

            if (!currentDate.isValid()) return latest;

            if (!latest) return current;

            const latestDate = dayjs(latest.dtEfetiva);

            if (currentDate.isAfter(latestDate)) {
                return current;
            }

            return latest;
        }, null);

        return latestRecord;
    }

    protected abstract doFilter(items: T[], filters: IItemBaseFilter): T[];
}
