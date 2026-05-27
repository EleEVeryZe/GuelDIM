import dayjs from "dayjs";
import { Registro } from "../interfaces/interfaces";
import { RegistroUseCase } from "../domain/usecases/RegistroUseCase";
import { FinanceService } from "../domain/services/FinanceService";

export class ChartData {
    private monthRange: {init: number, fin: number} | null = null;

    constructor(private useCase: RegistroUseCase) {
    }

    private readonly sumValor = (groupedByData: { [key: string]: Registro[] }) => {
        let acumulado = 0;
        return Object.keys(groupedByData).map((mesAno) => 
            {
                const financeService = new FinanceService(groupedByData[mesAno]);
                acumulado += this.isDateInTheFuture(mesAno) ? financeService.obterTotalInvestimento() : financeService.obterRestante();
                return {
                    descricao: mesAno,
                    valor: financeService.obterRestante(),
                    valorMenosInvestimento: financeService.obterRestanteMenosInvestimento(),
                    acumulado: acumulado
                }
            }, {}
        )
    }

    private readonly isDateInTheFuture = (input: string) => {
        const year = input.slice(0, 4)
        const month = input.slice(4)
        const date = dayjs(`${year}-${month}-01`)
        return dayjs(date).isAfter(dayjs().add(1, "month"));
    }

    private groupByDateItems = (data: Registro[]) => {
        return data.reduce((previousValue: { [key: string]: Registro[] } , currentValue) => {
            const dt = dayjs(currentValue.dtCorrente).format("YYYYMM");
            return {
                ...previousValue,
                [dt]: [
                    ...(previousValue[dt] && previousValue[dt].length ? previousValue[dt] : []),
                    currentValue
                ]
            }
        }
        , {});
    }

    public formatData = () : { data: { [key: string]: Registro[] }, sumValor: () => Array<{ descricao: string; valor: number; valorMenosInvestimento: number; acumulado: number; }>, removeSalary: () => { [key: string]: Registro[] } } => {
        let data = this.useCase.getFilter().getFilteredWithoutMonthFilter();
        if (this.monthRange) {
            const initDayJs = dayjs().subtract(this.monthRange.init, "month").startOf("month");
            const finDayJs = dayjs().add(this.monthRange.fin, "month").endOf("month");
            data = data.filter(reg => dayjs(reg.dtCorrente).isAfter(initDayJs) && dayjs(reg.dtCorrente).isBefore(finDayJs));
        }
        const groupedByData = this.groupByDateItems(data);

        return {
            data: groupedByData,
            sumValor: this.sumValor.bind(this, groupedByData),
            removeSalary: this.removeSalary.bind(this, groupedByData)
        }
    }

    public setMonthRange = (initMes: number, finMes: number) => {        
        this.monthRange = {init: initMes, fin: finMes};
        return this;
    }

    private readonly removeSalary = (groupedByData: { [key: string]: Registro[] }) => {
        // Remove salary from grouped data
        Object.keys(groupedByData).forEach(key => {
            groupedByData[key] = groupedByData[key].filter(reg => !reg.descricao.toLowerCase().includes('salario'));
        });
        return groupedByData;
    }
}