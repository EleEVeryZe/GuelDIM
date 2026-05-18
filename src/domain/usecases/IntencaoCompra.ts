import { IIntencaoCompra } from "@/interfaces/intencao-compra";
import { ItemBaseUseCase } from "./ItemBaseUseCase";

export class IntencaoCompraUseCase extends ItemBaseUseCase<IIntencaoCompra> {
    constructor() {
        super();
    }
    add(newRow: IIntencaoCompra): Promise<IIntencaoCompra[]> {
        throw new Error("Method not implemented.");
    }
    updateAllIdComum(idCommon: string, newValue: IIntencaoCompra): Promise<void> {
        throw new Error("Method not implemented.");
    }

    
}