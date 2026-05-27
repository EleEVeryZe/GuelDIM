import { IIntencaoCompraRepository } from "../../application/outPort/IGerenciarIntencaoCompraUseCase";
import { IntencaoCompra } from "../../domain/entities/intencao-compra";

export class JsonIntencaoCompraRepository implements IIntencaoCompraRepository {
  private readonly endpoint = "https://spikai.s3.sa-east-1.amazonaws.com/database.json";
  //private readonly endpoint = "http://localhost:3001/database.json";
  private cache?: IntencaoCompra[];

  async buscarPorId(id: string): Promise<IntencaoCompra | null> {
    const all = await this.buscarTodos();
    return all.find((item) => item.id === id) ?? null;
  }

  async buscarTodos(): Promise<IntencaoCompra[]> {
    if (this.cache) {
      return this.cache;
    }

    const timestamp = new Date().getTime();
    const url = `${this.endpoint}?v=${timestamp}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`JSON fetch failed with status ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("Invalid JSON database format: expected an array of purchase intentions.");
    }

    const parsed = data.map((item: any) =>
      IntencaoCompra.fromJSON({
        id: item.id,
        produto: item.produto,
        cotacoes: item.cotacoes || [],
        efetivados: item.efetivados || [],
        idComum: "",
        dtEfetiva: ""
      })
    );

    this.cache = parsed;
    return parsed;
  }

  async criarIntencao(intencao: IntencaoCompra): Promise<void> {
    throw new Error("Salvar não é suportado pelo repositório JSON remoto.");
  }
}
