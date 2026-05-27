import { ItemBaseRepository } from "@/application/outPort/RegistroRepository";
import { Registro } from "@/interfaces/interfaces";
import { GraphQLIntencaoCompraRepository } from "../graphql/GraphQLIntencaoCompraRepository";
import { JsonIntencaoCompraRepository } from "../http/JsonIntencaoCompraRepository";
import { IIntencaoCompra } from "@/interfaces/intencao-compra";
import { IntencaoCompra } from "@/domain/entities/intencao-compra";

export class IntencaoCompraOutPortAdapter implements ItemBaseRepository<IIntencaoCompra> {
    graphQl: GraphQLIntencaoCompraRepository;
    JsonIntencao: JsonIntencaoCompraRepository;
    fileId: string;

    getAll(): Promise<IntencaoCompra[]> {
       return this.JsonIntencao.buscarTodos(); 
    }
    add(Items: IIntencaoCompra[]): Promise<void> {
        return;
    }
    update(Items: IIntencaoCompra[]): Promise<void> {
        throw new Error("Method not implemented.");
    }
    remove(ItemId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    updateAllIdComum(Items: IIntencaoCompra[]): Promise<void> {
        throw new Error("Method not implemented.");
    }
    getLastUpdate(): Promise<IIntencaoCompra> {
        throw new Error("Method not implemented.");
    }
}