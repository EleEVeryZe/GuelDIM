import { Registro } from "../entities/Registro";

export const containsSalario = (descricao: string): boolean => {
  const descr = descricao?.toLowerCase().trim();
  return descr === "salario" || descr === "salário";
};

export const obterTotalSalario = (data: Registro[]): number => {
  return data
    .filter((x) => containsSalario(x.descricao))
    .reduce((a, c) => a + Number(c.valor), 0);
};

export const obterMinhasDespesas = (data: Registro[]): number => {
  return data
    .filter((x) => !containsSalario(x.descricao))
    .reduce((a, c) => a + (Number(c.valor) > 0 ? Number(c.valor) : 0), 0);
};

export const obterRestante = (data: Registro[]): number => {
  return Number(((-1 * obterTotalSalario(data)) - obterMinhasDespesas(data)).toFixed(2));
};

export const obterRestanteMenosInvestimento = (data: Registro[]): number => {
  const totalSalario = obterTotalSalario(data);
  const totalInvestimento = -0.2 * totalSalario;
  return Number(((-1 * totalSalario) - obterMinhasDespesas(data) - totalInvestimento).toFixed(2));
};

export const obterTotalInvestimento = (data: Registro[]): number => {
  return Number((-0.2 * obterTotalSalario(data)).toFixed(2));
};

export const obterPorcentagemDaCompra = (compra: Registro, data: Registro[]): string => {
  const restante = obterRestanteMenosInvestimento(data);
  if (Number(restante) <= 0) return "^100%";
  if (compra?.valor) {
    return `${(100 * (Number(compra.valor) / Number(restante))).toFixed(2)}%`;
  }
  return "0%";
};

export const obterPorcentagemSemanalDaCompra = (compra: Registro, data: Registro[]): string => {
  const moment = require("moment");
  const endOfMonth = Number(moment().endOf("month").format("DD"));
  const today = Number(moment().format("DD"));
  const semanasFaltantesDoMes = Math.max(Math.ceil((endOfMonth - today) / 7), 1);
  const restantePorSemana = Number(obterRestanteMenosInvestimento(data)) / semanasFaltantesDoMes;
  if (restantePorSemana <= 0) return "^100%";
  if (compra?.valor) {
    return `${(100 * (Number(compra.valor) / Number(restantePorSemana))).toFixed(2)}%`;
  }
  return "0%";
};
