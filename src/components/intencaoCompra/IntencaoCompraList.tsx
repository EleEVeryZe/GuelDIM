import React, { useEffect, useState } from 'react';
import { JsonIntencaoCompraRepository } from '@/adapters/http/JsonIntencaoCompraRepository';
import { GraphQLIntencaoCompraRepository } from '@/adapters/graphql/GraphQLIntencaoCompraRepository';
import { IntencaoCompra } from '@/domain/entities/intencao-compra';

export const IntencaoCompraList: React.FC = () => {
  const [intencoes, setIntencoes] = useState<IntencaoCompra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedIntencao, setSelectedIntencao] = useState<string>('');
  const [loadingCotacao, setLoadingCotacao] = useState(false);
  const [loadingIntencao, setLoadingIntencao] = useState(false);
  const [loadingEfetivar, setLoadingEfetivar] = useState(false);
  const [loadingVenda, setLoadingVenda] = useState(false);

  const [cotacaoForm, setCotacaoForm] = useState({
    valor: '',
    contato: '',
    link: '',
    observacao: ''
  });

  const [efetivarForm, setEfetivarForm] = useState({
    cotacaoId: '',
    valorCompraUnitario: '',
    quantidade: '1',
    codigosUnitarios: ''
  });

  const [vendaForm, setVendaForm] = useState({
    codUnitario: '',
    valorVenda: ''
  });

  const [novaIntencaoForm, setNovaIntencaoForm] = useState({
    id: '',
    nome: '',
    descricao: '',
    marca: '',
    modelo: '',
    ano: '',
    ehNovo: true,
    observacao: ''
  });
  const [showNovaIntencaoForm, setShowNovaIntencaoForm] = useState(false);

  const jsonRepo = new JsonIntencaoCompraRepository();
  const graphQLRepo = new GraphQLIntencaoCompraRepository();

  useEffect(() => {
    loadIntencoes();
  }, []);

  const loadIntencoes = async () => {
    try {
      const data = await jsonRepo.buscarTodos();
      const instancias = data.map((item: any) => IntencaoCompra.fromJSON(item));
      setIntencoes(instancias);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar intenções');
    } finally {
      setLoading(false);
    }
  };

  const handleCotacaoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIntencao || !cotacaoForm.valor || !cotacaoForm.contato) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setLoadingCotacao(true);
      await graphQLRepo.registrarCotacao({
        intencaoId: selectedIntencao,
        valor: parseFloat(cotacaoForm.valor),
        contato: cotacaoForm.contato,
        link: cotacaoForm.link || undefined,
        observacao: cotacaoForm.observacao || undefined
      });

      alert('Cotação registrada com sucesso!');
      setCotacaoForm({ valor: '', contato: '', link: '', observacao: '' });
      setSelectedIntencao('');
      await loadIntencoes();
    } catch (err) {
      alert('Erro ao registrar cotação: ' + (err instanceof Error ? err.message : 'Erro desconhecido'));
    } finally {
      setLoadingCotacao(false);
    }
  };

  const handleEfetivarCompraSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIntencao || !efetivarForm.cotacaoId || !efetivarForm.valorCompraUnitario || !efetivarForm.quantidade) {
      alert('Preencha os campos obrigatórios');
      return;
    }

    const quantidadeNum = parseInt(efetivarForm.quantidade);
    const codigosArray = efetivarForm.codigosUnitarios
      ? efetivarForm.codigosUnitarios.split(',').map(codigo => codigo.trim()).filter(Boolean)
      : [];

    if (codigosArray.length !== quantidadeNum) {
      alert(`A quantidade de códigos unitários (${codigosArray.length}) deve ser exatamente igual à quantidade comprada (${quantidadeNum}).`);
      return;
    }

    try {
      setLoadingEfetivar(true);
      await graphQLRepo.efetivarCompra({
        intencaoId: selectedIntencao,
        cotacaoId: efetivarForm.cotacaoId,
        valorCompraUnitario: parseFloat(efetivarForm.valorCompraUnitario),
        quantidade: quantidadeNum,
        codigosUnitarios: codigosArray,
        status: "EM_ESTOQUE"
      });

      alert('Compra efetivada com sucesso!');
      setEfetivarForm({ cotacaoId: '', valorCompraUnitario: '', quantidade: '1', codigosUnitarios: '' });
      setSelectedIntencao('');
      await loadIntencoes();
    } catch (err) {
      alert('Erro ao efetivar compra: ' + (err instanceof Error ? err.message : 'Erro desconhecido'));
    } finally {
      setLoadingEfetivar(false);
    }
  };

  const handleRegistrarVendaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIntencao || !vendaForm.codUnitario || !vendaForm.valorVenda) {
      alert('Preencha todos os campos obrigatórios para a venda');
      return;
    }

    try {
      setLoadingVenda(true);
      await graphQLRepo.registrarVenda({
        intencaoId: selectedIntencao,
        codUnitario: vendaForm.codUnitario,
        valorVenda: parseFloat(vendaForm.valorVenda),
        efetivadoId: '',
        compradorContato: '',
        observacao: ''
      });

      alert('Venda registrada com sucesso!');
      setVendaForm({ codUnitario: '', valorVenda: '' });
      setSelectedIntencao('');
      await loadIntencoes();
    } catch (err) {
      alert('Erro ao registrar venda: ' + (err instanceof Error ? err.message : 'Erro desconhecido'));
    } finally {
      setLoadingVenda(false);
    }
  };

  const handleNovaIntencaoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaIntencaoForm.nome || !novaIntencaoForm.marca) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setLoadingIntencao(true);
      await graphQLRepo.criarIntencao({
        id: "",
        produto: {
          nome: novaIntencaoForm.nome,
          descricao: novaIntencaoForm.descricao,
          marca: novaIntencaoForm.marca,
          modelo: novaIntencaoForm.modelo,
          ano: parseInt(novaIntencaoForm.ano) || 0,
          ehNovo: novaIntencaoForm.ehNovo,
          observacao: novaIntencaoForm.observacao,
          midias: []
        },
        cotacoes: [],
        efetivados: []
      });

      alert('Intenção de compra criada com sucesso!');
      setNovaIntencaoForm({
        id: '', nome: '', descricao: '', marca: '', modelo: '', ano: '', ehNovo: true, observacao: ''
      });
      setShowNovaIntencaoForm(false);
      await loadIntencoes();
    } catch (err) {
      alert('Erro ao criar intenção: ' + (err instanceof Error ? err.message : 'Erro desconhecido'));
    } finally {
      setLoadingIntencao(false);
    }
  };

  // --- CÁLCULO DAS MÉTRICAS GLOBAIS (DASHBOARD) ---
  const todosOsItensEfetivados = intencoes.flatMap(i => i.efetivados || []);

  const faturamentoGlobal = todosOsItensEfetivados
    .filter(item => item.status === 'VENDIDO' && item.venda)
    .reduce((total, item) => total + (item.venda?.valorVenda || 0), 0);

  const lucroGlobal = intencoes.reduce((total, i) => total + i.lucroTotalAcumulado, 0);
  const totalItensEmEstoque = intencoes.reduce((total, i) => total + i.quantidadeEmEstoque, 0);

  const dinheiroImobilizadoEstoque = todosOsItensEfetivados
    .filter(item => item.status === 'EM_ESTOQUE')
    .reduce((total, item) => total + item.valorCompra, 0);

  // Ordenação dinâmica estável
  const intencoesOrdenadas = [...intencoes].sort((a, b) => {
    if (a.id === selectedIntencao) return -1;
    if (b.id === selectedIntencao) return 1;
    return 0;
  });

  const intencaoSelecionadaObjeto = intencoes.find(i => i.id === selectedIntencao);
  const cotacoesDaIntencaoSelecionada = intencaoSelecionadaObjeto?.cotacoes || [];
  const itensDisponiveisParaVenda = intencaoSelecionadaObjeto?.efetivados?.filter(i => i.status === 'EM_ESTOQUE') || [];

  return (
    <div style={{ padding: '15px', fontFamily: 'sans-serif', maxWidth: 1300, margin: '0 auto' }}>
      <style>{`
        .responsive-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 15px;
          margin-bottom: 25px;
        }
        .operations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        .card-internal-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 20px;
        }
        .card-header-flex {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
          margin-bottom: 12px;
        }
        .badge-container {
          display: flex;
          gap: 10px;
        }
        @media (max-width: 768px) {
          .card-internal-grid {
            grid-template-columns: 1fr;
            gap: 15px;
          }
          .card-header-flex {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
          .badge-container {
            width: 100%;
            justify-content: space-between;
          }
          .form-grid-3 {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      {
        error ? <div style={{ padding: '20px', fontFamily: 'sans-serif', color: 'red' }}>Erro: {error}</div> :
        loading ? <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>Carregando intenções de compra...</div> :
          <>
            <h2>Painel de Operações Comerciais</h2>

            {/* DASHBOARD DE MÉTRICAS GLOBAIS */}
            <div className="responsive-grid" style={{ padding: 15, backgroundColor: '#f1f3f5', borderRadius: 8, border: '1px solid #dee2e6' }}>
              <div style={{ background: '#fff', padding: '15px', borderRadius: 6, borderLeft: '5px solid #17a2b8' }}>
                <span style={{ color: '#6c757d', fontSize: '0.85em', fontWeight: 'bold', display: 'block', textTransform: 'uppercase' }}>Faturamento Total</span>
                <strong style={{ fontSize: '1.5em', color: '#17a2b8', display: 'block', marginTop: 5 }}>R$ {faturamentoGlobal.toFixed(2)}</strong>
              </div>
              <div style={{ background: '#fff', padding: '15px', borderRadius: 6, borderLeft: '5px solid #28a745' }}>
                <span style={{ color: '#6c757d', fontSize: '0.85em', fontWeight: 'bold', display: 'block', textTransform: 'uppercase' }}>Lucro Consolidado</span>
                <strong style={{ fontSize: '1.5em', color: '#28a745', display: 'block', marginTop: 5 }}>R$ {lucroGlobal.toFixed(2)}</strong>
              </div>
              <div style={{ background: '#fff', padding: '15px', borderRadius: 6, borderLeft: '5px solid #ffc107' }}>
                <span style={{ color: '#6c757d', fontSize: '0.85em', fontWeight: 'bold', display: 'block', textTransform: 'uppercase' }}>Total Itens em Estoque</span>
                <strong style={{ fontSize: '1.5em', color: '#ffc107', display: 'block', marginTop: 5 }}>{totalItensEmEstoque} un</strong>
              </div>
              <div style={{ background: '#fff', padding: '15px', borderRadius: 6, borderLeft: '5px solid #6c757d' }}>
                <span style={{ color: '#6c757d', fontSize: '0.85em', fontWeight: 'bold', display: 'block', textTransform: 'uppercase' }}>Dinheiro em Estoque</span>
                <strong style={{ fontSize: '1.5em', color: '#495057', display: 'block', marginTop: 5 }}>R$ {dinheiroImobilizadoEstoque.toFixed(2)}</strong>
              </div>
            </div>

            {/* Botão Nova Intenção */}
            <div style={{ marginBottom: 20 }}>
              <button
                onClick={() => setShowNovaIntencaoForm(!showNovaIntencaoForm)}
                style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', width: '100%', maxWidth: '300px' }}
              >
                {showNovaIntencaoForm ? 'Cancelar' : '+ Nova Intenção de Compra'}
              </button>
            </div>

            {/* Formulário Criar Nova Intenção */}
            {showNovaIntencaoForm && (
              <div style={{ marginBottom: 30, padding: 20, border: '1px solid #28a745', borderRadius: 8, backgroundColor: '#f8fff9' }}>
                <h3>Criar Nova Intenção de Compra</h3>
                <form onSubmit={handleNovaIntencaoSubmit}>
                  <div className="card-internal-grid" style={{ marginBottom: 10 }}>
                    <div>
                      <label>ID único:</label>
                      <input type="text" value={novaIntencaoForm.id} style={{ width: '100%', padding: 8, marginTop: 5, boxSizing: 'border-box' }} disabled placeholder="Gerado automaticamente" />
                    </div>
                    <div>
                      <label>Nome do produto:</label>
                      <input
                        type="text" value={novaIntencaoForm.nome}
                        onChange={(e) => setNovaIntencaoForm({ ...novaIntencaoForm, nome: e.target.value })}
                        style={{ width: '100%', padding: 8, marginTop: 5, boxSizing: 'border-box' }} required
                      />
                    </div>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <label>Descrição:</label>
                    <input
                      type="text" value={novaIntencaoForm.descricao}
                      onChange={(e) => setNovaIntencaoForm({ ...novaIntencaoForm, descricao: e.target.value })}
                      style={{ width: '100%', padding: 8, marginTop: 5, boxSizing: 'border-box' }}
                    />
                  </div>
                  <div className="form-grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
                    <div>
                      <label>Marca:</label>
                      <input
                        type="text" value={novaIntencaoForm.marca}
                        onChange={(e) => setNovaIntencaoForm({ ...novaIntencaoForm, marca: e.target.value })}
                        style={{ width: '100%', padding: 8, marginTop: 5, boxSizing: 'border-box' }} required
                      />
                    </div>
                    <div>
                      <label>Modelo:</label>
                      <input
                        type="text" value={novaIntencaoForm.modelo}
                        onChange={(e) => setNovaIntencaoForm({ ...novaIntencaoForm, modelo: e.target.value })}
                        style={{ width: '100%', padding: 8, marginTop: 5, boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label>Ano:</label>
                      <input
                        type="number" value={novaIntencaoForm.ano}
                        onChange={(e) => setNovaIntencaoForm({ ...novaIntencaoForm, ano: e.target.value })}
                        style={{ width: '100%', padding: 8, marginTop: 5, boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <label>
                      <input
                        type="checkbox" checked={novaIntencaoForm.ehNovo}
                        onChange={(e) => setNovaIntencaoForm({ ...novaIntencaoForm, ehNovo: e.target.checked })}
                        style={{ marginRight: 8 }}
                      />
                      Produto novo
                    </label>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <label>Observação:</label>
                    <textarea
                      value={novaIntencaoForm.observacao}
                      onChange={(e) => setNovaIntencaoForm({ ...novaIntencaoForm, observacao: e.target.value })}
                      style={{ width: '100%', padding: 8, marginTop: 5, minHeight: 60, boxSizing: 'border-box' }}
                    />
                  </div>
                  <button disabled={loadingIntencao} type="submit" style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: 4, width: '100%' }}>
                    {loadingIntencao ? "...Carregando" : "Criar Intenção"}
                  </button>
                </form>
              </div>
            )}

            {/* Grid de Fluxo de Operações */}
            <div className="operations-grid">

              {/* OPERAÇÃO 1: Registrar Cotação */}
              <div style={{ padding: 20, border: '1px solid #ddd', borderRadius: 8, backgroundColor: '#fff', boxSizing: 'border-box' }}>
                <h3>1. Pesquisa / Cotação</h3>
                <form onSubmit={handleCotacaoSubmit}>
                  <div style={{ marginBottom: 10 }}>
                    <label>Intenção de Compra:</label>
                    <select
                      value={selectedIntencao}
                      onChange={(e) => setSelectedIntencao(e.target.value)}
                      style={{ width: '100%', padding: 8, marginTop: 5 }} required
                    >
                      <option value="">Selecione uma intenção</option>
                      {intencoes.map((intencao) => (
                        <option key={intencao.id} value={intencao.id}>
                          {intencao.produto.nome} ({intencao.produto.marca})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <label>Valor de Mercado (R$):</label>
                    <input
                      type="number" step="0.01" value={cotacaoForm.valor}
                      onChange={(e) => setCotacaoForm({ ...cotacaoForm, valor: e.target.value })}
                      style={{ width: '100%', padding: 8, marginTop: 5, boxSizing: 'border-box' }} required
                    />
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <label>Contato Fornecedor:</label>
                    <input
                      type="text" value={cotacaoForm.contato}
                      onChange={(e) => setCotacaoForm({ ...cotacaoForm, contato: e.target.value })}
                      style={{ width: '100%', padding: 8, marginTop: 5, boxSizing: 'border-box' }} required
                    />
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <label>Link (Opcional):</label>
                    <input
                      type="url" value={cotacaoForm.link}
                      onChange={(e) => setCotacaoForm({ ...cotacaoForm, link: e.target.value })}
                      style={{ width: '100%', padding: 8, marginTop: 5, boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <label>Observação:</label>
                    <textarea
                      value={cotacaoForm.observacao}
                      onChange={(e) => setCotacaoForm({ ...cotacaoForm, observacao: e.target.value })}
                      style={{ width: '100%', padding: 8, marginTop: 5, minHeight: 40, boxSizing: 'border-box' }}
                    />
                  </div>
                  <button disabled={loadingCotacao} type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
                    {loadingCotacao ? "...Enviando" : "Registrar Cotação"}
                  </button>
                </form>
              </div>

              {/* OPERAÇÃO 2: Efetivar Compra */}
              <div style={{ padding: 20, border: '1px solid #ffc107', borderRadius: 8, backgroundColor: '#ffffff', boxSizing: 'border-box' }}>
                <h3>2. Efetivar Compra (Estoque)</h3>
                <form onSubmit={handleEfetivarCompraSubmit}>
                  <div style={{ marginBottom: 10 }}>
                    <label>Selecione a Intenção:</label>
                    <select
                      value={selectedIntencao}
                      onChange={(e) => setSelectedIntencao(e.target.value)}
                      style={{ width: '100%', padding: 8, marginTop: 5 }} required
                    >
                      <option value="">Selecione uma intenção</option>
                      {intencoes.map((intencao) => (
                        <option key={intencao.id} value={intencao.id}>
                          {intencao.produto.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: 10 }}>
                    <label>Cotação de Origem:</label>
                    <select
                      value={efetivarForm.cotacaoId}
                      onChange={(e) => setEfetivarForm({ ...efetivarForm, cotacaoId: e.target.value })}
                      style={{ width: '100%', padding: 8, marginTop: 5 }} required disabled={!selectedIntencao}
                    >
                      <option value="">Vincular à cotação...</option>
                      {cotacoesDaIntencaoSelecionada.map((c) => (
                        <option key={c.id} value={c.id}>
                          R$ {c.valor} - Forn: {c.contato}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="card-internal-grid" style={{ marginBottom: 10, gap: 10 }}>
                    <div>
                      <label>Vlr. Unitário:</label>
                      <input
                        type="number" step="0.01" value={efetivarForm.valorCompraUnitario}
                        onChange={(e) => setEfetivarForm({ ...efetivarForm, valorCompraUnitario: e.target.value })}
                        style={{ width: '100%', padding: 8, marginTop: 5, boxSizing: 'border-box' }} required
                      />
                    </div>
                    <div>
                      <label>Quantidade:</label>
                      <input
                        type="number" min="1" value={efetivarForm.quantidade}
                        onChange={(e) => setEfetivarForm({ ...efetivarForm, quantidade: e.target.value })}
                        style={{ width: '100%', padding: 8, marginTop: 5, boxSizing: 'border-box' }} required
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: 10 }}>
                    <label>Identificadores / Códigos Unitários:</label>
                    <input
                      type="text" placeholder="SN-01, SN-02" value={efetivarForm.codigosUnitarios}
                      onChange={(e) => setEfetivarForm({ ...efetivarForm, codigosUnitarios: e.target.value })}
                      style={{ width: '100%', padding: 8, marginTop: 5, boxSizing: 'border-box' }} required
                    />
                    <small style={{ color: '#666', display: 'block', marginTop: 4 }}>
                      Insira exatamente {efetivarForm.quantidade || 1} código(s).
                    </small>
                  </div>

                  <button disabled={loadingEfetivar} type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#ffc107', color: '#212529', fontWeight: 'bold', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
                    {loadingEfetivar ? "...Salvando Itens" : "Efetivar Entrada"}
                  </button>
                </form>
              </div>

              {/* OPERAÇÃO 3: Registrar Venda */}
              <div style={{ padding: 20, border: '1px solid #17a2b8', borderRadius: 8, backgroundColor: '#fff', boxSizing: 'border-box' }}>
                <h3>3. Saída / Registrar Venda</h3>
                <form onSubmit={handleRegistrarVendaSubmit}>
                  <div style={{ marginBottom: 10 }}>
                    <label>Selecione a Intenção:</label>
                    <select
                      value={selectedIntencao}
                      onChange={(e) => setSelectedIntencao(e.target.value)}
                      style={{ width: '100%', padding: 8, marginTop: 5 }} required
                    >
                      <option value="">Selecione uma intenção</option>
                      {intencoes.map((intencao) => (
                        <option key={intencao.id} value={intencao.id}>
                          {intencao.produto.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <label>Item Específico em Estoque:</label>
                    <select
                      value={vendaForm.codUnitario}
                      onChange={(e) => setVendaForm({ ...vendaForm, codUnitario: e.target.value })}
                      style={{ width: '100%', padding: 8, marginTop: 5 }} required disabled={!selectedIntencao}
                    >
                      <option value="">Selecione o código unitário...</option>
                      {itensDisponiveisParaVenda.map((item) => (
                        <option key={item.codUnitario} value={item.codUnitario}>
                          Cod: {item.codUnitario} (Custo: R$ {item.valorCompra})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <label>Valor de Venda Final (R$):</label>
                    <input
                      type="number" step="0.01" value={vendaForm.valorVenda}
                      onChange={(e) => setVendaForm({ ...vendaForm, valorVenda: e.target.value })}
                      style={{ width: '100%', padding: 8, marginTop: 5, boxSizing: 'border-box' }} required
                    />
                  </div>
                  <button disabled={loadingVenda} type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
                    {loadingVenda ? "...Confirmando Venda" : "Concluir Venda"}
                  </button>
                </form>
              </div>

            </div>

            {/* Lista de Intenções Ativas */}
            <div>
              <h3>Monitoramento de Intenções e Métricas Financeiras</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {intencoesOrdenadas.map((intencao) => {
                  const isFocada = intencao.id === selectedIntencao;
                  return (
                    <li key={intencao.id} style={{
                      marginBottom: 25,
                      padding: 20,
                      border: isFocada ? '2px solid #007bff' : '1px solid #ccc',
                      borderRadius: 6,
                      backgroundColor: isFocada ? '#f4f8ff' : '#fafafa',
                      boxShadow: isFocada ? '0 4px 12px rgba(0,123,255,0.15)' : 'none',
                      transition: 'all 0.3s ease'
                    }}>

                      {/* Header do Card Responsivo */}
                      <div className="card-header-flex">
                        <div>
                          <strong style={{ fontSize: '1.2em', color: '#333' }}>
                            {isFocada && <span style={{ marginRight: 6 }}>📌</span>}
                            {intencao.produto.nome}
                          </strong>
                          <span style={{ color: '#666', marginLeft: 8 }}>{intencao.produto.marca} {intencao.produto.modelo}</span>
                        </div>
                        <div className="badge-container">
                          <span style={{ background: '#e3f2fd', color: '#0d47a1', padding: '5px 10px', borderRadius: 4, fontSize: '0.85em', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                            📦 Estoque: {intencao.quantidadeEmEstoque} un
                          </span>
                          <span style={{ background: '#e8f5e9', color: '#1b5e20', padding: '5px 10px', borderRadius: 4, fontSize: '0.85em', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                            💰 Lucro: R$ {intencao.lucroTotalAcumulado.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="card-internal-grid">

                        {/* Painel de Cotações */}
                        <div style={{ background: '#fff', padding: 12, borderRadius: 4, border: '1px solid #e0e0e0', boxSizing: 'border-box' }}>
                          <strong style={{ fontSize: '0.95em', color: '#555' }}>Histórico de Cotações ({intencao.cotacoes?.length || 0})</strong>
                          <ul style={{ marginTop: 8, paddingLeft: 15, fontSize: '0.9em' }}>
                            {intencao.cotacoes?.map((c) => (
                              <li key={c.id} style={{ marginBottom: 5 }}>
                                <span style={{ color: '#007bff', fontWeight: 'bold' }}>R$ {c.valor}</span> — {c.contato}
                                {c.link && <a href={c.link} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 6, textDecoration: 'none' }}>🔗</a>}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Painel de Rastreabilidade Unitária */}
                        <div style={{ background: '#fff', padding: 12, borderRadius: 4, border: '1px solid #e0e0e0', boxSizing: 'border-box' }}>
                          <strong style={{ fontSize: '0.95em', color: '#555' }}>Rastreabilidade de Itens Comprados ({intencao.efetivados?.length || 0})</strong>
                          <div style={{ marginTop: 8, maxHeight: '200px', overflowY: 'auto' }}>
                            {intencao.efetivados?.map((item) => {
                              const esEstoque = item.status === 'EM_ESTOQUE';
                              return (
                                <div key={item.codUnitario} style={{
                                  padding: '8px',
                                  marginBottom: 6,
                                  borderRadius: 4,
                                  borderLeft: esEstoque ? '4px solid #ffc107' : '4px solid #28a745',
                                  backgroundColor: esEstoque ? '#fffdf5' : '#f6fbf7',
                                  fontSize: '0.85em',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  gap: 10
                                }}>
                                  <div>
                                    <strong>ID: {item.codUnitario}</strong> <br />
                                    <span style={{ color: '#666' }}>Custo: R$ {item.valorCompra}</span>
                                  </div>

                                  <div style={{ textAlign: 'right', minWidth: '110px' }}>
                                    {esEstoque ? (
                                      <span style={{ color: '#856404', fontWeight: 'bold', background: '#fff3cd', padding: '2px 6px', borderRadius: 3, fontSize: '0.9em' }}>Disponível</span>
                                    ) : (
                                      <div>
                                        <span style={{ color: '#155724', fontWeight: 'bold', background: '#d4edda', padding: '2px 6px', borderRadius: 3, fontSize: '0.9em' }}>
                                          Vendido ({item.venda?.valorVenda})
                                        </span>
                                        <div style={{ color: '#155724', fontSize: '0.85em', marginTop: 3 }}>
                                          Lucro: +{item.venda?.lucroLiquido}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </>

      }
    </div>
  );
};