import { registrosMock } from "./barChartFixture.test";
import { ChartData } from "./chartServices";
import { RegistroUseCase } from "../domain/usecases/RegistroUseCase";

describe("Service", () => {
    it("Should limit range of dates", () => {
        const mockUseCase = {
            itemFilterBaseService: {
                getFiltered: () => registrosMock
            }
        } as any;
        const chart = new ChartData(mockUseCase);
        chart.setMonthRange(2, 2);
    })
})