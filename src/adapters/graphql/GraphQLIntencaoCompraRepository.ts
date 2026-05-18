import { IIntencaoCompraRepository } from "@/application/outPort/IGerenciarIntencaoCompraUseCase";
import { IntencaoCompra } from "@/domain/entities/intencao-compra";

export abstract class GraphQLIntencaoCompraRepository implements IIntencaoCompraRepository {
  
  private readonly endpoint = "https://2qqqkwumjh.execute-api.sa-east-1.amazonaws.com/default/graphql";
  //private readonly endpoint = "http://localhost:3000/graphql";

  async buscarPorId(id: string): Promise<IntencaoCompra | null> {
    //Método não implementado
    return null;
  }


  async buscarTodos(): Promise<IntencaoCompra[]> {
    throw new Error("buscarTodos não é suportado pelo repositório GraphQL.");
  }

  protected async executeGraphQL(query: string, variables?: any): Promise<any> {
    const body: Record<string, any> = { query };
    if (variables) {
      body.variables = variables;
    }

    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed with status ${response.status}`);
    }

    const json = await response.json();

    if (json.errors) {
      throw new Error(`GraphQL error: ${JSON.stringify(json.errors)}`);
    }

    return json;
  }

}
