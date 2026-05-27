import { IIntencaoCompra, IProduto, ICotacao, IItemEfetivado, StatusItem } from "./../../interfaces/intencao-compra";
import { IItemBase } from "@/interfaces/baseItem"

export class IntencaoCompra implements IItemBase, IIntencaoCompra {
    public id: string;
    public produto: IProduto;
    public cotacoes: ICotacao[];
    public efetivados: IItemEfetivado[];
    idComum: string;
    dtEfetiva: string;

    constructor(id: string, produto: IProduto) {
        this.id = id;
        this.produto = produto;
        this.cotacoes = [];
        this.efetivados = [];
    }

    /**
     * Factory Method: Reconstrói a classe a partir de um JSON baixado do S3
     */
    public static fromJSON(json: IIntencaoCompra): IntencaoCompra {
        const instancia = new IntencaoCompra(json.id, json.produto);
        instancia.cotacoes = json.cotacoes;
        instancia.efetivados = json.efetivados;
        return instancia;
    }

    /**
     * Adiciona uma nova pesquisa/cotação de mercado
     */
    public registrarCotacao(cotacao: Omit<ICotacao, 'id'>): void {
        const novoId = `cot_${Math.random().toString(36).substring(2, 9)}`;
        this.cotacoes.push({ id: novoId, ...cotacao });
    }

    /**
     * REQUISITO: Divide a cotação gerando compras parciais ou totais no estoque
     */
    public efetivarCompraParcial(
        cotacaoId: string,
        quantidade: number,
        valorCompraUnitario: number,
        codigosUnitarios: string[],
        midiasPorItem?: string[][]
    ): void {
        const cotacaoExiste = this.cotacoes.some(c => c.id === cotacaoId);
        if (!cotacaoExiste) {
            throw new Error(`Cotação com ID ${cotacaoId} não foi encontrada.`);
        }

        if (codigosUnitarios.length !== quantidade) {
            throw new Error("A quantidade de códigos unitários deve ser igual à quantidade comprada.");
        }

        for (const [index, cod] of codigosUnitarios.entries()) {
            const codigoDuplicado = this.efetivados.some(i => i.codUnitario === cod);
            if (codigoDuplicado) {
                throw new Error(`O código unitário ${cod} já está cadastrado.`);
            }

            this.efetivados.push({
                codUnitario: cod,
                cotacaoId: cotacaoId,
                valorCompra: valorCompraUnitario,
                dataCompra: new Date().toISOString(),
                status: 'EM_ESTOQUE',
                venda: null,
                midias: midiasPorItem ? midiasPorItem[index] ?? [] : [],
                codigosUnitarios: [],
                idComum: "",
                dtEfetiva: "",
                id: undefined
            });
        }
    }

    /**
     * Registra a venda de uma unidade específica e calcula o lucro automaticamente
     */
    public registrarVenda(codUnitario: string, valorVenda: number, midiasVenda?: string[]): void {
        const item = this.efetivados.find(i => i.codUnitario === codUnitario);

        if (!item) {
            throw new Error(`Item com código ${codUnitario} não encontrado no estoque.`);
        }
        if (item.status !== 'EM_ESTOQUE') {
            throw new Error(`Item ${codUnitario} não está disponível para venda. Status: ${item.status}`);
        }

        const lucroLiquido = valorVenda - item.valorCompra;

        item.status = 'VENDIDO';
        item.venda = {
            valorVenda,
            dataVenda: new Date().toISOString(),
            lucroLiquido,
            midias: midiasVenda || [] 
        };
    }

    /**
     * GETTERS: Métricas financeiras calculadas em tempo de execução
     */
    public get lucroTotalAcumulado(): number {
        return this.efetivados
            .filter(i => i.status === 'VENDIDO' && i.venda)
            .reduce((total, i) => total + (i.venda?.lucroLiquido || 0), 0);
    }

    public get quantidadeEmEstoque(): number {
        return this.efetivados.filter(i => i.status === 'EM_ESTOQUE').length;
    }
}
