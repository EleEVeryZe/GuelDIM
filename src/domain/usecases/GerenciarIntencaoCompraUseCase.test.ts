import { GerenciarIntencaoCompraUseCase } from './GerenciarIntencaoCompraUseCase';
import { IntencaoCompra } from '../entities/intencao-compra';
import { IIntencaoCompraRepository } from '@/application/outPort/IGerenciarIntencaoCompraUseCase';
import { IProduto, RegistrarCotacaoInput, EfetivarCompraParcialInput, RegistrarVendaInput } from '@/interfaces/intencao-compra';

type MockRepository = {
    buscarPorId: jest.Mock<Promise<IntencaoCompra | null>, [string]>;
    salvar: jest.Mock<Promise<void>, [IntencaoCompra]>;
    buscarTodos: jest.Mock<Promise<IntencaoCompra[]>, []>;
};

class MockIntencaoCompraRepository implements IIntencaoCompraRepository {
    buscarPorId = jest.fn<Promise<IntencaoCompra | null>, [string]>();
    criarIntencao = jest.fn<Promise<void>, [IntencaoCompra]>();
    buscarTodos = jest.fn<Promise<IntencaoCompra[]>, []>();
}

describe('GerenciarIntencaoCompraUseCase', () => {
    let repository: MockIntencaoCompraRepository;
    let useCase: GerenciarIntencaoCompraUseCase;
    let produto: IProduto;

    beforeEach(() => {
        repository = new MockIntencaoCompraRepository();
        useCase = new GerenciarIntencaoCompraUseCase(repository);

        produto = {
            nome: 'MacBook Pro',
            descricao: 'Laptop Apple',
            marca: 'Apple',
            modelo: 'M2',
            ano: 2025,
            ehNovo: true,
            observacao: 'Modelo recente'
        };
    });

    it('should create a new purchase intention and persist it', async () => {
        await useCase.criarNovaIntencao('intencao-01', produto);

        expect(repository.criarIntencao).toHaveBeenCalledTimes(1);
        const saved = repository.criarIntencao.mock.calls[0][0];
        expect(saved.id).toBe('intencao-01');
        expect(saved.produto).toEqual(produto);
        expect(saved.cotacoes).toHaveLength(0);
        expect(saved.efetivados).toHaveLength(0);
    });

    it('should register a cotacao and persist the updated intention', async () => {
        const intencao = new IntencaoCompra('intencao-02', produto);
        repository.buscarPorId.mockResolvedValue(intencao);

        const input: RegistrarCotacaoInput = {
            intencaoId: 'intencao-02',
            valor: 1500,
            contato: 'Fornecedor A',
            link: 'https://exemplo.com/produto',
            observacao: 'Preço competitivo'
        };

        const result = await useCase.registrarCotacao(input);

        expect(repository.buscarPorId).toHaveBeenCalledWith('intencao-02');
        expect(repository.criarIntencao).toHaveBeenCalledWith(intencao);
        expect(result.cotacoes).toHaveLength(1);
        expect(result.cotacoes[0]).toMatchObject({ valor: 1500, contato: 'Fornecedor A' });
        expect(result.cotacoes[0].id).toMatch(/^cot_/);
    });

    it('should throw when trying to register a cotacao for a missing intention', async () => {
        repository.buscarPorId.mockResolvedValue(null);

        await expect(
            useCase.registrarCotacao({
                intencaoId: 'missing-id',
                valor: 1200,
                contato: 'Fornecedor B'
            })
        ).rejects.toThrow('Arquivo de intenção de compra com ID missing-id não existe.');
    });

    it('should efetivar a compra parcial and return the correct metrics', async () => {
        const intencao = new IntencaoCompra('intencao-03', produto);
        intencao.registrarCotacao({
            data: '2026-05-11T10:00:00Z',
            valor: 1000,
            contato: 'Fornecedor B'
        });

        repository.buscarPorId.mockResolvedValue(intencao);

        const cotacaoId = intencao.cotacoes[0].id;
        const input: EfetivarCompraParcialInput = {
            intencaoId: 'intencao-03',
            cotacaoId,
            quantidade: 2,
            valorCompraUnitario: 1000,
            codigosUnitarios: ['ITEM-01', 'ITEM-02'],
            status: ''
        };

        const output = await useCase.efetivarCompraParcial(input);

        expect(output.intencaoId).toBe('intencao-03');
        expect(output.quantidadeEmEstoque).toBe(2);
        expect(output.totalEfetivados).toBe(2);
        expect(repository.criarIntencao).toHaveBeenCalledWith(intencao);
        expect(intencao.efetivados.map(i => i.codUnitario)).toEqual(['ITEM-01', 'ITEM-02']);
    });

    it('should throw when efetivarCompraParcial is called for a missing intention', async () => {
        repository.buscarPorId.mockResolvedValue(null);

        await expect(
            useCase.efetivarCompraParcial({
                intencaoId: 'missing-id',
                cotacaoId: 'cot-01',
                quantidade: 1,
                valorCompraUnitario: 1000,
                codigosUnitarios: ['ITEM-01'],
                status: ''
            })
        ).rejects.toThrow('Arquivo de intenção de compra com ID missing-id não existe.');
    });

    it('should register a sale and persist the updated item status', async () => {
        const intencao = new IntencaoCompra('intencao-04', produto);
        intencao.registrarCotacao({
            data: '2026-05-11T10:00:00Z',
            valor: 1000,
            contato: 'Fornecedor C'
        });
        const cotacaoId = intencao.cotacoes[0].id;
        intencao.efetivarCompraParcial(cotacaoId, 1, 1000, ['ITEM-03']);

        repository.buscarPorId.mockResolvedValue(intencao);

        const input: RegistrarVendaInput = {
            intencaoId: 'intencao-04',
            codUnitario: 'ITEM-03',
            valorVenda: 1200
        };

        const result = await useCase.registrarVenda(input);

        expect(result.efetivados[0].status).toBe('VENDIDO');
        expect(result.efetivados[0].venda?.lucroLiquido).toBe(200);
        expect(repository.criarIntencao).toHaveBeenCalledWith(intencao);
    });

    it('should throw when registrarVenda is called for a missing intention', async () => {
        repository.buscarPorId.mockResolvedValue(null);

        await expect(
            useCase.registrarVenda({
                intencaoId: 'missing-id',
                codUnitario: 'ITEM-04',
                valorVenda: 1300
            })
        ).rejects.toThrow('Arquivo de intenção de compra com ID missing-id não existe.');
    });
});
