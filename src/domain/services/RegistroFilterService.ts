import dayjs from "dayjs";
import { Registro } from "../entities/Registro";
import { FinanceService } from "./FinanceService";
import { ItemFilterBaseService } from "./ItemFilterBaseService";
import { IItemBaseFilter } from "@/interfaces/baseItem";

export interface FilterState extends IItemBaseFilter {
    filtro_ano: string;
    filtro_meses: string;
    filtro_descricao: string;
    filtro_fonte: string;
    showPagos: boolean;
    filtro_categoria: string;
}

export class RegistroFilterService extends ItemFilterBaseService<Registro> {

    constructor(initialData: Registro[] = []) {
        const initialFilters: FilterState = {
            filtro_ano: dayjs().format("YYYY"),
            filtro_meses: "",
            filtro_descricao: "",
            filtro_fonte: "",
            showPagos: true,
            filtro_categoria: "",
        };

        super(initialData, initialFilters);

        this.allItems = initialData;
        this.filters = initialFilters;
    }

    getFilteredWithoutMonthFilter(): Registro[] {
        const filtersWithoutMonth = { ...this.filters, filtro_meses: "" };
        return this.doFilter(this.allItems, filtersWithoutMonth);
    }

    protected doFilter(registros: Registro[], filters: Partial<FilterState>): Registro[] {
        if (!registros || registros.length === 0) return [];

        let result = [...registros];
        const { filtro_ano, filtro_meses, filtro_descricao, filtro_fonte, showPagos, filtro_categoria } = filters;

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

        if (filtro_categoria) {
            const term = filtro_categoria.toLowerCase();
            result = result.filter(({ categoria }) =>
                (categoria || "").toLowerCase().includes(term)
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

    obterTotalSobreSalario(mes: string, ano: string): number {
        const financeiro = new FinanceService(this.doFilter(this.allItems, {
            filtro_meses: mes,
            filtro_ano: ano,
            filtro_descricao: "",
            filtro_fonte: "",
            showPagos: false,
            filtro_categoria: ""
        }));
        const totalSalario = financeiro.obterTotalSalario();

        const despesas = new FinanceService(this.getFiltered());
        const totalDespesas = despesas.obterMinhasDespesas();
        return (100 * (Number(totalDespesas) / Number(-1 * totalSalario)));
    }
}
