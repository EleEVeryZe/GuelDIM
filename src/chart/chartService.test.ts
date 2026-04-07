import { registrosMock } from "./barChartFixture.test";
import { ChartData } from "./chartServices";

describe("Service", () => {
    it("Should limit range of dates", () => {
        const chart = new ChartData(registrosMock);
        chart.setMonthRange(2, 2);
    })
})