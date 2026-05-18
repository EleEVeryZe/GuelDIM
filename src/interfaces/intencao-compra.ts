import { IntencaoCompra } from "../domain/entities/intencao-compra";
import { IItemBase } from "./baseItem";

export interface IProduto {
    nome: string;
    descricao: string;
    marca: string;
    modelo: string;
    ano: number;
    observacao?: string;
    ehNovo: boolean;
    midias?: string[];
}

export interface ICotacao {
    id: string;
    data: string;
    valor: number;
    link?: string;
    contato: string;
    observacao?: string;
    midias?: string[];
}

export type StatusItem = 'EM_ESTOQUE' | 'VENDIDO' | 'DEVOLVIDO' | 'PERDA';

export interface IVenda {
    valorVenda: number;
    dataVenda: string;
    lucroLiquido: number;
    midias?: string[];
}

export interface IItemEfetivado extends IItemBase{
    codUnitario: string;
    cotacaoId: string | null;
    valorCompra: number;
    dataCompra: string;
    status: StatusItem;
    venda: IVenda | null;
    midias?: string[];
    codigosUnitarios: string[];
    midiasPorItem?: string[][];
}

export interface IIntencaoCompra extends IItemBase {
    id: string;
    produto: IProduto;
    cotacoes: ICotacao[];
    efetivados: IItemEfetivado[];
}

export interface RegistrarCotacaoInput {
    intencaoId: string;
    valor: number;
    contato: string;
    link?: string;
    observacao?: string;
    midias?: string[];
}

export interface RegistrarVendaInput {
    intencaoId: string;
    codUnitario: string;
    valorVenda: number;
    midias?: string[];
}

export interface ICompra extends IItemBase {
    intencaoId: string;
    cotacaoId: string;
    quantidade: number;
    valorCompraUnitario: number;
    codigosUnitarios: string[];
    midiasPorItem?: string[][];
    status: string;
}

export interface EfetivarCompraParcialOutput {
    intencaoId: string;
    quantidadeEmEstoque: number;
    totalEfetivados: number;
}

