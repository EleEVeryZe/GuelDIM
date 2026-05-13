import { IIntencaoCompraRepository } from "@/application/outPort/IGerenciarIntencaoCompraUseCase";
import { IntencaoCompra } from "@/domain/entities/intencao-compra";
import { EfetivarCompraParcialInput, IIntencaoCompra } from "@/interfaces/intencao-compra";
import dayjs from "dayjs";

export class GraphQLIntencaoCompraRepository implements IIntencaoCompraRepository {
  async registrarVenda(venda: any) {
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
  private readonly endpoint = "https://2qqqkwumjh.execute-api.sa-east-1.amazonaws.com/default/graphql";
  //private readonly endpoint = "http://localhost:3000/graphql";

  async buscarPorId(id: string): Promise<IntencaoCompra | null> {
    //Método não implementado
    return null;
  }

  async criarIntencao(intencao: IIntencaoCompra): Promise<void> {
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

  async buscarTodos(): Promise<IntencaoCompra[]> {
    throw new Error("buscarTodos não é suportado pelo repositório GraphQL.");
  }

  private async executeGraphQL(query: string, variables?: any): Promise<any> {
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

  private mapToIntencaoCompra(data: any): IntencaoCompra {
    return IntencaoCompra.fromJSON({
      id: data.id,
      produto: data.produto,
      cotacoes: data.cotacoes || [],
      efetivados: data.efetivados || []
    });
  }

  async registrarCotacao(input: any): Promise<any> {
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

  async efetivarCompra(efetivado: EfetivarCompraParcialInput): Promise<void> {
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
