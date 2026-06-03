import { c } from "vite/dist/node/types.d-aGj9QkWt";
import { Registro } from "../entities/Registro";
import moment from 'moment';

export enum RESTANTE_INVESTIMENTO_TARJA {
  TRANQUILO,
  ALERTA,
  PERIGOSO
}

export class FinanceService {
  static PORCENTAGEM_INVESTIMENTO = 0.25;


  constructor(private data: Registro[]) { }

  containsSalario(descricao: string): boolean {
    const descr = descricao?.toLowerCase().trim();
    return descr === "salario" || descr === "salário";
  }

  obterTotalPorFonte(fonte: string) {
    return this.data.filter(x => x.fonte.toLowerCase() === fonte.toLowerCase()).reduce((a, c) => (c.valor ? a + Number(c.valor) : 0), 0);
  }

  obterTotalPorFontes(): Record<string, number> {
    const totais: Record<string, number> = {};

    for (let i = 0; i < this.data.length; i++) {
      const item = this.data[i];

      if (item.fonte) {
        const valor = item.valor ? Number(item.valor) : 0;
        totais[item.fonte] = (Math.abs(totais[item.fonte] || 0)) + Math.abs(valor);
      }
    }

    return totais;
  }

  obterTotalPorCategoria(categoria: string): number {
    return this.data
      .filter(
        (x) =>
          !this.containsSalario(x.descricao) &&
          x.categoria?.toLowerCase() === categoria.toLowerCase()
      )
      .reduce((a, c) => a + (Number(c.valor) > 0 ? Number(c.valor) : 0), 0);
  }

  obterPorcentagemPorCategoria(categoria: string): string {
    let total = Math.abs(this.obterTotalSalario());
    if (total === 0) total = Math.abs(this.obterMinhasDespesas());

    const totalCategoria = this.obterTotalPorCategoria(categoria);
    return `${((100 * totalCategoria) / total).toFixed(2)}% (R$${totalCategoria.toFixed(2)})`;
  }

  obterTotalSalario(): number {
    return this.data
      .filter((x) => this.containsSalario(x.descricao))
      .reduce((a, c) => a + Number(c.valor), 0);
  }

  obterMinhasDespesas(): number {
    return this.data
      .filter((x) => !this.containsSalario(x.descricao))
      .reduce((a, c) => a + (Number(c.valor) > 0 ? Number(c.valor) : 0), 0);
  }

  obterRestante(): number {
    return Number(((-1 * this.obterTotalSalario()) - this.obterMinhasDespesas()).toFixed(2));
  }

  obterRestanteMenosInvestimento(): number {
    const totalSalario = this.obterTotalSalario();
    const totalInvestimento = -FinanceService.PORCENTAGEM_INVESTIMENTO * totalSalario;
    return Number(((-1 * totalSalario) - this.obterMinhasDespesas() - totalInvestimento).toFixed(2));
  }
  
  obterRestanteMenosMinInvestimento(): number {
    const totalSalario = this.obterTotalSalario();
    const totalInvestimento = -(FinanceService.PORCENTAGEM_INVESTIMENTO - 0.05) * totalSalario;
    return Number(((-1 * totalSalario) - this.obterMinhasDespesas() - totalInvestimento).toFixed(2));
  }

  obterTotalInvestimento(): number {
    return Number((-FinanceService.PORCENTAGEM_INVESTIMENTO * this.obterTotalSalario()).toFixed(2));
  }

  obterTotalMinimoInvestimento(): number {
    return Number((-(FinanceService.PORCENTAGEM_INVESTIMENTO - 0.05) * this.obterTotalSalario()).toFixed(2));
  }

  obterTarjaRestante(): RESTANTE_INVESTIMENTO_TARJA {
    const totalSalarioAbs = Math.abs(this.obterTotalSalario());
    const livreParaGastar = this.obterRestanteMenosMinInvestimento();

    if (totalSalarioAbs === 0 || livreParaGastar <= 0) {
      return RESTANTE_INVESTIMENTO_TARJA.PERIGOSO;
    }

    const margemDisponivelPercentual = livreParaGastar / totalSalarioAbs;

    if (margemDisponivelPercentual < 0.05) {
      return RESTANTE_INVESTIMENTO_TARJA.PERIGOSO;
    }

    if (margemDisponivelPercentual < 0.15) {
      return RESTANTE_INVESTIMENTO_TARJA.ALERTA;
    }

    return RESTANTE_INVESTIMENTO_TARJA.TRANQUILO;
  }

  obterPorcentagemDaCompra(compra: Registro): string {
    const restante = this.obterRestanteMenosInvestimento();
    if (Number(restante) <= 0) return "^100%";
    if (compra?.valor) {
      return `${(100 * (Number(compra.valor) / Number(restante))).toFixed(2)}%`;
    }
    return "0%";
  }

  obterPorcentagemSemanalDaCompra(compra: Registro): string {
    const endOfMonth = Number(moment().endOf("month").format("DD"));
    const today = Number(moment().format("DD"));
    const semanasFaltantesDoMes = Math.max(Math.ceil((endOfMonth - today) / 7), 1);
    const restantePorSemana = Number(this.obterRestanteMenosInvestimento()) / semanasFaltantesDoMes;
    if (restantePorSemana <= 0) return "^100%";
    if (compra?.valor) {
      return `${(100 * (Number(compra.valor) / Number(restantePorSemana))).toFixed(2)}%`;
    }
    return "0%";
  }

  obterSomaDespesasAbsolutas(): number {
    return this.data
      .filter((x) => !this.containsSalario(x.descricao))
      .reduce((a, c) => a + Math.abs(Number(c.valor)), 0);
  }
}
