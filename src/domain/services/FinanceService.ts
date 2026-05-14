import { Registro } from "../entities/Registro";
import moment from 'moment';

export class FinanceService {
  constructor(private data: Registro[]) { }

  containsSalario(descricao: string): boolean {
    const descr = descricao?.toLowerCase().trim();
    return descr === "salario" || descr === "salário";
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
    const totalSalario = Math.abs(this.obterTotalSalario());
    if (totalSalario === 0) return "0%";

    const totalCategoria = this.obterTotalPorCategoria(categoria);
    return ((100 * totalCategoria) / totalSalario).toFixed(2);
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
    const totalInvestimento = -0.2 * totalSalario;
    return Number(((-1 * totalSalario) - this.obterMinhasDespesas() - totalInvestimento).toFixed(2));
  }

  obterTotalInvestimento(): number {
    return Number((-0.2 * this.obterTotalSalario()).toFixed(2));
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
