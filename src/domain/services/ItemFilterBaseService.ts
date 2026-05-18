import { ItemBaseFilterInPort } from "@/application/inPort/RegistroFilterInPort";
import { IItemBase, IItemBaseFilter } from "@/interfaces/baseItem";
import dayjs from "dayjs";
import { BehaviorSubject, combineLatest, map, Observable } from "rxjs";

export abstract class ItemFilterBaseService<T extends IItemBase> implements ItemBaseFilterInPort {
    private readonly allItems$ = new BehaviorSubject<T[]>([]);
    private readonly filtered$: Observable<T[]>;

    constructor(initialData: T[], readonly filters$: BehaviorSubject<IItemBaseFilter>) {
        this.allItems$.next(initialData);

        this.filtered$ = combineLatest([this.allItems$, this.filters$]).pipe(
            map(([registros, filters]) => this.applyFiltering(registros, filters))
        );
    }


    protected applyFiltering(item: T[], filters: IItemBaseFilter): T[] {
        if (!item || item.length === 0) return [];
        return this.doFilter(item, filters);
    }

    getFiltered(): T[] {
        let latest: T[] = [];
        this.filtered$.subscribe((val) => (latest = val)).unsubscribe();
        return latest;
    }

    getFiltered$(): Observable<T[]> {
        return this.filtered$;
    }

    setSourceData(data: T[]): void {
        this.allItems$.next(data);
    }

    updateFilters(partialFilters: Partial<IItemBaseFilter>): void {
        this.filters$.next({
            ...this.filters$.getValue(),
            ...partialFilters,
        });
    }

    getLastUpdate() {
        const regs = this.getFiltered();

        if (!regs || regs.length === 0) {
            return null;
        }

        const latestRecord = regs.reduce((latest, current) => {
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



    protected abstract doFilter(item: T[], filters: IItemBaseFilter);

}