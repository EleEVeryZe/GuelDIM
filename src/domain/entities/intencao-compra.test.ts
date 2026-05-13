import { IntencaoCompra } from './intencao-compra';
import { IProduto, ICotacao, IItemEfetivado } from '../../interfaces/intencao-compra';

describe('IntencaoCompra Entity', () => {
    let produto: IProduto;
    let intencao: IntencaoCompra;

    beforeEach(() => {
        produto = {
            nome: 'iPhone 13',
            descricao: 'Smartphone Apple',
            marca: 'Apple',
            modelo: 'iPhone 13 Pro',
            ano: 2021,
            ehNovo: true,
            observacao: 'Excelente condição'
        };
        intencao = new IntencaoCompra('intencao_001', produto);
    });

    describe('Constructor', () => {
        it('should create a new IntencaoCompra instance', () => {
            expect(intencao.id).toBe('intencao_001');
            expect(intencao.produto).toEqual(produto);
            expect(intencao.cotacoes).toEqual([]);
            expect(intencao.efetivados).toEqual([]);
        });
    });

    describe('fromJSON Factory Method', () => {
        it('should reconstruct IntencaoCompra from JSON', () => {
            const cotacao: ICotacao = {
                id: 'cot_001',
                data: '2026-05-11T10:00:00Z',
                valor: 1000,
                contato: 'João',
                link: 'https://example.com',
                observacao: 'Melhor preço'
            };

            const itemEfetivado: IItemEfetivado = {
                codUnitario: 'IPHONE13_001',
                cotacaoId: 'cot_001',
                valorCompra: 1000,
                dataCompra: '2026-05-11T10:00:00Z',
                status: 'EM_ESTOQUE',
                venda: null
            };

            const json = {
                id: 'intencao_001',
                produto,
                cotacoes: [cotacao],
                efetivados: [itemEfetivado]
            };

            const restored = IntencaoCompra.fromJSON(json);

            expect(restored.id).toBe('intencao_001');
            expect(restored.produto).toEqual(produto);
            expect(restored.cotacoes).toEqual([cotacao]);
            expect(restored.efetivados).toEqual([itemEfetivado]);
        });
    });

    describe('registrarCotacao', () => {
        it('should add a new quotation with generated ID', () => {
            const cotacao = {
                data: '2026-05-11T10:00:00Z',
                valor: 1000,
                contato: 'João Silva',
                link: 'https://example.com/product',
                observacao: 'Melhor preço encontrado'
            };

            intencao.registrarCotacao(cotacao);

            expect(intencao.cotacoes).toHaveLength(1);
            expect(intencao.cotacoes[0]).toMatchObject(cotacao);
            expect(intencao.cotacoes[0].id).toMatch(/^cot_/);
        });

        it('should generate unique IDs for multiple quotations', () => {
            intencao.registrarCotacao({
                data: '2026-05-11T10:00:00Z',
                valor: 1000,
                contato: 'João'
            });

            intencao.registrarCotacao({
                data: '2026-05-11T11:00:00Z',
                valor: 950,
                contato: 'Maria'
            });

            expect(intencao.cotacoes).toHaveLength(2);
            expect(intencao.cotacoes[0].id).not.toBe(intencao.cotacoes[1].id);
        });
    });

    describe('efetivarCompraParcial', () => {
        beforeEach(() => {
            intencao.registrarCotacao({
                data: '2026-05-11T10:00:00Z',
                valor: 1000,
                contato: 'João'
            });
        });

        it('should add items to efetivados when quotation exists', () => {
            const cotacaoId = intencao.cotacoes[0].id;
            const codigosUnitarios = ['IPHONE13_001', 'IPHONE13_002'];

            intencao.efetivarCompraParcial(
                cotacaoId,
                2,
                1000,
                codigosUnitarios
            );

            expect(intencao.efetivados).toHaveLength(2);
            expect(intencao.efetivados[0].codUnitario).toBe('IPHONE13_001');
            expect(intencao.efetivados[0].status).toBe('EM_ESTOQUE');
            expect(intencao.efetivados[0].valorCompra).toBe(1000);
        });

        it('should throw error when quotation does not exist', () => {
            expect(() => {
                intencao.efetivarCompraParcial(
                    'invalid_cotacao_id',
                    1,
                    1000,
                    ['IPHONE13_001']
                );
            }).toThrow('Cotação com ID invalid_cotacao_id não foi encontrada.');
        });

        it('should throw error when quantity does not match codes length', () => {
            const cotacaoId = intencao.cotacoes[0].id;

            expect(() => {
                intencao.efetivarCompraParcial(
                    cotacaoId,
                    2,
                    1000,
                    ['IPHONE13_001'] // only 1 code, but quantity is 2
                );
            }).toThrow('A quantidade de códigos unitários deve ser igual à quantidade comprada.');
        });

        it('should throw error when duplicate unit code exists', () => {
            const cotacaoId = intencao.cotacoes[0].id;

            intencao.efetivarCompraParcial(
                cotacaoId,
                1,
                1000,
                ['IPHONE13_001']
            );

            expect(() => {
                intencao.efetivarCompraParcial(
                    cotacaoId,
                    1,
                    1000,
                    ['IPHONE13_001'] // duplicate code
                );
            }).toThrow('O código unitário IPHONE13_001 já está cadastrado.');
        });

        it('should add medias to items when provided', () => {
            const cotacaoId = intencao.cotacoes[0].id;
            const codigosUnitarios = ['IPHONE13_001', 'IPHONE13_002'];
            const midias = [['foto1.jpg', 'foto2.jpg'], ['foto3.jpg']];

            intencao.efetivarCompraParcial(
                cotacaoId,
                2,
                1000,
                codigosUnitarios,
                midias
            );

            expect(intencao.efetivados[0].midias).toEqual(['foto1.jpg', 'foto2.jpg']);
            expect(intencao.efetivados[1].midias).toEqual(['foto3.jpg']);
        });
    });

    describe('registrarVenda', () => {
        beforeEach(() => {
            intencao.registrarCotacao({
                data: '2026-05-11T10:00:00Z',
                valor: 1000,
                contato: 'João'
            });

            const cotacaoId = intencao.cotacoes[0].id;
            intencao.efetivarCompraParcial(
                cotacaoId,
                2,
                1000,
                ['IPHONE13_001', 'IPHONE13_002']
            );
        });

        it('should register a sale and calculate profit', () => {
            intencao.registrarVenda('IPHONE13_001', 1300);

            const item = intencao.efetivados[0];
            expect(item.status).toBe('VENDIDO');
            expect(item.venda?.valorVenda).toBe(1300);
            expect(item.venda?.lucroLiquido).toBe(300);
        });

        it('should throw error when item does not exist', () => {
            expect(() => {
                intencao.registrarVenda('NONEXISTENT_CODE', 1300);
            }).toThrow('Item com código NONEXISTENT_CODE não encontrado no estoque.');
        });

        it('should throw error when item is not in stock', () => {
            intencao.registrarVenda('IPHONE13_001', 1300);

            expect(() => {
                intencao.registrarVenda('IPHONE13_001', 1400); // trying to sell again
            }).toThrow('Item IPHONE13_001 não está disponível para venda. Status: VENDIDO');
        });

        it('should add medias to sale when provided', () => {
            const midiasVenda = ['venda_foto1.jpg', 'comprovante.pdf'];
            intencao.registrarVenda('IPHONE13_001', 1300, midiasVenda);

            const item = intencao.efetivados[0];
            expect(item.venda?.midias).toEqual(midiasVenda);
        });

        it('should handle sales with loss', () => {
            intencao.registrarVenda('IPHONE13_001', 800);

            const item = intencao.efetivados[0];
            expect(item.venda?.lucroLiquido).toBe(-200);
        });
    });

    describe('lucroTotalAcumulado getter', () => {
        beforeEach(() => {
            intencao.registrarCotacao({
                data: '2026-05-11T10:00:00Z',
                valor: 1000,
                contato: 'João'
            });

            const cotacaoId = intencao.cotacoes[0].id;
            intencao.efetivarCompraParcial(
                cotacaoId,
                3,
                1000,
                ['IPHONE13_001', 'IPHONE13_002', 'IPHONE13_003']
            );
        });

        it('should return 0 when no items are sold', () => {
            expect(intencao.lucroTotalAcumulado).toBe(0);
        });

        it('should calculate total profit from sold items', () => {
            intencao.registrarVenda('IPHONE13_001', 1300); // +300 profit
            intencao.registrarVenda('IPHONE13_002', 1200); // +200 profit

            expect(intencao.lucroTotalAcumulado).toBe(500);
        });

        it('should include losses in profit calculation', () => {
            intencao.registrarVenda('IPHONE13_001', 1300); // +300 profit
            intencao.registrarVenda('IPHONE13_002', 900);  // -100 loss

            expect(intencao.lucroTotalAcumulado).toBe(200);
        });

        it('should not count unsold items in profit', () => {
            intencao.registrarVenda('IPHONE13_001', 1300); // +300 profit
            // IPHONE13_002 and IPHONE13_003 still in stock

            expect(intencao.lucroTotalAcumulado).toBe(300);
        });
    });

    describe('quantidadeEmEstoque getter', () => {
        beforeEach(() => {
            intencao.registrarCotacao({
                data: '2026-05-11T10:00:00Z',
                valor: 1000,
                contato: 'João'
            });

            const cotacaoId = intencao.cotacoes[0].id;
            intencao.efetivarCompraParcial(
                cotacaoId,
                3,
                1000,
                ['IPHONE13_001', 'IPHONE13_002', 'IPHONE13_003']
            );
        });

        it('should return total quantity when nothing is sold', () => {
            expect(intencao.quantidadeEmEstoque).toBe(3);
        });

        it('should decrease quantity when items are sold', () => {
            intencao.registrarVenda('IPHONE13_001', 1300);
            expect(intencao.quantidadeEmEstoque).toBe(2);

            intencao.registrarVenda('IPHONE13_002', 1300);
            expect(intencao.quantidadeEmEstoque).toBe(1);
        });

        it('should return 0 when all items are sold', () => {
            intencao.registrarVenda('IPHONE13_001', 1300);
            intencao.registrarVenda('IPHONE13_002', 1300);
            intencao.registrarVenda('IPHONE13_003', 1300);

            expect(intencao.quantidadeEmEstoque).toBe(0);
        });
    });
});
