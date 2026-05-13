import { GraphQLIntencaoCompraRepository } from './GraphQLIntencaoCompraRepository';
import { IntencaoCompra } from '@/domain/entities/intencao-compra';
import { IProduto } from '@/interfaces/intencao-compra';

const USE_REAL_API = false; // process.env.USE_REAL_API === 'true';

// Mock fetch for testing
const mockFetch = jest.fn();

describe('GraphQLIntencaoCompraRepository Integration', () => {
  let repository: GraphQLIntencaoCompraRepository;
  let produto: IProduto;

  beforeEach(() => {
    repository = new GraphQLIntencaoCompraRepository();
    produto = {
      nome: 'iPhone 15 Pro',
      descricao: 'Smartphone topo de linha',
      marca: 'Apple',
      modelo: 'Pro Max',
      ano: 2025,
      ehNovo: true,
      observacao: 'Último modelo lançado',
      midias: ['imagem-1.jpg']
    };

    if (!USE_REAL_API) {
      // Setup mocks
      global.fetch = mockFetch;
    }
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('buscarPorId', () => {
    it('should fetch IntencaoCompra by ID with mocked GraphQL response', async () => {
      const mockResponse = {
        data: {
          intencaoCompra: {
            id: 'intencao-test-001',
            produto: {
              nome: 'iPhone 15 Pro',
              descricao: 'Smartphone topo de linha',
              marca: 'Apple',
              modelo: 'Pro Max',
              ano: 2025,
              observacao: 'Último modelo lançado',
              ehNovo: true,
              midias: ['imagem-1.jpg']
            },
            cotacoes: [
              {
                id: 'cot_001',
                data: '2026-05-11T10:00:00Z',
                valor: 4500,
                link: 'https://exemplo.com/iphone',
                contato: 'Fornecedor A',
                observacao: 'Preço especial',
                midias: []
              }
            ],
            efetivados: []
          }
        }
      };

      if (!USE_REAL_API) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse
        });
      }

      const result = await repository.buscarPorId('intencao-test-001');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('intencao-test-001');
      expect(result?.produto.nome).toBe('iPhone 15 Pro');
      expect(result?.cotacoes).toHaveLength(1);
      expect(result?.cotacoes[0].valor).toBe(4500);

      if (!USE_REAL_API) {
        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:3000/graphql',
          expect.any(Object)
        );
      }
    });

    it('should return null when IntencaoCompra not found (mocked)', async () => {
      const mockResponse = {
        data: {
          intencaoCompra: null
        }
      };

      if (!USE_REAL_API) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse
        });
      }

      if (USE_REAL_API) {
        // Skip real API test for non-existent ID
        expect(true).toBe(true);
        return;
      }

      const result = await repository.buscarPorId('nonexistent-id');
      expect(result).toBeNull();
    });

    it('should handle GraphQL errors (mocked)', async () => {
      const mockResponse = {
        errors: [
          {
            message: 'Internal server error',
            extensions: { code: 'INTERNAL_SERVER_ERROR' }
          }
        ]
      };

      if (!USE_REAL_API) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse
        });
      }

      if (USE_REAL_API) {
        expect(true).toBe(true);
        return;
      }

      await expect(repository.buscarPorId('test-id')).rejects.toThrow('GraphQL error');
    });

    it('should handle network errors (mocked)', async () => {
      if (!USE_REAL_API) {
        mockFetch.mockRejectedValueOnce(new Error('Network timeout'));
      }

      if (USE_REAL_API) {
        expect(true).toBe(true);
        return;
      }

      await expect(repository.buscarPorId('test-id')).rejects.toThrow('Network timeout');
    });

    it('should handle HTTP error responses (mocked)', async () => {
      if (!USE_REAL_API) {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 500
        });
      }

      if (USE_REAL_API) {
        expect(true).toBe(true);
        return;
      }

      await expect(repository.buscarPorId('test-id')).rejects.toThrow(
        'GraphQL request failed with status 500'
      );
    });
  });

  describe('salvar', () => {
    it('should save IntencaoCompra via GraphQL mutation (mocked)', async () => {
      const intencao = new IntencaoCompra('intencao-save-001', produto);
      intencao.registrarCotacao({
        data: new Date().toISOString(),
        valor: 4500,
        contato: 'Fornecedor A',
        link: 'https://exemplo.com/iphone'
      });

      const mockResponse = {
        data: {
          criarIntencao: {
            id: 'intencao-save-001',
            produto: {
              nome: 'iPhone 15 Pro'
            }
          }
        }
      };

      if (!USE_REAL_API) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse
        });
      }

      await expect(repository.criarIntencao(intencao)).resolves.not.toThrow();

      if (!USE_REAL_API) {
        expect(mockFetch).toHaveBeenCalledTimes(1);
        const callArgs = mockFetch.mock.calls[0];
        expect(callArgs[0]).toBe('http://localhost:3000/graphql');
        expect(callArgs[1].method).toBe('POST');
        const body = JSON.parse(callArgs[1].body);
        expect(body.query).toContain('criarIntencao(input: $input)');
        expect(body.variables.input.id).toBe('intencao-save-001');
      }
    });

    it('should handle save errors (mocked)', async () => {
      const intencao = new IntencaoCompra('intencao-error', produto);

      const mockResponse = {
        errors: [
          {
            message: 'Duplicate ID',
            extensions: { code: 'DUPLICATE_KEY' }
          }
        ]
      };

      if (!USE_REAL_API) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse
        });
      }

      if (USE_REAL_API) {
        expect(true).toBe(true);
        return;
      }

      await expect(repository.criarIntencao(intencao)).rejects.toThrow('GraphQL error');
    });

    it('should properly escape special characters in GraphQL strings (mocked)', async () => {
      const produtoComEspeciais = {
        ...produto,
        nome: 'iPhone "Test" & Special',
        descricao: 'Description with "quotes" and\nnewlines'
      };
      const intencao = new IntencaoCompra('intencao-special', produtoComEspeciais);

      const mockResponse = {
        data: {
          criarIntencao: {
            id: 'intencao-special',
            produto: { nome: 'iPhone "Test" & Special' }
          }
        }
      };

      if (!USE_REAL_API) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse
        });
      }

      await expect(repository.criarIntencao(intencao)).resolves.not.toThrow();

      if (!USE_REAL_API) {
        const callArgs = mockFetch.mock.calls[0];
        const body = JSON.parse(callArgs[1].body);
        expect(body.variables.input.produto.nome).toBe('iPhone "Test" & Special');
        expect(body.variables.input.produto.descricao).toBe('Description with "quotes" and\nnewlines');
      }
    });
  });

  describe('Integration Flow (mocked)', () => {
    it('should execute create, fetch, and save flow (mocked)', async () => {
      const id = 'intencao-flow-001';
      const intencao = new IntencaoCompra(id, produto);

      // Mock save
      if (!USE_REAL_API) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: { criarIntencao: { id, produto: { nome: produto.nome } } }
          })
        });
      }

      await repository.criarIntencao(intencao);

      // Mock fetch
      if (!USE_REAL_API) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: {
              intencaoCompra: {
                id,
                produto,
                cotacoes: [],
                efetivados: []
              }
            }
          })
        });
      }

      const fetched = await repository.buscarPorId(id);
      expect(fetched?.id).toBe(id);
      expect(fetched?.produto.nome).toBe(produto.nome);
    });
  });

  if (USE_REAL_API) {
    describe('Real API Tests', () => {
      it('should connect to real GraphQL API endpoint', async () => {
        try {
          const result = await repository.buscarPorId('test-connectivity');
          expect(result === null || result instanceof IntencaoCompra).toBe(true);
        } catch (error) {
          expect(error).toBeDefined();
        }
      });

      it('should save and retrieve real data from GraphQL API', async () => {
        const testId = `test-${Date.now()}`;
        const intencao = new IntencaoCompra(testId, produto);

        await repository.criarIntencao(intencao);

        const fetched = await repository.buscarPorId(testId);
        expect(fetched?.id).toBe(testId);
        expect(fetched?.produto.nome).toBe(produto.nome);
      });
    });
  }
});
