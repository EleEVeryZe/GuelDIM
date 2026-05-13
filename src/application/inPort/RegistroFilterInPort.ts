import { Observable } from "rxjs";
import { Registro } from "@/domain/entities/Registro";

export interface RegistroFilterInPort {
    /**
     * Retrieves the current snapshot of filtered Registro items synchronously.
     */
    getFiltered(): Registro[];

    /**
     * Returns an Observable stream that emits the updated list of 
     * filtered Registro items whenever the dataset or filters change.
     */
    getFiltered$(): Observable<Registro[]>;

    /**
     * Triggers a filtering action by a raw string input.
     * Typically maps to a search term matching descriptions or names.
     */
    filterBy(filter: string): void;
}