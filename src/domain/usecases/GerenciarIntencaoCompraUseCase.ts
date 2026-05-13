import { IGerenciarIntencaoCompraUseCase, IIntencaoCompraRepository } from '@/application/outPort/IGerenciarIntencaoCompraUseCase';
import { IntencaoCompra } from '../entities/intencao-compra';
import {
    EfetivarCompraParcialInput,
    EfetivarCompraParcialOutput,
    RegistrarCotacaoInput,
    RegistrarVendaInput
} from './../../interfaces/intencao-compra';

export class GerenciarIntencaoCompraUseCase implements IGerenciarIntencaoCompraUseCase {
    constructor(private readonly repository: IIntencaoCompraRepository) { }

    /**
     * Inicializa um novo arquivo de produto no S3
     */
    public async criarNovaIntencao(id: string, produto: any): Promise<void> {
        const novaIntencao = new IntencaoCompra(id, produto);
        await this.repository.criarIntencao(novaIntencao);
    }

    /**
     * Adiciona uma pesquisa de preço ao histórico do arquivo
     */
    public async registrarCotacao(input: RegistrarCotacaoInput): Promise<IntencaoCompra> {
        const intencao = await this.obterIntencaoOuFalhar(input.intencaoId);

        intencao.registrarCotacao({
            data: new Date().toISOString(),
            valor: input.valor,
            contato: input.contato,
            link: input.link,
            observacao: input.observacao
        });

        await this.repository.criarIntencao(intencao);
        return intencao;
    }

    /**
     * Divide a cotação gerando os itens físicos no estoque
     */
    public async efetivarCompraParcial(input: EfetivarCompraParcialInput): Promise<EfetivarCompraParcialOutput> {
        const intencao = await this.obterIntencaoOuFalhar(input.intencaoId);

        intencao.efetivarCompraParcial(
            input.cotacaoId,
            input.quantidade,
            input.valorCompraUnitario,
            input.codigosUnitarios
        );

        await this.repository.criarIntencao(intencao);

        return {
            intencaoId: intencao.id,
            quantidadeEmEstoque: intencao.quantidadeEmEstoque,
            totalEfetivados: intencao.efetivados.length
        };
    }

    /**
     * Localiza um item físico por código e liquida a venda calculando lucro
     */
    public async registrarVenda(input: RegistrarVendaInput): Promise<IntencaoCompra> {
        const intencao = await this.obterIntencaoOuFalhar(input.intencaoId);

        intencao.registrarVenda(input.codUnitario, input.valorVenda, input.midias);

        await this.repository.criarIntencao(intencao);
        return intencao;
    }

    /**
     * Método auxiliar privado para reaproveitar a validação de busca
     */
    private async obterIntencaoOuFalhar(id: string): Promise<IntencaoCompra> {
        const intencao = await this.repository.buscarPorId(id);
        if (!intencao) {
            throw new Error(`Arquivo de intenção de compra com ID ${id} não existe.`);
        }
        return intencao;
    }
}
