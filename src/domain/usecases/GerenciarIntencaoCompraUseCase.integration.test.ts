import { GerenciarIntencaoCompraUseCase } from './GerenciarIntencaoCompraUseCase';
import { IntencaoCompra } from '../entities/intencao-compra';
import { IIntencaoCompraRepository } from '@/application/outPort/IGerenciarIntencaoCompraUseCase';
import { IProduto, RegistrarCotacaoInput, EfetivarCompraParcialInput, RegistrarVendaInput } from '@/interfaces/intencao-compra';

class InMemoryIntencaoCompraRepository implements IIntencaoCompraRepository {
    private store = new Map<string, IntencaoCompra>();

    async buscarPorId(id: string): Promise<IntencaoCompra | null> {
        return this.store.get(id) ?? null;
    }

    async criarIntencao(intencao: IntencaoCompra): Promise<void> {
        this.store.set(intencao.id, intencao);
    }

    async buscarTodos(): Promise<IntencaoCompra[]> {
        return Array.from(this.store.values());
    }
}

describe('GerenciarIntencaoCompraUseCase Integration', () => {
    let repository: InMemoryIntencaoCompraRepository;
    let useCase: GerenciarIntencaoCompraUseCase;
    let produto: IProduto;

    beforeEach(() => {
        repository = new InMemoryIntencaoCompraRepository();
        useCase = new GerenciarIntencaoCompraUseCase(repository);

        produto = {
            nome: 'Smart TV',
            descricao: 'TV 55 polegadas',
            marca: 'Samsung',
            modelo: 'QLED',
            ano: 2026,
            ehNovo: true,
            observacao: 'Tela 4K'
        };
    });

    it('should execute the full purchase intention flow and persist state', async () => {
        await useCase.criarNovaIntencao('intencao-100', produto);

        const initial = await repository.buscarPorId('intencao-100');
        expect(initial).not.toBeNull();
        expect(initial?.produto).toEqual(produto);
        expect(initial?.cotacoes).toHaveLength(0);

        const cotacaoResult = await useCase.registrarCotacao({
            intencaoId: 'intencao-100',
            valor: 1800,
            contato: 'Fornecedor X',
            link: 'https://exemplo.com/tv',
            observacao: 'Excelente preço'
        });

        expect(cotacaoResult.cotacoes).toHaveLength(1);
        const cotacaoId = cotacaoResult.cotacoes[0].id;

        const efetivarResult = await useCase.efetivarCompraParcial({
            intencaoId: 'intencao-100',
            cotacaoId,
            quantidade: 2,
            valorCompraUnitario: 1800,
            codigosUnitarios: ['TV-001', 'TV-002'],
            status: ''
        });

        expect(efetivarResult.quantidadeEmEstoque).toBe(2);
        expect(efetivarResult.totalEfetivados).toBe(2);

        const afterEfetivar = await repository.buscarPorId('intencao-100');
        expect(afterEfetivar?.quantidadeEmEstoque).toBe(2);

        await useCase.registrarVenda({
            intencaoId: 'intencao-100',
            codUnitario: 'TV-001',
            valorVenda: 2200,
            midias: ['nota-fiscal.pdf']
        });

        const finalState = await repository.buscarPorId('intencao-100');
        expect(finalState).not.toBeNull();
        expect(finalState?.quantidadeEmEstoque).toBe(1);
        expect(finalState?.lucroTotalAcumulado).toBe(400);
        expect(finalState?.efetivados.find(item => item.codUnitario === 'TV-001')?.status).toBe('VENDIDO');
        expect(finalState?.efetivados.find(item => item.codUnitario === 'TV-001')?.venda?.midias).toEqual(['nota-fiscal.pdf']);
    });
});
