import React, { useEffect, useState } from 'react';
import { JsonIntencaoCompraRepository } from '@/adapters/http/JsonIntencaoCompraRepository';
import { GraphQLIntencaoCompraRepository } from '@/adapters/graphql/GraphQLIntencaoCompraRepository';
import { IntencaoCompra } from '@/domain/entities/intencao-compra';

import {
  Autocomplete,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';

export const IntencaoCompraList: React.FC = () => {
  const [intencoes, setIntencoes] = useState<IntencaoCompra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedIntencao, setSelectedIntencao] = useState<string>('');

  const [loadingCotacao, setLoadingCotacao] = useState(false);
  const [loadingIntencao, setLoadingIntencao] = useState(false);
  const [loadingEfetivar, setLoadingEfetivar] = useState(false);
  const [loadingVenda, setLoadingVenda] = useState(false);

  // =========================
  // MODAL
  // =========================
  const [modalOpen, setModalOpen] = useState(false);

  const [modalData, setModalData] = useState({
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'info'
  });

  const openModal = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'info' = 'info'
  ) => {
    setModalData({
      title,
      message,
      type
    });

    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  // =========================
  // FORMS
  // =========================

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

      const instancias = data.map((item: any) =>
        IntencaoCompra.fromJSON(item)
      );

      setIntencoes(instancias);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao carregar intenções'
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // COTAÇÃO
  // =========================

  const handleCotacaoSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      !selectedIntencao ||
      !cotacaoForm.valor ||
      !cotacaoForm.contato
    ) {
      openModal(
        'Validação',
        'Preencha todos os campos obrigatórios',
        'info'
      );

      return;
    }

    try {
      setLoadingCotacao(true);

      await graphQLRepo.registrarCotacao({
        intencaoId: selectedIntencao,
        valor: parseFloat(cotacaoForm.valor),
        contato: cotacaoForm.contato,
        link: cotacaoForm.link || undefined,
        observacao:
          cotacaoForm.observacao || undefined
      });

      openModal(
        'Sucesso',
        'Cotação registrada com sucesso!',
        'success'
      );

      setCotacaoForm({
        valor: '',
        contato: '',
        link: '',
        observacao: ''
      });

      setSelectedIntencao('');

      await loadIntencoes();
    } catch (err) {
      openModal(
        'Erro',
        'Erro ao registrar cotação: ' +
          (err instanceof Error
            ? err.message
            : 'Erro desconhecido'),
        'error'
      );
    } finally {
      setLoadingCotacao(false);
    }
  };

  // =========================
  // EFETIVAR COMPRA
  // =========================

  const handleEfetivarCompraSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      !selectedIntencao ||
      !efetivarForm.cotacaoId ||
      !efetivarForm.valorCompraUnitario ||
      !efetivarForm.quantidade
    ) {
      openModal(
        'Validação',
        'Preencha os campos obrigatórios',
        'info'
      );

      return;
    }

    const quantidadeNum = parseInt(
      efetivarForm.quantidade
    );

    const codigosArray = efetivarForm.codigosUnitarios
      ? efetivarForm.codigosUnitarios
          .split(',')
          .map((codigo) => codigo.trim())
          .filter(Boolean)
      : [];

    if (codigosArray.length !== quantidadeNum) {
      openModal(
        'Validação',
        `A quantidade de códigos unitários (${codigosArray.length}) deve ser exatamente igual à quantidade comprada (${quantidadeNum}).`,
        'info'
      );

      return;
    }

    try {
      setLoadingEfetivar(true);

      await graphQLRepo.efetivarCompra({
        intencaoId: selectedIntencao,
        cotacaoId: efetivarForm.cotacaoId,
        valorCompraUnitario: parseFloat(
          efetivarForm.valorCompraUnitario
        ),
        quantidade: quantidadeNum,
        codigosUnitarios: codigosArray,
        status: 'EM_ESTOQUE'
      });

      openModal(
        'Sucesso',
        'Compra efetivada com sucesso!',
        'success'
      );

      setEfetivarForm({
        cotacaoId: '',
        valorCompraUnitario: '',
        quantidade: '1',
        codigosUnitarios: ''
      });

      setSelectedIntencao('');

      await loadIntencoes();
    } catch (err) {
      openModal(
        'Erro',
        'Erro ao efetivar compra: ' +
          (err instanceof Error
            ? err.message
            : 'Erro desconhecido'),
        'error'
      );
    } finally {
      setLoadingEfetivar(false);
    }
  };

  // =========================
  // VENDA
  // =========================

  const handleRegistrarVendaSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      !selectedIntencao ||
      !vendaForm.codUnitario ||
      !vendaForm.valorVenda
    ) {
      openModal(
        'Validação',
        'Preencha todos os campos obrigatórios para a venda',
        'info'
      );

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

      openModal(
        'Sucesso',
        'Venda registrada com sucesso!',
        'success'
      );

      setVendaForm({
        codUnitario: '',
        valorVenda: ''
      });

      setSelectedIntencao('');

      await loadIntencoes();
    } catch (err) {
      openModal(
        'Erro',
        'Erro ao registrar venda: ' +
          (err instanceof Error
            ? err.message
            : 'Erro desconhecido'),
        'error'
      );
    } finally {
      setLoadingVenda(false);
    }
  };

  // =========================
  // NOVA INTENÇÃO
  // =========================

  const handleNovaIntencaoSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      !novaIntencaoForm.nome ||
      !novaIntencaoForm.marca
    ) {
      openModal(
        'Validação',
        'Preencha todos os campos obrigatórios',
        'info'
      );

      return;
    }

    try {
      setLoadingIntencao(true);

      await graphQLRepo.criarIntencao({
        id: '',
        produto: {
          nome: novaIntencaoForm.nome,
          descricao:
            novaIntencaoForm.descricao,
          marca: novaIntencaoForm.marca,
          modelo: novaIntencaoForm.modelo,
          ano:
            parseInt(novaIntencaoForm.ano) || 0,
          ehNovo: novaIntencaoForm.ehNovo,
          observacao:
            novaIntencaoForm.observacao,
          midias: []
        },
        cotacoes: [],
        efetivados: []
      });

      openModal(
        'Sucesso',
        'Intenção de compra criada com sucesso!',
        'success'
      );

      setNovaIntencaoForm({
        id: '',
        nome: '',
        descricao: '',
        marca: '',
        modelo: '',
        ano: '',
        ehNovo: true,
        observacao: ''
      });

      setShowNovaIntencaoForm(false);

      await loadIntencoes();
    } catch (err) {
      openModal(
        'Erro',
        'Erro ao criar intenção: ' +
          (err instanceof Error
            ? err.message
            : 'Erro desconhecido'),
        'error'
      );
    } finally {
      setLoadingIntencao(false);
    }
  };

  // =========================
  // DASHBOARD
  // =========================

  const todosOsItensEfetivados =
    intencoes.flatMap((i) => i.efetivados || []);

  const faturamentoGlobal =
    todosOsItensEfetivados
      .filter(
        (item) =>
          item.status === 'VENDIDO' &&
          item.venda
      )
      .reduce(
        (total, item) =>
          total + (item.venda?.valorVenda || 0),
        0
      );

  const lucroGlobal = intencoes.reduce(
    (total, i) =>
      total + i.lucroTotalAcumulado,
    0
  );

  const totalItensEmEstoque =
    intencoes.reduce(
      (total, i) =>
        total + i.quantidadeEmEstoque,
      0
    );

  const dinheiroImobilizadoEstoque =
    todosOsItensEfetivados
      .filter(
        (item) => item.status === 'EM_ESTOQUE'
      )
      .reduce(
        (total, item) =>
          total + item.valorCompra,
        0
      );

  const intencoesOrdenadas = [...intencoes].sort(
    (a, b) => {
      if (a.id === selectedIntencao) return -1;
      if (b.id === selectedIntencao) return 1;
      return 0;
    }
  );

  const intencaoSelecionadaObjeto =
    intencoes.find(
      (i) => i.id === selectedIntencao
    );

  const cotacoesDaIntencaoSelecionada =
    intencaoSelecionadaObjeto?.cotacoes || [];

  const itensDisponiveisParaVenda =
    intencaoSelecionadaObjeto?.efetivados?.filter(
      (i) => i.status === 'EM_ESTOQUE'
    ) || [];

  return (
    <div
      style={{
        padding: '15px',
        fontFamily: 'sans-serif',
        maxWidth: 1300,
        margin: '0 auto'
      }}
    >
      <h2>Painel de Operações Comerciais</h2>

      {/* TODO: MANTENHA TODO O RESTANTE DO JSX ORIGINAL */}

      {/* ========================= */}
      {/* MODAL */}
      {/* ========================= */}

      <Dialog
        open={modalOpen}
        onClose={closeModal}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
            fontWeight: 'bold',
            color:
              modalData.type === 'success'
                ? '#2e7d32'
                : modalData.type === 'error'
                ? '#d32f2f'
                : '#1976d2'
          }}
        >
          {modalData.title}
        </DialogTitle>

        <DialogContent>
          <Typography
            variant="body1"
            sx={{
              whiteSpace: 'pre-line'
            }}
          >
            {modalData.message}
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={closeModal}
            variant="contained"
            color={
              modalData.type === 'success'
                ? 'success'
                : modalData.type === 'error'
                ? 'error'
                : 'primary'
            }
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
