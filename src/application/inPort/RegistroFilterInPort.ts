import { Observable } from "rxjs";
import { IItemBase } from "@/interfaces/baseItem";

export interface ItemBaseFilterInPort {
    /**
     * Retrieves the current snapshot of filtered Registro items synchronously.
     */
    getFiltered(): IItemBase[];

    /**
     * Returns an Observable stream that emits the updated list of 
     * filtered Registro items whenever the dataset or filters change.
     */
    getFiltered$(): Observable<IItemBase[]>;

}