import { BehaviorSubject, Observable, combineLatest } from "rxjs";
import { map } from "rxjs/operators";
import dayjs from "dayjs";
import { RegistroFilterInPort } from "@/application/inPort/RegistroFilterInPort";
import { Registro } from "../entities/Registro";
import { FinanceService } from "./FinanceService";

export interface FilterState {
    filtro_ano: string;
    filtro_meses: string;
    filtro_descricao: string;
    filtro_fonte: string;
    showPagos: boolean;
}

export class RegistroFilterService implements RegistroFilterInPort {
    private readonly registros$ = new BehaviorSubject<Registro[]>([]);

    private readonly filters$ = new BehaviorSubject<FilterState>({
        filtro_ano: dayjs().format("YYYY"),
        filtro_meses: "",
        filtro_descricao: "",
        filtro_fonte: "",
        showPagos: true,
    });

    private readonly filteredRegistros$: Observable<Registro[]>;

    constructor(initialData: Registro[] = []) {
        this.registros$.next(initialData);

        this.filteredRegistros$ = combineLatest([this.registros$, this.filters$]).pipe(
            map(([registros, filters]) => this.applyFiltering(registros, filters))
        );
    }

    setSourceData(data: Registro[]): void {
        this.registros$.next(data);
    }

    updateFilters(partialFilters: Partial<FilterState>): void {
        this.filters$.next({
            ...this.filters$.getValue(),
            ...partialFilters,
        });
    }

    getFiltered$(): Observable<Registro[]> {
        return this.filteredRegistros$;
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


    getFiltered(): Registro[] {
        let latest: Registro[] = [];
        this.filteredRegistros$.subscribe((val) => (latest = val)).unsubscribe();
        return latest;
    }

    getFilteredWithoutMonthFilter(): Registro[] {
        const currentFilters = this.filters$.getValue();
        const filtersWithoutMonth = { ...currentFilters, filtro_meses: "" };
        return this.applyFiltering(this.registros$.getValue(), filtersWithoutMonth);
    }

    filterBy(filter: string): void {
        this.updateFilters({ filtro_descricao: filter });
    }

    private applyFiltering(registros: Registro[], filters: FilterState): Registro[] {
        if (!registros || registros.length === 0) return [];

        let result = [...registros];
        const { filtro_ano, filtro_meses, filtro_descricao, filtro_fonte, showPagos } = filters;

        if (filtro_meses) {
            const selectedMonths = filtro_meses.split(";");
            const targetYear = dayjs(filtro_ano).year();

            result = result.filter(({ dtCorrente }) => {
                const date = dayjs(dtCorrente);
                return (
                    selectedMonths.includes(String(date.month() + 1)) &&
                    date.year() === targetYear
                );
            });
        }

        if (filtro_descricao) {
            const term = filtro_descricao.toLowerCase();
            const isWildcard = term.includes("*");
            const cleanTerm = term.replace(/\*/g, "");

            result = result.filter(({ descricao }) => {
                const descLower = (descricao || "").toLowerCase();
                if (isWildcard) {
                    return !descricao.includes(":") && descLower.includes(cleanTerm);
                }
                return descLower.includes(term);
            });
        }

        if (filtro_fonte) {
            const term = filtro_fonte.toLowerCase();
            result = result.filter(({ fonte }) =>
                (fonte || "").toLowerCase().includes(term)
            );
        }

        if (!showPagos) {
            result = result.filter(({ ehPago }) => !ehPago);
        }

        return result.sort((a, b) => {
            const valA = a.dtCorrente?.valueOf() || 0;
            const valB = b.dtCorrente?.valueOf() || 0;
            return valA - valB;
        });
    }

    getFinanceService(): FinanceService {
        return new FinanceService(this.getFiltered());
    }
}