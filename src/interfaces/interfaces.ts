import { Dayjs } from "dayjs";

export interface Registro {
    id: string;
    dtCorrente: Dayjs;
    descricao: string;
    valor: number;
    idComum?: string;
    fonte: string;
    categoria: string | null;
    qtdParc: number;
    parcelaAtual: number;
    comentario: string;
    ehPago: boolean;
    dtEfetiva?: string
}

export interface Investment {
    id: string;
    name: string;
    total: number;
    date: Dayjs;
    category?: string;
    comment?: string;
}

export interface InvestmentOperation {
    id: string;
    investmentId: string;
    amount: number;
    date: Dayjs;
    type: 'deposit' | 'withdraw';
    comment?: string;
}

export interface ChartData {
    
}