import dayjs from "dayjs";
import { GraphQLIntencaoCompraRepository } from "./GraphQLIntencaoCompraRepository";

export class VendaRepository extends GraphQLIntencaoCompraRepository {
    async add(venda: any) {
        const mutation = `
      mutation registrarVenda($input: RegistrarVendaInput!) {
        registrarVenda(input: $input)
      }
    `;

        const variables = {
            input: {
                intencaoId: venda.intencaoId,
                codUnitario: venda.codUnitario,
                valorVenda: venda.valorVenda,
                //efetivadoId: venda.efetivadoId, TODO: adicionar no back essa parte
                //observacao: venda.observacao,
                dataVenda: dayjs().toISOString()
            }
        };

        try {
            await this.executeGraphQL(mutation, variables);
        } catch (error) {
            console.error("Error saving IntencaoCompra to GraphQL:", error);
            throw error;
        } throw new Error('Method not implemented.');
    }
}