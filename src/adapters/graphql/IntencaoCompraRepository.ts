import { IIntencaoCompra } from "@/interfaces/intencao-compra";
import { GraphQLIntencaoCompraRepository } from "./GraphQLIntencaoCompraRepository";

export class IntencaoCompraRepository extends GraphQLIntencaoCompraRepository {
    async add(intencao: IIntencaoCompra): Promise<void> {
        const mutation = `
      mutation criarIntencao($input: ProdutoInput!) {
        criarIntencao(input: $input)
      }
    `;

        const variables = {
            input: {
                nome: intencao.produto.nome,
                descricao: intencao.produto.descricao,
                marca: intencao.produto.marca,
                modelo: intencao.produto.modelo,
                ano: intencao.produto.ano,
                observacao: intencao.produto.observacao || "",
                ehNovo: intencao.produto.ehNovo,
                midias: intencao.produto.midias || []
            }
        };

        try {
            await this.executeGraphQL(mutation, variables);
        } catch (error) {
            console.error("Error saving IntencaoCompra to GraphQL:", error);
            throw error;
        }
    }


}