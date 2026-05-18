import { ICompra, IItemEfetivado } from "@/interfaces/intencao-compra";
import { GraphQLIntencaoCompraRepository } from "./GraphQLIntencaoCompraRepository";
import { ItemBaseRepository } from "@/application/outPort/RegistroRepository";
import { JsonIntencaoCompraRepository } from "../http/JsonIntencaoCompraRepository";

export class CompraRepository extends GraphQLIntencaoCompraRepository implements ItemBaseRepository<IItemEfetivado> {
    json = new JsonIntencaoCompraRepository();

    fileId: string;
    async getAll(): Promise<IItemEfetivado[]> {
        const itens = await this.json.buscarTodos();
        return itens.map(item => item.efetivados);
    }
    

    async add(efetivado: IItemEfetivado[]): Promise<void> {
        const mutation = `
      mutation efetivarCompraParcial($input: EfetivarCompraParcialInput!) {
        efetivarCompraParcial(input: $input) 
     }
    `;
        const variables = {
            input: efetivado
        };

        try {
            await this.executeGraphQL(mutation, variables);
        } catch (error) {
            console.error("Error creating new intencao:", error);
            throw error;
        }
    }
}