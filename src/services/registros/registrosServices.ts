import moment from "moment";
import { Registro } from "../../interfaces/interfaces";

export const containsSalario = (descricao: string) => {
    const descr = descricao?.toLowerCase().trim();
    return descr === "salario" || descr === "salário";
}

export const obterTotalSalario = (data: Registro[]) => data
.filter((x) => containsSalario(x.descricao))
.reduce((a, c) => a + parseFloat(c.valor as any), 0);

export const obterMinhasDespesas = (data: Registro[]) => parseFloat(
    data
    .filter(x => !containsSalario(x.descricao))
    .reduce((a, c) => {
      return parseFloat(a as any) + parseFloat(c.valor > 0 ? c.valor : 0 as any) as any;
    }, 0)
)

export const obterRestante = (data: Registro[]) => {
    const result = (-1 * (obterTotalSalario(data))) - obterMinhasDespesas(data);
    return result.toFixed(2); 
}

export const obterRestanteMenosInvestimento = (data: Registro[]) => {
    const totalSalario = obterTotalSalario(data);

    const totalInvestimento = (-1 * (0.2 * totalSalario))

    const result = (-1 * (totalSalario)) - obterMinhasDespesas(data) - totalInvestimento;
                  
    return result.toFixed(2); 
}

export const obterTotalInvestimento = (data: Registro[]) => {
    const totalSalario = obterTotalSalario(data);
    return (-1 * (0.2 * totalSalario)).toFixed(2);
}

export const obterPorcentagemDaCompra = (compra: Registro, data: Registro[]) => {
    const restante = obterRestanteMenosInvestimento(data);
    if (parseFloat(restante) < 0)
        return "^100%"
    if (compra?.valor)
        return (100 * (parseFloat(compra.valor as any) / parseFloat(restante as any))).toFixed(2) + "%";
}

export const obterPorcentagemSemanalDaCompra = (compra: Registro, data: Registro[]) => {
    const endOfMonth = parseInt(moment().endOf("month").format("DD"));
    const today = parseInt(moment().format("DD"));
    const semanasFaltantesDoMes = Math.ceil((endOfMonth - today)/7);
    const restantePorSemana = parseFloat(obterRestanteMenosInvestimento(data)) / semanasFaltantesDoMes;

    if (restantePorSemana < 0)
        return "^100%"
    if (compra?.valor)
        return (100 * (parseFloat(compra.valor as any) / restantePorSemana)).toFixed(2) + "%";
}

