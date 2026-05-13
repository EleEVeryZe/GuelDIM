import { JsonIntencaoCompraRepository } from './JsonIntencaoCompraRepository';
import { IntencaoCompra } from '@/domain/entities/intencao-compra';
import { IProduto } from '@/interfaces/intencao-compra';

const USE_REAL_API = false;
const mockFetch = jest.fn();

describe('JsonIntencaoCompraRepository', () => {
  let repository: JsonIntencaoCompraRepository;
  let produto: IProduto;

  beforeEach(() => {
    repository = new JsonIntencaoCompraRepository();
    produto = {
      nome: 'PlayStation 5 Slim',
      descricao: 'Edição Digital',
      marca: 'Sony',
      modelo: 'CFI-2000',
      ano: 2023,
      ehNovo: true,
      observacao: '',
      midias: []
    };

    if (!USE_REAL_API) {
      global.fetch = mockFetch;
    }
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch all purchase intentions from the remote JSON endpoint', async () => {
    const mockResponse = [
      {
        id: 'intencao-001',
        produto,
        cotacoes: [],
        efetivados: []
      }
    ];

    if (!USE_REAL_API) {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });
    }

    const all = await repository.buscarTodos();

    expect(all).toHaveLength(1);
    expect(all[0].id).toBe('intencao-001');
    expect(all[0].produto.nome).toBe('PlayStation 5 Slim');

    if (!USE_REAL_API) {
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://spikai.s3.sa-east-1.amazonaws.com/database.json',
        expect.any(Object)
      );
    }
  });

  it('should fetch a purchase intention by id from the remote JSON endpoint', async () => {
    const mockResponse = [
      {
        id: 'intencao-002',
        produto,
        cotacoes: [],
        efetivados: []
      }
    ];

    if (!USE_REAL_API) {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });
    }

    const result = await repository.buscarPorId('intencao-002');

    expect(result).not.toBeNull();
    expect(result?.id).toBe('intencao-002');
    expect(result?.produto.nome).toBe('PlayStation 5 Slim');
  });

  it('should return null when the purchase intention is not found', async () => {
    const mockResponse = [
      {
        id: 'intencao-003',
        produto,
        cotacoes: [],
        efetivados: []
      }
    ];

    if (!USE_REAL_API) {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });
    }

    const result = await repository.buscarPorId('not-found');

    expect(result).toBeNull();
  });

  it('should throw when salvar is called on the remote JSON repository', async () => {
    const intencao = new IntencaoCompra('intencao-004', produto);

    await expect(repository.criarIntencao(intencao)).rejects.toThrow(
      'Salvar não é suportado pelo repositório JSON remoto.'
    );
  });
});
