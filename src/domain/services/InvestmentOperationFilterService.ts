import { ItemFilterBaseService } from "./ItemFilterBaseService";
import { IItemBaseFilter } from "@/interfaces/baseItem";
import { InvestmentOperationFilter } from "@/interfaces/interfaces";
import { InvestmentOperation } from "../entities/Investment";

export class InvestmentOperationFilterService extends ItemFilterBaseService<InvestmentOperation> {
    constructor(initialData: InvestmentOperation[] = []) {
        const initialFilters: InvestmentOperationFilter = {
            id: '',
        };

        super(initialData, initialFilters);

        this.allItems = initialData;
        this.filters = initialFilters;
    }

    protected doFilter(items: InvestmentOperation[], filters: IItemBaseFilter): InvestmentOperation[] {
        throw new Error("Method not implemented.");
    }

}
