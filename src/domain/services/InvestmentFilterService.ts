import { ItemFilterBaseService } from "./ItemFilterBaseService";
import { IItemBaseFilter } from "@/interfaces/baseItem";
import { Investment, InvestmentFilter } from "@/interfaces/interfaces";

export class InvestmentFilterService extends ItemFilterBaseService<Investment> {
   constructor(initialData: Investment[] = []) {
        const initialFilters: InvestmentFilter = {
            id: '',
            name: '',
            total: '',
            date_mes: '',
            date_ano: '',
            category: '',
            comment: '',
        };

        super(initialData, initialFilters);

        this.allItems = initialData;
        this.filters = initialFilters;
    }

    protected doFilter(items: Investment[], filters: IItemBaseFilter): Investment[] {
        throw new Error("Method not implemented.");
    }
 
}
