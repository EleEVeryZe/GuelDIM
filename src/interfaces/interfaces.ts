import { Dayjs } from "dayjs";
import { IItemBase, IItemBaseFilter } from "./baseItem";

export interface Registro extends IItemBase {
    id: string;
    dtCorrente: Dayjs;
    descricao: string;
    valor: number;
    fonte: string;
    categoria: string | null;
    qtdParc: number;
    parcelaAtual: number;
    comentario: string;
    ehPago: boolean;
}

export interface Investment extends IItemBase {
    id: string;
    name: string;
    total: number;
    date: Dayjs;
    category?: string;
    comment?: string;
}

export interface InvestmentFilter extends IItemBaseFilter {
    id: string;
    name: string;
    total: string;
    date_mes: string,
    date_ano: string,
    category?: string;
    comment?: string;
}

export interface InvestmentOperation extends IItemBase {
    id: string;
    investmentId: string;
    amount: number;
    date: Dayjs;
    type: 'deposit' | 'withdraw';
    comment?: string;
}

export interface InvestmentOperationFilter extends IItemBaseFilter {
    id: string;
    investmentId: string;
    amount: string;
    date: string;
    type: string;
    comment: string;
    date_mes: string,
    date_ano: string,

}


export interface ChartData {

}