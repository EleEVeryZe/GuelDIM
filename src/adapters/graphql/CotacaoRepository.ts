import { GraphQLIntencaoCompraRepository } from "./GraphQLIntencaoCompraRepository";

export class CotacaoRepository extends GraphQLIntencaoCompraRepository {
    async add(input: any): Promise<any> {
        const mutation = `
      mutation RegistrarCotacao($input: CotacaoInput!) {
        registrarCotacao(input: $input) 
      }
    `;

        try {
            const response = await this.executeGraphQL(mutation, { input });
            return response.data;
        } catch (error) {
            console.error("Error registering cotacao:", error);
            throw error;
        }
    }

}