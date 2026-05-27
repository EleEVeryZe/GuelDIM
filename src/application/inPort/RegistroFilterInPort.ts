import { Observable } from "rxjs";
import { IItemBase } from "@/interfaces/baseItem";

export interface ItemBaseFilterInPort {
    /**
     * Retrieves the current snapshot of filtered Registro items synchronously.
     */
    getFiltered(): IItemBase[];

}